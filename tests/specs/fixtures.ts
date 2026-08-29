import { APIRequestContext, test as base, request as pwRequest } from "@playwright/test";
import { ApiClient } from "../app/api/ApiClient";
import { deleteOAuthClientFromDb } from "../app/utils/dbTasks";
import { env } from "../../envValidation";
import * as fs from "fs";
import * as path from "path";

const ADMIN_TOKEN_FILE_PATH = path.resolve(__dirname, "../../.adminToken");
const USER_TOKEN_FILE_PATH = path.resolve(__dirname, "../../.userToken");

function isTokenExpired(token: string): boolean {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return true;
    const payload = JSON.parse(Buffer.from(parts[1], "base64").toString("utf8"));
    if (typeof payload.exp !== "number") return false;
    // Check if expired (with 10-second safety margin)
    return Date.now() >= payload.exp * 1000 - 10000;
  } catch {
    return true;
  }
}

async function getCachedToken(api: ApiClient, tokenFilePath: string, email: string, pass: string): Promise<string> {
  let token = "";
  if (fs.existsSync(tokenFilePath)) {
    const tokenStr = fs.readFileSync(tokenFilePath, "utf8").trim();
    if (tokenStr && !isTokenExpired(tokenStr)) {
      token = tokenStr;
    }
  }

  if (!token) {
    token = await api.authController.getUserToken(email, pass);
    fs.writeFileSync(tokenFilePath, token, "utf8");
  }

  return token;
}

type Fixtures = {
  adminRequest: APIRequestContext;
  userRequest: APIRequestContext;
  clientRequest: APIRequestContext;

  adminApi: ApiClient;
  userApi: ApiClient;
  anonymousApi: ApiClient;
  clientApi: ApiClient;
  clientApiOptions: {
    scope?: string[];
  };
};

export const test = base.extend<Fixtures>({
  adminRequest: async ({ request }, use) => {
    const api = new ApiClient(request);
    const token = await getCachedToken(api, ADMIN_TOKEN_FILE_PATH, env.ADMIN_EMAIL, env.ADMIN_PASS);

    const adminRequest = await pwRequest.newContext({
      extraHTTPHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });

    await use(adminRequest);

    await adminRequest.dispose();
  },

  userRequest: async ({ request }, use) => {
    const api = new ApiClient(request);
    const token = await getCachedToken(api, USER_TOKEN_FILE_PATH, env.USER_EMAIL, env.USER_PASS);

    const userRequest = await pwRequest.newContext({
      extraHTTPHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });

    await use(userRequest);

    await userRequest.dispose();
  },
  clientApiOptions: { scope: ["read"] },
  clientRequest: async ({ request, clientApiOptions }, use) => {
    const api = new ApiClient(request);
    let token = "";
    token = await api.authController.getUserToken(env.ADMIN_EMAIL, env.ADMIN_PASS);

    const registerOAuthClientResponse = await api.authController.registerOAuthClient(
      token,
      clientApiOptions.scope ?? [],
    );
    const oAuthClientId = registerOAuthClientResponse.clientId;
    const oAuthClientSecret = registerOAuthClientResponse.clientSecret;
    const oAuthClientToken = await api.authController.getOAuthClientToken(
      token,
      oAuthClientId,
      oAuthClientSecret,
      clientApiOptions.scope ?? [],
    );

    const clientRequest = await pwRequest.newContext({
      extraHTTPHeaders: {
        Authorization: `Bearer ${oAuthClientToken}`,
      },
    });

    await use(clientRequest);
    await api.authController.deactivateOAuthClient(token, oAuthClientId);
    await deleteOAuthClientFromDb(oAuthClientId);
    await clientRequest.dispose();
  },

  userApi: async ({ userRequest }, use) => {
    await use(new ApiClient(userRequest));
  },

  adminApi: async ({ adminRequest }, use) => {
    await use(new ApiClient(adminRequest));
  },

  anonymousApi: async ({ request }, use) => {
    await use(new ApiClient(request));
  },
  clientApi: async ({ clientRequest }, use) => {
    await use(new ApiClient(clientRequest));
  },
});

export { expect } from "@playwright/test";

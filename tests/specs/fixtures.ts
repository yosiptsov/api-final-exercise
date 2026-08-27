import { APIRequestContext, test as base, request as APIRequest } from "@playwright/test";
import { ApiClient } from "../app/api/ApiClient";
import { deleteOAuthClient } from "../app/utils/dbTasks";
import { env } from "../../envValidation";
import * as fs from "fs";
import * as path from "path";

const TOKEN_FILE_PATH = path.resolve(__dirname, "../../.token");

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

type Fixtures = {
  options: {
    isAuthorized: boolean;
    scope?: string[];
    isDeleteOAuthClient?: boolean;
    asUser?: boolean;
  };
  existingUser: {
    existingUserEmail: string;
    existingUserPass: string;
  };
  authRequest: APIRequestContext;
  apiClient: ApiClient;
};

export const test = base.extend<Fixtures>({
  options: { isAuthorized: true, scope: ["read", "write", "admin"], isDeleteOAuthClient: true, asUser: false },
  existingUser: { existingUserEmail: env.ADMIN_EMAIL, existingUserPass: env.ADMIN_PASS },
  authRequest: async ({ request, options, existingUser }, use) => {
    const api = new ApiClient(request);
    if (!options.isAuthorized) {
      await use(request);
      return;
    }
    let contextToDispose: APIRequestContext | null = null;

    let token = "";
    if (fs.existsSync(TOKEN_FILE_PATH)) {
      const cachedToken = fs.readFileSync(TOKEN_FILE_PATH, "utf8").trim();
      if (cachedToken && !isTokenExpired(cachedToken)) {
        token = cachedToken;
      }
    }

    if (!token) {
      token = await api.oAuthController.getToken(existingUser.existingUserEmail, existingUser.existingUserPass);
      fs.writeFileSync(TOKEN_FILE_PATH, token, "utf8");
    }

    if (options.asUser) {
      const authContext = await APIRequest.newContext({
        extraHTTPHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
      contextToDispose = authContext;
      await use(authContext);
      await contextToDispose.dispose();
      return;
    }

    const registerOAuthClientResponse = await api.oAuthController.registerOAuthClient(token, options.scope ?? []);
    const oAuthClientId = registerOAuthClientResponse.clientId;
    const oAuthClientSecret = registerOAuthClientResponse.clientSecret;
    const oAuthClientToken = await api.oAuthController.getOAuthClientToken(
      token,
      oAuthClientId,
      oAuthClientSecret,
      options.scope ?? [],
    );

    const authContext = await APIRequest.newContext({
      extraHTTPHeaders: {
        Authorization: `Bearer ${oAuthClientToken}`,
      },
    });

    contextToDispose = authContext;

    await use(authContext);
    // teardown
    await api.oAuthController.deactivateOAuthClient(token, oAuthClientId);
    await deleteOAuthClient(oAuthClientId);
    await contextToDispose.dispose();
  },
  apiClient: async ({ authRequest }, use) => {
    const controller = new ApiClient(authRequest);
    await use(controller);
  },
});

export { expect } from "@playwright/test";

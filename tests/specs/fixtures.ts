import { APIRequestContext, test as base, request as APIRequest } from "@playwright/test";
import { ApiController } from "../app/api/ApiController";
import { env } from "../../envValidation";

type Fixtures = {
  options: {
    isAuthorized: boolean;
    scope?: string[];
  };
  existingUser: {
    existingUserEmail: string;
    existingUserPass: string;
  };
  authRequest: APIRequestContext;
  apiController: ApiController;
};

export const test = base.extend<Fixtures>({
  options: { isAuthorized: true, scope: ["read", "write"] },
  existingUser: { existingUserEmail: env.ADMIN_EMAIL, existingUserPass: env.ADMIN_PASS },
  authRequest: async ({ request, options, existingUser }, use) => {
    const api = new ApiController(request);
    if (!options.isAuthorized) {
      await use(request);
      return;
    }
    let contextToDispose: APIRequestContext | null = null;

    const token = await api.oAuthController.getToken(existingUser.existingUserEmail, existingUser.existingUserPass);
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
    await contextToDispose.dispose();
  },
  apiController: async ({ authRequest }, use) => {
    const controller = new ApiController(authRequest);
    await use(controller);
  },
});

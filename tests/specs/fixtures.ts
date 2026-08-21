import { APIRequestContext, test as base, request as APIRequest } from "@playwright/test";
import { ApiController } from "../app/api/ApiController";
import { RegisterUserPayload } from "../app/schemas/User";
import { env } from "../../envValidation";

// 1. Describe types for options and our new fixture
type Fixtures = {
  //options
  options: {
    isAuthorized: boolean; // true — authentication required, false — clean request
    isNeedToCreateUser: boolean; // true — create a new unique user, false — use an existing one
  };
  existingUser: {
    // test data
    existingUserEmail: string;
    existingUserPass: string;
  };

  newUserPayload: RegisterUserPayload | null; // allows passing a custom payload from the test

  authRequest: APIRequestContext; // Our new authorized fixture. It has name authRequest not just request, to not to change fixture 'request'
  apiController: ApiController;
};

export const test = base.extend<Fixtures>({
  // 2. Set default values for fixture parameters
  options: { isAuthorized: true, isNeedToCreateUser: false },
  existingUser: { existingUserEmail: env.ADMIN_EMAIL, existingUserPass: env.ADMIN_PASS },
  newUserPayload: null,

  // 3. Implement the authRequest fixture
  authRequest: async ({ request, options, existingUser, newUserPayload }, use) => {
    const api = new ApiController(request);
    // CASE 1: Authentication is not required at all
    if (!options.isAuthorized) {
      await use(request); // Return the base unauthorized client
      return;
    }

    let targetEmail = existingUser.existingUserEmail;
    let targetPass = existingUser.existingUserPass;
    let contextToDispose: APIRequestContext | null = null;

    try {
      // CASE 2: Need to create a NEW unique user
      if (options.isNeedToCreateUser) {
        const testUserNumber = Date.now();

        // If the test did not pass a custom payload, generate a random one
        const generatedPayload: RegisterUserPayload = newUserPayload || {
          user: {
            name: `youser${testUserNumber}`,
            email: `youser${testUserNumber}@gm1.com`,
            password: env.ADMIN_PASS,
          },
        };

        // Create the user in the system using the base API client
        await api.userController.registerUser(generatedPayload);

        // Save user credentials for the subsequent login step
        targetEmail = generatedPayload.user.email;
        targetPass = generatedPayload.user.password;
      }

      // CASE 3 (Default): Login either the new or existing user from env
      const token = await api.oAuthController.getToken(targetEmail, targetPass);

      // Create an isolated context with the Authorization header
      const authContext = await APIRequest.newContext({
        extraHTTPHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });

      contextToDispose = authContext;

      // Pass the authorized context into the test
      await use(authContext);
    } finally {
      if (contextToDispose) {
        await contextToDispose.dispose();
      }
    }
  },
  apiController: async ({ authRequest }, use) => {
    const controller = new ApiController(authRequest);
    await use(controller);
  },
});


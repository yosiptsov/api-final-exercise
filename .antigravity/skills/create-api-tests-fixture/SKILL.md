---
name: create-api-tests-fixture
description: use it when you need to create or modify the main api test fixture
---

## Example

In this project, we use dynamic OAuth client creation and teardown within the Playwright fixture instead of hardcoding tokens or caching them purely to disk. Use the fixture pattern below as a reference:

```typescript
import { APIRequestContext, test as base, request as APIRequest } from "@playwright/test";
import { ApiClient } from "../app/api/ApiClient";
import { deleteOAuthClient } from "../app/utils/dbTasks";
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
  apiClient: ApiClient;
};

export const test = base.extend<Fixtures>({
  options: { isAuthorized: true, scope: ["read", "write"] },
  existingUser: { existingUserEmail: env.ADMIN_EMAIL, existingUserPass: env.ADMIN_PASS },
  
  authRequest: async ({ request, options, existingUser }, use) => {
    const api = new ApiClient(request);
    
    // If authorization is not required, just pass the raw request
    if (!options.isAuthorized) {
      await use(request);
      return;
    }
    
    // 1. Get Token
    const token = await api.oAuthController.getToken(existingUser.existingUserEmail, existingUser.existingUserPass);
    
    // 2. Register OAuth Client and Get OAuth Token
    const registerResponse = await api.oAuthController.registerOAuthClient(token, options.scope ?? []);
    const oAuthClientId = registerResponse.clientId;
    const oAuthClientSecret = registerResponse.clientSecret;
    const oAuthClientToken = await api.oAuthController.getOAuthClientToken(
      token,
      oAuthClientId,
      oAuthClientSecret,
      options.scope ?? [],
    );

    // 3. Create Authenticated Context
    const authContext = await APIRequest.newContext({
      extraHTTPHeaders: {
        Authorization: `Bearer ${oAuthClientToken}`,
      },
    });

    // 4. Pass context to the test
    await use(authContext);
    
    // 5. Teardown
    await api.oAuthController.deactivateOAuthClient(token, oAuthClientId);
    await deleteOAuthClient(oAuthClientId);
    await authContext.dispose();
  },
  
  apiClient: async ({ authRequest }, use) => {
    const client = new ApiClient(authRequest);
    await use(client);
  },
});
```

## Usage in tests

```typescript
import { test } from "../fixtures";

test.use({ options: { isAuthorized: true, scope: ["read"] } });

test("some authorized test", async ({ apiClient }) => {
  // apiClient is pre-authenticated!
});
```

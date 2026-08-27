```typescript
import { test } from "../fixtures";
import { expect } from "@playwright/test";
import { TAG } from "../../app/tags/tags";
import { ClientInfoSchema, UserInfoSchema } from "../../app/schemas/UserInfo";
import { verifyHeaders } from "../../app/utils/commonAssertions";
import { faker } from "@faker-js/faker";
import { deleteUserFromDB, verifyUserExistsInDB } from "../../app/utils/dbTasks";
import { RegisterUserPayload } from "../../app/schemas/RegisterUser";

test.describe("GET /api/oauth/userinfo - Test Coverage Suite", () => {
  test.describe(
    "Positive Scenarios ('client_credentials' token)",
    { tag: [TAG.auth, TAG.regression, TAG.positive] },
    () => {
      test.use({
        options: { isAuthorized: true, scope: ["read"] },
      });

      test("oauth2 01: Service returns current user data", async ({ apiController }) => {
        //Arrange
        //Act
        const response = await test.step("getting current user info", async () => {
          return await apiController.oAuthController.getCurrentUserInfo();
        });
        const responseJson = await response.json();

        // Assert
        await test.step("response status is 200 (OK)", () => {
          expect(response.status(), "Check status").toBe(200);
          expect(response.statusText(), "Check status message").toBe("OK");
        });

        await test.step("check that json correspond to expected json schema", async () => {
          const result = ClientInfoSchema.safeParse(responseJson);
          expect(result.success, { message: result.error?.message }).toBeTruthy();
        });

        await test.step("verify response Headers", async () => {
          verifyHeaders(response);
        });

        await test.step("verify returned user data", () => {
          expect(responseJson.sub).toContain("client_");
          expect(responseJson.type).toBe("client");
          expect(responseJson.scopes).toEqual(["read"]);
        });
      });
    },
  );
```

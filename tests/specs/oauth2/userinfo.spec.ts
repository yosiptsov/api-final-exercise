import { test, expect } from "../fixtures";
import { TAG } from "../../app/tags/tags";
import { ClientInfoSchema, UserInfoSchema } from "../../app/schemas/UserInfo";
import { verifyHeaders } from "../../app/utils/commonAssertions";
import { faker } from "@faker-js/faker";
import { deleteUserFromDB, verifyUserExistsInDB } from "../../app/utils/dbTasks";
import { RegisterUserPayload } from "../../app/schemas/RegisterUser";

test.describe("GET /api/oauth/userinfo - Test Coverage Suite", () => {
  test.describe(
    "Positive Scenarios (clientCredentials token)",
    { tag: [TAG.auth, TAG.regression, TAG.positive, TAG.clientToken] },
    () => {
      test("oauth2 01: Service returns current user data", async ({ clientApi }) => {
        //Arrange
        //Act
        const response = await test.step("getting current user info", async () => {
          return await clientApi.userController.getCurrentUserInfo();
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

  test.describe(
    "Positive Scenarios (password grant token)",
    { tag: [TAG.positive, TAG.regression, TAG.passToken] },
    () => {
      test("oauth2 03: Service returns current user data", async ({ adminApi }) => {
        //Act
        const response = await adminApi.userController.getCurrentUserInfo();
        const responseJson = await response.json();

        //Assert
        await test.step("response status is 200 (OK)", () => {
          expect(response.status(), "Check status").toBe(200);
          expect(response.statusText(), "Check status message").toBe("OK");
        });

        await test.step("verify response Headers", async () => {
          verifyHeaders(response);
        });

        await test.step("check that json corresponds to expected UserInfo schema", async () => {
          const result = UserInfoSchema.safeParse(responseJson);
          expect(result.success, { message: result.error?.message }).toBeTruthy();
        });

        await test.step("verify returned user data", () => {
          expect(responseJson.id).toBeTruthy();
          expect(responseJson.email).toBe("admin@dojo.api");
          expect(responseJson.name).toBe("Admin User");
          expect(responseJson.role).toBe("ADMIN");
        });

        await test.step("verify it doesn't return sensitive fields", () => {
          expect(responseJson.password).toBeUndefined();
          expect(responseJson.passwordHash).toBeUndefined();
        });
      });
    },
  );

  test.describe("Unauthorized Access", { tag: [TAG.auth, TAG.regression, TAG.negative] }, () => {
    test("oauth2 02: returns 401 when Authorization header is missing", async ({ anonymousApi }) => {
      //Arrange
      //Act
      const response = await test.step("getting current user info", async () => {
        return await anonymousApi.userController.getCurrentUserInfo(false);
      });
      const responseJson = await response.json();

      // Assert
      await test.step("response status is 401 (Unauthorized)", () => {
        expect(response.status(), "Check status").toBe(401);
        expect(responseJson.error, "Check error message").toBe("Unauthorized");
      });

      await test.step("verify response Headers", async () => {
        verifyHeaders(response);
      });
    });
  });
});

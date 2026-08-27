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

      test("oauth2 01: Service returns current user data", async ({ apiClient }) => {
        //Arrange
        //Act
        const response = await test.step("getting current user info", async () => {
          return await apiClient.oAuthController.getCurrentUserInfo();
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

  test.describe("Unauthorized Access", { tag: [TAG.auth, TAG.regression, TAG.negative] }, () => {
    test.use({
      options: { isAuthorized: false },
    });

    test("oauth2 02: returns 401 when Authorization header is missing", async ({ apiClient }) => {
      //Arrange
      //Act
      const response = await test.step("getting current user info", async () => {
        return await apiClient.oAuthController.getCurrentUserInfo(false);
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

  test.describe("Positive Scenarios (User password token)", { tag: [TAG.positive, TAG.regression] }, () => {
    test.use({
      options: { isAuthorized: false },
    });

    let newUserPayload: RegisterUserPayload = {
      user: {
        name: "",
        email: "",
        password: "",
      },
    };
    let userToken: string;

    test.beforeEach(async ({ apiClient }) => {
      //Arrange
      newUserPayload = {
        user: {
          name: faker.person.fullName(),
          email: faker.internet.email(),
          password: faker.internet.password({ length: 10 }) + "A1",
        },
      };
      await apiClient.oAuthController.registerUser(newUserPayload);
      verifyUserExistsInDB(newUserPayload.user.name, newUserPayload.user.email);

      userToken = await apiClient.oAuthController.getToken(newUserPayload.user.email, newUserPayload.user.password);
    });

    test.afterEach(async () => {
      await deleteUserFromDB(newUserPayload.user.email);
    });

    test("oauth2 03: Service returns current user data", async ({ request }) => {
      //Act
      const response = await test.step("getting current user info", async () => {
        return await request.get("/api/oauth/userinfo", {
          headers: { Authorization: `Bearer ${userToken}` },
        });
      });
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
        expect(responseJson.email).toBe(newUserPayload.user.email);
        expect(responseJson.name).toBe(newUserPayload.user.name);
        expect(responseJson.role).toBe("USER");
      });

      await test.step("verify it doesn't return sensitive fields", () => {
        expect(responseJson.password).toBeUndefined();
        expect(responseJson.passwordHash).toBeUndefined();
      });
    });
  });
});

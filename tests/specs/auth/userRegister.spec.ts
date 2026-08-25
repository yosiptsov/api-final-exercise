import { test } from "../fixtures";
import { APIRequest, APIResponse, expect } from "@playwright/test";
import { verifyHeaders } from "../../app/utils/commonAssertions";
import { verifyUserExistsInDB, deleteCreatedUserFromDB } from "../../app/utils/dbTasks";
import { TAG } from "../../app/tags/tags";
import { RegisterUserPayload, RegisterUserResponseSchema } from "../../app/schemas/RegisterUser";
import {
  userWithMissedFields,
  invalidUserName,
  invalidUserEmail,
  invalidPasswordComplexity,
} from "./userRegister.data";
import { faker } from "@faker-js/faker";

test.describe("Positive Scenarios (Successful Registration)", { tag: [TAG.positive, TAG.regression] }, () => {
  test.use({
    options: { isAuthorized: false, scope: [] },
  });

  const newUserPayload: RegisterUserPayload = {
    user: {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password({ length: 10 }) + "A1",
    },
  };
  let response: APIResponse;

  test.beforeEach(async ({ apiController }) => {
    //Arrange
    response = await apiController.oAuthController.registerUser(newUserPayload);
    verifyUserExistsInDB(newUserPayload.user.name, newUserPayload.user.email);
  });

  test.afterEach(async () => {
    await deleteCreatedUserFromDB(newUserPayload.user.email);
  });

  test("UserReg 01: A new user can be registered", async () => {
    //Act
    const responseJson = await response.json();

    // Assert
    await test.step("response status is 201 (Created)", () => {
      expect(response.status(), "Check status").toBe(201);
      expect(response.statusText(), "Check status message").toBe("Created");
    });

    await test.step("check that json correspond to expected json schema", async () => {
      const result = RegisterUserResponseSchema.safeParse(responseJson);
      expect(result.success, { message: result.error?.message }).toBeTruthy();
    });

    await test.step("verify response Headers", async () => {
      verifyHeaders(response);
    });

    await test.step("verify created user data", () => {
      expect(responseJson.id, "user id is present").toBeTruthy();
      expect(responseJson.name, "user name is correct").toBe(newUserPayload.user.name);
      expect(responseJson.email, "user email is correct").toBe(newUserPayload.user.email);
      expect(responseJson.role, "user role is USER").toBe("USER");
    });
  });
});

test.describe("Negative Validation Scenarios - 400 Bad Request", () => {
  test.use({
    options: { isAuthorized: false, scope: [] },
  });
  test.describe("UserReg 02: User payload missing required fields", { tag: [TAG.negative] }, () => {
    for (const { description, payload } of userWithMissedFields) {
      test(`Register fails when ${description}`, async ({ apiController }) => {
        const response = await apiController.oAuthController.registerUser(payload as any);
        expect(response.status()).toBe(400);
      });
    }
  });

  test.describe("UserReg 03: Invalid name constraints  ", { tag: [TAG.negative] }, () => {
    for (const { description, payload } of invalidUserName) {
      test(`Register fails when ${description}`, async ({ apiController }) => {
        const response = await apiController.oAuthController.registerUser(payload as any);
        expect(response.status()).toBe(400);
      });
    }
  });
  test.describe("UserReg 04: Invalid email format", { tag: [TAG.negative] }, () => {
    for (const { description, payload } of invalidUserEmail) {
      test(`Register fails when ${description}`, async ({ apiController }) => {
        const response = await apiController.oAuthController.registerUser(payload as any);
        expect(response.status()).toBe(400);
      });
    }
  });
  test.describe("UserReg 05: Invalid password complexity", { tag: [TAG.negative, TAG.regression] }, () => {
    for (const { description, payload } of invalidPasswordComplexity) {
      test(`Register fails when ${description}`, async ({ apiController }) => {
        const response = await apiController.oAuthController.registerUser(payload as any);
        expect(response.status()).toBe(400);
      });
    }
  });
});

test.describe("Business Logic / Conflict Scenarios - 409 Conflicts", () => {
  test.use({
    options: { isAuthorized: false, scope: [] },
  });
});

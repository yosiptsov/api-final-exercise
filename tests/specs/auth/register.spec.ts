import { test } from "../fixtures";
import { expect } from "@playwright/test";
import { verifyHeaders } from "../../app/utils/commonAssertions";
import { TAG } from "../../app/tags/tags";
import { RegisterUserPayload } from "../../app/schemas/User";
import { faker } from "@faker-js/faker";
import { prisma } from "../../../src/lib/prisma";

test.describe("Positive Scenarios (Successful Registration)", { tag: [TAG.auth, TAG.authorized] }, () => {
  test.use({
    options: { isAuthorized: false, scope: [] },
  });

  test("auth 01: A new user can be registered", async ({ apiController }) => {
    //Arrange
    const newUserPayload: RegisterUserPayload = {
      user: {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: faker.internet.password({ length: 10 }) + "A1",
      },
    };
    // Act
    const response = await apiController.oAuthController.registerUser(newUserPayload);
    const responseJson = await response.json();

    // Assert
    await test.step("response status is 201 (Created)", () => {
      expect(response.status(), "Check status").toBe(201);
      expect(response.statusText(), "Check status message").toBe("Created");
    });
    verifyHeaders(response);

    await test.step("verify created user data", () => {
      expect(responseJson.id).toBeTruthy();
      expect(responseJson.name).toBe(newUserPayload.user.name);
      expect(responseJson.email).toBe(newUserPayload.user.email);
      expect(responseJson.role).toBe("USER");
    });

    await test.step("verify created user appeared in DB", async () => {
      const dbUser = await prisma.user.findUnique({
        where: { email: newUserPayload.user.email },
      });
      expect(dbUser).not.toBeNull();
      expect(dbUser?.name).toBe(newUserPayload.user.name);
      expect(dbUser?.role).toBe("USER");
    });

    await test.step("delete created user from the DB", async () => {
      await prisma.user.delete({
        where: { email: newUserPayload.user.email },
      });
      const dbUser = await prisma.user.findUnique({
        where: { email: newUserPayload.user.email },
      });
      expect(dbUser).toBeNull();
    });
  });
});

// test.describe("Negative Scenarios", { tag: [TAG.auth, TAG.authorized] }, () => {
//   test.use({
//     options: { isAuthorized: false, scope: [] },
//   });

//   test("auth 01: A new user can be registered", async ({ apiController }) => {
//     //Arrange
//     const newUserPayload: RegisterUserPayload = {
//       user: {
//         name: faker.person.fullName(),
//         email: faker.internet.email(),
//         password: faker.internet.password({ length: 10 }) + "A1",
//       },
//     };
//     // Act
//     const response = await apiController.oAuthController.registerUser(newUserPayload);
//     const responseJson = await response.json();

//     // Assert
//     await test.step("response status is 201 (Created)", () => {
//       expect(response.status(), "Check status").toBe(201);
//       expect(response.statusText(), "Check status message").toBe("Created");
//     });
//     verifyHeaders(response);

//     await test.step("verify created user data", () => {
//       expect(responseJson.id).toBeTruthy();
//       expect(responseJson.name).toBe(newUserPayload.user.name);
//       expect(responseJson.email).toBe(newUserPayload.user.email);
//       expect(responseJson.role).toBe("USER");
//     });
//   });
// });

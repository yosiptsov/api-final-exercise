import { test } from "../fixtures";
import { expect } from "@playwright/test";
import { verifyHeaders } from "../../app/utils/commonAssertions";
import { verifyUserExistsInDB, deleteCreatedUserFromDB } from "../../app/utils/dbTasks";
import { TAG } from "../../app/tags/tags";
import { RegisterUserPayload } from "../../app/schemas/User";
import { faker } from "@faker-js/faker";

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
      expect(responseJson.id, "user id is present").toBeTruthy();
      expect(responseJson.name, "user name is correct").toBe(newUserPayload.user.name);
      expect(responseJson.email, "user email is correct").toBe(newUserPayload.user.email);
      expect(responseJson.role, "user role is USER").toBe("USER");
    });

    verifyUserExistsInDB(newUserPayload.user.name, newUserPayload.user.email);
    deleteCreatedUserFromDB(newUserPayload.user.email);
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

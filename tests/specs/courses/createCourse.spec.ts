import { test, expect } from "../fixtures";
import { TAG } from "../../app/tags/tags";
import { CreateCoursePayload } from "../../app/schemas/Courses";
import { CourseResponseSchema } from "../../app/schemas/Courses";
import { verifyHeaders } from "../../app/utils/commonAssertions";
import { faker } from "@faker-js/faker";

test.describe("POST /api/courses - Create a new course", { tag: [TAG.course] }, () => {
  test.describe("Positive scenarios", () => {
    test.use({
      options: { isAuthorized: true, scope: ["read", "write", "admin"], isDeleteOAuthClient: true, asUser: true },
    });

    // Happy paths
    test("Create a new course successfully", async ({ apiClient }) => {
      //Arrange
      const coursePayload: CreateCoursePayload = {
        title: `PW Generated Course about ${faker.book.title}`,
      };
      //Act
      const response = await test.step("create a new course", async () => {
        return await apiClient.coursesController.createCourse(coursePayload);
      });
      const responseJson = await response.json();

      //Assert
      await test.step("response status is 201 (Created)", () => {
        expect(response.status(), "Check status").toBe(201);
        expect(response.statusText(), "Check status message").toBe("Created");
      });

      await test.step("check that json correspond to expected json schema", async () => {
        const result = CourseResponseSchema.safeParse(responseJson);
        expect(result.success, { message: result.error?.message }).toBeTruthy();
      });

      await test.step("verify response Headers", async () => {
        verifyHeaders(response);
      });

      await test.step("verify returned response data", () => {
        expect(responseJson.title).toBe(coursePayload.title);
      });
    });
  });
  test.describe("Negative scenarios - Validation", () => {
    // Bad payloads
  });
  test.describe("Negative scenarios - Authorization & Authentication", () => {
    // Roles and missing tokens
  });
});

```typescript
import { test, expect } from "../fixtures";
import { TAG } from "../../app/tags/tags";
import type * as CourseTypes from "../../app/schemas/Courses";
import * as CourseSchemas from "../../app/schemas/Courses";
import { verifyHeaders } from "../../app/utils/commonAssertions";
import { faker } from "@faker-js/faker";
import { APIResponse } from "@playwright/test";
import { courseWithIncorrectTitle } from "./createCourse.data";

test.describe("POST /api/courses - Create a new course", { tag: [TAG.course] }, () => {
  test.describe(
    "Positive scenarios (Password grant token)",
    { tag: [TAG.positive, TAG.regression, TAG.passToken] },
    () => {
      let createdCourseResponse: APIResponse;
      let createdCourseJson: CourseTypes.CourseResponse;
      let coursePayload: CourseTypes.CreateCoursePayload;

      test.beforeEach(async ({ adminApi }) => {
        //Arrange
        coursePayload = {
          title: `PW Generated Course ${faker.string.alphanumeric(5)}`,
        };
        createdCourseResponse = await adminApi.coursesController.createCourse(coursePayload);
        createdCourseJson = await createdCourseResponse.json();
      });

      test.afterEach(async ({ adminApi }) => {
        if (createdCourseJson?.id) {
          await adminApi.coursesController.deleteCourse(createdCourseJson.id);
        }
      });

      test("Course 01: should successfully create a new course with a valid title", async ({ adminApi }) => {
        await test.step("response status is 201 (Created)", () => {
          expect(createdCourseResponse.status(), "Check status").toBe(201);
          expect(createdCourseResponse.statusText(), "Check status message").toBe("Created");
        });

        await test.step("check that json correspond to expected json schema", async () => {
          const result = CourseSchemas.CourseResponseSchema.safeParse(createdCourseJson);
          expect(result.success, { message: result.error?.message }).toBeTruthy();
        });

        await test.step("verify response Headers", async () => {
          verifyHeaders(createdCourseResponse);
        });

        await test.step("verify response default state and payload matching", () => {
          expect(createdCourseJson).toMatchObject({
            title: coursePayload.title,
            // Default boolean & numeric flags
            isPublished: false,
            isListed: true,
            isFeatured: false,
            featuredOrder: 0,
            // Nullable default fields
            description: null,
            imageUrl: null,
            price: null,
            outcomes: null,
            requirements: null,
            authorName: null,
            authorRole: null,
          });
        });

        await test.step("verify created course can be read", async () => {
          const getCourseResponse = await adminApi.coursesController.getCourseDetails(createdCourseJson.id);
          const getCourseResponseJson = await getCourseResponse.json();
          expect(getCourseResponseJson.title, "title of the read course equal to payload title").toBe(
            coursePayload.title,
          );
        });
      });

      test("Course 02: should create a unique slug if a course with the same title already exists", async ({
        adminApi,
      }) => {
        //Arrange - duplicate payload with the same title created in beforeEach
        const duplicatePayload: CourseTypes.CreateCoursePayload = {
          title: coursePayload.title,
        };

        //Act
        const secondResponse = await test.step("create second course with identical title", async () => {
          return await adminApi.coursesController.createCourse(duplicatePayload);
        });
        const secondCourseJson = await secondResponse.json();

        try {
          //Assert
          await test.step("response status is 201 (Created)", () => {
            expect(secondResponse.status(), "Check status").toBe(201);
          });

          await test.step("verify title is identical but slug has unique timestamp suffix", () => {
            expect(secondCourseJson.title, "title matches original").toBe(coursePayload.title);
            expect(secondCourseJson.slug, "slug has unique timestamp suffix").toMatch(
              new RegExp(`^${createdCourseJson.slug}-\\d+$`),
            );
          });
        } finally {
          if (secondCourseJson?.id) {
            await adminApi.coursesController.deleteCourse(secondCourseJson.id);
          }
        }
      });
    },
  );

  test.describe("Course 03: Negative scenarios - Validation", { tag: [TAG.negative, TAG.passToken] }, () => {
    for (const { description, payload } of courseWithIncorrectTitle) {
      test(`Course should return 400 Bad Request ${description}`, async ({ adminApi }) => {
        //Act
        const response = await test.step("trying to create a course", async () => {
          return await adminApi.coursesController.createCourse(payload as any, false);
        });
        const responseJson = await response.json();
        //Assert
        await test.step("response status is 400 (Bad Request)", () => {
          expect(response.status(), "Check status").toBe(400);
          expect(response.statusText(), "Check status message").toBe("Bad Request");
          expect(responseJson.error, "Check error message").toBe("Title must be at least 3 characters");
        });

        await test.step("verify response Headers", async () => {
          verifyHeaders(response);
        });
      });
    }
  });

  test.describe("Negative scenarios - Authorization & Authentication", () => {
    // Roles and missing tokens
    test.describe("clientCredentials token", { tag: [TAG.negative, TAG.clientToken] }, () => {
      test.use({
        clientApiOptions: { scope: ["read", "write", "admin"] },
      });

      test("Course 04: clientCredentials token should not allow to create a course", async ({ clientApi }) => {
        //Arrange
        const coursePayload: CourseTypes.CreateCoursePayload = {
          title: `PW Generated Course about ${faker.book.title}`,
        };
        //Act
        const response = await test.step("create a new course", async () => {
          return await clientApi.coursesController.createCourse(coursePayload, false);
        });
        const responseJson = await response.json();

        //Assert
        await test.step("response status is 403 (Forbidden)", () => {
          expect(response.status(), "Check status").toBe(403);
          expect(response.statusText(), "Check status message").toBe("Forbidden");
          expect(responseJson.error, "Check error message").toBe("Forbidden");
        });

        await test.step("verify response Headers", async () => {
          verifyHeaders(response);
        });
      });
    });
    test.describe("password token", { tag: [TAG.negative, TAG.passToken] }, () => {
      test("Course 05: should return 403 Forbidden if user role is not ADMIN", async ({ userApi }) => {
        const CoursePayload = {
          title: "Course title",
        };
        //Act
        const response = await test.step("trying to create a course", async () => {
          return await userApi.coursesController.createCourse(CoursePayload, false);
        });
        const responseJson = await response.json();
        //Assert
        await test.step("response status is 403 (Forbidden)", () => {
          expect(response.status(), "Check status").toBe(403);
          expect(response.statusText(), "Check status message").toBe("Forbidden");
          expect(responseJson.error, "Check error message").toBe("Forbidden");
        });

        await test.step("verify response Headers", async () => {
          verifyHeaders(response);
        });
      });
      test("Course 06: should return 401 Unauthorized if no token is provided", async ({ anonymousApi }) => {
        const CoursePayload = {
          title: "Course title",
        };
        //Act
        const response = await test.step("trying to create a course", async () => {
          return await anonymousApi.coursesController.createCourse(CoursePayload, false);
        });
        const responseJson = await response.json();
        //Assert
        await test.step("response status is 401 (Unauthorized)", () => {
          expect(response.status(), "Check status").toBe(401);
          expect(response.statusText(), "Check status message").toBe("Unauthorized");
          expect(responseJson.error, "Check error message").toBe("Unauthorized");
        });

        await test.step("verify response Headers", async () => {
          verifyHeaders(response);
        });
      });
    });
  });
});
```

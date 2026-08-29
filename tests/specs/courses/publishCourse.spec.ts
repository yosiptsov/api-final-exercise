import { test, expect } from "../fixtures";
import { TAG } from "../../app/tags/tags";
import type * as CourseTypes from "../../app/schemas/Courses";
import type * as ChapterTypes from "../../app/schemas/Chapters";
import * as CourseSchemas from "../../app/schemas/Courses";
import { verifyHeaders } from "../../app/utils/commonAssertions";
import { faker } from "@faker-js/faker";
import { APIResponse } from "@playwright/test";

test.describe("PATCH /api/courses/{courseId}/publish - Publish/Unpublish a course", { tag: [TAG.course] }, () => {
  test.describe(
    "Positive scenarios (Password grant token)",
    { tag: [TAG.positive, TAG.regression, TAG.passToken] },
    () => {
      let createdCourseResponse: APIResponse;
      let createdCourseJson: CourseTypes.CourseResponse;
      let coursePayload: CourseTypes.CreateCoursePayload;

      const courseUpdatePayload: CourseTypes.UpdateCoursePayload = {
        description: faker.book.genre(),
        imageUrl: faker.image.avatar(),
        price: "100",
      };

      const courseChapterPayload: ChapterTypes.CreateChapterPayload = {
        title: faker.book.series(),
      };

      test.beforeEach(async ({ adminApi }) => {
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

      test("Publish 01: should successfully publish an unpublished course that meets all requirements", async ({
        adminApi,
      }) => {
        //Arrange
        await test.step("updating the course to be able to publish", async () => {
          await adminApi.coursesController.updateCourse(createdCourseJson.id, courseUpdatePayload);
          const chapterRes = await adminApi.chaptersController.addChapterToCourse(
            createdCourseJson.id,
            courseChapterPayload,
          );
          const chapterResJson = await chapterRes.json();
          await adminApi.chaptersController.updateChapter(createdCourseJson.id, chapterResJson.id, {
            isPublished: true,
          });
        });

        //Act
        const publishResponse = await test.step("publish the course", async () => {
          return await adminApi.coursesController.publishCourse(createdCourseJson.id);
        });

        const publishResponseJson = await publishResponse.json();
        //Assert
        await test.step("response status is 200 (OK)", () => {
          expect(publishResponse.status(), "Check status").toBe(200);
          expect(publishResponse.statusText(), "Check status message").toBe("OK");
        });

        await test.step("check that json correspond to expected json schema", async () => {
          const result = CourseSchemas.CourseResponseSchema.safeParse(publishResponseJson);
          expect(result.success, { message: result.error?.message }).toBeTruthy();
        });

        await test.step("verify response Headers", async () => {
          verifyHeaders(publishResponse);
        });

        test.step("verify the course is published", () => {
          expect(publishResponseJson.isPublished, "isPublish = true").toBe(true);
        });
      });

      test("Publish 02: should successfully unpublish a published course", async ({ adminApi }) => {
        //Arrange
        await test.step("updating the course to be able to publish it", async () => {
          await adminApi.coursesController.updateCourse(createdCourseJson.id, courseUpdatePayload);
          const chapterRes = await adminApi.chaptersController.addChapterToCourse(
            createdCourseJson.id,
            courseChapterPayload,
          );
          const chapterResJson = await chapterRes.json();
          await adminApi.chaptersController.updateChapter(createdCourseJson.id, chapterResJson.id, {
            isPublished: true,
          });
          await adminApi.coursesController.publishCourse(createdCourseJson.id);
        });
        //Act
        const unpublishResponse = await test.step("unpublish the course", async () => {
          return await adminApi.coursesController.updateCourse(createdCourseJson.id, { isPublished: false });
        });
        const unpublishResponseJson = await unpublishResponse.json();

        //Assert
        await test.step("response status is 200 (OK)", () => {
          expect(unpublishResponse.status(), "Check status").toBe(200);
          expect(unpublishResponse.statusText(), "Check status message").toBe("OK");
        });

        await test.step("check that json correspond to expected json schema", async () => {
          const result = CourseSchemas.CourseResponseSchema.safeParse(unpublishResponseJson);
          expect(result.success, { message: result.error?.message }).toBeTruthy();
        });

        await test.step("verify response Headers", async () => {
          verifyHeaders(unpublishResponse);
        });

        test.step("verify the course is unpublished", () => {
          expect(unpublishResponseJson.isPublished, "isPublish = false").toBe(false);
        });
      });
    },
  );

  test.describe("Negative scenarios - Validation", () => {
    // Missing required fields or chapters
  });
  test.describe("Negative scenarios - Not Found", () => {
    // Course doesn't exist
  });
  test.describe("Negative scenarios - Authorization & Authentication", () => {
    // Roles and missing tokens
  });
});

import { test, expect } from "../fixtures";
import { TAG } from "../../app/tags/tags";
import {
  LearningPathSchema,
  type CreateLearningPathPayload,
} from "../../app/schemas/LearningPaths";
import { verifyHeaders } from "../../app/utils/commonAssertions";
import { deleteLearningPathFromDb } from "../../app/utils/dbTasks";
import { faker } from "@faker-js/faker";

test.describe("/api/learning-paths Endpoints", () => {
  let createdLearningPathIds: string[] = [];

  test.afterEach(async () => {
    for (const id of createdLearningPathIds) {
      await deleteLearningPathFromDb(id);
    }
    createdLearningPathIds = [];
  });

  test.describe(
    "POST /api/learning-paths - Create a learning path (Authorized)",
    { tag: [TAG.regression, TAG.positive, TAG.authorized, TAG.roleAdmin, TAG.aiGenerated] },
    () => {
      test("should successfully create a learning path with minimum required fields", async ({
        adminApi,
      }) => {
        // Arrange
        let response: any;
        let body: any;
        const payload: CreateLearningPathPayload = {
          title: `LP ${faker.word.words(2)}`,
          instructor: {
            name: faker.person.fullName(),
          },
        };

        // Act
        await test.step("Send POST /api/learning-paths request with minimal payload", async () => {
          response = await adminApi.learningPathsController.createLearningPath(payload);
          body = await response.json();
        });

        // Assert
        await test.step("Verify response status, headers and Zod schema contract", async () => {
          expect(response.status()).toBe(201);
          await verifyHeaders(response);

          const parseResult = LearningPathSchema.safeParse(body);
          expect(
            parseResult.success,
            `Zod validation failed: ${JSON.stringify(parseResult.error?.issues)}`,
          ).toBeTruthy();
        });

        await test.step("Verify created entity data matches request payload", async () => {
          expect(body.title).toBe(payload.title);
          expect(body.isPublished).toBe(false);
          expect(body.instructor).toBeDefined();
          expect(body.instructor.name).toBe(payload.instructor.name);

          if (body.id) {
            createdLearningPathIds.push(body.id);
          }
        });
      });

      test("should successfully create a learning path with full nested relations", async ({
        adminApi,
      }) => {
        // Arrange
        let response: any;
        let body: any;
        const payload: CreateLearningPathPayload = {
          title: `Full LP ${faker.word.words(3)}`,
          description: faker.lorem.paragraph(),
          modules: [
            {
              title: `Module 1: ${faker.word.words(2)}`,
              description: faker.lorem.sentence(),
              position: 1,
            },
            {
              title: `Module 2: ${faker.word.words(2)}`,
              description: faker.lorem.sentence(),
              position: 2,
            },
          ],
          video: {
            title: faker.lorem.words(3),
            videoId: faker.string.alphanumeric(11),
          },
          certificate: {
            name: `Certificate of Completion - ${faker.word.words(2)}`,
            description: faker.lorem.sentence(),
            templateUrl: faker.internet.url(),
          },
          instructor: {
            name: faker.person.fullName(),
            bio: faker.lorem.sentence(),
            avatarUrl: faker.image.avatar(),
          },
        };

        // Act
        await test.step("Send POST /api/learning-paths request with full payload", async () => {
          response = await adminApi.learningPathsController.createLearningPath(payload);
          body = await response.json();
        });

        // Assert
        await test.step("Verify response status, headers and Zod schema contract", async () => {
          expect(response.status()).toBe(201);
          await verifyHeaders(response);

          const parseResult = LearningPathSchema.safeParse(body);
          expect(
            parseResult.success,
            `Zod validation failed: ${JSON.stringify(parseResult.error?.issues)}`,
          ).toBeTruthy();
        });

        await test.step("Verify nested relations and properties match request payload", async () => {
          expect(body.title).toBe(payload.title);
          expect(body.description).toBe(payload.description);
          expect(body.modules).toHaveLength(2);
          expect(body.modules[0].title).toBe(payload.modules![0].title);
          expect(body.video).toBeDefined();
          expect(body.video.title).toBe(payload.video!.title);
          expect(body.video.videoId).toBe(payload.video!.videoId);
          expect(body.certificate).toBeDefined();
          expect(body.certificate.name).toBe(payload.certificate!.name);
          expect(body.instructor).toBeDefined();
          expect(body.instructor.name).toBe(payload.instructor.name);

          if (body.id) {
            createdLearningPathIds.push(body.id);
          }
        });
      });
    },
  );

  test.describe(
    "POST /api/learning-paths - Create a learning path (Validation errors)",
    { tag: [TAG.regression, TAG.negative, TAG.aiGenerated] },
    () => {
      test("should return 400 Bad Request if title is shorter than 3 characters", async ({
        adminApi,
      }) => {
        // Arrange
        let response: any;
        let body: any;
        const invalidPayload = {
          title: "ab",
          instructor: {
            name: faker.person.fullName(),
          },
        };

        // Act
        await test.step("Send POST /api/learning-paths with short title", async () => {
          response = await adminApi.learningPathsController.createLearningPath(
            invalidPayload,
            false,
          );
          body = await response.json();
        });

        // Assert
        await test.step("Verify 400 Bad Request response and error message", async () => {
          expect(response.status()).toBe(400);
          await verifyHeaders(response);
          expect(body.error).toContain("Title must be at least 3 characters");
        });
      });

      test("should return 400 Bad Request if instructor is missing", async ({ adminApi }) => {
        // Arrange
        let response: any;
        let body: any;
        const invalidPayload = {
          title: `Valid Title ${faker.word.words(2)}`,
        };

        // Act
        await test.step("Send POST /api/learning-paths without instructor", async () => {
          response = await adminApi.learningPathsController.createLearningPath(
            invalidPayload,
            false,
          );
          body = await response.json();
        });

        // Assert
        await test.step("Verify 400 Bad Request response and error message", async () => {
          expect(response.status()).toBe(400);
          await verifyHeaders(response);
          expect(body.error).toContain("Instructor is required with at least a name");
        });
      });

      test("should return 400 Bad Request if instructor name is missing", async ({
        adminApi,
      }) => {
        // Arrange
        let response: any;
        let body: any;
        const invalidPayload = {
          title: `Valid Title ${faker.word.words(2)}`,
          instructor: {
            bio: "Instructor without name",
          },
        };

        // Act
        await test.step("Send POST /api/learning-paths with instructor missing name", async () => {
          response = await adminApi.learningPathsController.createLearningPath(
            invalidPayload,
            false,
          );
          body = await response.json();
        });

        // Assert
        await test.step("Verify 400 Bad Request response and error message", async () => {
          expect(response.status()).toBe(400);
          await verifyHeaders(response);
          expect(body.error).toContain("Instructor is required with at least a name");
        });
      });
    },
  );

  test.describe(
    "POST /api/learning-paths - Create a learning path (Unauthorized & Forbidden)",
    { tag: [TAG.regression, TAG.negative, TAG.notAuthorized, TAG.aiGenerated] },
    () => {
      test("should return 401 Unauthorized when no authentication token is provided", async ({
        anonymousApi,
      }) => {
        // Arrange
        let response: any;
        const payload: CreateLearningPathPayload = {
          title: `Unauth LP ${faker.word.words(2)}`,
          instructor: {
            name: faker.person.fullName(),
          },
        };

        // Act
        await test.step("Send POST /api/learning-paths without token", async () => {
          response = await anonymousApi.learningPathsController.createLearningPath(
            payload,
            false,
          );
        });

        // Assert
        await test.step("Verify 401 Unauthorized response status and headers", async () => {
          expect(response.status()).toBe(401);
          await verifyHeaders(response);
        });
      });

      test("should return 403 Forbidden when caller is not an ADMIN user", async ({
        userApi,
      }) => {
        // Arrange
        let response: any;
        const payload: CreateLearningPathPayload = {
          title: `Forbidden LP ${faker.word.words(2)}`,
          instructor: {
            name: faker.person.fullName(),
          },
        };

        // Act
        await test.step("Send POST /api/learning-paths as regular USER", async () => {
          response = await userApi.learningPathsController.createLearningPath(payload, false);
        });

        // Assert
        await test.step("Verify 403 Forbidden response status and headers", async () => {
          expect(response.status()).toBe(403);
          await verifyHeaders(response);
        });
      });
    },
  );
});

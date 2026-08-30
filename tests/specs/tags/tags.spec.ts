import { test, expect } from "../fixtures";
import { TAG } from "../../app/tags/tags";
import type * as TagsTypes from "../../app/schemas/Tags";
import * as TagsSchemas from "../../app/schemas/Tags";
import { verifyHeaders } from "../../app/utils/commonAssertions";
import { faker } from "@faker-js/faker";

test.describe("/api/tags Endpoints", () => {
  let createdTagIds: string[] = [];

  test.afterEach(async ({ adminApi }) => {
    // Clean up created tags using API
    for (const id of createdTagIds) {
      await adminApi.tagsController.deleteTag(id, false);
    }
    createdTagIds = [];
  });

  test.describe("GET /api/tags - Get all tags", { tag: [TAG.regression, TAG.positive, TAG.aiGenerated] }, () => {
    test("should retrieve a list of all tags", async ({ anonymousApi, adminApi }) => {
      // Arrange
      let tag1Id = "";
      let tag2Id = "";
      await test.step("Create tags for setup", async () => {
        const tag1Name = faker.word.noun() + Date.now().toString();
        const tag2Name = faker.word.noun() + Date.now().toString() + "b";

        const t1Response = await adminApi.tagsController.createTag(tag1Name);
        const t1Data = await t1Response.json();
        tag1Id = t1Data.id;
        createdTagIds.push(t1Data.id);

        const t2Response = await adminApi.tagsController.createTag(tag2Name);
        const t2Data = await t2Response.json();
        tag2Id = t2Data.id;
        createdTagIds.push(t2Data.id);
      });

      // Act
      let getResponse: any;
      await test.step("Get tags", async () => {
        getResponse = await anonymousApi.tagsController.getTagList();
      });

      // Assert
      await test.step("Verify response", async () => {
        expect(getResponse.status()).toBe(200);
        await verifyHeaders(getResponse);
        const data = await getResponse.json();

        const parsedData = TagsSchemas.TagListSchema.parse(data);
        expect(Array.isArray(parsedData)).toBeTruthy();

        const sortedNames = [...parsedData].map((t) => t.name).sort((a, b) => a.localeCompare(b));
        const actualNames = parsedData.map((t) => t.name);
        expect(actualNames).toEqual(sortedNames);
      });
    });
  });

  test.describe(
    "POST /api/tags - Create a new tag (Authorized)",
    { tag: [TAG.regression, TAG.positive, TAG.authorized, TAG.aiGenerated] },
    () => {
      test("should successfully create a new tag", async ({ adminApi }) => {
        // Arrange
        const tagName = faker.word.noun() + Date.now();
        let response: any;

        // Act
        await test.step("Send create tag request", async () => {
          response = await adminApi.tagsController.createTag(tagName);
        });

        // Assert
        await test.step("Verify response", async () => {
          expect(response.status()).toBe(201);
          await verifyHeaders(response);
          const data = await response.json();

          const parsedData = TagsSchemas.TagSchema.parse(data);
          expect(parsedData.name).toBe(tagName);
          expect(parsedData.slug).toBeTruthy();

          createdTagIds.push(parsedData.id);
        });
      });
    },
  );

  test.describe(
    "POST /api/tags - Create a new tag (Error responses)",
    { tag: [TAG.regression, TAG.negative, TAG.aiGenerated] },
    () => {
      test("should return 400 Bad Request if the name is missing or not a string", async ({ adminApi }) => {
        // Arrange
        let response1: any, response2: any;

        // Act
        await test.step("Send invalid payloads", async () => {
          response1 = await adminApi.tagsController.request.post("/api/tags", {
            data: {},
            failOnStatusCode: false,
          });
          response2 = await adminApi.tagsController.request.post("/api/tags", {
            data: { name: 123 },
            failOnStatusCode: false,
          });
        });

        // Assert
        await test.step("Verify error status code", async () => {
          expect(response1.status()).toBe(400);
          expect(response2.status()).toBe(400);
          await verifyHeaders(response1);
          await verifyHeaders(response2);
        });
      });

      test("should return 400 Bad Request if the name is less than 2 characters", async ({ adminApi }) => {
        // Arrange
        let response: any;

        // Act
        await test.step("Send short name", async () => {
          response = await adminApi.tagsController.createTag("a", false);
        });

        // Assert
        await test.step("Verify error status code", async () => {
          expect(response.status()).toBe(400);
          await verifyHeaders(response);
        });
      });

      test("should return 409 Conflict if a tag with the same slug already exists", async ({ adminApi }) => {
        // Arrange
        const tagName = faker.word.noun() + Date.now();
        await test.step("Create initial tag", async () => {
          const response1 = await adminApi.tagsController.createTag(tagName);
          const data = await response1.json();
          createdTagIds.push(data.id);
        });

        let response2: any;
        // Act
        await test.step("Create conflicting tag", async () => {
          response2 = await adminApi.tagsController.createTag(tagName, false);
        });

        // Assert
        await test.step("Verify error status code", async () => {
          expect(response2.status()).toBe(409);
          await verifyHeaders(response2);
        });
      });
    },
  );

  test.describe(
    "POST /api/tags - Create a new tag (Unauthorized)",
    { tag: [TAG.regression, TAG.negative, TAG.notAuthorized, TAG.aiGenerated] },
    () => {
      test("should return 401 Unauthorized if no token is provided", async ({ anonymousApi }) => {
        // Arrange
        const tagName = faker.word.noun() + Date.now();
        let response: any;

        // Act
        await test.step("Send request without token", async () => {
          response = await anonymousApi.tagsController.createTag(tagName, false);
        });

        // Assert
        await test.step("Verify error status code", async () => {
          expect(response.status()).toBe(401);
          await verifyHeaders(response);
        });
      });

      test("should return 403 Forbidden if user role is not ADMIN", async ({ userApi }) => {
        // Arrange
        const tagName = faker.word.noun() + Date.now();
        let response: any;

        // Act
        await test.step("Send request with non-admin token", async () => {
          response = await userApi.tagsController.createTag(tagName, false);
        });

        // Assert
        await test.step("Verify error status code", async () => {
          expect(response.status()).toBe(403);
          await verifyHeaders(response);
        });
      });
    },
  );

  test.describe(
    "DELETE /api/tags/{tagId} - Delete a tag (Authorized)",
    { tag: [TAG.regression, TAG.positive, TAG.authorized, TAG.aiGenerated] },
    () => {
      test("should successfully delete an existing tag", async ({ adminApi }) => {
        // Arrange
        let tagId = "";
        await test.step("Create tag to delete", async () => {
          const tagName = faker.word.noun() + Date.now();
          const createResponse = await adminApi.tagsController.createTag(tagName);
          const createdData = await createResponse.json();
          tagId = createdData.id;
        });

        let deleteResponse: any;
        // Act
        await test.step("Send delete tag request", async () => {
          deleteResponse = await adminApi.tagsController.deleteTag(tagId);
        });

        // Assert
        await test.step("Verify response", async () => {
          expect(deleteResponse.status()).toBe(200);
          await verifyHeaders(deleteResponse);

          const deleteData = await deleteResponse.json();
          TagsSchemas.SuccessResponseSchema.parse(deleteData);
          expect(deleteData.success).toBe(true);
        });
      });
    },
  );

  test.describe(
    "DELETE /api/tags/{tagId} - Delete a tag (Unauthorized)",
    { tag: [TAG.regression, TAG.negative, TAG.notAuthorized, TAG.aiGenerated] },
    () => {
      test("should return 401 Unauthorized if no token is provided", async ({ anonymousApi, adminApi }) => {
        // Arrange
        let tagId = "";
        await test.step("Create tag", async () => {
          const tagName = faker.word.noun() + Date.now();
          const createResponse = await adminApi.tagsController.createTag(tagName);
          const createdData = await createResponse.json();
          tagId = createdData.id;
          createdTagIds.push(tagId);
        });

        let response: any;
        // Act
        await test.step("Send delete tag request without token", async () => {
          response = await anonymousApi.tagsController.deleteTag(tagId, false);
        });

        // Assert
        await test.step("Verify error status code", async () => {
          expect(response.status()).toBe(401);
          await verifyHeaders(response);
        });
      });

      test("should return 403 Forbidden if user role is not ADMIN", async ({ userApi, adminApi }) => {
        // Arrange
        let tagId = "";
        await test.step("Create tag", async () => {
          const tagName = faker.word.noun() + Date.now();
          const createResponse = await adminApi.tagsController.createTag(tagName);
          const createdData = await createResponse.json();
          tagId = createdData.id;
          createdTagIds.push(tagId);
        });

        let response: any;
        // Act
        await test.step("Send delete tag request with non-admin token", async () => {
          response = await userApi.tagsController.deleteTag(tagId, false);
        });

        // Assert
        await test.step("Verify error status code", async () => {
          expect(response.status()).toBe(403);
          await verifyHeaders(response);
        });
      });
    },
  );
});

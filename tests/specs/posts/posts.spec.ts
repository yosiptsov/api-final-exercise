import { test, expect } from "../fixtures";
import { TAG } from "../../app/tags/tags";
import * as PostsSchemas from "../../app/schemas/Posts";
import { verifyHeaders } from "../../app/utils/commonAssertions";
import { faker } from "@faker-js/faker";

test.describe("/api/posts Endpoints", () => {
  let createdPostIds: string[] = [];

  test.afterEach(async ({ adminApi }) => {
    // Clean up created posts using API
    for (const id of createdPostIds) {
      await adminApi.postsController.deletePost(id, false);
    }
    createdPostIds = [];
  });

  test.describe(
    "GET /api/posts - Get all published posts",
    { tag: [TAG.regression, TAG.positive, TAG.aiGenerated] },
    () => {
      test("should retrieve a list of published posts", async ({ anonymousApi, adminApi }) => {
        // Arrange
        await test.step("Create test published and draft posts for setup", async () => {
          const publishedTitle = "Published Post " + faker.string.alphanumeric(8);
          const publishedRes = await adminApi.postsController.createPost({
            title: publishedTitle,
            content: faker.lorem.paragraph(),
            isPublished: true,
          });
          const publishedData = await publishedRes.json();
          createdPostIds.push(publishedData.id);

          const draftTitle = "Draft Post " + faker.string.alphanumeric(8);
          const draftRes = await adminApi.postsController.createPost({
            title: draftTitle,
            content: faker.lorem.paragraph(),
            isPublished: false,
          });
          const draftData = await draftRes.json();
          createdPostIds.push(draftData.id);
        });

        // Act
        let getResponse: any;
        await test.step("Get published posts list", async () => {
          getResponse = await anonymousApi.postsController.getPostList();
        });

        // Assert
        await test.step("Verify response and schema", async () => {
          expect(getResponse.status()).toBe(200);
          await verifyHeaders(getResponse);

          const data = await getResponse.json();
          const parsedPosts = PostsSchemas.PostListSchema.parse(data);

          expect(Array.isArray(parsedPosts)).toBeTruthy();
          for (const post of parsedPosts) {
            expect(post.isPublished).toBe(true);
          }
        });
      });
    },
  );

  test.describe(
    "POST /api/posts - Create a new post (Authorized)",
    { tag: [TAG.regression, TAG.positive, TAG.authorized, TAG.aiGenerated] },
    () => {
      test("should successfully create a new post with valid payload", async ({ adminApi }) => {
        // Arrange
        const postPayload = {
          title: "Blog Post " + faker.lorem.words(3),
          excerpt: faker.lorem.sentence(),
          content: faker.lorem.paragraphs(2),
          isPublished: true,
        };
        let response: any;

        // Act
        await test.step("Send create post request", async () => {
          response = await adminApi.postsController.createPost(postPayload);
        });

        // Assert
        await test.step("Verify response and post structure", async () => {
          expect(response.status()).toBe(201);
          await verifyHeaders(response);

          const data = await response.json();
          const parsedPost = PostsSchemas.PostSchema.parse(data);

          expect(parsedPost.title).toBe(postPayload.title);
          expect(parsedPost.excerpt).toBe(postPayload.excerpt);
          expect(parsedPost.content).toBe(postPayload.content);
          expect(parsedPost.isPublished).toBe(true);
          expect(parsedPost.slug).toBeTruthy();

          createdPostIds.push(parsedPost.id);
        });
      });

      test("should successfully create a new post with associated tags", async ({ adminApi }) => {
        // Arrange
        let tagId = "";
        const tagName = faker.word.noun() + Date.now();
        await test.step("Create tag for post", async () => {
          const tagRes = await adminApi.tagsController.createTag(tagName);
          const tagData = await tagRes.json();
          tagId = tagData.id;
        });

        const postPayload = {
          title: "Tagged Blog Post " + faker.lorem.words(3),
          content: faker.lorem.paragraph(),
          tagIds: [tagId],
          isPublished: true,
        };
        let response: any;

        // Act
        await test.step("Send create post request with tagIds", async () => {
          response = await adminApi.postsController.createPost(postPayload);
        });

        // Assert
        await test.step("Verify post contains associated tag", async () => {
          expect(response.status()).toBe(201);
          await verifyHeaders(response);

          const data = await response.json();
          const parsedPost = PostsSchemas.PostSchema.parse(data);
          createdPostIds.push(parsedPost.id);

          expect(parsedPost.tags).toBeDefined();
          expect(parsedPost.tags?.some((t) => t.id === tagId)).toBe(true);

          // Cleanup tag
          await adminApi.tagsController.deleteTag(tagId, false);
        });
      });
    },
  );

  test.describe(
    "POST /api/posts - Create a new post (Error responses)",
    { tag: [TAG.regression, TAG.negative, TAG.aiGenerated] },
    () => {
      test("should return 400 Bad Request if title is missing or less than 3 characters", async ({ adminApi }) => {
        // Arrange
        let responseMissingTitle: any;
        let responseShortTitle: any;

        // Act
        await test.step("Send requests with invalid payloads", async () => {
          responseMissingTitle = await adminApi.postsController.createPost(
            { content: faker.lorem.paragraph() },
            false,
          );
          responseShortTitle = await adminApi.postsController.createPost({ title: "ab" }, false);
        });

        // Assert
        await test.step("Verify error status code 400", async () => {
          expect(responseMissingTitle.status()).toBe(400);
          expect(responseShortTitle.status()).toBe(400);
          await verifyHeaders(responseMissingTitle);
          await verifyHeaders(responseShortTitle);
        });
      });
    },
  );

  test.describe(
    "POST /api/posts - Create a new post (Unauthorized)",
    { tag: [TAG.regression, TAG.negative, TAG.notAuthorized, TAG.aiGenerated] },
    () => {
      test("should return 401 Unauthorized if no token is provided", async ({ anonymousApi }) => {
        // Arrange
        const postPayload = { title: "Unauthorized Post Title" };
        let response: any;

        // Act
        await test.step("Send request without token", async () => {
          response = await anonymousApi.postsController.createPost(postPayload, false);
        });

        // Assert
        await test.step("Verify 401 Unauthorized response", async () => {
          expect(response.status()).toBe(401);
          await verifyHeaders(response);
        });
      });

      test("should return 403 Forbidden if user role is not ADMIN", async ({ userApi }) => {
        // Arrange
        const postPayload = { title: "Forbidden Post Title" };
        let response: any;

        // Act
        await test.step("Send request with non-admin user token", async () => {
          response = await userApi.postsController.createPost(postPayload, false);
        });

        // Assert
        await test.step("Verify 403 Forbidden response", async () => {
          expect(response.status()).toBe(403);
          await verifyHeaders(response);
        });
      });
    },
  );

  test.describe(
    "PATCH /api/posts/{postId} - Update a post (Authorized)",
    { tag: [TAG.regression, TAG.positive, TAG.authorized, TAG.aiGenerated] },
    () => {
      test("should successfully update an existing post", async ({ adminApi }) => {
        // Arrange
        let postId = "";
        await test.step("Create initial post", async () => {
          const createRes = await adminApi.postsController.createPost({
            title: "Initial Post " + faker.string.alphanumeric(6),
            isPublished: false,
          });
          const initialPost = await createRes.json();
          postId = initialPost.id;
          createdPostIds.push(postId);
        });

        const updatePayload = {
          title: "Updated Post Title " + faker.string.alphanumeric(6),
          content: "Updated Content",
          isPublished: true,
        };
        let response: any;

        // Act
        await test.step("Send update post request", async () => {
          response = await adminApi.postsController.updatePost(postId, updatePayload);
        });

        // Assert
        await test.step("Verify updated post response and schema", async () => {
          expect(response.status()).toBe(200);
          await verifyHeaders(response);

          const data = await response.json();
          const updatedPost = PostsSchemas.PostSchema.parse(data);

          expect(updatedPost.title).toBe(updatePayload.title);
          expect(updatedPost.content).toBe(updatePayload.content);
          expect(updatedPost.isPublished).toBe(true);
        });
      });
    },
  );

  test.describe(
    "PATCH /api/posts/{postId} - Update a post (Unauthorized)",
    { tag: [TAG.regression, TAG.negative, TAG.notAuthorized, TAG.aiGenerated] },
    () => {
      test("should return 401 Unauthorized if no token is provided", async ({ anonymousApi, adminApi }) => {
        // Arrange
        let postId = "";
        await test.step("Create initial post", async () => {
          const createRes = await adminApi.postsController.createPost({
            title: "Post for Unauth PATCH " + faker.string.alphanumeric(6),
          });
          const initialPost = await createRes.json();
          postId = initialPost.id;
          createdPostIds.push(postId);
        });

        let response: any;
        // Act
        await test.step("Send patch request without token", async () => {
          response = await anonymousApi.postsController.updatePost(postId, { title: "New Title" }, false);
        });

        // Assert
        await test.step("Verify 401 Unauthorized response", async () => {
          expect(response.status()).toBe(401);
          await verifyHeaders(response);
        });
      });

      test("should return 403 Forbidden if user role is not ADMIN", async ({ userApi, adminApi }) => {
        // Arrange
        let postId = "";
        await test.step("Create initial post", async () => {
          const createRes = await adminApi.postsController.createPost({
            title: "Post for Forbidden PATCH " + faker.string.alphanumeric(6),
          });
          const initialPost = await createRes.json();
          postId = initialPost.id;
          createdPostIds.push(postId);
        });

        let response: any;
        // Act
        await test.step("Send patch request with regular user token", async () => {
          response = await userApi.postsController.updatePost(postId, { title: "New Title" }, false);
        });

        // Assert
        await test.step("Verify 403 Forbidden response", async () => {
          expect(response.status()).toBe(403);
          await verifyHeaders(response);
        });
      });
    },
  );

  test.describe(
    "DELETE /api/posts/{postId} - Delete a post (Authorized)",
    { tag: [TAG.regression, TAG.positive, TAG.authorized, TAG.aiGenerated] },
    () => {
      test("should successfully delete an existing post", async ({ adminApi }) => {
        // Arrange
        let postId = "";
        await test.step("Create post to delete", async () => {
          const createRes = await adminApi.postsController.createPost({
            title: "Post to Delete " + faker.string.alphanumeric(6),
          });
          const initialPost = await createRes.json();
          postId = initialPost.id;
        });

        let response: any;
        // Act
        await test.step("Send delete post request", async () => {
          response = await adminApi.postsController.deletePost(postId);
        });

        // Assert
        await test.step("Verify delete response and schema", async () => {
          expect(response.status()).toBe(200);
          await verifyHeaders(response);

          const data = await response.json();
          PostsSchemas.SuccessResponseSchema.parse(data);
          expect(data.success).toBe(true);
        });
      });
    },
  );

  test.describe(
    "DELETE /api/posts/{postId} - Delete a post (Unauthorized)",
    { tag: [TAG.regression, TAG.negative, TAG.notAuthorized, TAG.aiGenerated] },
    () => {
      test("should return 401 Unauthorized if no token is provided", async ({ anonymousApi, adminApi }) => {
        // Arrange
        let postId = "";
        await test.step("Create initial post", async () => {
          const createRes = await adminApi.postsController.createPost({
            title: "Post for Unauth DELETE " + faker.string.alphanumeric(6),
          });
          const initialPost = await createRes.json();
          postId = initialPost.id;
          createdPostIds.push(postId);
        });

        let response: any;
        // Act
        await test.step("Send delete request without token", async () => {
          response = await anonymousApi.postsController.deletePost(postId, false);
        });

        // Assert
        await test.step("Verify 401 Unauthorized response", async () => {
          expect(response.status()).toBe(401);
          await verifyHeaders(response);
        });
      });

      test("should return 403 Forbidden if user role is not ADMIN", async ({ userApi, adminApi }) => {
        // Arrange
        let postId = "";
        await test.step("Create initial post", async () => {
          const createRes = await adminApi.postsController.createPost({
            title: "Post for Forbidden DELETE " + faker.string.alphanumeric(6),
          });
          const initialPost = await createRes.json();
          postId = initialPost.id;
          createdPostIds.push(postId);
        });

        let response: any;
        // Act
        await test.step("Send delete request with regular user token", async () => {
          response = await userApi.postsController.deletePost(postId, false);
        });

        // Assert
        await test.step("Verify 403 Forbidden response", async () => {
          expect(response.status()).toBe(403);
          await verifyHeaders(response);
        });
      });
    },
  );
});

# Test Plan: /api/posts

This document outlines the test strategy and test cases to cover the `/api/posts` endpoints (`posts.spec.ts`) based on the AAA (Arrange, Act, Assert) principle.

## 1. Describe Block Structure

```typescript
describe('/api/posts Endpoints', () => {
  describe('GET /api/posts - Get all published posts', { tag: [TAG.regression, TAG.positive, TAG.aiGenerated] }, () => {
    // Happy path tests
  });

  describe('POST /api/posts - Create a new post (Authorized)', { tag: [TAG.regression, TAG.positive, TAG.authorized, TAG.aiGenerated] }, () => {
    // Happy path creation
  });

  describe('POST /api/posts - Create a new post (Error responses)', { tag: [TAG.regression, TAG.negative, TAG.aiGenerated] }, () => {
    // Validation errors (missing/invalid fields)
  });

  describe('POST /api/posts - Create a new post (Unauthorized)', { tag: [TAG.regression, TAG.negative, TAG.notAuthorized, TAG.aiGenerated] }, () => {
    // Auth & permission errors
  });

  describe('PATCH /api/posts/{postId} - Update a post (Authorized)', { tag: [TAG.regression, TAG.positive, TAG.authorized, TAG.aiGenerated] }, () => {
    // Happy path update
  });

  describe('PATCH /api/posts/{postId} - Update a post (Unauthorized)', { tag: [TAG.regression, TAG.negative, TAG.notAuthorized, TAG.aiGenerated] }, () => {
    // Auth & permission errors
  });

  describe('DELETE /api/posts/{postId} - Delete a post (Authorized)', { tag: [TAG.regression, TAG.positive, TAG.authorized, TAG.aiGenerated] }, () => {
    // Happy path deletion
  });

  describe('DELETE /api/posts/{postId} - Delete a post (Unauthorized)', { tag: [TAG.regression, TAG.negative, TAG.notAuthorized, TAG.aiGenerated] }, () => {
    // Auth & permission errors
  });
});
```

## 2. Test Cases to Cover

### 📝 GET /api/posts

*   **Test**: `should retrieve a list of published posts`
    *   **Arrange**: Create published and unpublished test posts via `adminApi`.
    *   **Act**: Send `GET` request to `/api/posts` without token (`anonymousApi`).
    *   **Assert**: 
        *   Status code is `200 OK`.
        *   Validate response headers (`verifyHeaders`).
        *   Validate response schema (`PostListSchema`).
        *   Verify all returned posts have `isPublished` equal to `true`.

### ➕ POST /api/posts

*   **Test**: `should successfully create a new post with valid payload`
    *   **Arrange**: `ADMIN` token, valid payload `{ title: "Test Post Title", content: "Test Content", isPublished: true }`.
    *   **Act**: Send `POST` request to `/api/posts`.
    *   **Assert**: 
        *   Status `201 Created`.
        *   Validate response headers (`verifyHeaders`).
        *   Validate response schema (`PostSchema`).
        *   Verify generated slug and properties match request payload.

*   **Test**: `should successfully create a new post with associated tags`
    *   **Arrange**: Create tag via `adminApi`, valid payload with `tagIds: [tagId]`.
    *   **Act**: Send `POST` request to `/api/posts`.
    *   **Assert**: 
        *   Status `201 Created`.
        *   Validate response schema (`PostSchema`).
        *   Verify post response includes attached tag under `tags`.

*   **Test**: `should return 400 Bad Request if title is missing or less than 3 characters`
    *   **Arrange**: `ADMIN` token, invalid payloads (`{}` or `{ title: "hi" }`).
    *   **Act**: Send `POST` request to `/api/posts`.
    *   **Assert**: Status `400 Bad Request`, validate headers (`verifyHeaders`).

*   **Test**: `should return 401 Unauthorized if no token is provided`
    *   **Arrange**: `anonymousApi`, valid post payload.
    *   **Act**: Send `POST` request to `/api/posts`.
    *   **Assert**: Status `401 Unauthorized`, validate headers (`verifyHeaders`).

*   **Test**: `should return 403 Forbidden if user role is not ADMIN`
    *   **Arrange**: `userApi` (regular user token), valid post payload.
    *   **Act**: Send `POST` request to `/api/posts`.
    *   **Assert**: Status `403 Forbidden`, validate headers (`verifyHeaders`).

### ✏️ PATCH /api/posts/{postId}

*   **Test**: `should successfully update an existing post`
    *   **Arrange**: Create a post via `adminApi`. Construct updated title and content payload.
    *   **Act**: Send `PATCH` request to `/api/posts/{postId}` using `adminApi`.
    *   **Assert**: 
        *   Status `200 OK`.
        *   Validate response headers (`verifyHeaders`).
        *   Validate response schema (`PostSchema`).
        *   Verify updated fields match payload.

*   **Test**: `should return 401 Unauthorized if no token is provided`
    *   **Arrange**: Existing post ID, `anonymousApi`.
    *   **Act**: Send `PATCH` request to `/api/posts/{postId}`.
    *   **Assert**: Status `401 Unauthorized`, validate headers (`verifyHeaders`).

*   **Test**: `should return 403 Forbidden if user role is not ADMIN`
    *   **Arrange**: Existing post ID, `userApi`.
    *   **Act**: Send `PATCH` request to `/api/posts/{postId}`.
    *   **Assert**: Status `403 Forbidden`, validate headers (`verifyHeaders`).

### 🗑️ DELETE /api/posts/{postId}

*   **Test**: `should successfully delete an existing post`
    *   **Arrange**: Create a post via `adminApi`.
    *   **Act**: Send `DELETE` request to `/api/posts/{postId}` using `adminApi`.
    *   **Assert**: 
        *   Status `200 OK`.
        *   Validate response headers (`verifyHeaders`).
        *   Validate response schema (`SuccessResponseSchema`).
        *   Verify `{ success: true }`.

*   **Test**: `should return 401 Unauthorized if no token is provided`
    *   **Arrange**: Existing post ID, `anonymousApi`.
    *   **Act**: Send `DELETE` request to `/api/posts/{postId}`.
    *   **Assert**: Status `401 Unauthorized`, validate headers (`verifyHeaders`).

*   **Test**: `should return 403 Forbidden if user role is not ADMIN`
    *   **Arrange**: Existing post ID, `userApi`.
    *   **Act**: Send `DELETE` request to `/api/posts/{postId}`.
    *   **Assert**: Status `403 Forbidden`, validate headers (`verifyHeaders`).

## 3. Cleanup & Strategy

*   Track created post IDs in a `createdPostIds: string[]` array during test setup and execution.
*   Clean up all created posts in `test.afterEach` hook using `adminApi.postsController.deletePost(id, false)`.

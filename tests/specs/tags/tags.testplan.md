# Test Plan: /api/tags

This document outlines the test strategy and test cases to cover the `/api/tags` endpoints (`tags.spec.ts`) based on the AAA (Arrange, Act, Assert) principle.

## 1. Describe Block Structure

```typescript
describe('/api/tags Endpoints', () => {
  describe('GET /api/tags - Get all tags', { tag: [TAG.regression, TAG.positive, TAG.aiGenerated] }, () => {
    // Happy path tests
  });

  describe('POST /api/tags - Create a new tag (Authorized)', { tag: [TAG.regression, TAG.positive, TAG.authorized, TAG.aiGenerated] }, () => {
    // Happy path creation
  });

  describe('POST /api/tags - Create a new tag (Error responses)', { tag: [TAG.regression, TAG.negative, TAG.aiGenerated] }, () => {
    // Validation & conflict errors
  });

  describe('POST /api/tags - Create a new tag (Unauthorized)', { tag: [TAG.regression, TAG.negative, TAG.notAuthorized, TAG.aiGenerated] }, () => {
    // Auth & permission errors
  });

  describe('DELETE /api/tags/{tagId} - Delete a tag (Authorized)', { tag: [TAG.regression, TAG.positive, TAG.authorized, TAG.aiGenerated] }, () => {
    // Happy path deletion
  });

  describe('DELETE /api/tags/{tagId} - Delete a tag (Unauthorized)', { tag: [TAG.regression, TAG.negative, TAG.notAuthorized, TAG.aiGenerated] }, () => {
    // Auth & permission errors
  });
});
```

## 2. Test Cases to Cover

### 🏷️ GET /api/tags

*   **Test**: `should retrieve a list of all tags`
    *   **Arrange**: Create test tags via `adminApi`.
    *   **Act**: Send `GET` request to `/api/tags` without token.
    *   **Assert**: 
        *   Status code is `200 OK`.
        *   Validate response headers (`verifyHeaders`).
        *   Validate response schema (`TagListSchema`).
        *   Verify tags are sorted in ascending order.

### ➕ POST /api/tags

*   **Test**: `should successfully create a new tag`
    *   **Arrange**: ADMIN token, valid payload `{ name: "New Tag" }`.
    *   **Act**: Send `POST` request.
    *   **Assert**: Status `201 Created`, validate headers (`verifyHeaders`), validate schema (`TagSchema`), verify slug generation.

*   **Test**: `should return 400 Bad Request if the name is missing or not a string`
    *   **Arrange**: ADMIN token, payload `{}` or `{ name: 123 }`.
    *   **Act**: Send `POST` request.
    *   **Assert**: Status `400 Bad Request`, validate headers (`verifyHeaders`).

*   **Test**: `should return 400 Bad Request if the name is less than 2 characters`
    *   **Arrange**: ADMIN token, payload `{ name: "a" }`.
    *   **Act**: Send `POST` request.
    *   **Assert**: Status `400 Bad Request`, validate headers (`verifyHeaders`).

*   **Test**: `should return 409 Conflict if a tag with the same slug already exists`
    *   **Arrange**: Create initial tag "Existing Tag".
    *   **Act**: Send `POST` with identical tag name.
    *   **Assert**: Status `409 Conflict`, validate headers (`verifyHeaders`).

*   **Test**: `should return 401 Unauthorized if no token is provided` (Status 401, `verifyHeaders`).
*   **Test**: `should return 403 Forbidden if user role is not ADMIN` (Status 403, `verifyHeaders`).

### 🗑️ DELETE /api/tags/{tagId}

*   **Test**: `should successfully delete an existing tag`
    *   **Arrange**: Create tag to delete.
    *   **Act**: Send `DELETE` request to `/api/tags/{tagId}` using ADMIN token.
    *   **Assert**: Status `200 OK`, validate headers (`verifyHeaders`), validate response `{ success: true }`.

*   **Test**: `should return 401 Unauthorized if no token is provided` (Status 401, `verifyHeaders`).
*   **Test**: `should return 403 Forbidden if user role is not ADMIN` (Status 403, `verifyHeaders`).

## 3. Cleanup & Strategy
*   Track all created tag IDs in `createdTagIds` array during setup.
*   Clean up all created tags in `afterEach` hook using `adminApi.tagsController.deleteTag(id, false)`.

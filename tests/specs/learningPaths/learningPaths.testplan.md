# Test Plan: /api/learning-paths

This document outlines the test strategy and test cases to cover the `/api/learning-paths` endpoint (`learningPaths.spec.ts`) based on the AAA (Arrange, Act, Assert) principle.

## 1. Target Endpoints

- `POST /api/learning-paths` — Create a new learning path with optional nested modules, video, certificate, categories, and mandatory instructor.

## 2. Describe Block Structure

```typescript
describe('/api/learning-paths Endpoints', () => {
  describe('POST /api/learning-paths - Create a learning path (Authorized)', { tag: [TAG.regression, TAG.positive, TAG.authorized, TAG.roleAdmin, TAG.aiGenerated] }, () => {
    // Happy path creation scenarios
  });

  describe('POST /api/learning-paths - Create a learning path (Validation errors)', { tag: [TAG.regression, TAG.negative, TAG.aiGenerated] }, () => {
    // Schema and body validation errors
  });

  describe('POST /api/learning-paths - Create a learning path (Unauthorized & Forbidden)', { tag: [TAG.regression, TAG.negative, TAG.notAuthorized, TAG.aiGenerated] }, () => {
    // Auth and permission boundaries
  });
});
```

## 3. Test Cases Breakdown (AAA Pattern)

### ➕ POST /api/learning-paths (Happy Path Scenarios)

*   **Test**: `should successfully create a learning path with minimum required fields`
    *   **Arrange**: Prepare payload with `title` (at least 3 chars) and `instructor` (with `name`).
    *   **Act**: Send `POST` request to `/api/learning-paths` using `adminApi`.
    *   **Assert**:
        *   Status code is `201 Created`.
        *   Validate response headers using `verifyHeaders`.
        *   Validate JSON response schema against `LearningPathSchema`.
        *   Verify generated properties: `title`, `slug`, `isPublished` (default `false`), and `instructor.name`.

*   **Test**: `should successfully create a learning path with full nested relations`
    *   **Arrange**: Prepare complete payload with `title`, `description`, `modules` array, `video` object (`title`, `videoId`), `certificate` object (`name`, `description`, `templateUrl`), and `instructor` object (`name`, `bio`, `avatarUrl`).
    *   **Act**: Send `POST` request to `/api/learning-paths` using `adminApi`.
    *   **Assert**:
        *   Status code is `201 Created`.
        *   Validate response headers using `verifyHeaders`.
        *   Validate JSON response schema against `LearningPathSchema`.
        *   Verify created nested modules, video, certificate, and instructor fields match request payload.

### ⚠️ POST /api/learning-paths (Validation Error Scenarios)

*   **Test**: `should return 400 Bad Request if title is missing or shorter than 3 characters`
    *   **Arrange**: Prepare invalid payload with `title: "ab"` and valid `instructor`.
    *   **Act**: Send `POST` request to `/api/learning-paths` using `adminApi` with `failOnStatusCode: false`.
    *   **Assert**:
        *   Status code is `400 Bad Request`.
        *   Validate response headers using `verifyHeaders`.
        *   Verify error message mentions title requirement.

*   **Test**: `should return 400 Bad Request if instructor is missing or instructor name is missing`
    *   **Arrange**: Prepare invalid payload with valid `title` but missing `instructor` or `{ instructor: {} }`.
    *   **Act**: Send `POST` request to `/api/learning-paths` using `adminApi` with `failOnStatusCode: false`.
    *   **Assert**:
        *   Status code is `400 Bad Request`.
        *   Validate response headers using `verifyHeaders`.
        *   Verify error message indicates instructor is required.

### 🔒 POST /api/learning-paths (Auth & Role Boundary Scenarios)

*   **Test**: `should return 401 Unauthorized when no authentication token is provided`
    *   **Arrange**: Prepare valid payload with `title` and `instructor`.
    *   **Act**: Send `POST` request to `/api/learning-paths` using `anonymousApi` with `failOnStatusCode: false`.
    *   **Assert**:
        *   Status code is `401 Unauthorized`.
        *   Validate response headers using `verifyHeaders`.

*   **Test**: `should return 403 Forbidden when caller is not an ADMIN user`
    *   **Arrange**: Prepare valid payload with `title` and `instructor`.
    *   **Act**: Send `POST` request to `/api/learning-paths` using `userApi` (regular user token) with `failOnStatusCode: false`.
    *   **Assert**:
        *   Status code is `403 Forbidden`.
        *   Validate response headers using `verifyHeaders`.

## 4. Cleanup & Fixture Strategy

*   Track created Learning Path IDs in a local `createdLearningPathIds: string[]` array within spec execution.
*   In `test.afterEach` hook, iterate over `createdLearningPathIds` and invoke `deleteLearningPathFromDb(id)` to ensure clean state and prevent DB pollution.

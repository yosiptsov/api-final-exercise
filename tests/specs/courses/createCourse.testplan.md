# Test Plan: POST /api/courses

This document outlines the test strategy and test cases to cover the course creation endpoint (`createCourse.spec.ts`) based on the AAA (Arrange, Act, Assert) principle.

## 1. Describe Block Structure

```typescript
describe('POST /api/courses - Create a new course', { tag: [TAG.course] }, () => {
  describe('Positive scenarios (Password grant token)', { tag: [TAG.positive, TAG.regression, TAG.passToken, TAG.aiGenerated] }, () => {
    // Happy path tests
  });

  describe('Course 03: Negative scenarios - Validation', { tag: [TAG.negative, TAG.passToken, TAG.aiGenerated] }, () => {
    // Input validation errors (e.g. title too short)
  });

  describe('Negative scenarios - Authorization & Authentication', () => {
    describe('clientCredentials token', { tag: [TAG.negative, TAG.clientToken, TAG.aiGenerated] }, () => {
      // Forbidden for client credentials
    });
    describe('password token', { tag: [TAG.negative, TAG.passToken, TAG.aiGenerated] }, () => {
      // Forbidden for non-admin / Unauthorized without token
    });
  });
});
```

## 2. Test Cases to Cover

### ➕ POST /api/courses

#### Positive Scenarios
*   **Course 01**: `should successfully create a new course with a valid title`
    *   **Arrange**: ADMIN user token, generated course payload with valid title.
    *   **Act**: Send `POST /api/courses`.
    *   **Assert**: 
        *   Status code `201 Created`.
        *   Response matches Zod schema (`CourseResponseSchema`).
        *   Headers verified via `verifyHeaders`.
        *   Default state flags (`isPublished: false`, `isListed: true`, `isFeatured: false`).
        *   Read created course details via GET to confirm persistence.

*   **Course 02**: `should create a unique slug if a course with the same title already exists`
    *   **Arrange**: Initial course created with title T. Duplicate payload with identical title T.
    *   **Act**: Send second `POST /api/courses`.
    *   **Assert**: Status `201 Created`, slug matches regex pattern `^<originalSlug>-\d+$`.

#### Negative Scenarios (Validation)
*   **Course 03**: `Course should return 400 Bad Request for incorrect title payloads`
    *   **Arrange**: Parameterized payloads with short title (< 3 chars) or missing title.
    *   **Act**: Send `POST /api/courses` with `failOnStatusCode: false`.
    *   **Assert**: Status `400 Bad Request`, error message "Title must be at least 3 characters", headers verified via `verifyHeaders`.

#### Negative Scenarios (Auth & Permissions)
*   **Course 04**: `clientCredentials token should not allow to create a course`
    *   **Act**: Send `POST /api/courses` using client credentials token.
    *   **Assert**: Status `403 Forbidden`, `verifyHeaders`.

*   **Course 05**: `should return 403 Forbidden if user role is not ADMIN`
    *   **Act**: Send `POST /api/courses` using regular USER token.
    *   **Assert**: Status `403 Forbidden`, `verifyHeaders`.

*   **Course 06**: `should return 401 Unauthorized if no token is provided`
    *   **Act**: Send `POST /api/courses` without token (anonymous).
    *   **Assert**: Status `401 Unauthorized`, `verifyHeaders`.

## 3. Cleanup & Strategy
*   Clean up created course instances in `afterEach` hook using `adminApi.coursesController.deleteCourse(id)`.

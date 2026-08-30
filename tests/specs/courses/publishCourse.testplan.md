# Test Plan: PATCH /api/courses/{courseId}/publish

This document outlines the test strategy and test cases to cover publishing and unpublishing course endpoints (`publishCourse.spec.ts`) based on the AAA (Arrange, Act, Assert) principle.

## 1. Describe Block Structure

```typescript
describe('PATCH /api/courses/{courseId}/publish - Publish/Unpublish a course', { tag: [TAG.course] }, () => {
  describe('Positive scenarios (Password grant token)', { tag: [TAG.positive, TAG.regression, TAG.passToken, TAG.aiGenerated] }, () => {
    // Publish and unpublish happy paths
  });

  describe('Negative scenarios - Validation', () => {
    // Missing required fields/chapters
  });

  describe('Negative scenarios - Not Found', () => {
    // Non-existent courseId
  });

  describe('Negative scenarios - Authorization & Authentication', () => {
    // Permission boundaries and unauthenticated access
  });
});
```

## 2. Test Cases to Cover

### 🚀 PATCH /api/courses/{courseId}/publish

#### Positive Scenarios
*   **Publish 01**: `should successfully publish an unpublished course that meets all requirements`
    *   **Arrange**: Create course, populate description/imageUrl/price, add a chapter, and publish that chapter (`isPublished: true`).
    *   **Act**: Call `publishCourse(courseId)` via ADMIN token.
    *   **Assert**: 
        *   Status code `200 OK`.
        *   Validate Zod schema (`CourseResponseSchema`).
        *   Headers verified via `verifyHeaders`.
        *   Verify `isPublished === true`.

*   **Publish 02**: `should successfully unpublish a published course`
    *   **Arrange**: Create course, meet publication prerequisites, publish the course.
    *   **Act**: Call `updateCourse(courseId, { isPublished: false })` via ADMIN token.
    *   **Assert**: Status `200 OK`, Zod schema valid, `verifyHeaders`, `isPublished === false`.

#### Negative Scenarios (Validation & Prerequisites)
*   **Publish 03**: `should return 400 Bad Request if course does not meet publishing criteria (e.g. missing published chapter or price)`
    *   **Arrange**: Create draft course without published chapters.
    *   **Act**: Attempt to publish.
    *   **Assert**: Status `400 Bad Request`, verify error message and `verifyHeaders`.

#### Negative Scenarios (Auth & Roles)
*   **Publish 04**: `should return 403 Forbidden for non-admin user / client token`
    *   **Act**: Attempt to publish course with standard USER token or client credentials.
    *   **Assert**: Status `403 Forbidden`, `verifyHeaders`.

*   **Publish 05**: `should return 401 Unauthorized for anonymous user`
    *   **Act**: Attempt to publish course without token.
    *   **Assert**: Status `401 Unauthorized`, `verifyHeaders`.

## 3. Cleanup & Strategy
*   Clean up created course and its associated chapters in `afterEach` hook using `adminApi.coursesController.deleteCourse(id)`.

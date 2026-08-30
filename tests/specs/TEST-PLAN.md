# Test Plan

## Endpoints Covered: `/api/tags`

### 1. `GET /api/tags`
*   **Description:** Retrieves a list of all tags.
*   **Coverage:** 
    *   Verified successful retrieval (status `200`).
    *   Verified response data schema using Zod (`TagListSchema`).
    *   Verified that the list is sorted in ascending alphabetical order by `name`.

### 2. `POST /api/tags`
*   **Description:** Creates a new tag.
*   **Coverage:**
    *   **(Positive)** Successfully created a tag with valid payload by an ADMIN user (status `201`). Verified returned data schema and generated slug.
    *   **(Negative - Validation)** Sent empty payload and invalid payload types (e.g., number instead of string), expected `400 Bad Request`.
    *   **(Negative - Validation)** Sent a tag name with less than 2 characters, expected `400 Bad Request`.
    *   **(Negative - Conflict)** Tried to create a tag with a slug that already exists in the database, expected `409 Conflict`.
    *   **(Negative - Auth)** Sent request without token, expected `401 Unauthorized`.
    *   **(Negative - Roles)** Sent request with a standard `USER` token (not ADMIN), expected `403 Forbidden`.

### 3. `DELETE /api/tags/{tagId}`
*   **Description:** Deletes a specific tag by ID.
*   **Coverage:**
    *   **(Positive)** Successfully deleted an existing tag by an ADMIN user, expected `200 OK` and `{ success: true }`.
    *   **(Negative - Auth)** Tried to delete without token, expected `401 Unauthorized`.
    *   **(Negative - Roles)** Tried to delete with a standard `USER` token, expected `403 Forbidden`.

> Note: Clean-up mechanism was implemented in `afterEach` hook to remove dynamically created tags using the API (`adminApi.tagsController.deleteTag`) to avoid flakiness and `409 Conflict` issues in CI environments.

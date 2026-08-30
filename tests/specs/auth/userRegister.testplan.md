# Test Plan: POST /api/auth/register

This document outlines the test strategy and test cases to cover the user registration endpoint (`userRegister.spec.ts`) based on the AAA (Arrange, Act, Assert) principle.

## 1. Describe Block Structure

```typescript
describe('POST /api/auth/register - Test Coverage Suite', () => {
  describe('Positive Scenarios (Successful Registration)', { tag: [TAG.positive, TAG.regression, TAG.aiGenerated] }, () => {
    // Happy path registration
  });

  describe('Negative Validation Scenarios - 400 Bad Request', () => {
    describe('UserReg 02: User payload missing required fields', { tag: [TAG.negative, TAG.aiGenerated] }, () => {});
    describe('UserReg 03: Invalid name constraints', { tag: [TAG.negative, TAG.aiGenerated] }, () => {});
    describe('UserReg 04: Invalid email format', { tag: [TAG.negative, TAG.aiGenerated] }, () => {});
    describe('UserReg 05: Invalid password complexity', { tag: [TAG.negative, TAG.regression, TAG.aiGenerated] }, () => {});
  });

  describe('Business Logic / Conflict Scenarios - 409 Conflicts', { tag: [TAG.negative, TAG.regression, TAG.aiGenerated] }, () => {
    // Duplicate user registration
  });
});
```

## 2. Test Cases to Cover

### 👤 POST /api/auth/register

#### Positive Scenarios
*   **UserReg 01**: `A new user can be registered`
    *   **Arrange**: Generate valid user payload (name, unique email, strong password).
    *   **Act**: Send `POST /api/auth/register` via `anonymousApi`.
    *   **Assert**: 
        *   Status code `201 Created`.
        *   Validate Zod response schema (`RegisterUserResponseSchema`).
        *   Validate headers (`verifyHeaders`).
        *   Verify database state via `verifyUserExistsInDB`.
        *   Verify response contains `id`, `name`, `email`, and `role: "USER"`.

#### Negative Validation Scenarios (400 Bad Request)
*   **UserReg 02**: `Register fails when required fields are missing`
    *   **Arrange**: Parameterized payloads missing `name`, `email`, or `password`.
    *   **Act**: Send `POST /api/auth/register`.
    *   **Assert**: Status `400 Bad Request`, `verifyHeaders`.

*   **UserReg 03**: `Register fails when name constraints are violated`
    *   **Arrange**: Payloads with empty string name or overly long name.
    *   **Act**: Send `POST /api/auth/register`.
    *   **Assert**: Status `400 Bad Request`, `verifyHeaders`.

*   **UserReg 04**: `Register fails when email format is invalid`
    *   **Arrange**: Invalid email strings (e.g. `invalid-email`, `@domain.com`).
    *   **Act**: Send `POST /api/auth/register`.
    *   **Assert**: Status `400 Bad Request`, `verifyHeaders`.

*   **UserReg 05**: `Register fails when password complexity is insufficient`
    *   **Arrange**: Short passwords (< 8 chars), passwords missing numbers or uppercase letters.
    *   **Act**: Send `POST /api/auth/register`.
    *   **Assert**: Status `400 Bad Request`, `verifyHeaders`.

#### Conflict Scenarios (409 Conflict)
*   **UserReg 06**: `Duplicate email registration`
    *   **Arrange**: Pre-register a user with email E and verify DB existence.
    *   **Act**: Send `POST /api/auth/register` with identical email E.
    *   **Assert**: Status `409 Conflict`, `verifyHeaders`.

## 3. Cleanup & Strategy
*   Clean up generated users in `afterEach` hook using `deleteUserFromDB(email)`.

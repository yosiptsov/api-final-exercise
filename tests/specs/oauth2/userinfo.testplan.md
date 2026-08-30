# Test Plan: GET /api/oauth/userinfo

This document outlines the test strategy and test cases to cover the OAuth user info endpoint (`userinfo.spec.ts`) based on the AAA (Arrange, Act, Assert) principle.

## 1. Describe Block Structure

```typescript
describe('GET /api/oauth/userinfo - Test Coverage Suite', () => {
  describe('Positive Scenarios (clientCredentials token)', { tag: [TAG.auth, TAG.regression, TAG.positive, TAG.clientToken, TAG.aiGenerated] }, () => {
    // Client credentials info
  });

  describe('Positive Scenarios (password grant token)', { tag: [TAG.positive, TAG.regression, TAG.passToken, TAG.aiGenerated] }, () => {
    // User credentials info
  });

  describe('Unauthorized Access', { tag: [TAG.auth, TAG.regression, TAG.negative, TAG.aiGenerated] }, () => {
    // Missing / invalid tokens
  });
});
```

## 2. Test Cases to Cover

### 🔑 GET /api/oauth/userinfo

#### Positive Scenarios (Client Credentials Token)
*   **oauth2 01**: `Service returns current user data for client credentials token`
    *   **Arrange**: Pre-authenticated `clientApi` fixture.
    *   **Act**: Send `GET /api/oauth/userinfo`.
    *   **Assert**: 
        *   Status code `200 OK`.
        *   Validate response schema against `ClientInfoSchema`.
        *   Validate headers (`verifyHeaders`).
        *   Verify fields: `sub` contains `"client_"`, `type` is `"client"`, `scopes` contains `["read"]`.

#### Positive Scenarios (Password Grant Token)
*   **oauth2 03**: `Service returns current user data for password grant token`
    *   **Arrange**: Pre-authenticated `adminApi` fixture.
    *   **Act**: Send `GET /api/oauth/userinfo`.
    *   **Assert**: 
        *   Status code `200 OK`.
        *   Validate headers (`verifyHeaders`).
        *   Validate response schema against `UserInfoSchema`.
        *   Verify returned user data: `email === "admin@dojo.api"`, `name === "Admin User"`, `role === "ADMIN"`.
        *   Verify sensitive fields (`password`, `passwordHash`) are `undefined`.

#### Negative Scenarios (Unauthorized)
*   **oauth2 02**: `returns 401 when Authorization header is missing`
    *   **Arrange**: `anonymousApi` fixture (no token).
    *   **Act**: Send `GET /api/oauth/userinfo` with `failOnStatusCode: false`.
    *   **Assert**: Status `401 Unauthorized`, `error: "Unauthorized"`, validate headers (`verifyHeaders`).

## 3. Cleanup & Strategy
*   No resources created or mutated during test execution (read-only endpoint).
*   Dynamic token acquisition handled seamlessly by `clientApi`, `adminApi`, and `anonymousApi` fixtures.

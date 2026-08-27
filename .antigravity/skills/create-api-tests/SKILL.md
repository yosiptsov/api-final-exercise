---
name: create-api-tests
description: use it when you need to create api tests to cover features or bugs, using playwright and typescript best practices. Covers schema validation with Zod 4/AJV, auth flow testing, CRUD lifecycle tests, error and header validation, pagination.
---

## Core Principles

> **Note:** The core project principles (like AAA testing, using Zod, authentication rules, and tags) have been moved to the global `.clinerules` file in the root of the project to ensure they are applied automatically across all tasks.

## Common Test Patterns (Strategy)

Cover each endpoint with a happy-path test plus at least one error-path test.

- **CRUD lifecycle** — a `describe.serial` block that creates, reads, updates, deletes, then verifies the 404. Carries the resource id across steps.
- **Auth flows** — login success, invalid credentials (401), expired token (401), token refresh, and permission boundary (403). Treat auth as its own describe block.
- **Error responses** — 400 (malformed body), 422 (validation with field details), 429 (rate limit + `retry-after`). Don't ship happy-path-only suites.
- **Response headers** — assert `content-type`, `cache-control`, and rate-limit headers directly, not behind a conditional that may never fire.
- **Pagination** — first-page metadata, out-of-bounds empty page, and rejection of invalid page size.

## Code example

Use the code here as an example
`.antigravity/skills/create-api-tests/references/code-example.md`

## Related Skills

1. If you need to create a controller for tests, use the skill at
   `.antigravity/skills/create-api-tests-controller/SKILL.md`
2. If you need to create a Zod schema or write a schema validation assertion, use the skill at
   `.antigravity/skills/api-tests-schema-validation/SKILL.md`
3. If you need to create a fixture, use the skill at
   `.antigravity/skills/create-api-tests-fixture/SKILL.md`

---

## Done When

- Every target endpoint has at least a happy-path test and at least one error-path test (4xx or 5xx response validated).
- Auth flow tested as its own describe block: successful login, invalid credentials, expired token, and permission boundary (403).
- Schema validation assertions on response shape using Zod 4 or AJV — not just `toHaveProperty` spot-checks.
- Header assertions exist for at least `content-type` and any cache/rate-limit headers the API sets, asserted unconditionally.
- Contract tests in place for any endpoint consumed by a different team or service (shared schema file; for consumer-driven verification use `contract-testing`).

---

## Anti-Patterns

### 1. Hardcoded auth tokens
Tokens expire, rotate, and differ across environments. Use a login fixture that acquires tokens dynamically.

### 2. Testing against production
API tests create, modify, and delete data. Run against a dedicated test environment or local instance.

### 3. Not validating error responses
Happy-path-only suites miss the most common production issues. Test 400, 401, 403, 404, and 500 responses for every endpoint.

### 4. Asserting headers only conditionally
Headers carry cache directives, rate limit info, content type, and CORS policy. Assert them directly on every relevant response — a check buried inside `if (rateLimited)` may never run and proves nothing.

### 5. No cleanup after test data creation
Tests that create resources without deleting them pollute the database. Use `afterEach`/`afterAll` hooks or fixture teardown.

### 6. Treating API tests as unit tests
Don't mock the database — API tests verify the contract from the consumer's perspective. Mock only genuine third parties you don't own (payment gateways, external SaaS).

### 7. Ignoring idempotency
PUT and DELETE should be idempotent. Test that calling them twice produces the same result.

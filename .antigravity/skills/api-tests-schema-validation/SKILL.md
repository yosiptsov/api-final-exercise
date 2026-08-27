---
name: api-tests-schema-validation
description: use it for generating ZOD schema and validation
---

Validate response shape against a schema rather than spot-checking individual fields with `toHaveProperty`. Two common approaches:

- **Zod 4** — define a schema, `safeParse` the response, and assert `result.success`. Log `result.error.issues` on failure for a precise diff. Use the Zod 4 native string formats: `z.email()`, `z.uuid()`, `z.iso.datetime()` — the chained `z.string().email()` forms are deprecated and slated for removal.
- **Schema-as-contract** — have both the API and the tests import the same schema file. If the response shape changes, consumer tests fail immediately. With an OpenAPI spec, auto-generate the schema (`orval` or `openapi-zod-client`).

## Zod (Zod 4 Native Form)

> **Zod 4 vs Zod 3.** Zod 4 shipped major API changes. Three to know: (1) **String formats moved to top-level functions** — `z.email()`, `z.uuid()`, `z.iso.datetime()` replace the chained `z.string().email()`, `z.string().uuid()`, `z.string().datetime()`. The chained forms still work but emit deprecation warnings and are slated for removal in the next major; write the new form. (2) `z.coerce` syntax changed and the error format is different — if your codebase mixes Zod 3 and 4 packages, error-format consumers silently break, so pin the version per package. (3) `z.uuid()` is now strict per RFC 9562/4122; use `z.guid()` for a permissive "UUID-like" check. For OpenAPI → Zod codegen, **`orval`** and **`openapi-zod-client`** are the maintained round-trip tools.

```typescript
import { z } from "zod";
import { test, expect } from "@playwright/test";

const UserSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  name: z.string().min(1),
  role: z.enum(["admin", "member", "viewer"]),
  createdAt: z.iso.datetime(),
});

const UsersListSchema = z.object({
  users: z.array(UserSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
});

test("GET /api/users", async ({ request }) => {
  // some code of the test ....
  //Assert
  await test.step("JSON schema matches ZOD template", () => {
    const result = UsersListSchema.safeParse(json);
    expect(result.success, { message: result.error?.message }).toBeTruthy();
  });
});
```

## Schema-as-Contract Pattern

Both API and tests import the same schema file. If the response shape changes, consumer tests fail immediately. With an OpenAPI spec, auto-generate the schema with `openapi-zod-client` (the maintained round-trip tools) so the contract stays in sync with the spec.

```typescript
// shared/schemas/user.schema.ts  (imported by both API and tests)
import { z } from "zod";
export const UserResponseSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  name: z.string(),
  role: z.enum(["admin", "member", "viewer"]),
  createdAt: z.iso.datetime(),
});
export type UserResponse = z.infer<typeof UserResponseSchema>;
```

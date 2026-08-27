---
name: create-api-tests-controller
description: when you need to generate API test controller, to hold all required methods for test execution
---

## Guidelines

- Use access modifiers (`private`, `public`, `protected`) to keep a clean API surface for each class.
- Use `BaseController` to hold repeatable code (update it if it needs to change). See the example below:

```typescript
import { APIRequestContext } from "@playwright/test";

export class BaseController {
  request: APIRequestContext;

  constructor(request: APIRequestContext) {
    this.request = request;
  }
}
```

- Add interfaces for request bodies, like in the `updateUser` method, or import them from the Zod schema.
- Add the endpoint as a variable when it's identical across all methods in a class.
- Add a `failOnStatusCode: false` option to methods so negative-path responses can be handled directly.
- Compose controllers with an `ApiClient` (see the example below):

```typescript
import { APIRequestContext } from "@playwright/test";
import { OAuthController } from "./OAuthController";

export class ApiClient {
  oAuthController: OAuthController;

  constructor(request: APIRequestContext) {
    this.oAuthController = new OAuthController(request);
  }
}
```

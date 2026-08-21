import { APIRequestContext } from "@playwright/test";

export class BaseController {
  request: APIRequestContext;

  constructor(request: APIRequestContext) {
    this.request = request;
  }
}

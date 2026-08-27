import { APIRequestContext } from "@playwright/test";
import { OAuthController } from "./OAuthController";

export class ApiClient {
  oAuthController: OAuthController;

  constructor(request: APIRequestContext) {
    this.oAuthController = new OAuthController(request);
  }
}

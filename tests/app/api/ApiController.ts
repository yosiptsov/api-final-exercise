import { APIRequestContext } from "@playwright/test";
import { OAuthController } from "./OAuthController";

export class ApiController {
  oAuthController: OAuthController;

  constructor(request: APIRequestContext) {
    this.oAuthController = new OAuthController(request);
  }
}

import { APIRequestContext } from "@playwright/test";
import { OAuthController } from "./OAuthController";
import { DBController } from "./dbController";

export class ApiController {
  oAuthController: OAuthController;
  dbController: DBController;

  constructor(request: APIRequestContext) {
    this.oAuthController = new OAuthController(request);
    this.dbController = new DBController(request);
  }
}

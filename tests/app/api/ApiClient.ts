import { APIRequestContext } from "@playwright/test";
import { OAuthController } from "./OAuthController";
import { CoursesController } from "./CoursesController";

export class ApiClient {
  oAuthController: OAuthController;
  coursesController: CoursesController;

  constructor(request: APIRequestContext) {
    this.oAuthController = new OAuthController(request);
    this.coursesController = new CoursesController(request);
  }
}

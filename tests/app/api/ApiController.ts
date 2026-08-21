import { APIRequestContext } from "@playwright/test";
import { ArticleController } from "./ArticleController";
import { UserController } from "./UserController";
import { OAuthController } from "./OAuthController";

export class ApiController {
  articleController: ArticleController;
  userController: UserController;
  oAuthController: OAuthController;

  constructor(request: APIRequestContext) {
    this.articleController = new ArticleController(request);
    this.userController = new UserController(request);
    this.oAuthController = new OAuthController(request);
  }
}

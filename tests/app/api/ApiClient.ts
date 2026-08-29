import { APIRequestContext } from "@playwright/test";
import { AuthController } from "./AuthController";
import { UserController } from "./UserController";
import { CoursesController } from "./CoursesController";
import { ChaptersController } from "./ChaptersController";

export class ApiClient {
  authController: AuthController;
  userController: UserController;
  coursesController: CoursesController;
  chaptersController: ChaptersController;

  constructor(request: APIRequestContext) {
    this.authController = new AuthController(request);
    this.userController = new UserController(request);
    this.coursesController = new CoursesController(request);
    this.chaptersController = new ChaptersController(request);
  }
}

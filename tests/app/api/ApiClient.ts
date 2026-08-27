import { APIRequestContext } from "@playwright/test";
import { AuthController } from "./AuthController";
import { UserController } from "./UserController";
import { CoursesController } from "./CoursesController";

export class ApiClient {
  authController: AuthController;
  userController: UserController;
  coursesController: CoursesController;

  constructor(request: APIRequestContext) {
    this.authController = new AuthController(request);
    this.userController = new UserController(request);
    this.coursesController = new CoursesController(request);
  }
}

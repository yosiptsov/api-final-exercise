import { APIRequestContext } from "@playwright/test";
import { AuthController } from "./AuthController";
import { UserController } from "./UserController";
import { CoursesController } from "./CoursesController";
import { ChaptersController } from "./ChaptersController";
import { TagsController } from "./TagsController";
import { PostsController } from "./PostsController";
import { PromoCodesController } from "./PromoCodesController";
import { LearningPathsController } from "./LearningPathsController";

export class ApiClient {
  authController: AuthController;
  userController: UserController;
  coursesController: CoursesController;
  chaptersController: ChaptersController;
  tagsController: TagsController;
  postsController: PostsController;
  promoCodesController: PromoCodesController;
  learningPathsController: LearningPathsController;

  constructor(request: APIRequestContext) {
    this.authController = new AuthController(request);
    this.userController = new UserController(request);
    this.coursesController = new CoursesController(request);
    this.chaptersController = new ChaptersController(request);
    this.tagsController = new TagsController(request);
    this.postsController = new PostsController(request);
    this.promoCodesController = new PromoCodesController(request);
    this.learningPathsController = new LearningPathsController(request);
  }
}


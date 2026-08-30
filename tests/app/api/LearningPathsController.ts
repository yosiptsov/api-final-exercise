import { BaseController } from "./BaseController";
import type { CreateLearningPathPayload } from "../schemas/LearningPaths";

export class LearningPathsController extends BaseController {
  private endpoint = "api/learning-paths";

  async createLearningPath(
    payload: CreateLearningPathPayload | Record<string, unknown>,
    failOnStatusCode: boolean = true,
  ) {
    const response = await this.request.post(this.endpoint, {
      data: payload,
      failOnStatusCode,
    });
    return response;
  }
}

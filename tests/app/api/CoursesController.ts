import { BaseController } from "./BaseController";
import { CreateCoursePayload } from "../schemas/Courses";

export class CoursesController extends BaseController {
  private endpoint = "/api/courses";

  async createCourse(coursePayload: CreateCoursePayload, failOnStatusCode: boolean = true) {
    const response = await this.request.post(this.endpoint, {
      data: coursePayload,
      failOnStatusCode: failOnStatusCode,
    });

    return response;
  }

  async getCourseDetails(courseId: string, failOnStatusCode: boolean = true) {
    const response = await this.request.get(`${this.endpoint}/${courseId}`, {
      failOnStatusCode: failOnStatusCode,
    });

    return response;
  }

  async updateCourse(courseId: string, coursePayload: Partial<CreateCoursePayload>, failOnStatusCode: boolean = true) {
    const response = await this.request.patch(`${this.endpoint}/${courseId}`, {
      data: coursePayload,
      failOnStatusCode: failOnStatusCode,
    });
    return response;
  }

  async deleteCourse(courseId: string, failOnStatusCode: boolean = true) {
    const response = await this.request.patch(`${this.endpoint}/${courseId}/publish`, {
      failOnStatusCode: failOnStatusCode,
    });
    return response;
  }
}

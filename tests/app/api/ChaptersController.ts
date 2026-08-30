import { BaseController } from "./BaseController";
import type * as ChapterTypes from "../schemas/Chapters";

export class ChaptersController extends BaseController {
  private endpoint = (courseId: string) => `api/courses/${courseId}/chapters`;
  private chapterEndpoint = (courseId: string, chapterId: string) => `api/courses/${courseId}/chapters/${chapterId}`;

  async addChapterToCourse(
    courseId: string,
    payload: ChapterTypes.CreateChapterPayload,
    failOnStatusCode: boolean = true
  ) {
    const response = await this.request.post(this.endpoint(courseId), {
      data: payload,
      failOnStatusCode,
    });

    return response;
  }

  async reorderChapters(
    courseId: string,
    payload: ChapterTypes.ReorderChaptersPayload,
    failOnStatusCode: boolean = true
  ) {
    const response = await this.request.put(this.endpoint(courseId), {
      data: payload,
      failOnStatusCode,
    });

    return response;
  }

  async updateChapter(
    courseId: string,
    chapterId: string,
    payload: ChapterTypes.UpdateChapterPayload,
    failOnStatusCode: boolean = true
  ) {
    const response = await this.request.patch(this.chapterEndpoint(courseId, chapterId), {
      data: payload,
      failOnStatusCode,
    });

    return response;
  }

  async deleteChapter(
    courseId: string,
    chapterId: string,
    failOnStatusCode: boolean = true
  ) {
    const response = await this.request.delete(this.chapterEndpoint(courseId, chapterId), {
      failOnStatusCode,
    });

    return response;
  }
}

import { BaseController } from "./BaseController";
import type * as TagsTypes from "../schemas/Tags";

export class TagsController extends BaseController {
  private endpoint = "/api/tags";

  async createTag(tagName: string, failOnStatusCode: boolean = true) {
    const response = await this.request.post(this.endpoint, {
      data: {
        name: tagName,
      },
      failOnStatusCode,
    });
    return response;
  }

  async deleteTag(tagId: string, failOnStatusCode: boolean = true) {
    const response = await this.request.delete(`${this.endpoint}/${tagId}`, {
      failOnStatusCode,
    });
    return response;
  }

  async getTagList(failOnStatusCode: boolean = true) {
    const response = await this.request.get(this.endpoint, {
      failOnStatusCode,
    });
    return response;
  }
}

import { BaseController } from "./BaseController";
import type { CreatePostPayload, UpdatePostPayload } from "../schemas/Posts";

export class PostsController extends BaseController {
  private endpoint = "api/posts";

  async getPostList(failOnStatusCode: boolean = true) {
    const response = await this.request.get(this.endpoint, {
      failOnStatusCode,
    });
    return response;
  }

  async createPost(postPayload: CreatePostPayload | Record<string, unknown>, failOnStatusCode: boolean = true) {
    const response = await this.request.post(this.endpoint, {
      data: postPayload,
      failOnStatusCode,
    });
    return response;
  }

  async updatePost(
    postId: string,
    postPayload: UpdatePostPayload | Record<string, unknown>,
    failOnStatusCode: boolean = true,
  ) {
    const response = await this.request.patch(`${this.endpoint}/${postId}`, {
      data: postPayload,
      failOnStatusCode,
    });
    return response;
  }

  async deletePost(postId: string, failOnStatusCode: boolean = true) {
    const response = await this.request.delete(`${this.endpoint}/${postId}`, {
      failOnStatusCode,
    });
    return response;
  }
}

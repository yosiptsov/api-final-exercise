import { APIRequestContext, expect } from "@playwright/test";
import { BaseController } from "./BaseController";
import { RegisterUserPayload } from "../schemas/User";

export class UserController extends BaseController {
  private endpoint = "/api/auth/register";

  async registerUser(newUserPayload: RegisterUserPayload) {
    const response = await this.request.post(this.endpoint, {
      data: {
        name: newUserPayload.user.name,
        email: newUserPayload.user.email,
        password: newUserPayload.user.password,
      },
      failOnStatusCode: true,
    });
    expect(response.status()).toBe(201);
    return response.json();
  }
}

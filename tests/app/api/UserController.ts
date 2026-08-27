import { expect } from "@playwright/test";
import { BaseController } from "./BaseController";

export class UserController extends BaseController {
  private endpointUserInfo = "/api/oauth/userinfo";
  private endpointUserRegister = "/api/auth/register";

  async registerUser(newUserPayload: any) {
    const response = await this.request.post(this.endpointUserRegister, {
      data: newUserPayload?.user
        ? {
            name: newUserPayload.user.name,
            email: newUserPayload.user.email,
            password: newUserPayload.user.password,
          }
        : newUserPayload,
    });
    return response;
  }

  async getCurrentUserInfo(failOnStatusCode: boolean = true) {
    const response = await this.request.get(this.endpointUserInfo, {
      failOnStatusCode: failOnStatusCode,
    });
    return response;
  }
}

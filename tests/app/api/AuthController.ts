import { expect } from "@playwright/test";
import { BaseController } from "./BaseController";

export class AuthController extends BaseController {
  private endpointClient = "api/oauth/clients";
  private endpointToken = "api/oauth/token";

  async getUserToken(email: string, password: string, failOnStatusCode: boolean = true) {
    const response = await this.request.post(this.endpointToken, {
      data: {
        grant_type: "password",
        email: email,
        password: password,
      },
      failOnStatusCode: failOnStatusCode,
    });

    const responseBody = await response.json();
    expect(responseBody.access_token).toBeTruthy();
    return responseBody.access_token;
  }

  async registerOAuthClient(
    token: string,
    scopes: string[],
    name: string = "PW credentials",
    grants: string[] = ["client_credentials"],
    failOnStatusCode: boolean = true,
  ) {
    const response = await this.request.post(this.endpointClient, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        name: name,
        grants: grants,
        scopes: scopes,
      },
      failOnStatusCode: failOnStatusCode,
    });

    return response.json();
  }

  async getOAuthClientToken(
    token: string,
    clientId: string,
    clientSecret: string,
    scope: string[],
    failOnStatusCode: boolean = true,
  ) {
    const response = await this.request.post(this.endpointToken, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
        scope: scope.join(" "),
      },
      failOnStatusCode: failOnStatusCode,
    });

    const responseBody = await response.json();
    expect(responseBody.access_token).toBeTruthy();
    return responseBody.access_token;
  }

  async deactivateOAuthClient(token: string, clientId: string, failOnStatusCode: boolean = true) {
    const response = await this.request.delete(`${this.endpointClient}/${clientId}`, {
      headers: { Authorization: `Bearer ${token}` },
      failOnStatusCode: failOnStatusCode,
    });
    return response.json();
  }
}

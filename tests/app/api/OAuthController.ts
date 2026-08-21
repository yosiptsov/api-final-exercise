import { APIRequestContext, expect } from "@playwright/test";
import { BaseController } from "./BaseController";

export class OAuthController extends BaseController {
  private endpointClient = "/api/oauth/clients";
  private endpointToken = "/api/oauth/token";

  async getToken(email: string, password: string) {
    const response = await this.request.post(this.endpointToken, {
      data: {
        grant_type: "password",
        email: email,
        password: password,
      },
      failOnStatusCode: true,
    });

    expect(response.status()).toBe(200);
    const responseBody = await response.json();
    expect(responseBody.access_token).toBeTruthy();
    return responseBody.access_token;
  }

  async registerOAuthClient(
    token: string,
    scopes: string[],
    name: string = "PW credentials",
    grants: string[] = ["client_credentials"],
  ) {
    const response = await this.request.post(this.endpointClient, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        name: name,
        grants: grants,
        scopes: scopes,
      },
      failOnStatusCode: true,
    });

    expect(response.status()).toBe(201);
    return response.json();
  }

  async deactivateOAuthClient(token: string, clientId: string) {
    const response = await this.request.delete(`${this.endpointClient}/${clientId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(response.status()).toBe(200);
    return response.json();
  }
}

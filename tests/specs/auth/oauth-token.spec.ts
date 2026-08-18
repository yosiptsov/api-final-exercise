import { test, expect, type APIRequestContext } from "@playwright/test";

async function getToken(request: APIRequestContext, email: string, password: string) {
  const response = await request.post("/api/oauth/token", {
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

async function registerOAuthClient(
  request: APIRequestContext,
  token: string,
  scopes: string[],
  name: string = "PW credentials",
  grants: string[] = ["client_credentials"],
) {
  const response = await request.post("/api/oauth/clients", {
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

test.describe("verify oAuth", () => {
  test("get token", async ({ request }) => {
    const admin = {
      email: process.env.ADMIN_EMAIL as string,
      password: process.env.ADMIN_PASS as string,
    };

    const token = await getToken(request, admin.email, admin.password);
    console.log(token);

    const oAuthResponse = await registerOAuthClient(request, token, ["read", "write"], "Delete this");
    console.log(oAuthResponse.clientId);
  });
});

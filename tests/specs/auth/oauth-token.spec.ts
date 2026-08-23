import { test } from "../fixtures";
import { expect } from "@playwright/test";
import { TAG } from "../../app/tags/tags";
import { ApiController } from "../../app/api/ApiController";

test.describe("Services authorized user with only role 'Read'", { tag: [TAG.auth, TAG.authorized] }, () => {
  test.use({
    options: { isAuthorized: true, scope: ["read"] },
  });

  test("Current user info response contains", async ({ apiController }) => {
    //Arrange
    //Act
    const currentUserInfoResponse = await apiController.oAuthController.getCurrentUserInfo();
    const currentUserInfoResponseJson = await currentUserInfoResponse.json();

    //Assert

    // headers
    expect.soft(currentUserInfoResponse.headers()["content-type"]).toContain("application/json");
    expect.soft(currentUserInfoResponseJson.sub, "field sub contains text 'client_'").toContain("client_");
    expect.soft(currentUserInfoResponseJson.type, "field client is 'client'").toBe("client");
    expect.soft(currentUserInfoResponseJson.scopes, "field scopes has only permission 'read'").toEqual(["read"]);
    console.log(currentUserInfoResponseJson);
  });
});

test.describe("Services unavailable for unauthorized user", { tag: [TAG.auth, TAG.nonAuthRequests] }, () => {
  test.use({
    options: { isAuthorized: false, scope: ["read"] },
  });
});

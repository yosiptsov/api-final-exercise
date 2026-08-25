import { APIResponse, expect, test } from "@playwright/test";

export async function verifyHeaders(response: APIResponse) {
  await test.step("verify response Headers", async () => {
    expect.soft(response.headers()["content-type"]).toContain("application/json");
  });
}

import { APIResponse, expect, test } from "@playwright/test";

export async function verifyHeaders(response: APIResponse) {
  await test.step("Verify Response Headers", async () => {
    expect.soft(response.headers()["content-type"]).toContain("application/json");
  });
}

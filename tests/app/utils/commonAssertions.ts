import { APIResponse, expect, test } from "@playwright/test";

export async function verifyHeaders(response: APIResponse) {
  expect.soft(response.headers()["content-type"]).toContain("application/json");
}

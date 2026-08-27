import { APIResponse, expect } from "@playwright/test";

export async function verifyHeaders(response: APIResponse) {
  expect.soft(response.headers()["content-type"]).toContain("application/json");
}

import { request, expect, FullConfig } from "@playwright/test";

async function globalSetup(config: FullConfig) {
  const apiRequest = await request.newContext();

  const response = await apiRequest.get(`${config.projects[0].use.baseURL}api/tags`, { failOnStatusCode: true });

  expect(response.ok()).toBeTruthy();
}

export default globalSetup;

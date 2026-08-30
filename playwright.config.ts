import { defineConfig } from "@playwright/test";

import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(__dirname, ".env") });

const rawBaseURL = process.env.BASE_URL || "http://localhost:3000/";
const baseURL = rawBaseURL.endsWith("/") ? rawBaseURL : `${rawBaseURL}/`;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  retries: 0,
  use: {
    baseURL,
  },
  reporter: [["html", { open: "never" }]],

  projects: [
    {
      name: "dojo-api",
      testDir: "./tests/",
      use: {
        baseURL,
        extraHTTPHeaders: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      },
    },
  ],
});

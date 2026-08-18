import { defineConfig } from "@playwright/test";

import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(__dirname, ".env") });

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  retries: 0,
  use: {
    baseURL: process.env.BASE_URL || "http://localhost:3000",
  },
  reporter: [["html", { open: "never" }]],

  projects: [
    {
      name: "dojo-api",
      testDir: "./tests/",
      use: {
        baseURL: process.env.BASE_URL || "http://localhost:3000/",
        extraHTTPHeaders: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      },
    },
  ],
});

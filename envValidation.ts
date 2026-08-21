import { z } from "zod";

import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(__dirname, ".env") });

const envSchema = z.object({
  BASE_URL: z.url(),
  ADMIN_EMAIL: z.email("Admin email is required for tests!"),
  ADMIN_PASS: z.string("Admin password is required for tests!"),
});

export const env = envSchema.parse(process.env);

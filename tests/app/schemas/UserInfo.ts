import { z } from "zod";

// Schema for the user info response (obtained via password grant)
export const UserInfoSchema = z.object({
  id: z.string(),
  email: z.email(),
  name: z.string(),
  role: z.enum(["USER", "ADMIN"]),
  isActive: z.boolean(),
  createdAt: z.iso.datetime(),
});

// TypeScript type for the user info response
export type UserInfo = z.infer<typeof UserInfoSchema>;

// Schema for the client info response (obtained via client credentials grant)
export const ClientInfoSchema = z.object({
  sub: z.string(),
  type: z.literal("client"),
  scopes: z.array(z.string()),
});

// TypeScript type for the client info response
export type ClientInfo = z.infer<typeof ClientInfoSchema>;


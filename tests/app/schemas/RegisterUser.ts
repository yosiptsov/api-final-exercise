import { z } from "zod";

// Schema for the nested user payload object
const UserPayloadSchema = z.object({
  name: z.string().min(1, "Username is required").max(50, "Username is too long"),
  email: z.email("Invalid email format").min(1, "Email is a required field"),
  password: z.string().min(1, "Password cannot be empty"),
});

// Main schema wrapping the user object inside the "user" key
export const RegisterUserPayloadSchema = z.object({
  user: UserPayloadSchema,
});

// Export of the TypeScript type based on the created payload schema
export type RegisterUserPayload = z.infer<typeof RegisterUserPayloadSchema>;

// Schema for the user response object
export const RegisterUserResponseSchema = z.object({
  id: z.string(),
  email: z.email(),
  name: z.string(),
  role: z.enum(["USER", "ADMIN"]),
  //isActive: z.boolean(),
  createdAt: z.iso.datetime(),
});

// TypeScript type based on the user response schema
export type RegisterUserResponse = z.infer<typeof RegisterUserResponseSchema>;

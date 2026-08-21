import { z } from "zod";

// Schema for the nested user payload object
const UserPayloadSchema = z.object({
  name: z.string().min(1, "Username is required").max(50, "Username is too long"),
  email: z.email("Invalid email format").min(1, "Email is a required field"),
  password: z.string().min(1, "Password cannot be empty"),
});

// Main schema wrapping the user object inside the "user" key
export const CreateUserPayloadSchema = z.object({
  user: UserPayloadSchema,
});

// Export of the TypeScript type based on the created payload schema
export type RegisterUserPayload = z.infer<typeof CreateUserPayloadSchema>;

import { z } from "zod";

/**
 * Tag Model Schema (Represents a Tag entity returned by the API)
 */
export const TagSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
});

export type Tag = z.infer<typeof TagSchema>;

/**
 * 1. GET /api/tags (listTags)
 * Response is an array of Tag objects.
 */
export const TagListSchema = z.array(TagSchema);

export type TagList = z.infer<typeof TagListSchema>;

/**
 * 2. POST /api/tags (createTag)
 * Request payload schema to create a new tag.
 */
export const CreateTagPayloadSchema = z.object({
  name: z.string().min(2, "Tag name must be at least 2 characters long"),
});

export type CreateTagPayload = z.infer<typeof CreateTagPayloadSchema>;

/**
 * 3. DELETE /api/tags/{tagId} (deleteTag)
 * Response schema for successful tag deletion.
 */
export const SuccessResponseSchema = z.object({
  success: z.boolean(),
});

export type SuccessResponse = z.infer<typeof SuccessResponseSchema>;

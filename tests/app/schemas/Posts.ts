import { z } from "zod";
import { TagSchema } from "./Tags";

/**
 * Post Model Schema (Represents the Post entity returned by the API)
 */
export const PostSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  excerpt: z.string().nullable(),
  content: z.string().nullable(),
  imageUrl: z.string().nullable(),
  isPublished: z.boolean(),
  publishedAt: z.iso.datetime().nullable(),
  tags: z.array(TagSchema).optional(),
  createdAt: z.iso.datetime(),
});

export type Post = z.infer<typeof PostSchema>;

/**
 * 1. GET /api/posts (listPosts)
 * Response is an array of Post objects.
 */
export const PostListSchema = z.array(PostSchema);

export type PostList = z.infer<typeof PostListSchema>;

/**
 * 2. POST /api/posts (createPost)
 * Request payload schema to create a new blog post.
 */
export const CreatePostPayloadSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  excerpt: z.string().optional(),
  content: z.string().optional(),
  imageUrl: z.string().optional(),
  tagIds: z.array(z.string()).optional(),
  isPublished: z.boolean().optional(),
});

export type CreatePostPayload = z.infer<typeof CreatePostPayloadSchema>;

/**
 * 3. PATCH /api/posts/{postId} (updatePost)
 * Request payload schema to update an existing blog post.
 */
export const UpdatePostPayloadSchema = z.object({
  title: z.string().optional(),
  excerpt: z.string().nullable().optional(),
  content: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  tagIds: z.array(z.string()).optional(),
  isPublished: z.boolean().optional(),
});

export type UpdatePostPayload = z.infer<typeof UpdatePostPayloadSchema>;

/**
 * 4. DELETE /api/posts/{postId} (deletePost)
 * Response schema for successful post deletion.
 */
export const SuccessResponseSchema = z.object({
  success: z.boolean(),
});

export type SuccessResponse = z.infer<typeof SuccessResponseSchema>;

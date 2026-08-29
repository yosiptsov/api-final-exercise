import { z } from "zod";

/**
 * Chapter Model Schema (Represents the Chapter entity returned by the API)
 */
export const ChapterSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  videoUrl: z.string().nullable(),
  timecodes: z.string().nullable(),
  notes: z.string().nullable(),
  homework: z.string().nullable(),
  position: z.number().int(),
  isPublished: z.boolean(),
  isFree: z.boolean(),
  courseId: z.string(),
  createdAt: z.iso.datetime(),
});

export type Chapter = z.infer<typeof ChapterSchema>;

/**
 * 1. POST /api/courses/{courseId}/chapters (createChapter)
 */
export const CreateChapterPayloadSchema = z.object({
  title: z.string().min(1, "Title is required"),
});

export type CreateChapterPayload = z.infer<typeof CreateChapterPayloadSchema>;

/**
 * 2. PUT /api/courses/{courseId}/chapters (reorderChapters)
 */
export const ReorderChapterItemSchema = z.object({
  id: z.string(),
  position: z.number().int(),
});

export type ReorderChapterItem = z.infer<typeof ReorderChapterItemSchema>;

export const ReorderChaptersPayloadSchema = z.object({
  list: z.array(ReorderChapterItemSchema),
});

export type ReorderChaptersPayload = z.infer<typeof ReorderChaptersPayloadSchema>;

// Aliases for backwards compatibility
export const ListItemSchema = ReorderChapterItemSchema;
export type ListItem = ReorderChapterItem;
export const ListPayloadSchema = ReorderChaptersPayloadSchema;
export type ListPayload = ReorderChaptersPayload;

/**
 * 3. PATCH /api/courses/{courseId}/chapters/{chapterId} (updateChapter)
 */
export const UpdateChapterPayloadSchema = z.object({
  title: z.string().optional(),
  description: z.string().nullable().optional(),
  videoUrl: z.string().nullable().optional(),
  timecodes: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  homework: z.string().nullable().optional(),
  isPublished: z.boolean().optional(),
  isFree: z.boolean().optional(),
});

export type UpdateChapterPayload = z.infer<typeof UpdateChapterPayloadSchema>;

/**
 * Common Success Response Schema (used by PUT reorder and DELETE chapter endpoints)
 */
export const SuccessResponseSchema = z.object({
  success: z.boolean(),
});

export type SuccessResponse = z.infer<typeof SuccessResponseSchema>;

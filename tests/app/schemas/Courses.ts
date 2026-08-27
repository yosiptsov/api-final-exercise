import { z } from "zod";

// Schema for Course Category
export const CategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
});

export type Category = z.infer<typeof CategorySchema>;

// Schema for Course Chapter
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

// Schema for Course Attachment
export const AttachmentSchema = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string(),
  courseId: z.string(),
  createdAt: z.iso.datetime(),
});

export type Attachment = z.infer<typeof AttachmentSchema>;

// Schema for the course creation payload (POST /api/courses)
export const CreateCoursePayloadSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long"),
});

export type CreateCoursePayload = z.infer<typeof CreateCoursePayloadSchema>;

// Schema for the course response (POST /api/courses response & general Course details)
export const CourseResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  imageUrl: z.string().nullable(),
  price: z.string().nullable(), // Decimal serialized as string (e.g. "29.99")
  isPublished: z.boolean(),
  isListed: z.boolean(),
  isFeatured: z.boolean(),
  featuredOrder: z.number().int(),
  outcomes: z.string().nullable(),
  requirements: z.string().nullable(),
  authorName: z.string().nullable(),
  authorRole: z.string().nullable(),
  categories: z.array(CategorySchema).optional(),
  chapters: z.array(ChapterSchema).optional(),
  attachments: z.array(AttachmentSchema).optional(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export type CourseResponse = z.infer<typeof CourseResponseSchema>;

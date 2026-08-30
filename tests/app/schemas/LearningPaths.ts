import { z } from "zod";

/**
 * LearningPathModule Schema
 */
export const LearningPathModuleSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable().optional(),
  position: z.number().int(),
  learningPathId: z.string(),
  createdAt: z.iso.datetime().or(z.string()),
  updatedAt: z.iso.datetime().or(z.string()),
});

export type LearningPathModule = z.infer<typeof LearningPathModuleSchema>;

/**
 * Category Schema
 */
export const CategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  createdAt: z.iso.datetime().or(z.string()).optional(),
  updatedAt: z.iso.datetime().or(z.string()).optional(),
});

export type Category = z.infer<typeof CategorySchema>;

/**
 * YouTubeVideo Schema
 */
export const YouTubeVideoSchema = z.object({
  id: z.string(),
  title: z.string(),
  videoId: z.string(),
  description: z.string().nullable().optional(),
  position: z.number().int().optional(),
  isPublished: z.boolean().optional(),
  createdAt: z.iso.datetime().or(z.string()),
  updatedAt: z.iso.datetime().or(z.string()),
});

export type YouTubeVideo = z.infer<typeof YouTubeVideoSchema>;

/**
 * Certificate Schema
 */
export const CertificateSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  templateUrl: z.string().nullable().optional(),
  learningPathId: z.string().optional(),
  createdAt: z.iso.datetime().or(z.string()),
  updatedAt: z.iso.datetime().or(z.string()),
});

export type Certificate = z.infer<typeof CertificateSchema>;

/**
 * Instructor Schema
 */
export const InstructorSchema = z.object({
  id: z.string(),
  name: z.string(),
  bio: z.string().nullable().optional(),
  avatarUrl: z.string().nullable().optional(),
  createdAt: z.iso.datetime().or(z.string()),
  updatedAt: z.iso.datetime().or(z.string()),
});

export type Instructor = z.infer<typeof InstructorSchema>;

/**
 * Main LearningPath Model Schema
 */
export const LearningPathSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  description: z.string().nullable().optional(),
  isPublished: z.boolean(),
  createdAt: z.iso.datetime().or(z.string()),
  updatedAt: z.iso.datetime().or(z.string()),
  modules: z.array(LearningPathModuleSchema).optional(),
  categories: z.array(CategorySchema).optional(),
  video: YouTubeVideoSchema.nullable().optional(),
  certificate: CertificateSchema.nullable().optional(),
  instructor: InstructorSchema.nullable().optional(),
});

export type LearningPath = z.infer<typeof LearningPathSchema>;

/**
 * Input schemas for creating Learning Path nested resources
 */
export const ModuleInputSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  position: z.number().int().optional(),
});

export const VideoInputSchema = z.object({
  title: z.string(),
  videoId: z.string(),
});

export const CertificateInputSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  templateUrl: z.string().optional(),
});

export const InstructorInputSchema = z.object({
  name: z.string(),
  bio: z.string().optional(),
  avatarUrl: z.string().optional(),
});

/**
 * POST /api/learning-paths Payload Schema
 */
export const CreateLearningPathPayloadSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  modules: z.array(ModuleInputSchema).optional(),
  categoryIds: z.array(z.string()).optional(),
  video: VideoInputSchema.optional(),
  certificate: CertificateInputSchema.optional(),
  instructor: InstructorInputSchema,
});

export type CreateLearningPathPayload = z.infer<typeof CreateLearningPathPayloadSchema>;

import { z } from "zod";

/**
 * PromoCode Model Schema
 */
export const PromoCodeSchema = z.object({
  id: z.string(),
  code: z.string(),
  courseId: z.string(),
  discountPercent: z.number().int(),
  maxUses: z.number().int().nullable(),
  currentUses: z.number().int(),
  expiresAt: z.iso.datetime(),
  isActive: z.boolean(),
  _count: z.object({ usages: z.number().int() }).optional(),
  createdAt: z.iso.datetime(),
});

export type PromoCode = z.infer<typeof PromoCodeSchema>;

/**
 * GET /api/admin/courses/{courseId}/promo-codes
 */
export const PromoCodeListSchema = z.array(PromoCodeSchema);
export type PromoCodeList = z.infer<typeof PromoCodeListSchema>;

/**
 * POST /api/admin/courses/{courseId}/promo-codes
 */
export const CreatePromoCodePayloadSchema = z.object({
  code: z.string().min(3).max(20),
  discountPercent: z.number().int().min(1).max(100),
  maxUses: z.number().int().nullable().optional(),
  expiresAt: z.string(),
});

export type CreatePromoCodePayload = z.infer<typeof CreatePromoCodePayloadSchema>;

/**
 * POST /api/courses/{courseId}/validate-promo
 */
export const PromoValidationSchema = z.object({
  valid: z.boolean(),
  discountPercent: z.number().int().optional(),
  originalPrice: z.number().optional(),
  finalPrice: z.number().optional(),
  error: z.string().nullable().optional(),
});

export type PromoValidation = z.infer<typeof PromoValidationSchema>;

/**
 * POST /api/courses/{courseId}/purchase
 */
export const PurchasePayloadSchema = z.object({
  promoCode: z.string().optional(),
});

export type PurchasePayload = z.infer<typeof PurchasePayloadSchema>;

export const PurchaseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  courseId: z.string(),
  amount: z.union([z.number(), z.string()]),
  promoCode: z.string().nullable(),
  course: z
    .object({
      id: z.string(),
      title: z.string(),
      slug: z.string(),
      imageUrl: z.string().nullable(),
    })
    .optional(),
  createdAt: z.iso.datetime(),
});

export type Purchase = z.infer<typeof PurchaseSchema>;

export const SuccessResponseSchema = z.object({
  success: z.boolean(),
});

export type SuccessResponse = z.infer<typeof SuccessResponseSchema>;

import { BaseController } from "./BaseController";
import type { CreatePromoCodePayload, PurchasePayload } from "../schemas/PromoCodes";

export class PromoCodesController extends BaseController {
  private adminEndpoint(courseId: string) {
    return `api/admin/courses/${courseId}/promo-codes`;
  }

  private publicEndpoint(courseId: string) {
    return `api/courses/${courseId}`;
  }

  async createPromoCode(
    courseId: string,
    payload: CreatePromoCodePayload | Record<string, unknown>,
    failOnStatusCode: boolean = true,
  ) {
    const response = await this.request.post(this.adminEndpoint(courseId), {
      data: payload,
      failOnStatusCode,
    });
    return response;
  }

  async getPromoCodes(courseId: string, failOnStatusCode: boolean = true) {
    const response = await this.request.get(this.adminEndpoint(courseId), {
      failOnStatusCode,
    });
    return response;
  }

  async togglePromoCode(courseId: string, promoCodeId: string, failOnStatusCode: boolean = true) {
    const response = await this.request.patch(`${this.adminEndpoint(courseId)}/${promoCodeId}`, {
      failOnStatusCode,
    });
    return response;
  }

  async deletePromoCode(courseId: string, promoCodeId: string, failOnStatusCode: boolean = true) {
    const response = await this.request.delete(`${this.adminEndpoint(courseId)}/${promoCodeId}`, {
      failOnStatusCode,
    });
    return response;
  }

  async validatePromoCode(
    courseId: string,
    payload: { code?: string } | Record<string, unknown>,
    failOnStatusCode: boolean = true,
  ) {
    const response = await this.request.post(`${this.publicEndpoint(courseId)}/validate-promo`, {
      data: payload,
      failOnStatusCode,
    });
    return response;
  }

  async purchaseCourse(
    courseId: string,
    payload?: PurchasePayload | Record<string, unknown>,
    failOnStatusCode: boolean = true,
  ) {
    const response = await this.request.post(`${this.publicEndpoint(courseId)}/purchase`, {
      data: payload ?? {},
      failOnStatusCode,
    });
    return response;
  }
}

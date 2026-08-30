import { test, expect } from "../fixtures";
import { TAG } from "../../app/tags/tags";
import * as PromoCodeSchemas from "../../app/schemas/PromoCodes";
import type { ApiClient } from "../../app/api/ApiClient";
import { verifyHeaders } from "../../app/utils/commonAssertions";
import { faker } from "@faker-js/faker";

async function createAndPublishTestCourse(adminApi: ApiClient, price: number = 100) {
  const courseRes = await adminApi.coursesController.createCourse({
    title: `PW Promo Course ${faker.string.alphanumeric(6)}`,
  });
  const course = await courseRes.json();

  await adminApi.coursesController.updateCourse(course.id, {
    price,
    description: "A comprehensive test course description.",
    imageUrl: "https://example.com/image.jpg",
  });

  const chapterRes = await adminApi.chaptersController.addChapterToCourse(course.id, {
    title: "Intro Chapter",
  });
  const chapter = await chapterRes.json();

  await adminApi.chaptersController.updateChapter(course.id, chapter.id, {
    isPublished: true,
  });

  await adminApi.coursesController.publishCourse(course.id);

  return course;
}

test.describe("Promo Codes & Course Purchase Endpoints", () => {
  let createdCourseIds: string[] = [];

  test.afterEach(async ({ adminApi }) => {
    for (const courseId of createdCourseIds) {
      try {
        await adminApi.coursesController.deleteCourse(courseId, false);
      } catch {
        // ignore cleanup failure if already deleted
      }
    }
    createdCourseIds = [];
  });

  test.describe(
    "Admin Promo Codes Management (Authorized)",
    { tag: [TAG.regression, TAG.positive, TAG.authorized, TAG.aiGenerated] },
    () => {
      test("PromoCode 01: should successfully create a valid promo code for a course", async ({ adminApi }) => {
        // Arrange
        const course = await createAndPublishTestCourse(adminApi);
        createdCourseIds.push(course.id);

        const promoCodeValue = `CODE${faker.string.alphanumeric({ length: 6, casing: "upper" })}`;
        const payload = {
          code: promoCodeValue,
          discountPercent: 50,
          maxUses: 100,
          expiresAt: "2030-12-31T23:59:59.000Z",
        };

        // Act
        const response = await test.step("create a new promo code", async () => {
          return await adminApi.promoCodesController.createPromoCode(course.id, payload);
        });
        const json = await response.json();

        // Assert
        await test.step("response status is 201 Created", () => {
          expect(response.status(), "Check status").toBe(201);
        });

        await test.step("verify response headers", () => {
          verifyHeaders(response);
        });

        await test.step("JSON schema matches Zod template", () => {
          const result = PromoCodeSchemas.PromoCodeSchema.safeParse(json);
          expect(result.success, { message: result.error?.message }).toBeTruthy();
        });

        await test.step("verify created promo code properties", () => {
          expect(json.code).toBe(promoCodeValue);
          expect(json.discountPercent).toBe(50);
          expect(json.courseId).toBe(course.id);
          expect(json.isActive).toBe(true);
        });
      });

      test("PromoCode 02: should retrieve a list of promo codes for a course", async ({ adminApi }) => {
        // Arrange
        const course = await createAndPublishTestCourse(adminApi);
        createdCourseIds.push(course.id);

        const code1 = `PROMOA${faker.string.alphanumeric({ length: 5, casing: "upper" })}`;
        const code2 = `PROMOB${faker.string.alphanumeric({ length: 5, casing: "upper" })}`;

        await adminApi.promoCodesController.createPromoCode(course.id, {
          code: code1,
          discountPercent: 20,
          expiresAt: "2030-12-31T23:59:59.000Z",
        });
        await adminApi.promoCodesController.createPromoCode(course.id, {
          code: code2,
          discountPercent: 30,
          expiresAt: "2030-12-31T23:59:59.000Z",
        });

        // Act
        const response = await test.step("get list of promo codes", async () => {
          return await adminApi.promoCodesController.getPromoCodes(course.id);
        });
        const json = await response.json();

        // Assert
        await test.step("response status is 200 OK", () => {
          expect(response.status(), "Check status").toBe(200);
        });

        await test.step("verify response headers", () => {
          verifyHeaders(response);
        });

        await test.step("JSON schema matches Zod list template", () => {
          const result = PromoCodeSchemas.PromoCodeListSchema.safeParse(json);
          expect(result.success, { message: result.error?.message }).toBeTruthy();
        });

        await test.step("verify list contains created promo codes", () => {
          const codes = json.map((p: any) => p.code);
          expect(codes).toContain(code1);
          expect(codes).toContain(code2);
        });
      });

      test("PromoCode 03: should toggle promo code active status", async ({ adminApi }) => {
        // Arrange
        const course = await createAndPublishTestCourse(adminApi);
        createdCourseIds.push(course.id);

        const promoCodeValue = `TOGGLE${faker.string.alphanumeric({ length: 5, casing: "upper" })}`;
        const createRes = await adminApi.promoCodesController.createPromoCode(course.id, {
          code: promoCodeValue,
          discountPercent: 15,
          expiresAt: "2030-12-31T23:59:59.000Z",
        });
        const createdPromo = await createRes.json();

        // Act
        const toggleResponse = await test.step("toggle promo code active status", async () => {
          return await adminApi.promoCodesController.togglePromoCode(course.id, createdPromo.id);
        });
        const toggleJson = await toggleResponse.json();

        // Assert
        await test.step("response status is 200 OK", () => {
          expect(toggleResponse.status(), "Check status").toBe(200);
        });

        await test.step("verify response headers", () => {
          verifyHeaders(toggleResponse);
        });

        await test.step("JSON schema matches Zod template", () => {
          const result = PromoCodeSchemas.PromoCodeSchema.safeParse(toggleJson);
          expect(result.success, { message: result.error?.message }).toBeTruthy();
        });

        await test.step("verify isActive status is toggled to false", () => {
          expect(toggleJson.isActive).toBe(false);
        });
      });

      test("PromoCode 04: should successfully delete a promo code", async ({ adminApi }) => {
        // Arrange
        const course = await createAndPublishTestCourse(adminApi);
        createdCourseIds.push(course.id);

        const promoCodeValue = `DEL${faker.string.alphanumeric({ length: 6, casing: "upper" })}`;
        const createRes = await adminApi.promoCodesController.createPromoCode(course.id, {
          code: promoCodeValue,
          discountPercent: 10,
          expiresAt: "2030-12-31T23:59:59.000Z",
        });
        const createdPromo = await createRes.json();

        // Act
        const deleteResponse = await test.step("delete promo code", async () => {
          return await adminApi.promoCodesController.deletePromoCode(course.id, createdPromo.id);
        });
        const deleteJson = await deleteResponse.json();

        // Assert
        await test.step("response status is 200 OK", () => {
          expect(deleteResponse.status(), "Check status").toBe(200);
        });

        await test.step("verify response headers", () => {
          verifyHeaders(deleteResponse);
        });

        await test.step("JSON schema matches SuccessResponse template", () => {
          const result = PromoCodeSchemas.SuccessResponseSchema.safeParse(deleteJson);
          expect(result.success, { message: result.error?.message }).toBeTruthy();
        });

        await test.step("verify success is true", () => {
          expect(deleteJson.success).toBe(true);
        });
      });
    },
  );

  test.describe(
    "Admin Promo Codes Management (Validation Errors)",
    { tag: [TAG.regression, TAG.negative, TAG.aiGenerated] },
    () => {
      test("PromoCode 05: should return 400 Bad Request if discountPercent exceeds 100", async ({ adminApi }) => {
        // Arrange
        const course = await createAndPublishTestCourse(adminApi);
        createdCourseIds.push(course.id);

        const payload = {
          code: `OVER100${faker.string.alphanumeric({ length: 4, casing: "upper" })}`,
          discountPercent: 150,
          expiresAt: "2030-12-31T23:59:59.000Z",
        };

        // Act
        const response = await test.step("try to create promo code with invalid discount", async () => {
          return await adminApi.promoCodesController.createPromoCode(course.id, payload, false);
        });

        // Assert
        await test.step("response status is 400 Bad Request", () => {
          expect(response.status(), "Check status").toBe(400);
        });

        await test.step("verify response headers", () => {
          verifyHeaders(response);
        });
      });

      test("PromoCode 06: should return 400 Bad Request if code is shorter than 3 characters", async ({ adminApi }) => {
        // Arrange
        const course = await createAndPublishTestCourse(adminApi);
        createdCourseIds.push(course.id);

        const payload = {
          code: "AB",
          discountPercent: 20,
          expiresAt: "2030-12-31T23:59:59.000Z",
        };

        // Act
        const response = await test.step("try to create promo code with short code", async () => {
          return await adminApi.promoCodesController.createPromoCode(course.id, payload, false);
        });

        // Assert
        await test.step("response status is 400 Bad Request", () => {
          expect(response.status(), "Check status").toBe(400);
        });

        await test.step("verify response headers", () => {
          verifyHeaders(response);
        });
      });
    },
  );

  test.describe(
    "Admin Promo Codes Management (Unauthorized & Roles)",
    { tag: [TAG.regression, TAG.negative, TAG.notAuthorized, TAG.aiGenerated] },
    () => {
      test("PromoCode 07: should return 403 Forbidden if non-admin user creates promo code", async ({ userApi, adminApi }) => {
        // Arrange
        const course = await createAndPublishTestCourse(adminApi);
        createdCourseIds.push(course.id);

        const payload = {
          code: `USERTRY${faker.string.alphanumeric({ length: 4, casing: "upper" })}`,
          discountPercent: 10,
          expiresAt: "2030-12-31T23:59:59.000Z",
        };

        // Act
        const response = await test.step("try to create promo code as standard user", async () => {
          return await userApi.promoCodesController.createPromoCode(course.id, payload, false);
        });

        // Assert
        await test.step("response status is 403 Forbidden", () => {
          expect(response.status(), "Check status").toBe(403);
        });

        await test.step("verify response headers", () => {
          verifyHeaders(response);
        });
      });

      test("PromoCode 08: should return 401 Unauthorized if unauthenticated request is sent", async ({ anonymousApi, adminApi }) => {
        // Arrange
        const course = await createAndPublishTestCourse(adminApi);
        createdCourseIds.push(course.id);

        // Act
        const response = await test.step("get promo codes without token", async () => {
          return await anonymousApi.promoCodesController.getPromoCodes(course.id, false);
        });

        // Assert
        await test.step("response status is 401 Unauthorized", () => {
          expect(response.status(), "Check status").toBe(401);
        });

        await test.step("verify response headers", () => {
          verifyHeaders(response);
        });
      });
    },
  );

  test.describe(
    "Promo Code Validation - /api/courses/{courseId}/validate-promo",
    { tag: [TAG.regression, TAG.positive, TAG.negative, TAG.aiGenerated] },
    () => {
      test("PromoCode 09: should validate active promo code and return calculated discount price", async ({ adminApi, userApi }) => {
        // Arrange: Course with price $100 and 20% discount promo code
        const course = await createAndPublishTestCourse(adminApi, 100);
        createdCourseIds.push(course.id);

        const codeValue = `VAL20-${faker.string.alphanumeric({ length: 5, casing: "upper" })}`;
        await adminApi.promoCodesController.createPromoCode(course.id, {
          code: codeValue,
          discountPercent: 20,
          expiresAt: "2030-12-31T23:59:59.000Z",
        });

        // Act
        const response = await test.step("validate promo code", async () => {
          return await userApi.promoCodesController.validatePromoCode(course.id, { code: codeValue });
        });
        const json = await response.json();

        // Assert
        await test.step("response status is 200 OK", () => {
          expect(response.status(), "Check status").toBe(200);
        });

        await test.step("verify response headers", () => {
          verifyHeaders(response);
        });

        await test.step("JSON schema matches PromoValidation template", () => {
          const result = PromoCodeSchemas.PromoValidationSchema.safeParse(json);
          expect(result.success, { message: result.error?.message }).toBeTruthy();
        });

        await test.step("verify discount calculation", () => {
          expect(json.valid).toBe(true);
          expect(json.discountPercent).toBe(20);
          expect(json.originalPrice).toBe(100);
          expect(json.finalPrice).toBe(80);
        });
      });

      test("PromoCode 10: should return valid: false when promo code is deactivated", async ({ adminApi, userApi }) => {
        // Arrange
        const course = await createAndPublishTestCourse(adminApi, 100);
        createdCourseIds.push(course.id);

        const codeValue = `DEACT-${faker.string.alphanumeric({ length: 5, casing: "upper" })}`;
        const createRes = await adminApi.promoCodesController.createPromoCode(course.id, {
          code: codeValue,
          discountPercent: 30,
          expiresAt: "2030-12-31T23:59:59.000Z",
        });
        const createdPromo = await createRes.json();

        // Deactivate promo code
        await adminApi.promoCodesController.togglePromoCode(course.id, createdPromo.id);

        // Act
        const response = await test.step("validate deactivated promo code", async () => {
          return await userApi.promoCodesController.validatePromoCode(course.id, { code: codeValue });
        });
        const json = await response.json();

        // Assert
        await test.step("response status is 200 OK", () => {
          expect(response.status(), "Check status").toBe(200);
        });

        await test.step("verify response indicates invalid promo code", () => {
          expect(json.valid).toBe(false);
          expect(json.error).toBe("Promo code is deactivated");
        });
      });

      test("PromoCode 11: should return 400 Bad Request when promo code payload is empty", async ({ adminApi, userApi }) => {
        // Arrange
        const course = await createAndPublishTestCourse(adminApi, 100);
        createdCourseIds.push(course.id);

        // Act
        const response = await test.step("validate empty promo code", async () => {
          return await userApi.promoCodesController.validatePromoCode(course.id, { code: "" }, false);
        });

        // Assert
        await test.step("response status is 400 Bad Request", () => {
          expect(response.status(), "Check status").toBe(400);
        });

        await test.step("verify response headers", () => {
          verifyHeaders(response);
        });
      });
    },
  );

  test.describe(
    "Course Purchase - /api/courses/{courseId}/purchase",
    { tag: [TAG.regression, TAG.positive, TAG.negative, TAG.aiGenerated] },
    () => {
      test("PromoCode 12: should successfully purchase course without promo code", async ({ adminApi, userApi }) => {
        // Arrange
        const course = await createAndPublishTestCourse(adminApi, 50);
        createdCourseIds.push(course.id);

        // Act
        const response = await test.step("purchase course without promo code", async () => {
          return await userApi.promoCodesController.purchaseCourse(course.id);
        });
        const json = await response.json();

        // Assert
        await test.step("response status is 201 Created", () => {
          expect(response.status(), "Check status").toBe(201);
        });

        await test.step("verify response headers", () => {
          verifyHeaders(response);
        });

        await test.step("JSON schema matches Purchase template", () => {
          const result = PromoCodeSchemas.PurchaseSchema.safeParse(json);
          expect(result.success, { message: result.error?.message }).toBeTruthy();
        });

        await test.step("verify purchase details", () => {
          expect(json.courseId).toBe(course.id);
          expect(Number(json.amount)).toBe(50);
          expect(json.promoCode).toBeNull();
        });
      });

      test("PromoCode 13: should purchase course with valid promo code and apply discount", async ({ adminApi, userApi }) => {
        // Arrange
        const course = await createAndPublishTestCourse(adminApi, 200);
        createdCourseIds.push(course.id);

        const promoCodeValue = `BUY50-${faker.string.alphanumeric({ length: 5, casing: "upper" })}`;
        await adminApi.promoCodesController.createPromoCode(course.id, {
          code: promoCodeValue,
          discountPercent: 50,
          expiresAt: "2030-12-31T23:59:59.000Z",
        });

        // Act
        const response = await test.step("purchase course with promo code", async () => {
          return await userApi.promoCodesController.purchaseCourse(course.id, {
            promoCode: promoCodeValue,
          });
        });
        const json = await response.json();

        // Assert
        await test.step("response status is 201 Created", () => {
          expect(response.status(), "Check status").toBe(201);
        });

        await test.step("verify response headers", () => {
          verifyHeaders(response);
        });

        await test.step("JSON schema matches Purchase template", () => {
          const result = PromoCodeSchemas.PurchaseSchema.safeParse(json);
          expect(result.success, { message: result.error?.message }).toBeTruthy();
        });

        await test.step("verify purchase details with discount", () => {
          expect(json.courseId).toBe(course.id);
          expect(Number(json.amount)).toBe(100);
          expect(json.promoCode).toBe(promoCodeValue);
        });
      });

      test("PromoCode 14: should return 409 Conflict when user attempts to purchase course twice", async ({ adminApi, userApi }) => {
        // Arrange
        const course = await createAndPublishTestCourse(adminApi, 30);
        createdCourseIds.push(course.id);

        // First purchase
        await userApi.promoCodesController.purchaseCourse(course.id);

        // Act: Second purchase attempt
        const response = await test.step("attempt duplicate purchase", async () => {
          return await userApi.promoCodesController.purchaseCourse(course.id, {}, false);
        });
        const json = await response.json();

        // Assert
        await test.step("response status is 409 Conflict", () => {
          expect(response.status(), "Check status").toBe(409);
        });

        await test.step("verify error message", () => {
          expect(json.error).toBe("Already purchased");
        });
      });

      test("PromoCode 15: should return 401 Unauthorized if unauthenticated user attempts purchase", async ({ adminApi, anonymousApi }) => {
        // Arrange
        const course = await createAndPublishTestCourse(adminApi, 40);
        createdCourseIds.push(course.id);

        // Act
        const response = await test.step("purchase course without token", async () => {
          return await anonymousApi.promoCodesController.purchaseCourse(course.id, {}, false);
        });

        // Assert
        await test.step("response status is 401 Unauthorized", () => {
          expect(response.status(), "Check status").toBe(401);
        });

        await test.step("verify response headers", () => {
          verifyHeaders(response);
        });
      });
    },
  );
});

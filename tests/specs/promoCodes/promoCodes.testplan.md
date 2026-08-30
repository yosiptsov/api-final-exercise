# Test Plan: Promo Codes & Course Purchases

This document outlines the test strategy and test cases to cover the Promo Code management, Promo Code Validation, and Course Purchase endpoints (`promoCodes.spec.ts`) based on the AAA (Arrange, Act, Assert) principle.

## 1. Target Endpoints

* `POST /api/admin/courses/{courseId}/promo-codes` - Create a promo code (Admin/Teacher)
* `GET /api/admin/courses/{courseId}/promo-codes` - List promo codes for a course (Admin/Teacher)
* `PATCH /api/admin/courses/{courseId}/promo-codes/{promoCodeId}` - Toggle promo code active status (Admin/Teacher)
* `DELETE /api/admin/courses/{courseId}/promo-codes/{promoCodeId}` - Delete a promo code (Admin/Teacher)
* `POST /api/courses/{courseId}/validate-promo` - Validate a promo code (Student/User)
* `POST /api/courses/{courseId}/purchase` - Purchase a course (Student/User)

---

## 2. Describe Block Structure

```typescript
describe('Promo Codes & Course Purchase Endpoints', () => {
  describe('Admin Promo Codes Management (Authorized)', { tag: [TAG.regression, TAG.positive, TAG.authorized, TAG.aiGenerated] }, () => {
    // Happy path promo code creation, listing, toggling, and deletion
  });

  describe('Admin Promo Codes Management (Validation Errors)', { tag: [TAG.regression, TAG.negative, TAG.aiGenerated] }, () => {
    // Validation errors (invalid discount, code length, invalid dates)
  });

  describe('Admin Promo Codes Management (Unauthorized & Roles)', { tag: [TAG.regression, TAG.negative, TAG.notAuthorized, TAG.aiGenerated] }, () => {
    // 401 Unauthorized and 403 Forbidden checks for non-admin users
  });

  describe('Promo Code Validation - /api/courses/{courseId}/validate-promo', { tag: [TAG.regression, TAG.positive, TAG.negative, TAG.aiGenerated] }, () => {
    // Valid promo validation, invalid code, deactivated code
  });

  describe('Course Purchase - /api/courses/{courseId}/purchase', { tag: [TAG.regression, TAG.positive, TAG.negative, TAG.aiGenerated] }, () => {
    // Purchase without promo code, purchase with valid promo code, duplicate purchase (409)
  });
});
```

---

## 3. Test Cases Breakdown (AAA Pattern)

### ➕ POST /api/admin/courses/{courseId}/promo-codes
* **Test**: `should successfully create a valid promo code for a course`
  * **Arrange**: Create test course using `adminApi`. Prepare payload `{ code: "PROMO50", discountPercent: 50, expiresAt: "2030-12-31T23:59:59Z" }`.
  * **Act**: Call `adminApi.promoCodesController.createPromoCode(courseId, payload)`.
  * **Assert**:
    * Status code is `201 Created`.
    * Verify response headers via `verifyHeaders`.
    * Validate response schema (`PromoCodeSchema`).
    * Verify returned properties match request (`code`, `discountPercent`, `isActive: true`).

* **Test**: `should return 400 Bad Request if discount is invalid or code length is out of range`
  * **Arrange**: Course ID, invalid payload (`discountPercent: 150` or `code: "AB"`).
  * **Act**: Call `adminApi.promoCodesController.createPromoCode(courseId, payload, false)`.
  * **Assert**: Status `400 Bad Request`, verify response headers.

* **Test**: `should return 403 Forbidden if user role is not ADMIN`
  * **Arrange**: Valid promo payload, `userApi` (student token).
  * **Act**: Call `userApi.promoCodesController.createPromoCode(courseId, payload, false)`.
  * **Assert**: Status `403 Forbidden`.

---

### 📋 GET /api/admin/courses/{courseId}/promo-codes
* **Test**: `should retrieve list of promo codes for a course`
  * **Arrange**: Create promo code for course via `adminApi`.
  * **Act**: Call `adminApi.promoCodesController.getPromoCodes(courseId)`.
  * **Assert**:
    * Status code `200 OK`.
    * Verify response headers.
    * Validate response schema (`PromoCodeListSchema`).
    * Check list contains created promo code ID.

---

### 🔄 PATCH /api/admin/courses/{courseId}/promo-codes/{promoCodeId}
* **Test**: `should toggle promo code active status`
  * **Arrange**: Create active promo code via `adminApi`.
  * **Act**: Call `adminApi.promoCodesController.togglePromoCode(courseId, promoCodeId)`.
  * **Assert**:
    * Status `200 OK`.
    * Verify response schema (`PromoCodeSchema`).
    * Verify `isActive` is toggled from `true` to `false`.

---

### 🗑️ DELETE /api/admin/courses/{courseId}/promo-codes/{promoCodeId}
* **Test**: `should delete a promo code`
  * **Arrange**: Create promo code via `adminApi`.
  * **Act**: Call `adminApi.promoCodesController.deletePromoCode(courseId, promoCodeId)`.
  * **Assert**:
    * Status `200 OK`.
    * Validate response schema (`SuccessResponseSchema`).
    * Verify `{ success: true }`.

---

### 🔍 POST /api/courses/{courseId}/validate-promo ("Валідація промо-коду")
* **Test**: `should validate active promo code and calculate discounted price`
  * **Arrange**: Create course with price (e.g. $100), create 20% discount promo code (`PROMO20`).
  * **Act**: Call `userApi.promoCodesController.validatePromoCode(courseId, { code: "PROMO20" })`.
  * **Assert**:
    * Status `200 OK`.
    * Validate response schema (`PromoValidationSchema`).
    * Verify `valid: true`, `discountPercent: 20`, `originalPrice: 100`, `finalPrice: 80`.

* **Test**: `should return valid: false when code is deactivated`
  * **Arrange**: Create promo code and toggle it to inactive (`isActive: false`).
  * **Act**: Call `userApi.promoCodesController.validatePromoCode(courseId, { code })`.
  * **Assert**:
    * Status `200 OK`.
    * Verify `valid: false`, `error: "Promo code is deactivated"`.

* **Test**: `should return 400 Bad Request when promo code input is empty`
  * **Arrange**: Empty payload `{ code: "" }`.
  * **Act**: Call `userApi.promoCodesController.validatePromoCode(courseId, { code: "" }, false)`.
  * **Assert**: Status `400 Bad Request`.

---

### 💳 POST /api/courses/{courseId}/purchase ("Покупка курсу")
* **Test**: `should successfully purchase course without promo code`
  * **Arrange**: Create published course (with published chapter) with price via `adminApi`.
  * **Act**: Call `userApi.promoCodesController.purchaseCourse(courseId)`.
  * **Assert**:
    * Status `201 Created`.
    * Validate response schema (`PurchaseSchema`).
    * Verify `courseId` matches and `amount` equals course original price.

* **Test**: `should purchase course with valid promo code and apply discount`
  * **Arrange**: Create published course with price, create 50% promo code (`DISCOUNT50`).
  * **Act**: Call `userApi.promoCodesController.purchaseCourse(courseId, { promoCode: "DISCOUNT50" })`.
  * **Assert**:
    * Status `201 Created`.
    * Validate response schema (`PurchaseSchema`).
    * Verify `promoCode: "DISCOUNT50"` and `amount` reflects 50% discount.

* **Test**: `should return 409 Conflict when attempting to purchase the same course twice`
  * **Arrange**: User already purchased course once.
  * **Act**: Call `userApi.promoCodesController.purchaseCourse(courseId, {}, false)`.
  * **Assert**: Status `409 Conflict`.

* **Test**: `should return 401 Unauthorized if unauthenticated user attempts purchase`
  * **Arrange**: `anonymousApi`.
  * **Act**: Call `anonymousApi.promoCodesController.purchaseCourse(courseId, {}, false)`.
  * **Assert**: Status `401 Unauthorized`.

---

## 4. Cleanup & Strategy

* **Course Creation & Setup**:
  - Test helper will create a course, add a published chapter, set price, and publish course so purchase endpoints can operate on a published course.
* **Teardown**:
  - Store created `courseId`s and `promoCodeId`s in arrays during test execution.
  - Delete created courses and promo codes in `test.afterEach` hooks using `adminApi.coursesController.deleteCourse(courseId)` and `adminApi.promoCodesController.deletePromoCode(courseId, promoCodeId)`.

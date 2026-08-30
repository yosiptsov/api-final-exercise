---
name: create-test-plan
description: use it when you need to generate a test plan before manual test implementation or when planning test coverage for an API endpoint. Creates a test plan markdown file located alongside the corresponding test spec file.
---

## Guidelines

- Use this skill to plan test cases and structure before manual coding or automated test generation.
- **File Naming & Location Rule**:
  - Store the test plan file in the exact same folder as the target test spec file (e.g. `tests/specs/<endpointFolder>/`).
  - Name the file after the test spec file with the `.testplan.md` extension.
    - Example: For spec file `tests/specs/courses/publishCourse.spec.ts`, the test plan file must be `tests/specs/courses/publishCourse.testplan.md`.
    - Example: For spec file `tests/specs/tags/tags.spec.ts`, the test plan file must be `tests/specs/tags/tags.testplan.md`.

## Structure of a Test Plan

A comprehensive test plan must include:
1. **Target Endpoints**: HTTP method and endpoint paths covered by the plan.
2. **Describe Block Structure**: Proposed nested Playwright `describe` hierarchy with tags (including `TAG.aiGenerated`).
3. **Test Cases Breakdown (AAA Pattern)**:
   - **Positive Scenarios (Happy Path)**: Successful requests (200/201), Zod schema validation, response headers, DB state verification.
   - **Negative Scenarios (Validation)**: Invalid/missing fields, boundary conditions, conflict states (400 / 409).
   - **Negative Scenarios (Auth & Roles)**: Unauthenticated calls (401), insufficient role permissions (403).
4. **Cleanup & Fixture Strategy**: Details on setup fixtures and teardown hooks (`afterEach` API/DB cleanup).

## Example Reference

Refer to the format example here:
`.antigravity/skills/create-test-plan/references/test-plan-example.md`

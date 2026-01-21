# Full Repository Review - hostaway-api

## Executive Summary
- Overall score: 7.4/10
- Strengths: clear separation between client/auth/resources/types, consistent resource wrappers, solid retry/timeout behavior, and meaningful test coverage around request plumbing.
- Main risks: documentation and type mismatches across multiple resources (reservations, calendar, coupons, tasks, webhooks, financial) that can lead to incorrect payloads or misleading examples; includeResources defaults applied to non-GET endpoints; typed webhook event names likely drift from API/README.

## Architecture & Structure
### Critical
- None noted.

### Important
- None noted.

### Nice-to-have
- Repeated `encodePathParam` helpers across resource modules add noise and raise the risk of divergent behavior; a shared helper could simplify maintenance. (`src/resources/*.ts`)

## Code Quality & Best Practices
### Critical
- None noted.

### Important
- `includeResources` defaults are injected into every request, including POST/PUT/DELETE, which can unintentionally send unsupported query parameters and cause API rejections. Consider scoping default includeResources to GET endpoints or allowing per-resource opt-in. (`src/client.ts:197-206`)

### Nice-to-have
- `ApiResponse<T>` exposes both `result` and `data`, but the client does not normalize responses, leaving consumers to check both. Consider normalizing in `request` or providing a helper to reduce caller complexity. (`src/types/common.ts:17-29`, `src/client.ts:179-189`)
- Delete/export methods return `ApiResponse<unknown> | undefined`, while other methods always return `ApiResponse<T>`; consider standardizing return types for consistency and easier consumption. (`src/resources/listings.ts:40-45`, `src/resources/reservations.ts:66-71`, `src/resources/webhooks.ts:44-49`)

## Completeness
### Critical
- None noted.

### Important
- Several README examples use payload fields that are not represented in the request types or resource methods, which suggests API contract drift or incorrect usage examples. This impacts usability and correctness for core endpoints. (`README.md:181-226`, `README.md:362-408`, `README.md:418-442`)

### Nice-to-have
- Consider adding optional resource coverage for any newer Hostaway endpoints not listed in PLAN.md (e.g., message templates) if they are part of current product requirements.

## Bloat & Technical Debt
### Critical
- None noted.

### Important
- None noted.

### Nice-to-have
- Resource classes are small and repetitive; a shared base or helper could reduce duplication for common `GET/POST/PUT/DELETE` patterns and path encoding. (`src/resources/*.ts`)

## Consistency
### Critical
- None noted.

### Important
- Webhook event type constants use space-delimited names, while README examples use dot-delimited event identifiers. If the API expects dot notation, the current `WebhookEventType` is incorrect and will reject valid values at compile time. (`src/types/webhooks.ts:1-6`, `README.md:327-333`)
- Reservations, tasks, and coupon examples in README reference fields (`listingMapId`, `listingId`, `reservationId`, `couponId`) that do not match the declared request types, causing inconsistent guidance and potential runtime errors. (`src/types/reservations.ts:50-62`, `src/types/tasks.ts:67-101`, `src/types/coupons.ts:36-41`, `README.md:181-189`, `README.md:362-407`)

### Nice-to-have
- Calendar update examples use `dateFrom/dateTo` and `isAvailable`, while types define `date` and `available`; unify naming to avoid consumer confusion. (`src/types/calendar.ts:25-34`, `README.md:220-226`)
- `FinancialReportRequest` uses `fromDate/toDate` and `listingMapIds`, but README uses `startDate/endDate` and `listingId`. Aligning names improves type safety and usability. (`src/types/financial.ts:20-36`, `README.md:418-442`)

## Performance & Security
### Critical
- None noted.

### Important
- Financial report endpoints may return raw CSV when `format` is `csv`, but methods are typed as `ApiResponse<FinancialReportResult>`. This can mislead consumers and break assumptions about response shape. Consider returning `FinancialReportResult` directly or allowing response type configuration. (`src/resources/financial.ts:28-55`, `src/types/financial.ts:36-44`)

### Nice-to-have
- `buildQueryString` encodes `null` values as the string "null"; if any endpoints treat null specially, consider omitting nulls as well. (`src/client.ts:260-289`)

## Dependencies
### Critical
- None noted.

### Important
- None noted.

### Nice-to-have
- No runtime dependencies is good, but the library depends on a global `fetch`. Consider documenting the Node version requirement or providing a small polyfill guidance for Node < 18. (`src/client.ts:222-231`, `README.md`)

## Documentation
### Critical
- None noted.

### Important
- Multiple README examples do not match the implementation or types, especially for reservations, calendar updates, tasks, coupons, webhooks, and financial reports. This will cause incorrect integration even when the SDK works. Update the README to match actual request shapes and naming conventions. (`README.md:181-226`, `README.md:268-333`, `README.md:362-442`)

### Nice-to-have
- Consider documenting response shapes that return CSV/text (financial reports) or `undefined` (delete endpoints), to reduce ambiguity for consumers.

## Testing
### Critical
- None noted.

### Important
- Tests cover request construction but do not validate README examples or response parsing for non-JSON payloads (e.g., CSV financial reports). Add coverage to prevent drift and ensure runtime parity with docs. (`tests/resources.test.ts`, `tests/client.test.ts`)

### Nice-to-have
- Add targeted tests for includeResources default behavior on non-GET requests and for error mapping when responses are non-JSON. (`tests/client.test.ts`)

## Recommendations for Improvements
1. Align README examples with actual types and API payloads; treat this as a top-priority fix since it affects all users.
2. Review API docs for reservations, calendar, coupons, tasks, and financial reports to confirm correct field names and response shapes; update types and resource methods to match.
3. Scope `includeResources` defaults to endpoints that support it to avoid unexpected query parameters.
4. Clarify financial report return handling (JSON vs CSV) via typing, documentation, or a response mode option.
5. Add tests around doc examples and non-JSON responses to guard against future drift.

## Action Items (Prioritized)
1. P0: Reconcile README examples with actual request/response types for reservations, calendar, tasks, coupons, webhooks, and financial reports.
2. P0: Validate API field names (`listingId` vs `listingMapId`, `message` vs `body`, `isEnabled` vs `isActive`) and correct types/resources accordingly.
3. P1: Limit default `includeResources` injection to endpoints that support it or make it opt-in per request.
4. P1: Update financial report types to reflect CSV/text responses and add tests for both JSON and CSV flows.
5. P2: Consolidate `encodePathParam` helper and standardize delete method return types.

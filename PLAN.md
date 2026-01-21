# Hostaway API Wrapper Implementation Plan

## Sources
- https://api.hostaway.com/documentation (Hostaway Public API Reference)
- https://api.hostaway.com/v1/accessTokens (OAuth2 client credentials)

## Architecture Overview
- Build a small core HTTP client that knows how to authenticate, build URLs, and handle errors.
- Expose resource-focused modules (listings, reservations, calendar, conversations, etc.) that call the core client.
- Keep types isolated in `src/types` and resource logic in `src/resources` for clarity and reuse.

## Core API Client Design
- `HostawayClient` class
  - Constructor options: `baseUrl` (default `https://api.hostaway.com/v1`), `clientId`, `clientSecret`, `accountId`, `accessToken`, `fetch`, `timeoutMs`, `userAgent`, `includeResources`, `logger`.
  - `request<T>(method, path, { query, body, headers, signal })` for all requests.
  - Query string builder that omits `undefined` and supports arrays where applicable.
  - Response parsing: JSON by default, raw text for non-JSON responses.
- Resource modules use the client
  - `client.listings`, `client.reservations`, `client.calendar`, `client.conversations`, `client.webhooks`, `client.common` (amenities, property types, bed types).
  - Each module exports typed methods with explicit request/response shapes.

## Authentication Handling
- OAuth 2.0 Client Credentials Grant
  - `POST /v1/accessTokens` with `grant_type=client_credentials`, `client_id` (Hostaway account ID), `client_secret`, `scope=general`.
  - Store and reuse token, include `Authorization: Bearer <token>` on all requests.
- Token lifecycle
  - Cache token with `expiresIn` / `expiresAt` (if provided in response).
  - Auto-refresh token on expiration or on a single 401 retry.
  - Allow `tokenProvider` override for externally managed tokens.
  - Provide `revokeToken(token)` using `DELETE /v1/accessTokens?token=...` when needed.

## Main Resource Endpoints (Phase 1)
- Listings
  - `GET /listings` (filters: `limit`, `offset`, `sortOrder`, `city`, `match`, `country`, `contactName`, `propertyTypeId`).
  - `GET /listings/{listingId}`
  - `POST /listings`
  - `PUT /listings/{listingId}`
  - `DELETE /listings/{listingId}`
  - `POST /listings/{listingId}/export/airbnb`
  - `GET /listingFeeSettings/{listingId}`
  - `POST /listingFeeSettings/{listingId}`
- Listing Units
  - `GET /listingUnits/{listingMapId}`
- Reservations
  - `GET /reservations` (filters: `limit`, `offset`, `order`, `channelId`, `listingId`, `arrivalStartDate`, `arrivalEndDate`, `departureStartDate`, `departureEndDate`, `hasUnreadConversationMessages`).
  - `GET /reservations/{reservationId}`
  - `POST /reservations?forceOverbooking=1`
  - `POST /reservations?validatePaymentMethod=1`
  - `PUT /reservations/{reservationId}?forceOverbooking=1`
  - `PUT /reservations/{reservationId}/statuses/{status}` (for example, `cancelled`).
  - `DELETE /reservations/{reservationId}`
- Calendar
  - `GET /listings/{listingId}/calendar` (query: `startDate`, `endDate`, `includeResources`).
  - `PUT /listings/{listingId}/calendar` (single or multi-unit update).
  - `PUT /listings/{listingId}/calendarIntervals` (batch update).
  - `POST /listings/{listingId}/calendar/priceDetails`
- Conversations
  - `GET /conversations` (filters: `reservationId`, `limit`, `offset`, `includeResources`).
  - `GET /conversations/{conversationId}`
  - `GET /conversations/{conversationId}/messages`
  - `GET /conversations/{conversationId}/messages/{conversationMessageId}`
  - `POST /conversations/{conversationId}/messages`
- Common info endpoints
  - `GET /amenities`
  - `GET /bedTypes`
  - `GET /propertyTypes`

## Error Handling Strategy
- Create a `HostawayError` class
  - `status`, `code`, `message`, `details`, `requestId`, `responseBody` fields.
  - Attach the original request info (`method`, `url`, `params`).
- Retry policy
  - Retry on `429` and `5xx` for idempotent requests (GET, HEAD) with exponential backoff and jitter.
  - Avoid retries on POST/PUT/DELETE unless explicitly opted in.
- Timeout handling
  - Use `AbortController` per request; expose `timeoutMs` and `signal`.

## Type Definitions
- Core types
  - `ApiResponse<T>`, `Pagination`, `ListParams`, `IncludeResourcesParams`.
  - `ISODateString`, `ISODateTimeString` as branded string types.
- Resource models
  - `Listing`, `ListingUnit`, `Reservation`, `ReservationFee`, `ReservationUnit`, `CalendarDay`, `Conversation`, `ConversationMessage`, `MessageTemplate`.
  - Separate request payload types for create/update operations to keep input minimal and safe.
- Use `Partial<T>` only where the API supports partial updates; keep explicit field lists for clarity.

## Testing Approach
- Unit tests
  - Token caching and refresh logic.
  - Query string builder and request serialization.
  - Error mapping for common failure responses.
- Integration-style tests (mocked)
  - Mock Hostaway endpoints with `msw` or `nock`.
  - Validate pagination and includeResources behavior.
- Optional live smoke test
  - Guarded by env vars (`HOSTAWAY_CLIENT_ID`, `HOSTAWAY_CLIENT_SECRET`).
  - Not run in CI by default.

## Milestones
- M1: Core client + auth + error handling + types.
- M2: Listings, Reservations, Calendar, Conversations.
- M3: Common endpoints, webhooks/logs, and extras (tasks, coupons, financial reporting).
- M4: Docs + examples + test suite hardening.

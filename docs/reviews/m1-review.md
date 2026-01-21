## Code Review - Milestone 1

### Was gebaut wurde
- `HostawayClient` core request pipeline with retries, timeouts, query handling, and auth injection.
- `HostawayAuth` for token acquisition, caching, expiration handling, and revocation.
- `HostawayError` for enriched error details.
- Shared types for pagination, list params, logger, fetch, and ISO date branding.
- Public exports consolidated via `src/index.ts`.

### Highlights (Positive)
- Clean separation between client and auth concerns; refresh promise prevents concurrent token refreshes.
- Consistent error shaping with status/code/requestId metadata from responses.
- Retry/backoff includes 429 handling and `Retry-After` parsing.
- Flexible fetch injection plus optional logger and user-agent support.

### Kritikpunkte / Verbesserungsvorschläge
- Important: 401 refresh retry happens even when callers provide their own `Authorization` header, causing a redundant request and hiding user-token failures; track whether the client injected auth before retrying. (`src/client.ts:82-121`)
- Important: Caller-initiated aborts are wrapped as `HostawayError` with `FETCH_ERROR` unless timeout; consumers cannot differentiate cancel vs network failure. Consider surfacing an `ABORTED` code or rethrowing aborts. (`src/client.ts:100-114`, `src/client.ts:413-419`)
- Important: No tests around token refresh, retry/backoff, error mapping, or revoke behavior. Add coverage for timeout/abort and 401 refresh to prevent regressions. (`tests/`)
- Nice-to-have: `logger` is stored in auth but never used; either remove it or emit token/revocation debug logs for observability. (`src/auth.ts:34-46`)

### Score
7.5/10 — not yet production-ready; solid foundation but needs behavior tweaks and tests.

### Nächste Schritte
- Add tests for auth refresh, retries, timeouts/aborts, and error parsing.
- Decide on abort semantics and explicit behavior when `Authorization` is caller-provided.
- Optional: wire logger in auth or drop it for clarity.

# hostaway-api

A fully-typed TypeScript wrapper for the [Hostaway API](https://api.hostaway.com/documentation).

## Features

- **OAuth 2.0 Authentication** - Automatic token management with caching and refresh
- **Complete API Coverage** - Listings, reservations, calendar, conversations, webhooks, tasks, coupons, and financial reporting
- **Full TypeScript Support** - Comprehensive type definitions for all requests and responses
- **Error Handling** - Structured error objects with status codes, request IDs, and details
- **Automatic Retries** - Exponential backoff for rate limits (429) and server errors (5xx) on GET requests
- **Configurable** - Custom timeouts, fetch implementations, and logging

## Installation

This package is not yet published to npm. To use it locally:

```bash
# Clone the repository
git clone <repository-url>
cd hostaway-api

# Install dependencies
npm install

# Build the package
npm run build
```

To use in another project, you can link it:

```bash
# In hostaway-api directory
npm link

# In your project directory
npm link hostaway-api
```

## Quick Start

```typescript
import { HostawayClient } from 'hostaway-api';

const client = new HostawayClient({
  clientId: 'YOUR_ACCOUNT_ID',
  clientSecret: 'YOUR_CLIENT_SECRET',
});

// List all listings
const { result: listings } = await client.listings.list();
console.log(listings);

// Get a specific reservation
const { result: reservation } = await client.reservations.get(12345);
console.log(reservation);
```

## Authentication

The client supports multiple authentication methods:

### Client Credentials (Recommended)

```typescript
const client = new HostawayClient({
  clientId: 'YOUR_ACCOUNT_ID',      // Hostaway account ID
  clientSecret: 'YOUR_CLIENT_SECRET',
});
```

The client automatically handles token acquisition, caching, and refresh.

### Pre-existing Access Token

```typescript
const client = new HostawayClient({
  accessToken: 'YOUR_ACCESS_TOKEN',
});
```

### Custom Token Provider

For advanced use cases (e.g., external token management):

```typescript
const client = new HostawayClient({
  tokenProvider: {
    getToken: async () => ({
      accessToken: 'token-from-external-source',
      expiresAt: Date.now() + 3600 * 1000,
    }),
    revokeToken: async (token) => {
      // Optional: handle token revocation
    },
  },
});
```

### Token Revocation

```typescript
// Revoke the current token
await client.revokeToken();

// Revoke a specific token
await client.revokeToken('specific-token');
```

## API Resources

### Listings

Manage property listings.

```typescript
// List all listings
const { result } = await client.listings.list();

// List with filters
const { result } = await client.listings.list({
  limit: 10,
  offset: 0,
  city: 'Miami',
  country: 'US',
});

// Get a single listing
const { result } = await client.listings.get(12345);

// Create a listing
const { result } = await client.listings.create({
  name: 'Beach House',
  propertyTypeId: 1,
  // ... other fields
});

// Update a listing
const { result } = await client.listings.update(12345, {
  name: 'Updated Beach House',
});

// Delete a listing
await client.listings.delete(12345);

// Get fee settings
const { result } = await client.listings.getFeeSettings(12345);

// Update fee settings
const { result } = await client.listings.updateFeeSettings(12345, {
  cleaningFee: 100,
});

// Get listing unit
const { result } = await client.listings.getListingUnit(12345);

// Export to Airbnb
await client.listings.exportToAirbnb(12345);
```

### Reservations

Manage bookings and reservations.

```typescript
// List reservations
const { result } = await client.reservations.list();

// List with filters
const { result } = await client.reservations.list({
  limit: 20,
  listingId: 12345,
  arrivalStartDate: '2025-01-01',
  arrivalEndDate: '2025-12-31',
  sortOrder: 'arrivalDate',
});

// Get a reservation
const { result } = await client.reservations.get(12345);

// Create a reservation
const { result } = await client.reservations.create({
  listingMapId: 12345,
  channelId: 2000,
  guestName: 'John Doe',
  arrivalDate: '2025-06-01',
  departureDate: '2025-06-07',
  // ... other fields
});

// Create with options
const { result } = await client.reservations.create(
  reservationData,
  { forceOverbooking: true, validatePaymentMethod: true }
);

// Update a reservation
const { result } = await client.reservations.update(12345, {
  guestName: 'Jane Doe',
});

// Update reservation status
const { result } = await client.reservations.updateStatus(12345, 'cancelled');

// Delete a reservation
await client.reservations.delete(12345);
```

### Calendar

Manage availability and pricing.

```typescript
// Get calendar for a listing
const { result } = await client.calendar.get(12345, {
  startDate: '2025-01-01',
  endDate: '2025-01-31',
});

// Update calendar
const { result } = await client.calendar.update(12345, {
  startDate: '2025-01-15',
  endDate: '2025-01-20',
  price: 150,
  isAvailable: 1,
});

// Batch update calendar intervals
const { result } = await client.calendar.updateIntervals(12345, [
  { startDate: '2025-02-01', endDate: '2025-02-07', price: 200 },
  { startDate: '2025-02-08', endDate: '2025-02-14', price: 180 },
]);

// Get price details
const { result } = await client.calendar.priceDetails(12345, {
  startDate: '2025-03-01',
  endDate: '2025-03-07',
  numberOfGuests: 4,
});
```

### Conversations

Manage guest communications.

```typescript
// List conversations
const { result } = await client.conversations.list();

// List with filters
const { result } = await client.conversations.list({
  reservationId: 12345,
  limit: 10,
});

// Get a conversation
const { result } = await client.conversations.get(12345);

// List messages in a conversation
const { result } = await client.conversations.listMessages(12345);

// Get a specific message
const { result } = await client.conversations.getMessage(12345, 67890);

// Send a message
const { result } = await client.conversations.createMessage(12345, {
  body: 'Welcome to your stay!',
});
```

### Common

Access reference data for amenities, property types, bed types, and cancellation policies.

```typescript
// List amenities
const { result } = await client.common.listAmenities();

// List property types
const { result } = await client.common.listPropertyTypes();

// List bed types
const { result } = await client.common.listBedTypes();

// List all cancellation policies
const { result } = await client.common.listCancellationPolicies();

// Get a specific cancellation policy
const { result } = await client.common.getCancellationPolicy(1);

// List channel-specific cancellation policies
const { result } = await client.common.listAirbnbCancellationPolicies();
const { result } = await client.common.listBookingCancellationPolicies();
const { result } = await client.common.listVrboCancellationPolicies();
const { result } = await client.common.listMarriottCancellationPolicies();
```

### Webhooks

Configure webhook endpoints for real-time notifications.

```typescript
// List available event types
const eventTypes = client.webhooks.listEventTypes();

// Reservation webhooks
const { result } = await client.webhooks.listReservationWebhooks();
const { result } = await client.webhooks.getReservationWebhook(123);
const { result } = await client.webhooks.createReservationWebhook({
  url: 'https://example.com/webhook',
  isEnabled: 1,
});
const { result } = await client.webhooks.updateReservationWebhook(123, {
  isEnabled: 0,
});
await client.webhooks.deleteReservationWebhook(123);

// Conversation message webhooks
const { result } = await client.webhooks.listConversationMessageWebhooks();
const { result } = await client.webhooks.createConversationMessageWebhook({
  url: 'https://example.com/messages',
  isEnabled: 1,
});

// Unified webhooks (multiple event types)
const { result } = await client.webhooks.listUnifiedWebhooks();
const { result } = await client.webhooks.createUnifiedWebhook({
  url: 'https://example.com/unified',
  isEnabled: 1,
  eventTypes: ['reservation created', 'reservation updated'],
});
```

### Logs

Access webhook delivery logs.

```typescript
// Reservation webhook logs
const { result } = await client.logs.listReservationWebhookLogs({
  limit: 50,
  webhookId: 123,
});

// Conversation message webhook logs
const { result } = await client.logs.listConversationMessageWebhookLogs({
  limit: 50,
});

// Unified webhook logs
const { result } = await client.logs.listUnifiedWebhookLogs({
  limit: 50,
});
```

### Tasks

Manage housekeeping and maintenance tasks.

```typescript
// List tasks
const { result } = await client.tasks.list();

// List with filters
const { result } = await client.tasks.list({
  reservationId: 12345,
  status: 'pending',
});

// Get a task
const { result } = await client.tasks.get(12345);

// Create a task
const { result } = await client.tasks.create({
  listingMapId: 12345,
  title: 'Deep cleaning',
  description: 'Full property deep clean',
  // ... other fields
});

// Update a task
const { result } = await client.tasks.update(12345, {
  status: 'completed',
});

// Delete a task
await client.tasks.delete(12345);
```

### Coupons

Manage discount coupons.

```typescript
// List all coupons
const { result } = await client.coupons.list();

// List reservation coupons
const { result } = await client.coupons.listReservationCoupons();

// Apply coupon to reservation
const { result } = await client.coupons.createReservationCoupon({
  couponName: 'SUMMER25',
  listingMapId: 12345,
  startingDate: '2025-06-01',
  endingDate: '2025-06-07',
});
```

### Financial

Generate financial reports.

```typescript
// Get finance standard field for a reservation
const { result } = await client.financial.getStandardField(12345);

// Generate standard report
// Reports return CSV text when format is "csv".
const report = await client.financial.standardReport({
  listingMapIds: [12345],
  fromDate: '2025-01-01',
  toDate: '2025-12-31',
  format: 'csv',
});

// Generate consolidated report
const consolidatedReport = await client.financial.consolidatedReport({
  listingMapIds: [12345],
  fromDate: '2025-01-01',
  toDate: '2025-12-31',
  format: 'csv',
});

// Generate calculated report
const calculatedReport = await client.financial.calculatedReport({
  listingMapIds: [12345],
  fromDate: '2025-01-01',
  toDate: '2025-12-31',
  format: 'csv',
});

// Generate listing financials report
const listingFinancialsReport = await client.financial.listingFinancialsReport({
  listingMapIds: [12345],
  fromDate: '2025-01-01',
  toDate: '2025-12-31',
  format: 'csv',
});
```

## Error Handling

All API errors are thrown as `HostawayError` instances:

```typescript
import { HostawayClient, HostawayError } from 'hostaway-api';

try {
  const { result } = await client.reservations.get(99999);
} catch (error) {
  if (error instanceof HostawayError) {
    console.error('Status:', error.status);       // HTTP status code (e.g., 404)
    console.error('Code:', error.code);           // API error code
    console.error('Message:', error.message);     // Error message
    console.error('Details:', error.details);     // Additional error details
    console.error('Request ID:', error.requestId); // For support requests
    console.error('URL:', error.url);             // Request URL
    console.error('Method:', error.method);       // HTTP method
  }
}
```

### Error Codes

- `TIMEOUT` - Request exceeded the configured timeout
- `ABORTED` - Request was aborted via signal
- `FETCH_ERROR` - Network or fetch error

## TypeScript Support

This library is written in TypeScript and exports comprehensive type definitions:

```typescript
import type {
  Listing,
  Reservation,
  CalendarDay,
  Conversation,
  ApiResponse,
  ListingsListParams,
} from 'hostaway-api';

// All methods are fully typed
const response: ApiResponse<Listing[]> = await client.listings.list();
const listings: Listing[] = response.result;
```

## Client Configuration

```typescript
const client = new HostawayClient({
  // Authentication (choose one)
  clientId: 'YOUR_ACCOUNT_ID',
  clientSecret: 'YOUR_CLIENT_SECRET',
  // OR
  accessToken: 'YOUR_ACCESS_TOKEN',
  // OR
  tokenProvider: customTokenProvider,

  // Optional configuration
  baseUrl: 'https://api.hostaway.com/v1',  // API base URL
  timeoutMs: 30000,                         // Request timeout (default: 30s)
  maxRetries: 2,                            // Max retry attempts (default: 2)
  userAgent: 'MyApp/1.0',                   // Custom User-Agent header
  includeResources: true,                   // Include related resources
  fetch: customFetch,                       // Custom fetch implementation
  logger: {
    debug: console.debug,
    warn: console.warn,
  },
});
```

## Testing

Run the test suite:

```bash
npm test
```

Run tests in watch mode:

```bash
npx vitest
```

## Development

```bash
# Install dependencies
npm install

# Run type checking
npm run typecheck

# Build the project
npm run build

# Run tests
npm test
```

## License

MIT

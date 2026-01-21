import { describe, expect, it, vi } from 'vitest';
import { HostawayClient } from '../src/client.js';
import type { ISODateString } from '../src/types/common.js';

function jsonResponse(body: Record<string, unknown>, init: ResponseInit = {}): Response {
  const headers = new Headers(init.headers ?? {});
  if (!headers.has('content-type')) {
    headers.set('content-type', 'application/json');
  }
  return new Response(JSON.stringify(body), { ...init, headers });
}

function createClient(fetchMock: ReturnType<typeof vi.fn>) {
  return new HostawayClient({
    baseUrl: 'https://api.test',
    fetch: fetchMock,
    accessToken: 'token-1',
    timeoutMs: 0,
  });
}

describe('ListingsResource', () => {
  it('builds listing endpoints with query and body', async () => {
    const fetchMock = vi
      .fn()
      .mockImplementation(() => jsonResponse({ ok: true }, { status: 200 }));
    const client = createClient(fetchMock);

    await client.listings.list({ limit: 5, city: 'Lisbon', propertyTypeId: 9 });
    let [url, init] = fetchMock.mock.calls[0];
    let parsed = new URL(url as string);

    expect(parsed.pathname).toBe('/listings');
    expect(parsed.searchParams.get('limit')).toBe('5');
    expect(parsed.searchParams.get('city')).toBe('Lisbon');
    expect(parsed.searchParams.get('propertyTypeId')).toBe('9');
    expect(init?.method).toBe('GET');

    fetchMock.mockClear();
    await client.listings.exportToAirbnb(22);
    [url, init] = fetchMock.mock.calls[0];
    parsed = new URL(url as string);
    expect(parsed.pathname).toBe('/listings/22/export/airbnb');
    expect(init?.method).toBe('POST');

    fetchMock.mockClear();
    await client.listings.updateFeeSettings(22, { cleaningFee: 120 });
    [url, init] = fetchMock.mock.calls[0];
    parsed = new URL(url as string);
    expect(parsed.pathname).toBe('/listingFeeSettings/22');
    expect(init?.method).toBe('POST');
    expect(JSON.parse(init?.body as string)).toMatchObject({
      cleaningFee: 120,
    });
  });
});

describe('ReservationsResource', () => {
  it('supports reservation create options and status updates', async () => {
    const fetchMock = vi
      .fn()
      .mockImplementation(() => jsonResponse({ ok: true }, { status: 200 }));
    const client = createClient(fetchMock);

    await client.reservations.create(
      {
        listingId: 3,
        arrivalDate: '2024-02-10' as ISODateString,
        departureDate: '2024-02-11' as ISODateString,
        guestName: 'Ada',
      },
      { forceOverbooking: true, validatePaymentMethod: true }
    );
    let [url, init] = fetchMock.mock.calls[0];
    let parsed = new URL(url as string);
    expect(parsed.pathname).toBe('/reservations');
    expect(parsed.searchParams.get('forceOverbooking')).toBe('1');
    expect(parsed.searchParams.get('validatePaymentMethod')).toBe('1');
    expect(init?.method).toBe('POST');
    expect(JSON.parse(init?.body as string)).toMatchObject({
      listingId: 3,
      guestName: 'Ada',
    });

    fetchMock.mockClear();
    await client.reservations.update(44, { guestName: 'Grace' }, { forceOverbooking: true });
    [url, init] = fetchMock.mock.calls[0];
    parsed = new URL(url as string);
    expect(parsed.pathname).toBe('/reservations/44');
    expect(parsed.searchParams.get('forceOverbooking')).toBe('1');
    expect(init?.method).toBe('PUT');

    fetchMock.mockClear();
    await client.reservations.updateStatus(44, 'cancelled');
    [url, init] = fetchMock.mock.calls[0];
    parsed = new URL(url as string);
    expect(parsed.pathname).toBe('/reservations/44/statuses/cancelled');
    expect(init?.method).toBe('PUT');
  });
});

describe('CalendarResource', () => {
  it('builds calendar endpoints for get and updates', async () => {
    const fetchMock = vi
      .fn()
      .mockImplementation(() => jsonResponse({ ok: true }, { status: 200 }));
    const client = createClient(fetchMock);

    await client.calendar.get(7, {
      startDate: '2024-01-01' as ISODateString,
      endDate: '2024-01-10' as ISODateString,
      includeResources: true,
    });
    let [url, init] = fetchMock.mock.calls[0];
    let parsed = new URL(url as string);
    expect(parsed.pathname).toBe('/listings/7/calendar');
    expect(parsed.searchParams.get('startDate')).toBe('2024-01-01');
    expect(parsed.searchParams.get('endDate')).toBe('2024-01-10');
    expect(parsed.searchParams.get('includeResources')).toBe('true');
    expect(init?.method).toBe('GET');

    fetchMock.mockClear();
    await client.calendar.update(7, {
      date: '2024-01-05' as ISODateString,
      available: true,
      price: 200,
    });
    [url, init] = fetchMock.mock.calls[0];
    parsed = new URL(url as string);
    expect(parsed.pathname).toBe('/listings/7/calendar');
    expect(init?.method).toBe('PUT');

    fetchMock.mockClear();
    await client.calendar.updateIntervals(7, {
      startDate: '2024-01-01' as ISODateString,
      endDate: '2024-01-31' as ISODateString,
      closed: true,
    });
    [url, init] = fetchMock.mock.calls[0];
    parsed = new URL(url as string);
    expect(parsed.pathname).toBe('/listings/7/calendarIntervals');
    expect(init?.method).toBe('PUT');

    fetchMock.mockClear();
    await client.calendar.priceDetails(7, {
      startDate: '2024-02-01' as ISODateString,
      endDate: '2024-02-05' as ISODateString,
    });
    [url, init] = fetchMock.mock.calls[0];
    parsed = new URL(url as string);
    expect(parsed.pathname).toBe('/listings/7/calendar/priceDetails');
    expect(init?.method).toBe('POST');
  });
});

describe('ConversationsResource', () => {
  it('builds conversation endpoints', async () => {
    const fetchMock = vi
      .fn()
      .mockImplementation(() => jsonResponse({ ok: true }, { status: 200 }));
    const client = createClient(fetchMock);

    await client.conversations.list({
      reservationId: 10,
      limit: 2,
      includeResources: true,
    });
    let [url, init] = fetchMock.mock.calls[0];
    let parsed = new URL(url as string);
    expect(parsed.pathname).toBe('/conversations');
    expect(parsed.searchParams.get('reservationId')).toBe('10');
    expect(parsed.searchParams.get('limit')).toBe('2');
    expect(parsed.searchParams.get('includeResources')).toBe('true');
    expect(init?.method).toBe('GET');

    fetchMock.mockClear();
    await client.conversations.listMessages(55);
    [url, init] = fetchMock.mock.calls[0];
    parsed = new URL(url as string);
    expect(parsed.pathname).toBe('/conversations/55/messages');
    expect(init?.method).toBe('GET');

    fetchMock.mockClear();
    await client.conversations.createMessage(55, { message: 'Hello there' });
    [url, init] = fetchMock.mock.calls[0];
    parsed = new URL(url as string);
    expect(parsed.pathname).toBe('/conversations/55/messages');
    expect(init?.method).toBe('POST');
    expect(JSON.parse(init?.body as string)).toMatchObject({
      message: 'Hello there',
    });
  });
});

import { describe, expect, it, vi } from 'vitest';
import { HostawayClient } from '../src/client.js';
import type { ISODateString, ISODateTimeString } from '../src/types/common.js';

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

  it('builds listing get/delete/fee/unit endpoints', async () => {
    const fetchMock = vi
      .fn()
      .mockImplementation(() => jsonResponse({ ok: true }, { status: 200 }));
    const client = createClient(fetchMock);

    await client.listings.get('listing/alpha');
    let [url, init] = fetchMock.mock.calls[0];
    let parsed = new URL(url as string);
    expect(parsed.pathname).toBe('/listings/listing%2Falpha');
    expect(init?.method).toBe('GET');

    fetchMock.mockClear();
    await client.listings.delete(12);
    [url, init] = fetchMock.mock.calls[0];
    parsed = new URL(url as string);
    expect(parsed.pathname).toBe('/listings/12');
    expect(init?.method).toBe('DELETE');

    fetchMock.mockClear();
    await client.listings.getFeeSettings(14);
    [url, init] = fetchMock.mock.calls[0];
    parsed = new URL(url as string);
    expect(parsed.pathname).toBe('/listingFeeSettings/14');
    expect(init?.method).toBe('GET');

    fetchMock.mockClear();
    await client.listings.getListingUnit('unit/42');
    [url, init] = fetchMock.mock.calls[0];
    parsed = new URL(url as string);
    expect(parsed.pathname).toBe('/listingUnits/unit%2F42');
    expect(init?.method).toBe('GET');
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

  it('builds reservation get/delete endpoints', async () => {
    const fetchMock = vi
      .fn()
      .mockImplementation(() => jsonResponse({ ok: true }, { status: 200 }));
    const client = createClient(fetchMock);

    await client.reservations.get('res/77');
    let [url, init] = fetchMock.mock.calls[0];
    let parsed = new URL(url as string);
    expect(parsed.pathname).toBe('/reservations/res%2F77');
    expect(init?.method).toBe('GET');

    fetchMock.mockClear();
    await client.reservations.delete(99);
    [url, init] = fetchMock.mock.calls[0];
    parsed = new URL(url as string);
    expect(parsed.pathname).toBe('/reservations/99');
    expect(init?.method).toBe('DELETE');
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

  it('builds conversation get/message endpoints', async () => {
    const fetchMock = vi
      .fn()
      .mockImplementation(() => jsonResponse({ ok: true }, { status: 200 }));
    const client = createClient(fetchMock);

    await client.conversations.get('conv/alpha');
    let [url, init] = fetchMock.mock.calls[0];
    let parsed = new URL(url as string);
    expect(parsed.pathname).toBe('/conversations/conv%2Falpha');
    expect(init?.method).toBe('GET');

    fetchMock.mockClear();
    await client.conversations.getMessage('conv/alpha', 'msg/1');
    [url, init] = fetchMock.mock.calls[0];
    parsed = new URL(url as string);
    expect(parsed.pathname).toBe('/conversations/conv%2Falpha/messages/msg%2F1');
    expect(init?.method).toBe('GET');
  });
});

describe('IncludeResources overrides', () => {
  it('prefers per-request includeResources over client defaults', async () => {
    const fetchMock = vi
      .fn()
      .mockImplementation(() => jsonResponse({ ok: true }, { status: 200 }));
    const client = new HostawayClient({
      baseUrl: 'https://api.test',
      fetch: fetchMock,
      accessToken: 'token-1',
      timeoutMs: 0,
      includeResources: ['calendar', 'pricing'],
    });

    await client.listings.list({ limit: 1 });
    let [url] = fetchMock.mock.calls[0];
    let parsed = new URL(url as string);
    expect(parsed.searchParams.getAll('includeResources')).toEqual([
      'calendar',
      'pricing',
    ]);

    fetchMock.mockClear();
    await client.listings.list({ limit: 1, includeResources: false });
    [url] = fetchMock.mock.calls[0];
    parsed = new URL(url as string);
    expect(parsed.searchParams.getAll('includeResources')).toEqual(['false']);

    fetchMock.mockClear();
    await client.listings.list({ limit: 1, includeResources: ['photos'] });
    [url] = fetchMock.mock.calls[0];
    parsed = new URL(url as string);
    expect(parsed.searchParams.getAll('includeResources')).toEqual(['photos']);
  });
});

describe('CommonResource', () => {
  it('builds common endpoints', async () => {
    const fetchMock = vi
      .fn()
      .mockImplementation(() => jsonResponse({ ok: true }, { status: 200 }));
    const client = createClient(fetchMock);

    await client.common.listAmenities();
    let [url, init] = fetchMock.mock.calls[0];
    let parsed = new URL(url as string);
    expect(parsed.pathname).toBe('/amenities');
    expect(init?.method).toBe('GET');

    fetchMock.mockClear();
    await client.common.listBedTypes();
    [url, init] = fetchMock.mock.calls[0];
    parsed = new URL(url as string);
    expect(parsed.pathname).toBe('/bedTypes');
    expect(init?.method).toBe('GET');

    fetchMock.mockClear();
    await client.common.listPropertyTypes();
    [url, init] = fetchMock.mock.calls[0];
    parsed = new URL(url as string);
    expect(parsed.pathname).toBe('/propertyTypes');
    expect(init?.method).toBe('GET');

    fetchMock.mockClear();
    await client.common.listVrboCancellationPolicies();
    [url, init] = fetchMock.mock.calls[0];
    parsed = new URL(url as string);
    expect(parsed.pathname).toBe('/cancellationPolicies/vrbo');
    expect(init?.method).toBe('GET');
  });
});

describe('WebhooksResource', () => {
  it('builds webhook endpoints', async () => {
    const fetchMock = vi
      .fn()
      .mockImplementation(() => jsonResponse({ ok: true }, { status: 200 }));
    const client = createClient(fetchMock);

    await client.webhooks.listReservationWebhooks();
    let [url, init] = fetchMock.mock.calls[0];
    let parsed = new URL(url as string);
    expect(parsed.pathname).toBe('/webhooks/reservations');
    expect(init?.method).toBe('GET');

    fetchMock.mockClear();
    await client.webhooks.createConversationMessageWebhook({
      url: 'https://example.com/hook',
      login: 'user',
    });
    [url, init] = fetchMock.mock.calls[0];
    parsed = new URL(url as string);
    expect(parsed.pathname).toBe('/webhooks/conversationMessages');
    expect(init?.method).toBe('POST');
    expect(JSON.parse(init?.body as string)).toMatchObject({
      url: 'https://example.com/hook',
      login: 'user',
    });

    fetchMock.mockClear();
    await client.webhooks.deleteUnifiedWebhook(44);
    [url, init] = fetchMock.mock.calls[0];
    parsed = new URL(url as string);
    expect(parsed.pathname).toBe('/webhooks/unifiedWebhooks/44');
    expect(init?.method).toBe('DELETE');
  });

  it('exposes webhook event types', () => {
    const client = createClient(vi.fn());
    expect(client.webhooks.listEventTypes()).toContain('reservation created');
  });
});

describe('LogsResource', () => {
  it('builds webhook log endpoints with filters', async () => {
    const fetchMock = vi
      .fn()
      .mockImplementation(() => jsonResponse({ ok: true }, { status: 200 }));
    const client = createClient(fetchMock);

    await client.logs.listReservationWebhookLogs({
      limit: 5,
      reservationId: 12,
      listingMapId: 55,
    });
    let [url, init] = fetchMock.mock.calls[0];
    let parsed = new URL(url as string);
    expect(parsed.pathname).toBe('/reservationWebhooklogs');
    expect(parsed.searchParams.get('limit')).toBe('5');
    expect(parsed.searchParams.get('reservationId')).toBe('12');
    expect(parsed.searchParams.get('listingMapId')).toBe('55');
    expect(init?.method).toBe('GET');

    fetchMock.mockClear();
    await client.logs.listUnifiedWebhookLogs({ unifiedWebhookId: 9 });
    [url, init] = fetchMock.mock.calls[0];
    parsed = new URL(url as string);
    expect(parsed.pathname).toBe('/unifiedWebhookLogs');
    expect(parsed.searchParams.get('unifiedWebhookId')).toBe('9');
    expect(init?.method).toBe('GET');
  });
});

describe('TasksResource', () => {
  it('builds task endpoints', async () => {
    const fetchMock = vi
      .fn()
      .mockImplementation(() => jsonResponse({ ok: true }, { status: 200 }));
    const client = createClient(fetchMock);

    await client.tasks.list({
      limit: 2,
      status: 'pending',
      canStartFromStart: '2024-02-01 00:00:00' as ISODateTimeString,
    });
    let [url, init] = fetchMock.mock.calls[0];
    let parsed = new URL(url as string);
    expect(parsed.pathname).toBe('/tasks');
    expect(parsed.searchParams.get('limit')).toBe('2');
    expect(parsed.searchParams.get('status')).toBe('pending');
    expect(parsed.searchParams.get('canStartFromStart')).toBe('2024-02-01 00:00:00');
    expect(init?.method).toBe('GET');

    fetchMock.mockClear();
    await client.tasks.create({
      title: 'Restock supplies',
      listingMapId: 12,
    });
    [url, init] = fetchMock.mock.calls[0];
    parsed = new URL(url as string);
    expect(parsed.pathname).toBe('/tasks');
    expect(init?.method).toBe('POST');
    expect(JSON.parse(init?.body as string)).toMatchObject({
      title: 'Restock supplies',
      listingMapId: 12,
    });

    fetchMock.mockClear();
    await client.tasks.update(44, { status: 'completed' });
    [url, init] = fetchMock.mock.calls[0];
    parsed = new URL(url as string);
    expect(parsed.pathname).toBe('/tasks/44');
    expect(init?.method).toBe('PUT');

    fetchMock.mockClear();
    await client.tasks.delete('task/alpha');
    [url, init] = fetchMock.mock.calls[0];
    parsed = new URL(url as string);
    expect(parsed.pathname).toBe('/tasks/task%2Falpha');
    expect(init?.method).toBe('DELETE');
  });
});

describe('CouponsResource', () => {
  it('builds coupon endpoints', async () => {
    const fetchMock = vi
      .fn()
      .mockImplementation(() => jsonResponse({ ok: true }, { status: 200 }));
    const client = createClient(fetchMock);

    await client.coupons.list();
    let [url, init] = fetchMock.mock.calls[0];
    let parsed = new URL(url as string);
    expect(parsed.pathname).toBe('/coupons');
    expect(init?.method).toBe('GET');

    fetchMock.mockClear();
    await client.coupons.createReservationCoupon({
      couponName: 'COUPON42',
      listingMapId: 123,
      startingDate: '2024-02-01' as ISODateString,
      endingDate: '2024-02-03' as ISODateString,
    });
    [url, init] = fetchMock.mock.calls[0];
    parsed = new URL(url as string);
    expect(parsed.pathname).toBe('/reservationCoupons');
    expect(init?.method).toBe('POST');
    expect(JSON.parse(init?.body as string)).toMatchObject({
      couponName: 'COUPON42',
      listingMapId: 123,
    });

    fetchMock.mockClear();
    await client.coupons.listReservationCoupons();
    [url, init] = fetchMock.mock.calls[0];
    parsed = new URL(url as string);
    expect(parsed.pathname).toBe('/reservationCoupons');
    expect(init?.method).toBe('GET');
  });
});

describe('FinancialResource', () => {
  it('builds financial endpoints', async () => {
    const fetchMock = vi
      .fn()
      .mockImplementation(() => jsonResponse({ ok: true }, { status: 200 }));
    const client = createClient(fetchMock);

    await client.financial.getStandardFields(755143);
    let [url, init] = fetchMock.mock.calls[0];
    let parsed = new URL(url as string);
    expect(parsed.pathname).toBe('/financeStandardField/reservation/755143');
    expect(init?.method).toBe('GET');

    fetchMock.mockClear();
    await client.financial.standardReport({
      listingMapIds: [123],
      fromDate: '2019-01-30' as ISODateString,
      toDate: '2019-02-25' as ISODateString,
      format: 'csv',
    });
    [url, init] = fetchMock.mock.calls[0];
    parsed = new URL(url as string);
    expect(parsed.pathname).toBe('/finance/report/standard');
    expect(init?.method).toBe('POST');

    fetchMock.mockClear();
    await client.financial.consolidatedReport({ format: 'json' });
    [url, init] = fetchMock.mock.calls[0];
    parsed = new URL(url as string);
    expect(parsed.pathname).toBe('/finance/report/consolidated');
    expect(init?.method).toBe('POST');

    fetchMock.mockClear();
    await client.financial.calculatedReport({ format: 'json' });
    [url, init] = fetchMock.mock.calls[0];
    parsed = new URL(url as string);
    expect(parsed.pathname).toBe('/finance/report/calculated');
    expect(init?.method).toBe('POST');

    fetchMock.mockClear();
    await client.financial.listingFinancialsReport({ format: 'json' });
    [url, init] = fetchMock.mock.calls[0];
    parsed = new URL(url as string);
    expect(parsed.pathname).toBe('/finance/report/listingFinancials');
    expect(init?.method).toBe('POST');
  });
});

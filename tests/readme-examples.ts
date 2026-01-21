import { HostawayClient } from '../src/index.js';
import type { ISODateString } from '../src/types/common.js';

const asDate = (value: string) => value as ISODateString;

async function readmeExamples(): Promise<void> {
  const client = new HostawayClient({
    accessToken: 'token-1',
  });

  await client.reservations.list({
    limit: 20,
    listingId: 12345,
    arrivalStartDate: asDate('2025-01-01'),
    arrivalEndDate: asDate('2025-12-31'),
    sortOrder: 'arrivalDate',
  });

  await client.reservations.create({
    listingMapId: 12345,
    channelId: 2000,
    guestName: 'John Doe',
    arrivalDate: asDate('2025-06-01'),
    departureDate: asDate('2025-06-07'),
  });

  await client.calendar.update(12345, {
    startDate: asDate('2025-01-15'),
    endDate: asDate('2025-01-20'),
    price: 150,
    isAvailable: 1,
  });

  await client.calendar.updateIntervals(12345, [
    { startDate: asDate('2025-02-01'), endDate: asDate('2025-02-07'), price: 200 },
    { startDate: asDate('2025-02-08'), endDate: asDate('2025-02-14'), price: 180 },
  ]);

  await client.tasks.list({
    reservationId: 12345,
    status: 'pending',
  });

  await client.tasks.create({
    listingMapId: 12345,
    title: 'Deep cleaning',
    description: 'Full property deep clean',
  });

  await client.coupons.createReservationCoupon({
    couponName: 'SUMMER25',
    listingMapId: 12345,
    startingDate: asDate('2025-06-01'),
    endingDate: asDate('2025-06-07'),
  });

  await client.webhooks.createUnifiedWebhook({
    url: 'https://example.com/unified',
    isEnabled: 1,
    eventTypes: ['reservation created', 'reservation updated'],
  });

  const report = await client.financial.standardReport({
    listingMapIds: [12345],
    fromDate: asDate('2025-01-01'),
    toDate: asDate('2025-12-31'),
    format: 'csv',
  });
  void report;
}

void readmeExamples;

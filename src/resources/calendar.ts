import type { HostawayClient } from '../client.js';
import type { ApiResponse } from '../types/common.js';
import type {
  CalendarDay,
  CalendarIntervalUpdateRequest,
  CalendarListParams,
  CalendarPriceDetailsRequest,
  CalendarPriceDetailsResponse,
  CalendarUpdateRequest,
} from '../types/calendar.js';

export class CalendarResource {
  private client: HostawayClient;

  constructor(client: HostawayClient) {
    this.client = client;
  }

  get(
    listingId: number | string,
    params?: CalendarListParams
  ): Promise<ApiResponse<CalendarDay[]>> {
    return this.client.request('GET', `/listings/${listingId}/calendar`, {
      query: params,
    });
  }

  update(
    listingId: number | string,
    payload: CalendarUpdateRequest
  ): Promise<ApiResponse<CalendarDay[]>> {
    return this.client.request('PUT', `/listings/${listingId}/calendar`, {
      body: payload,
    });
  }

  updateIntervals(
    listingId: number | string,
    payload: CalendarIntervalUpdateRequest
  ): Promise<ApiResponse<CalendarDay[]>> {
    return this.client.request(
      'PUT',
      `/listings/${listingId}/calendarIntervals`,
      {
        body: payload,
      }
    );
  }

  priceDetails(
    listingId: number | string,
    payload: CalendarPriceDetailsRequest
  ): Promise<ApiResponse<CalendarPriceDetailsResponse>> {
    return this.client.request('POST', `/listings/${listingId}/calendar/priceDetails`, {
      body: payload,
    });
  }
}

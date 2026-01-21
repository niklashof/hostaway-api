import type { HostawayClient } from '../client.js';
import type { ApiResponse } from '../types/common.js';
import type {
  CreateReservationRequest,
  Reservation,
  ReservationsListParams,
  ReservationStatus,
  ReservationCreateOptions,
  ReservationUpdateOptions,
  UpdateReservationRequest,
} from '../types/reservations.js';

const encodePathParam = (value: number | string): string =>
  encodeURIComponent(String(value));

export class ReservationsResource {
  private client: HostawayClient;

  constructor(client: HostawayClient) {
    this.client = client;
  }

  list(params?: ReservationsListParams): Promise<ApiResponse<Reservation[]>> {
    if (!params) {
      return this.client.request('GET', '/reservations');
    }

    const query = { ...params } as Record<string, unknown>;
    const resolvedSortOrder = (query.sortOrder ?? query.order) as
      | string
      | undefined;
    if (resolvedSortOrder !== undefined) {
      // Docs list sortOrder, older examples use order, so send both.
      query.sortOrder = resolvedSortOrder;
      query.order = resolvedSortOrder;
    }

    return this.client.request('GET', '/reservations', { query });
  }

  get(reservationId: number | string): Promise<ApiResponse<Reservation>> {
    return this.client.request(
      'GET',
      `/reservations/${encodePathParam(reservationId)}`
    );
  }

  create(
    payload: CreateReservationRequest,
    options?: ReservationCreateOptions
  ): Promise<ApiResponse<Reservation>> {
    const query: Record<string, unknown> = {};
    if (options?.forceOverbooking) {
      query.forceOverbooking = 1;
    }
    if (options?.validatePaymentMethod) {
      query.validatePaymentMethod = 1;
    }
    return this.client.request('POST', '/reservations', {
      query: Object.keys(query).length ? query : undefined,
      body: payload,
    });
  }

  update(
    reservationId: number | string,
    payload: UpdateReservationRequest,
    options?: ReservationUpdateOptions
  ): Promise<ApiResponse<Reservation>> {
    const query = options?.forceOverbooking ? { forceOverbooking: 1 } : undefined;
    return this.client.request(
      'PUT',
      `/reservations/${encodePathParam(reservationId)}`,
      {
        query,
        body: payload,
      }
    );
  }

  updateStatus(
    reservationId: number | string,
    status: ReservationStatus
  ): Promise<ApiResponse<Reservation>> {
    return this.client.request(
      'PUT',
      `/reservations/${encodePathParam(reservationId)}/statuses/${encodePathParam(
        status
      )}`
    );
  }

  delete(
    reservationId: number | string
  ): Promise<ApiResponse<unknown> | undefined> {
    return this.client.request(
      'DELETE',
      `/reservations/${encodePathParam(reservationId)}`
    );
  }
}

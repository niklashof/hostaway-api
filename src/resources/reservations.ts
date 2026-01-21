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

export class ReservationsResource {
  private client: HostawayClient;

  constructor(client: HostawayClient) {
    this.client = client;
  }

  list(params?: ReservationsListParams): Promise<ApiResponse<Reservation[]>> {
    return this.client.request('GET', '/reservations', { query: params });
  }

  get(reservationId: number | string): Promise<ApiResponse<Reservation>> {
    return this.client.request('GET', `/reservations/${reservationId}`);
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
    return this.client.request('PUT', `/reservations/${reservationId}`, {
      query,
      body: payload,
    });
  }

  updateStatus(
    reservationId: number | string,
    status: ReservationStatus
  ): Promise<ApiResponse<Reservation>> {
    return this.client.request(
      'PUT',
      `/reservations/${reservationId}/statuses/${status}`
    );
  }

  delete(
    reservationId: number | string
  ): Promise<ApiResponse<unknown> | undefined> {
    return this.client.request('DELETE', `/reservations/${reservationId}`);
  }
}

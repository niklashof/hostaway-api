import type { HostawayClient } from '../client.js';
import type { ApiResponse } from '../types/common.js';
import type {
  Coupon,
  CreateReservationCouponRequest,
  ReservationCoupon,
  ReservationCouponIdResult,
} from '../types/coupons.js';

export class CouponsResource {
  private client: HostawayClient;

  constructor(client: HostawayClient) {
    this.client = client;
  }

  list(): Promise<ApiResponse<Coupon[]>> {
    return this.client.request('GET', '/coupons');
  }

  createReservationCoupon(
    payload: CreateReservationCouponRequest
  ): Promise<ApiResponse<ReservationCouponIdResult[]>> {
    return this.client.request('POST', '/reservationCoupons', {
      body: payload,
    });
  }

  listReservationCoupons(): Promise<ApiResponse<ReservationCoupon[]>> {
    return this.client.request('GET', '/reservationCoupons');
  }
}

import type { ISODateString } from './common.js';

export type CouponType = 'percentage' | 'flatFee' | string;

export interface Coupon {
  id?: number;
  accountId?: number;
  userId?: number | null;
  isActive?: number | boolean;
  isExpired?: number | boolean;
  name?: string;
  type?: CouponType;
  amount?: number;
  minimumNights?: number;
  checkInDateStart?: ISODateString | string | null;
  checkInDateEnd?: ISODateString | string | null;
  numberOfUsesInitial?: number;
  numberOfUsesUsed?: number;
  validityDateStart?: ISODateString | string | null;
  validityDateEnd?: ISODateString | string | null;
  [key: string]: unknown;
}

export interface ReservationCoupon {
  id?: number;
  userId?: number | null;
  listingMapId?: number;
  reservationId?: number;
  couponId?: number | string;
  couponName?: string;
  reservationBasePrice?: number;
  couponPrice?: number;
  [key: string]: unknown;
}

export interface CreateReservationCouponRequest {
  couponName: string;
  listingMapId: number | string;
  startingDate: ISODateString | string;
  endingDate?: ISODateString | string;
  [key: string]: unknown;
}

export interface ReservationCouponIdResult {
  reservationCouponId?: number;
  [key: string]: unknown;
}

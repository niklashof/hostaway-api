import type { ISODateString, ISODateTimeString, ListParams } from './common.js';

export interface ReservationsListParams
  extends Pick<ListParams, 'limit' | 'offset' | 'sortOrder'> {
  channelId?: number | string;
  listingId?: number | string;
  arrivalStartDate?: ISODateString;
  arrivalEndDate?: ISODateString;
  departureStartDate?: ISODateString;
  departureEndDate?: ISODateString;
  hasUnreadConversationMessages?: boolean;
}

export type ReservationStatus = string;

export interface ReservationFee {
  name?: string;
  type?: string;
  amount?: number;
  currency?: string;
  [key: string]: unknown;
}

export interface ReservationUnit {
  listingUnitId?: number;
  listingMapId?: number;
  guests?: number;
  [key: string]: unknown;
}

export interface Reservation {
  id?: number;
  reservationId?: number;
  listingMapId?: number;
  listingId?: number;
  channelId?: number;
  status?: ReservationStatus;
  arrivalDate?: ISODateString;
  departureDate?: ISODateString;
  guestName?: string;
  guestsCount?: number;
  totalPrice?: number;
  currency?: string;
  fees?: ReservationFee[];
  units?: ReservationUnit[];
  createdAt?: ISODateTimeString;
  updatedAt?: ISODateTimeString;
  [key: string]: unknown;
}

export interface CreateReservationRequest {
  listingMapId: number;
  arrivalDate: ISODateString;
  departureDate: ISODateString;
  channelId?: number;
  guestName?: string;
  guestsCount?: number;
  totalPrice?: number;
  currency?: string;
  status?: ReservationStatus;
  fees?: ReservationFee[];
  units?: ReservationUnit[];
  [key: string]: unknown;
}

export type UpdateReservationRequest = Partial<
  Omit<CreateReservationRequest, 'channelId'>
> & {
  [key: string]: unknown;
};

export interface ReservationCreateOptions {
  forceOverbooking?: boolean;
  validatePaymentMethod?: boolean;
}

export interface ReservationUpdateOptions {
  forceOverbooking?: boolean;
}

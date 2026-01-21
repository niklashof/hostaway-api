import type {
  IncludeResourcesParams,
  ISODateString,
  ISODateTimeString,
} from './common.js';

export interface CalendarListParams extends IncludeResourcesParams {
  startDate?: ISODateString;
  endDate?: ISODateString;
}

export interface CalendarDay {
  id?: number;
  date?: ISODateString;
  listingUnitId?: number;
  status?: string;
  isAvailable?: boolean | number;
  isProcessed?: boolean | number;
  price?: number;
  minimumStay?: number;
  maximumStay?: number;
  closedOnArrival?: boolean | number | null;
  closedOnDeparture?: boolean | number | null;
  note?: string | null;
  countAvailableUnits?: number | null;
  availableUnitsToSell?: number | null;
  countPendingUnits?: number | null;
  countBlockingReservations?: number | null;
  countBlockedUnits?: number | null;
  desiredUnitsToSell?: number | null;
  updatedAt?: ISODateTimeString;
  [key: string]: unknown;
}

export interface CalendarUpdatePayload {
  startDate: ISODateString;
  endDate: ISODateString;
  listingUnitId?: number;
  status?: string;
  isAvailable?: boolean | number;
  isProcessed?: boolean | number;
  price?: number;
  minimumStay?: number;
  maximumStay?: number;
  closedOnArrival?: boolean | number | null;
  closedOnDeparture?: boolean | number | null;
  note?: string | null;
  desiredUnitsToSell?: number | null;
  [key: string]: unknown;
}

export type CalendarUpdateRequest = CalendarUpdatePayload | CalendarUpdatePayload[];

export interface CalendarIntervalUpdatePayload {
  startDate: ISODateString;
  endDate: ISODateString;
  listingUnitId?: number;
  status?: string;
  isAvailable?: boolean | number;
  isProcessed?: boolean | number;
  price?: number;
  minimumStay?: number;
  maximumStay?: number;
  closedOnArrival?: boolean | number | null;
  closedOnDeparture?: boolean | number | null;
  note?: string | null;
  desiredUnitsToSell?: number | null;
  [key: string]: unknown;
}

export type CalendarIntervalUpdateRequest =
  | CalendarIntervalUpdatePayload
  | CalendarIntervalUpdatePayload[];

export interface CalendarPriceDetailsRequest {
  startDate: ISODateString;
  endDate: ISODateString;
  listingUnitId?: number;
  currency?: string;
  [key: string]: unknown;
}

export interface CalendarPriceDetailsResponse {
  currency?: string;
  total?: number;
  [key: string]: unknown;
}

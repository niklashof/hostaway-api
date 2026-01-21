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
  date?: ISODateString;
  listingUnitId?: number;
  status?: string;
  available?: boolean;
  price?: number;
  minStay?: number;
  maxStay?: number;
  closed?: boolean;
  updatedAt?: ISODateTimeString;
  [key: string]: unknown;
}

export interface CalendarUpdatePayload {
  date: ISODateString;
  listingUnitId?: number;
  status?: string;
  available?: boolean;
  price?: number;
  minStay?: number;
  maxStay?: number;
  closed?: boolean;
  [key: string]: unknown;
}

export type CalendarUpdateRequest = CalendarUpdatePayload | CalendarUpdatePayload[];

export interface CalendarIntervalUpdatePayload {
  startDate: ISODateString;
  endDate: ISODateString;
  listingUnitId?: number;
  status?: string;
  available?: boolean;
  price?: number;
  minStay?: number;
  maxStay?: number;
  closed?: boolean;
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

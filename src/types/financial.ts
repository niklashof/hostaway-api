import type { ISODateString, ISODateTimeString } from './common.js';

export interface FinanceStandardField {
  id?: number;
  accountId?: number;
  listingMapId?: number;
  channelId?: number;
  reservationId?: number;
  insertedOn?: ISODateTimeString | string;
  updatedOn?: ISODateTimeString | string;
  [key: string]: unknown;
}

export type FinancialReportDateType =
  | 'arrivalDate'
  | 'departureDate'
  | 'reservationDate'
  | string;

export type FinancialReportFormat = 'csv' | 'json' | string;

export type FinancialReportSortOrder = 'asc' | 'desc' | string;

export type FinancialReportDelimiter = 'comma' | 'tab' | string;

export interface FinancialReportRequest {
  listingMapIds?: Array<number | string>;
  fromDate?: ISODateString | string;
  toDate?: ISODateString | string;
  dateType?: FinancialReportDateType;
  channelIds?: Array<number | string>;
  statuses?: string[];
  format?: FinancialReportFormat;
  sortBy?: string;
  sortOrder?: FinancialReportSortOrder;
  delimiter?: FinancialReportDelimiter;
  [key: string]: unknown;
}

export type FinancialReportResult =
  | string
  | Record<string, unknown>
  | Array<Record<string, unknown>>;

export type ISODateString = string & { __brand: 'ISODateString' };
export type ISODateTimeString = string & { __brand: 'ISODateTimeString' };

export interface Pagination {
  limit?: number;
  offset?: number;
  total?: number;
  count?: number;
}

export interface ListParams {
  limit?: number;
  offset?: number;
  sortOrder?: 'asc' | 'desc' | string;
}

export interface IncludeResourcesParams {
  includeResources?: boolean | string[];
}

export interface ApiResponse<T> {
  status?: string;
  result?: T;
  data?: T;
  pagination?: Pagination;
}

export interface Logger {
  debug?: (...args: unknown[]) => void;
  info?: (...args: unknown[]) => void;
  warn?: (...args: unknown[]) => void;
  error?: (...args: unknown[]) => void;
}

export type FetchLike = typeof fetch;

export interface Amenity {
  id?: number;
  name?: string;
  [key: string]: unknown;
}

export interface BedType {
  id?: number;
  name?: string;
  [key: string]: unknown;
}

export interface PropertyType {
  id?: number;
  name?: string;
  [key: string]: unknown;
}

export interface CancellationPolicyItem {
  id?: number | string;
  cancellationPolicyId?: number | string;
  refundAmount?: number | string;
  refundType?: string;
  refundField?: string;
  timeDelta?: number | string;
  event?: string;
  [key: string]: unknown;
}

export interface CancellationPolicy {
  id?: number;
  accountId?: number;
  name?: string;
  cancellationPolicyItem?: CancellationPolicyItem[];
  [key: string]: unknown;
}

export type CancellationPolicyChannel =
  | 'airbnb'
  | 'booking'
  | 'marriott'
  | 'vrbo'
  | string;

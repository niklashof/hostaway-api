import type { ISODateTimeString, ListParams } from './common.js';

export interface ListingsListParams extends ListParams {
  city?: string;
  match?: string;
  country?: string;
  contactName?: string;
  propertyTypeId?: number | string;
}

export interface Listing {
  id?: number;
  listingId?: number;
  name?: string;
  city?: string;
  country?: string;
  contactName?: string;
  propertyTypeId?: number;
  status?: string;
  createdAt?: ISODateTimeString;
  updatedAt?: ISODateTimeString;
  [key: string]: unknown;
}

export interface ListingUnit {
  id?: number;
  listingId?: number;
  listingMapId?: number;
  name?: string;
  status?: string;
  maxGuests?: number;
  bedroomCount?: number;
  bathroomCount?: number;
  createdAt?: ISODateTimeString;
  updatedAt?: ISODateTimeString;
  [key: string]: unknown;
}

export interface ListingFeeSettings {
  listingId?: number;
  currency?: string;
  cleaningFee?: number;
  petFee?: number;
  extraGuestFee?: number;
  securityDeposit?: number;
  weekendPrice?: number;
  [key: string]: unknown;
}

export interface CreateListingRequest {
  name?: string;
  city?: string;
  country?: string;
  contactName?: string;
  propertyTypeId?: number;
  address?: string;
  units?: number;
  [key: string]: unknown;
}

export interface UpdateListingRequest {
  name?: string;
  city?: string;
  country?: string;
  contactName?: string;
  propertyTypeId?: number;
  status?: string;
  address?: string;
  [key: string]: unknown;
}

export interface ListingFeeSettingsRequest {
  cleaningFee?: number;
  petFee?: number;
  extraGuestFee?: number;
  securityDeposit?: number;
  weekendPrice?: number;
  [key: string]: unknown;
}

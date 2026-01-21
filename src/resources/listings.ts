import type { HostawayClient } from '../client.js';
import type { ApiResponse } from '../types/common.js';
import type {
  CreateListingRequest,
  Listing,
  ListingFeeSettings,
  ListingFeeSettingsRequest,
  ListingUnit,
  ListingsListParams,
  UpdateListingRequest,
} from '../types/listings.js';

const encodePathParam = (value: number | string): string =>
  encodeURIComponent(String(value));

export class ListingsResource {
  private client: HostawayClient;

  constructor(client: HostawayClient) {
    this.client = client;
  }

  list(params?: ListingsListParams): Promise<ApiResponse<Listing[]>> {
    return this.client.request('GET', '/listings', { query: params });
  }

  get(listingId: number | string): Promise<ApiResponse<Listing>> {
    return this.client.request('GET', `/listings/${encodePathParam(listingId)}`);
  }

  create(payload: CreateListingRequest): Promise<ApiResponse<Listing>> {
    return this.client.request('POST', '/listings', { body: payload });
  }

  update(
    listingId: number | string,
    payload: UpdateListingRequest
  ): Promise<ApiResponse<Listing>> {
    return this.client.request('PUT', `/listings/${encodePathParam(listingId)}`, {
      body: payload,
    });
  }

  delete(listingId: number | string): Promise<ApiResponse<unknown> | undefined> {
    return this.client.request('DELETE', `/listings/${encodePathParam(listingId)}`);
  }

  exportToAirbnb(
    listingId: number | string
  ): Promise<ApiResponse<unknown> | undefined> {
    return this.client.request(
      'POST',
      `/listings/${encodePathParam(listingId)}/export/airbnb`
    );
  }

  getFeeSettings(
    listingId: number | string
  ): Promise<ApiResponse<ListingFeeSettings>> {
    return this.client.request(
      'GET',
      `/listingFeeSettings/${encodePathParam(listingId)}`
    );
  }

  updateFeeSettings(
    listingId: number | string,
    payload: ListingFeeSettingsRequest
  ): Promise<ApiResponse<ListingFeeSettings>> {
    return this.client.request(
      'POST',
      `/listingFeeSettings/${encodePathParam(listingId)}`,
      {
        body: payload,
      }
    );
  }

  getListingUnit(
    listingMapId: number | string
  ): Promise<ApiResponse<ListingUnit>> {
    return this.client.request(
      'GET',
      `/listingUnits/${encodePathParam(listingMapId)}`
    );
  }
}

import type { HostawayClient } from '../client.js';
import type { ApiResponse } from '../types/common.js';
import type {
  Amenity,
  BedType,
  CancellationPolicy,
  CancellationPolicyChannel,
  PropertyType,
} from '../types/common-resource.js';

const encodePathParam = (value: number | string): string =>
  encodeURIComponent(String(value));

export class CommonResource {
  private client: HostawayClient;

  constructor(client: HostawayClient) {
    this.client = client;
  }

  listAmenities(): Promise<ApiResponse<Amenity[]>> {
    return this.client.request('GET', '/amenities');
  }

  listBedTypes(): Promise<ApiResponse<BedType[]>> {
    return this.client.request('GET', '/bedTypes');
  }

  listPropertyTypes(): Promise<ApiResponse<PropertyType[]>> {
    return this.client.request('GET', '/propertyTypes');
  }

  listCancellationPolicies(): Promise<ApiResponse<CancellationPolicy[]>> {
    return this.client.request('GET', '/cancellationPolicies');
  }

  getCancellationPolicy(
    cancellationPolicyId: number | string
  ): Promise<ApiResponse<CancellationPolicy>> {
    return this.client.request(
      'GET',
      `/cancellationPolicies/${encodePathParam(cancellationPolicyId)}`
    );
  }

  listCancellationPoliciesByChannel(
    channel: CancellationPolicyChannel
  ): Promise<ApiResponse<CancellationPolicy[]>> {
    return this.client.request(
      'GET',
      `/cancellationPolicies/${encodePathParam(channel)}`
    );
  }

  listAirbnbCancellationPolicies(): Promise<ApiResponse<CancellationPolicy[]>> {
    return this.listCancellationPoliciesByChannel('airbnb');
  }

  listBookingCancellationPolicies(): Promise<ApiResponse<CancellationPolicy[]>> {
    return this.listCancellationPoliciesByChannel('booking');
  }

  listMarriottCancellationPolicies(): Promise<ApiResponse<CancellationPolicy[]>> {
    return this.listCancellationPoliciesByChannel('marriott');
  }

  listVrboCancellationPolicies(): Promise<ApiResponse<CancellationPolicy[]>> {
    return this.listCancellationPoliciesByChannel('vrbo');
  }
}

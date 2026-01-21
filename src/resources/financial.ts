import type { HostawayClient } from '../client.js';
import type { ApiResponse } from '../types/common.js';
import type {
  FinanceStandardField,
  FinancialReportRequest,
  FinancialReportResult,
} from '../types/financial.js';

const encodePathParam = (value: number | string): string =>
  encodeURIComponent(String(value));

export class FinancialResource {
  private client: HostawayClient;

  constructor(client: HostawayClient) {
    this.client = client;
  }

  getStandardField(
    reservationId: number | string
  ): Promise<ApiResponse<FinanceStandardField>> {
    return this.client.request(
      'GET',
      `/financeStandardField/reservation/${encodePathParam(reservationId)}`
    );
  }

  standardReport(
    payload: FinancialReportRequest
  ): Promise<FinancialReportResult> {
    return this.client.request('POST', '/finance/report/standard', {
      body: payload,
    });
  }

  consolidatedReport(
    payload: FinancialReportRequest
  ): Promise<FinancialReportResult> {
    return this.client.request('POST', '/finance/report/consolidated', {
      body: payload,
    });
  }

  calculatedReport(
    payload: FinancialReportRequest
  ): Promise<FinancialReportResult> {
    return this.client.request('POST', '/finance/report/calculated', {
      body: payload,
    });
  }

  listingFinancialsReport(
    payload: FinancialReportRequest
  ): Promise<FinancialReportResult> {
    return this.client.request('POST', '/finance/report/listingFinancials', {
      body: payload,
    });
  }
}

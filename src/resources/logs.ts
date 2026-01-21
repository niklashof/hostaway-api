import type { HostawayClient } from '../client.js';
import type { ApiResponse } from '../types/common.js';
import type {
  ConversationMessageWebhookLog,
  ConversationMessageWebhookLogListParams,
  ReservationWebhookLog,
  ReservationWebhookLogListParams,
  UnifiedWebhookLog,
  UnifiedWebhookLogListParams,
} from '../types/logs.js';

export class LogsResource {
  private client: HostawayClient;

  constructor(client: HostawayClient) {
    this.client = client;
  }

  listReservationWebhookLogs(
    params?: ReservationWebhookLogListParams
  ): Promise<ApiResponse<ReservationWebhookLog[]>> {
    return this.client.request('GET', '/reservationWebhooklogs', {
      query: params,
    });
  }

  listUnifiedWebhookLogs(
    params?: UnifiedWebhookLogListParams
  ): Promise<ApiResponse<UnifiedWebhookLog[]>> {
    return this.client.request('GET', '/unifiedWebhookLogs', {
      query: params,
    });
  }

  listConversationMessageWebhookLogs(
    params?: ConversationMessageWebhookLogListParams
  ): Promise<ApiResponse<ConversationMessageWebhookLog[]>> {
    return this.client.request('GET', '/conversationMessageWebhooklogs', {
      query: params,
    });
  }
}

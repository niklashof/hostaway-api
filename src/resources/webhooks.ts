import type { HostawayClient } from '../client.js';
import type { ApiResponse } from '../types/common.js';
import type {
  ConversationMessageWebhook,
  CreateConversationMessageWebhookRequest,
  CreateReservationWebhookRequest,
  CreateUnifiedWebhookRequest,
  ReservationWebhook,
  UnifiedWebhook,
  UpdateConversationMessageWebhookRequest,
  UpdateReservationWebhookRequest,
  UpdateUnifiedWebhookRequest,
  WebhookEventType,
} from '../types/webhooks.js';
import { WEBHOOK_EVENT_TYPES } from '../types/webhooks.js';

const encodePathParam = (value: number | string): string =>
  encodeURIComponent(String(value));

export class WebhooksResource {
  private client: HostawayClient;

  constructor(client: HostawayClient) {
    this.client = client;
  }

  listEventTypes(): WebhookEventType[] {
    return [...WEBHOOK_EVENT_TYPES];
  }

  listReservationWebhooks(): Promise<ApiResponse<ReservationWebhook[]>> {
    return this.client.request('GET', '/webhooks/reservations');
  }

  getReservationWebhook(
    webhookId: number | string
  ): Promise<ApiResponse<ReservationWebhook>> {
    return this.client.request(
      'GET',
      `/webhooks/reservations/${encodePathParam(webhookId)}`
    );
  }

  createReservationWebhook(
    payload: CreateReservationWebhookRequest
  ): Promise<ApiResponse<ReservationWebhook>> {
    return this.client.request('POST', '/webhooks/reservations', {
      body: payload,
    });
  }

  updateReservationWebhook(
    webhookId: number | string,
    payload: UpdateReservationWebhookRequest
  ): Promise<ApiResponse<ReservationWebhook>> {
    return this.client.request(
      'PUT',
      `/webhooks/reservations/${encodePathParam(webhookId)}`,
      {
        body: payload,
      }
    );
  }

  deleteReservationWebhook(
    webhookId: number | string
  ): Promise<ApiResponse<unknown> | undefined> {
    return this.client.request(
      'DELETE',
      `/webhooks/reservations/${encodePathParam(webhookId)}`
    );
  }

  listConversationMessageWebhooks(): Promise<
    ApiResponse<ConversationMessageWebhook[]>
  > {
    return this.client.request('GET', '/webhooks/conversationMessages');
  }

  getConversationMessageWebhook(
    webhookId: number | string
  ): Promise<ApiResponse<ConversationMessageWebhook>> {
    return this.client.request(
      'GET',
      `/webhooks/conversationMessages/${encodePathParam(webhookId)}`
    );
  }

  createConversationMessageWebhook(
    payload: CreateConversationMessageWebhookRequest
  ): Promise<ApiResponse<ConversationMessageWebhook>> {
    return this.client.request('POST', '/webhooks/conversationMessages', {
      body: payload,
    });
  }

  updateConversationMessageWebhook(
    webhookId: number | string,
    payload: UpdateConversationMessageWebhookRequest
  ): Promise<ApiResponse<ConversationMessageWebhook>> {
    return this.client.request(
      'PUT',
      `/webhooks/conversationMessages/${encodePathParam(webhookId)}`,
      {
        body: payload,
      }
    );
  }

  deleteConversationMessageWebhook(
    webhookId: number | string
  ): Promise<ApiResponse<unknown> | undefined> {
    return this.client.request(
      'DELETE',
      `/webhooks/conversationMessages/${encodePathParam(webhookId)}`
    );
  }

  listUnifiedWebhooks(): Promise<ApiResponse<UnifiedWebhook[]>> {
    return this.client.request('GET', '/webhooks/unifiedWebhooks');
  }

  getUnifiedWebhook(
    webhookId: number | string
  ): Promise<ApiResponse<UnifiedWebhook>> {
    return this.client.request(
      'GET',
      `/webhooks/unifiedWebhooks/${encodePathParam(webhookId)}`
    );
  }

  createUnifiedWebhook(
    payload: CreateUnifiedWebhookRequest
  ): Promise<ApiResponse<UnifiedWebhook>> {
    return this.client.request('POST', '/webhooks/unifiedWebhooks', {
      body: payload,
    });
  }

  updateUnifiedWebhook(
    webhookId: number | string,
    payload: UpdateUnifiedWebhookRequest
  ): Promise<ApiResponse<UnifiedWebhook>> {
    return this.client.request(
      'PUT',
      `/webhooks/unifiedWebhooks/${encodePathParam(webhookId)}`,
      {
        body: payload,
      }
    );
  }

  deleteUnifiedWebhook(
    webhookId: number | string
  ): Promise<ApiResponse<unknown> | undefined> {
    return this.client.request(
      'DELETE',
      `/webhooks/unifiedWebhooks/${encodePathParam(webhookId)}`
    );
  }
}

import type { ListParams } from './common.js';

export interface ReservationWebhookLogListParams
  extends Pick<ListParams, 'limit' | 'offset'> {
  reservationId?: number | string;
  listingMapId?: number | string;
}

export interface UnifiedWebhookLogListParams
  extends Pick<ListParams, 'limit' | 'offset'> {
  unifiedWebhookId?: number | string;
  listingMapId?: number | string;
}

export interface ConversationMessageWebhookLogListParams
  extends Pick<ListParams, 'limit' | 'offset'> {
  reservationId?: number | string;
  listingMapId?: number | string;
}

export interface ReservationWebhookLog {
  id?: number;
  accountId?: number;
  listingMapId?: number;
  reservationId?: number;
  reservationWebhookId?: number;
  currentReservationStatus?: string;
  previousReservationStatus?: string | null;
  url?: string;
  login?: string | null;
  password?: string | null;
  responseStatus?: number;
  responseBody?: string | null;
  [key: string]: unknown;
}

export interface UnifiedWebhookLog {
  id?: number;
  accountId?: number;
  listingMapId?: number;
  webhookNotificationSettingId?: number;
  isEnabled?: number | boolean;
  url?: string;
  login?: string | null;
  password?: string | null;
  responseStatus?: number;
  responseBody?: string | null;
  [key: string]: unknown;
}

export interface ConversationMessageWebhookLog {
  id?: number;
  accountId?: number;
  listingMapId?: number;
  reservationId?: number;
  conversationMessageId?: number;
  conversationMessageWebhookId?: number;
  url?: string;
  login?: string | null;
  password?: string | null;
  responseStatus?: number;
  responseBody?: string | null;
  [key: string]: unknown;
}

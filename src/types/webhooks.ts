// Known event types from Hostaway docs; API may add more over time.
export const WEBHOOK_EVENT_TYPES = [
  'reservation created',
  'reservation updated',
  'new message received',
] as const;

export type WebhookEventType = (typeof WEBHOOK_EVENT_TYPES)[number];

export interface ReservationWebhook {
  id?: number;
  url?: string;
  login?: string | null;
  password?: string | null;
  alertingEmailAddress?: string | null;
  isEnabled?: number | boolean;
  [key: string]: unknown;
}

export interface ConversationMessageWebhook {
  id?: number;
  url?: string;
  login?: string | null;
  password?: string | null;
  alertingEmailAddress?: string | null;
  isEnabled?: number | boolean;
  [key: string]: unknown;
}

export interface UnifiedWebhook {
  id?: number;
  isEnabled?: number | boolean;
  url?: string;
  login?: string | null;
  password?: string | null;
  alertingEmailAddress?: string | null;
  [key: string]: unknown;
}

export interface CreateReservationWebhookRequest {
  url: string;
  login?: string | null;
  password?: string | null;
  alertingEmailAddress?: string | null;
  isEnabled?: number | boolean;
  [key: string]: unknown;
}

export type UpdateReservationWebhookRequest = Partial<CreateReservationWebhookRequest>;

export interface CreateConversationMessageWebhookRequest {
  url: string;
  login?: string | null;
  password?: string | null;
  alertingEmailAddress?: string | null;
  isEnabled?: number | boolean;
  [key: string]: unknown;
}

export type UpdateConversationMessageWebhookRequest =
  Partial<CreateConversationMessageWebhookRequest>;

export interface CreateUnifiedWebhookRequest {
  url: string;
  isEnabled?: number | boolean;
  login?: string | null;
  password?: string | null;
  alertingEmailAddress?: string | null;
  [key: string]: unknown;
}

export type UpdateUnifiedWebhookRequest = Partial<CreateUnifiedWebhookRequest>;

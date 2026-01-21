import type {
  IncludeResourcesParams,
  ISODateTimeString,
  ListParams,
} from './common.js';

export interface ConversationsListParams
  extends IncludeResourcesParams,
    Pick<ListParams, 'limit' | 'offset'> {
  reservationId?: number | string;
}

export interface Conversation {
  id?: number;
  conversationId?: number;
  reservationId?: number;
  channelId?: number;
  status?: string;
  subject?: string;
  createdAt?: ISODateTimeString;
  updatedAt?: ISODateTimeString;
  [key: string]: unknown;
}

export interface ConversationMessage {
  id?: number;
  conversationMessageId?: number;
  conversationId?: number;
  message?: string;
  from?: string;
  type?: string;
  isIncoming?: boolean;
  createdAt?: ISODateTimeString;
  updatedAt?: ISODateTimeString;
  [key: string]: unknown;
}

export interface MessageTemplate {
  id?: number;
  name?: string;
  subject?: string;
  body?: string;
  [key: string]: unknown;
}

export interface CreateConversationMessageRequest {
  message: string;
  templateId?: number;
  [key: string]: unknown;
}

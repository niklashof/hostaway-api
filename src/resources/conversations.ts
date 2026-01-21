import type { HostawayClient } from '../client.js';
import type { ApiResponse } from '../types/common.js';
import type {
  Conversation,
  ConversationMessage,
  ConversationsListParams,
  CreateConversationMessageRequest,
} from '../types/conversations.js';

export class ConversationsResource {
  private client: HostawayClient;

  constructor(client: HostawayClient) {
    this.client = client;
  }

  list(params?: ConversationsListParams): Promise<ApiResponse<Conversation[]>> {
    return this.client.request('GET', '/conversations', { query: params });
  }

  get(conversationId: number | string): Promise<ApiResponse<Conversation>> {
    return this.client.request('GET', `/conversations/${conversationId}`);
  }

  listMessages(
    conversationId: number | string
  ): Promise<ApiResponse<ConversationMessage[]>> {
    return this.client.request(
      'GET',
      `/conversations/${conversationId}/messages`
    );
  }

  getMessage(
    conversationId: number | string,
    conversationMessageId: number | string
  ): Promise<ApiResponse<ConversationMessage>> {
    return this.client.request(
      'GET',
      `/conversations/${conversationId}/messages/${conversationMessageId}`
    );
  }

  createMessage(
    conversationId: number | string,
    payload: CreateConversationMessageRequest
  ): Promise<ApiResponse<ConversationMessage>> {
    return this.client.request(
      'POST',
      `/conversations/${conversationId}/messages`,
      {
        body: payload,
      }
    );
  }
}

import { HostawayError } from './errors.js';
import type { FetchLike, Logger } from './types/common.js';

export interface TokenProviderResult {
  accessToken: string;
  expiresAt?: number;
}

export interface TokenProvider {
  getToken: () => Promise<TokenProviderResult | string>;
  revokeToken?: (token: string) => Promise<void>;
}

export interface AuthOptions {
  baseUrl: string;
  clientId?: string;
  clientSecret?: string;
  accountId?: string;
  accessToken?: string;
  fetch: FetchLike;
  logger?: Logger;
  tokenProvider?: TokenProvider;
}

const EXPIRY_SKEW_MS = 30_000;

export class HostawayAuth {
  private baseUrl: string;
  private clientId?: string;
  private clientSecret?: string;
  private accessToken?: string;
  private expiresAt?: number;
  private fetchFn: FetchLike;
  private logger?: Logger;
  private tokenProvider?: TokenProvider;
  private refreshPromise?: Promise<string>;

  constructor(options: AuthOptions) {
    this.baseUrl = options.baseUrl;
    this.clientId = options.clientId ?? options.accountId;
    this.clientSecret = options.clientSecret;
    this.accessToken = options.accessToken;
    this.fetchFn = options.fetch;
    this.logger = options.logger;
    this.tokenProvider = options.tokenProvider;
  }

  canRefresh(): boolean {
    return Boolean(this.tokenProvider || (this.clientId && this.clientSecret));
  }

  invalidateToken(): void {
    this.accessToken = undefined;
    this.expiresAt = undefined;
  }

  async getAccessToken(forceRefresh = false): Promise<string> {
    if (!forceRefresh && this.accessToken && !this.isExpired()) {
      return this.accessToken;
    }

    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.resolveAccessToken().finally(() => {
      this.refreshPromise = undefined;
    });

    return this.refreshPromise;
  }

  async revokeToken(token?: string): Promise<void> {
    const tokenToRevoke = token ?? this.accessToken;
    if (!tokenToRevoke) {
      return;
    }

    if (this.tokenProvider?.revokeToken) {
      await this.tokenProvider.revokeToken(tokenToRevoke);
      if (tokenToRevoke === this.accessToken) {
        this.invalidateToken();
      }
      return;
    }

    const url = `${this.baseUrl.replace(/\/+$/, '')}/accessTokens?token=${encodeURIComponent(
      tokenToRevoke
    )}`;

    const response = await this.fetchFn(url, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${tokenToRevoke}`,
        Accept: 'application/json',
      },
    });

    const body = await parseResponseBody(response);
    if (!response.ok) {
      throw createErrorFromResponse('Token revocation failed', response, body);
    }

    if (tokenToRevoke === this.accessToken) {
      this.invalidateToken();
    }
  }

  private async resolveAccessToken(): Promise<string> {
    if (this.tokenProvider) {
      const provided = await this.tokenProvider.getToken();
      const normalized = normalizeProviderResult(provided);
      this.accessToken = normalized.accessToken;
      this.expiresAt = normalized.expiresAt;
      return normalized.accessToken;
    }

    if (!this.clientId || !this.clientSecret) {
      throw new HostawayError('Client credentials are required to fetch an access token.');
    }

    return this.fetchAccessToken();
  }

  private async fetchAccessToken(): Promise<string> {
    const url = `${this.baseUrl.replace(/\/+$/, '')}/accessTokens`;
    const body = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: this.clientId ?? '',
      client_secret: this.clientSecret ?? '',
      scope: 'general',
    });

    const response = await this.fetchFn(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body,
    });

    const responseBody = await parseResponseBody(response);

    if (!response.ok) {
      throw createErrorFromResponse('Token request failed', response, responseBody);
    }

    if (!responseBody || typeof responseBody !== 'object') {
      throw new HostawayError('Token response was not valid JSON.');
    }

    const token = readTokenFromBody(responseBody as Record<string, unknown>);
    if (!token) {
      throw new HostawayError('Token response did not include access_token.');
    }

    this.accessToken = token;
    this.expiresAt = resolveExpiresAt(responseBody as Record<string, unknown>);

    return token;
  }

  private isExpired(): boolean {
    if (!this.expiresAt) {
      return false;
    }
    return Date.now() >= this.expiresAt - EXPIRY_SKEW_MS;
  }
}

function normalizeProviderResult(
  result: TokenProviderResult | string
): TokenProviderResult {
  if (typeof result === 'string') {
    return { accessToken: result };
  }
  return result;
}

function readTokenFromBody(body: Record<string, unknown>): string | undefined {
  const token = body.access_token ?? body.accessToken;
  if (typeof token === 'string') {
    return token;
  }
  return undefined;
}

function resolveExpiresAt(body: Record<string, unknown>): number | undefined {
  const expiresAt = body.expires_at;
  if (typeof expiresAt === 'number') {
    return expiresAt > 1_000_000_000_000 ? expiresAt : expiresAt * 1000;
  }
  if (typeof expiresAt === 'string') {
    const parsed = Date.parse(expiresAt);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }

  const expiresIn = body.expires_in;
  if (typeof expiresIn === 'number') {
    return Date.now() + expiresIn * 1000;
  }

  return undefined;
}

async function parseResponseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) {
    return undefined;
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('json')) {
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }

  return text;
}

function createErrorFromResponse(
  fallbackMessage: string,
  response: Response,
  responseBody: unknown
): HostawayError {
  const bodyObject =
    responseBody && typeof responseBody === 'object'
      ? (responseBody as Record<string, unknown>)
      : undefined;

  const message =
    (bodyObject?.message as string) ||
    (bodyObject?.error as string) ||
    response.statusText ||
    fallbackMessage;

  const code =
    (bodyObject?.code as string) ||
    (bodyObject?.errorCode as string) ||
    undefined;

  return new HostawayError(message, {
    status: response.status,
    code,
    details: bodyObject?.errors ?? bodyObject?.details,
    requestId: getRequestId(response.headers),
    responseBody,
  });
}

function getRequestId(headers: Headers): string | undefined {
  return (
    headers.get('x-request-id') ||
    headers.get('request-id') ||
    headers.get('x-hostaway-request-id') ||
    undefined
  );
}

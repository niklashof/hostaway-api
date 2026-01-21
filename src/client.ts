import { HostawayAuth, type TokenProvider } from './auth.js';
import { HostawayError } from './errors.js';
import type { FetchLike, Logger } from './types/common.js';

export interface HostawayClientOptions {
  baseUrl?: string;
  clientId?: string;
  clientSecret?: string;
  accountId?: string;
  accessToken?: string;
  fetch?: FetchLike;
  timeoutMs?: number;
  userAgent?: string;
  includeResources?: boolean | string[];
  logger?: Logger;
  tokenProvider?: TokenProvider;
  maxRetries?: number;
}

export interface RequestOptions {
  query?: Record<string, unknown>;
  body?: unknown;
  headers?: HeadersInit;
  signal?: AbortSignal;
}

const DEFAULT_BASE_URL = 'https://api.hostaway.com/v1';
const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_MAX_RETRIES = 2;

export class HostawayClient {
  private baseUrl: string;
  private fetchFn: FetchLike;
  private auth: HostawayAuth;
  private timeoutMs: number;
  private userAgent?: string;
  private includeResources?: boolean | string[];
  private logger?: Logger;
  private maxRetries: number;

  constructor(options: HostawayClientOptions) {
    this.baseUrl = options.baseUrl ?? DEFAULT_BASE_URL;
    this.fetchFn = resolveFetch(options.fetch);
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.userAgent = options.userAgent;
    this.includeResources = options.includeResources;
    this.logger = options.logger;
    this.maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;

    this.auth = new HostawayAuth({
      baseUrl: this.baseUrl,
      clientId: options.clientId,
      clientSecret: options.clientSecret,
      accountId: options.accountId,
      accessToken: options.accessToken,
      fetch: this.fetchFn,
      logger: this.logger,
      tokenProvider: options.tokenProvider,
    });
  }

  async request<T>(
    method: string,
    path: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const normalizedMethod = method.toUpperCase();
    const url = this.buildUrl(path, options.query);

    let authRetried = false;
    let attempt = 0;

    while (true) {
      let response: Response;
      let didTimeout = false;
      let hadAuthHeader = false;
      let wasCallerAborted = false;

      try {
        const { signal, cleanup, markTimedOut, wasCallerAborted: readCallerAbort } =
          createRequestSignal(options.signal, this.timeoutMs);
        const headers = await this.prepareHeaders(options.headers);
        hadAuthHeader = headers.has('Authorization');
        const body = prepareBody(options.body, headers);
        if (!hadAuthHeader) {
          const token = await this.auth.getAccessToken();
          headers.set('Authorization', `Bearer ${token}`);
        }

        try {
          response = await this.fetchFn(url, {
            method: normalizedMethod,
            headers,
            body,
            signal,
          });
        } finally {
          didTimeout = markTimedOut();
          wasCallerAborted = readCallerAbort();
          cleanup();
        }
      } catch (error) {
        if (isAbortError(error) && didTimeout) {
          throw new HostawayError('Request timed out.', {
            code: 'TIMEOUT',
            method: normalizedMethod,
            url,
          });
        }

        if (isAbortError(error) && wasCallerAborted) {
          throw new HostawayError('Request aborted.', {
            code: 'ABORTED',
            method: normalizedMethod,
            url,
          });
        }

        throw new HostawayError('Request failed.', {
          code: 'FETCH_ERROR',
          details: error,
          method: normalizedMethod,
          url,
        });
      }

      if (
        response.status === 401 &&
        !authRetried &&
        !hadAuthHeader &&
        this.auth.canRefresh()
      ) {
        this.auth.invalidateToken();
        authRetried = true;
        continue;
      }

      if (shouldRetry(response.status, normalizedMethod, attempt, this.maxRetries)) {
        const delayMs = getRetryDelayMs(response, attempt);
        attempt += 1;
        this.logger?.warn?.(
          `Retrying ${normalizedMethod} ${url} after ${delayMs}ms (status ${response.status})`
        );
        await sleep(delayMs);
        continue;
      }

      const responseBody = await parseResponseBody(response);
      if (!response.ok) {
        throw createErrorFromResponse(
          response,
          responseBody,
          normalizedMethod,
          url
        );
      }

      return responseBody as T;
    }
  }

  async revokeToken(token?: string): Promise<void> {
    await this.auth.revokeToken(token);
  }

  private buildUrl(path: string, query?: Record<string, unknown>): string {
    const normalizedPath = path.replace(/^\/+/, '');
    const url = `${this.baseUrl.replace(/\/+$/, '')}/${normalizedPath}`;
    const finalQuery = { ...query };

    if (
      this.includeResources !== undefined &&
      finalQuery.includeResources === undefined
    ) {
      finalQuery.includeResources = this.includeResources;
    }

    const queryString = buildQueryString(finalQuery);
    if (!queryString) {
      return url;
    }

    return `${url}?${queryString}`;
  }

  private async prepareHeaders(headers?: HeadersInit): Promise<Headers> {
    const resolved = new Headers(headers ?? {});
    if (!resolved.has('Accept')) {
      resolved.set('Accept', 'application/json');
    }
    if (this.userAgent && !resolved.has('User-Agent')) {
      resolved.set('User-Agent', this.userAgent);
    }
    return resolved;
  }
}

function resolveFetch(fetchOverride?: FetchLike): FetchLike {
  if (fetchOverride) {
    return fetchOverride;
  }
  if (typeof globalThis.fetch === 'function') {
    return globalThis.fetch.bind(globalThis);
  }
  throw new HostawayError(
    'Fetch is not available. Provide a fetch implementation via client options.'
  );
}

function prepareBody(body: unknown, headers: Headers): BodyInit | undefined {
  if (body === undefined || body === null) {
    return undefined;
  }

  if (isBodyInit(body)) {
    return body;
  }

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  return JSON.stringify(body);
}

function isBodyInit(body: unknown): body is BodyInit {
  if (typeof body === 'string') {
    return true;
  }
  if (typeof ArrayBuffer !== 'undefined' && body instanceof ArrayBuffer) {
    return true;
  }
  if (typeof Blob !== 'undefined' && body instanceof Blob) {
    return true;
  }
  if (typeof FormData !== 'undefined' && body instanceof FormData) {
    return true;
  }
  if (typeof URLSearchParams !== 'undefined' && body instanceof URLSearchParams) {
    return true;
  }
  if (typeof Uint8Array !== 'undefined' && body instanceof Uint8Array) {
    return true;
  }
  return false;
}

function buildQueryString(params?: Record<string, unknown>): string {
  if (!params) {
    return '';
  }
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) {
      continue;
    }
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item === undefined) {
          continue;
        }
        search.append(key, String(item));
      }
      continue;
    }

    if (value instanceof Date) {
      search.set(key, value.toISOString());
      continue;
    }

    search.set(key, String(value));
  }
  return search.toString();
}

function shouldRetry(
  status: number,
  method: string,
  attempt: number,
  maxRetries: number
): boolean {
  if (attempt >= maxRetries) {
    return false;
  }
  if (method !== 'GET' && method !== 'HEAD') {
    return false;
  }
  if (status === 429) {
    return true;
  }
  return status >= 500 && status < 600;
}

function getRetryDelayMs(response: Response, attempt: number): number {
  const retryAfter = response.headers.get('retry-after');
  if (retryAfter) {
    const retrySeconds = Number(retryAfter);
    if (!Number.isNaN(retrySeconds)) {
      return Math.max(0, retrySeconds * 1000);
    }

    const retryDate = Date.parse(retryAfter);
    if (!Number.isNaN(retryDate)) {
      return Math.max(0, retryDate - Date.now());
    }
  }

  const baseDelay = 300 * 2 ** attempt;
  const maxDelay = 5_000;
  const jitter = Math.random() * 200;
  return Math.min(maxDelay, baseDelay) + jitter;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
  response: Response,
  responseBody: unknown,
  method: string,
  url: string
): HostawayError {
  const bodyObject =
    responseBody && typeof responseBody === 'object'
      ? (responseBody as Record<string, unknown>)
      : undefined;

  const message =
    (bodyObject?.message as string) ||
    (bodyObject?.error as string) ||
    response.statusText ||
    'Request failed.';

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
    method,
    url,
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

function createRequestSignal(signal: AbortSignal | undefined, timeoutMs: number) {
  if (!timeoutMs && !signal) {
    return {
      signal: undefined as AbortSignal | undefined,
      cleanup: () => {},
      markTimedOut: () => false,
      wasCallerAborted: () => false,
    };
  }

  if (!timeoutMs) {
    return {
      signal,
      cleanup: () => {},
      markTimedOut: () => false,
      wasCallerAborted: () => signal?.aborted ?? false,
    };
  }

  const controller = new AbortController();
  let timedOut = false;
  let callerAborted = false;
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const onAbort = () => {
    callerAborted = true;
    controller.abort();
  };
  if (signal) {
    if (signal.aborted) {
      callerAborted = true;
      controller.abort();
    } else {
      signal.addEventListener('abort', onAbort);
    }
  }

  timeoutId = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  return {
    signal: controller.signal,
    cleanup: () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (signal) {
        signal.removeEventListener('abort', onAbort);
      }
    },
    markTimedOut: () => timedOut,
    wasCallerAborted: () => callerAborted,
  };
}

function isAbortError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    (error as { name?: string }).name === 'AbortError'
  );
}

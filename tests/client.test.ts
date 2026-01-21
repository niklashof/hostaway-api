import { afterEach, describe, expect, it, vi } from 'vitest';
import { HostawayClient } from '../src/client.js';
import { HostawayError } from '../src/errors.js';

function jsonResponse(
  body: Record<string, unknown>,
  init: ResponseInit = {}
): Response {
  const headers = new Headers(init.headers ?? {});
  if (!headers.has('content-type')) {
    headers.set('content-type', 'application/json');
  }
  return new Response(JSON.stringify(body), { ...init, headers });
}

function createAbortableFetch() {
  return vi.fn((_: RequestInfo | URL, init?: RequestInit) => {
    return new Promise<Response>((_resolve, reject) => {
      const signal = init?.signal;
      const abortError = () => {
        const error = new Error('Aborted');
        (error as Error & { name: string }).name = 'AbortError';
        reject(error);
      };

      if (signal?.aborted) {
        abortError();
        return;
      }

      signal?.addEventListener('abort', abortError);
    });
  });
}

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('HostawayClient', () => {
  it('retries on 401 when the client injected auth', async () => {
    const tokenProvider = {
      getToken: vi
        .fn()
        .mockResolvedValueOnce('token-1')
        .mockResolvedValueOnce('token-2'),
    };

    const fetchMock = vi
      .fn()
      .mockImplementationOnce(async (_: RequestInfo | URL, init?: RequestInit) => {
        const headers = new Headers(init?.headers);
        expect(headers.get('Authorization')).toBe('Bearer token-1');
        return new Response('', { status: 401 });
      })
      .mockImplementationOnce(async (_: RequestInfo | URL, init?: RequestInit) => {
        const headers = new Headers(init?.headers);
        expect(headers.get('Authorization')).toBe('Bearer token-2');
        return jsonResponse({ ok: true }, { status: 200 });
      });

    const client = new HostawayClient({
      baseUrl: 'https://api.test',
      fetch: fetchMock,
      tokenProvider,
      timeoutMs: 0,
    });

    const result = await client.request('GET', '/sample');

    expect(result).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(tokenProvider.getToken).toHaveBeenCalledTimes(2);
  });

  it('does not retry on 401 when Authorization is provided', async () => {
    const tokenProvider = {
      getToken: vi.fn().mockResolvedValue('token-1'),
    };

    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse(
        { message: 'Nope', code: 'AUTH_FAILED' },
        { status: 401, statusText: 'Unauthorized' }
      )
    );

    const client = new HostawayClient({
      baseUrl: 'https://api.test',
      fetch: fetchMock,
      tokenProvider,
      timeoutMs: 0,
    });

    await expect(
      client.request('GET', '/sample', {
        headers: { Authorization: 'Bearer caller' },
      })
    ).rejects.toMatchObject({
      status: 401,
      code: 'AUTH_FAILED',
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(tokenProvider.getToken).not.toHaveBeenCalled();
  });

  it('retries GET requests on 5xx with backoff', async () => {
    vi.useFakeTimers();
    vi.spyOn(Math, 'random').mockReturnValue(0);

    const tokenProvider = {
      getToken: vi.fn().mockResolvedValue('token-1'),
    };

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response('', { status: 500 }))
      .mockResolvedValueOnce(jsonResponse({ ok: true }, { status: 200 }));

    const client = new HostawayClient({
      baseUrl: 'https://api.test',
      fetch: fetchMock,
      tokenProvider,
      timeoutMs: 0,
    });

    const requestPromise = client.request('GET', '/sample');

    await vi.advanceTimersByTimeAsync(300);
    const result = await requestPromise;

    expect(result).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('honors retry-after header for 429 responses', async () => {
    vi.useFakeTimers();

    const tokenProvider = {
      getToken: vi.fn().mockResolvedValue('token-1'),
    };

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response('', { status: 429, headers: { 'retry-after': '1' } })
      )
      .mockResolvedValueOnce(jsonResponse({ ok: true }, { status: 200 }));

    const client = new HostawayClient({
      baseUrl: 'https://api.test',
      fetch: fetchMock,
      tokenProvider,
      timeoutMs: 0,
    });

    const requestPromise = client.request('GET', '/sample');

    await vi.advanceTimersByTimeAsync(1000);

    const result = await requestPromise;

    expect(result).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('maps error responses with details and requestId', async () => {
    const tokenProvider = {
      getToken: vi.fn().mockResolvedValue('token-1'),
    };

    const responseBody = {
      message: 'Invalid payload',
      code: 'BAD_REQUEST',
      errors: { field: 'missing' },
    };

    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse(responseBody, {
        status: 400,
        statusText: 'Bad Request',
        headers: { 'x-request-id': 'req-123' },
      })
    );

    const client = new HostawayClient({
      baseUrl: 'https://api.test',
      fetch: fetchMock,
      tokenProvider,
      timeoutMs: 0,
    });

    await expect(client.request('GET', '/sample')).rejects.toMatchObject({
      status: 400,
      code: 'BAD_REQUEST',
      requestId: 'req-123',
      details: responseBody.errors,
      responseBody,
    });
  });

  it('returns timeout errors for timed out requests', async () => {
    vi.useFakeTimers();

    const tokenProvider = {
      getToken: vi.fn().mockResolvedValue('token-1'),
    };

    const fetchMock = createAbortableFetch();

    const client = new HostawayClient({
      baseUrl: 'https://api.test',
      fetch: fetchMock,
      tokenProvider,
      timeoutMs: 10,
    });

    const requestPromise = client.request('GET', '/sample');
    const expectation = expect(requestPromise).rejects.toMatchObject({
      code: 'TIMEOUT',
    });

    await vi.advanceTimersByTimeAsync(10);
    await expectation;
  });

  it('returns aborted errors for caller cancellations', async () => {
    const tokenProvider = {
      getToken: vi.fn().mockResolvedValue('token-1'),
    };

    const fetchMock = createAbortableFetch();

    const client = new HostawayClient({
      baseUrl: 'https://api.test',
      fetch: fetchMock,
      tokenProvider,
      timeoutMs: 0,
    });

    const controller = new AbortController();
    const requestPromise = client.request('GET', '/sample', {
      signal: controller.signal,
    });

    const expectation = expect(requestPromise).rejects.toMatchObject({
      code: 'ABORTED',
    });

    controller.abort();
    await expectation;
  });

  it('wraps non-abort fetch failures', async () => {
    const tokenProvider = {
      getToken: vi.fn().mockResolvedValue('token-1'),
    };

    const failure = new Error('Network down');
    const fetchMock = vi.fn().mockRejectedValue(failure);

    const client = new HostawayClient({
      baseUrl: 'https://api.test',
      fetch: fetchMock,
      tokenProvider,
      timeoutMs: 0,
    });

    await expect(client.request('GET', '/sample')).rejects.toMatchObject({
      code: 'FETCH_ERROR',
      details: failure,
    });
  });

  it('throws HostawayError instances for error responses', async () => {
    const tokenProvider = {
      getToken: vi.fn().mockResolvedValue('token-1'),
    };

    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({ message: 'Nope' }, { status: 404, statusText: 'Not Found' })
    );

    const client = new HostawayClient({
      baseUrl: 'https://api.test',
      fetch: fetchMock,
      tokenProvider,
      timeoutMs: 0,
    });

    await expect(client.request('GET', '/missing')).rejects.toBeInstanceOf(
      HostawayError
    );
  });
});

import { afterEach, describe, expect, it, vi } from 'vitest';
import { HostawayAuth } from '../src/auth.js';

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

afterEach(() => {
  vi.restoreAllMocks();
});

describe('HostawayAuth', () => {
  it('caches provider tokens until expiry', async () => {
    const tokenProvider = {
      getToken: vi.fn().mockResolvedValue({
        accessToken: 'token-1',
        expiresAt: Date.now() + 120_000,
      }),
    };

    const auth = new HostawayAuth({
      baseUrl: 'https://api.test',
      fetch: vi.fn(),
      tokenProvider,
    });

    const tokenA = await auth.getAccessToken();
    const tokenB = await auth.getAccessToken();

    expect(tokenA).toBe('token-1');
    expect(tokenB).toBe('token-1');
    expect(tokenProvider.getToken).toHaveBeenCalledTimes(1);
  });

  it('refreshes provider tokens when expired', async () => {
    const tokenProvider = {
      getToken: vi
        .fn()
        .mockResolvedValueOnce({
          accessToken: 'token-1',
          expiresAt: Date.now() - 1_000,
        })
        .mockResolvedValueOnce({
          accessToken: 'token-2',
          expiresAt: Date.now() + 120_000,
        }),
    };

    const auth = new HostawayAuth({
      baseUrl: 'https://api.test',
      fetch: vi.fn(),
      tokenProvider,
    });

    const tokenA = await auth.getAccessToken();
    const tokenB = await auth.getAccessToken();

    expect(tokenA).toBe('token-1');
    expect(tokenB).toBe('token-2');
    expect(tokenProvider.getToken).toHaveBeenCalledTimes(2);
  });

  it('revokes provider tokens and invalidates cache', async () => {
    const tokenProvider = {
      getToken: vi
        .fn()
        .mockResolvedValueOnce({ accessToken: 'token-1' })
        .mockResolvedValueOnce({ accessToken: 'token-2' }),
      revokeToken: vi.fn().mockResolvedValue(undefined),
    };

    const auth = new HostawayAuth({
      baseUrl: 'https://api.test',
      fetch: vi.fn(),
      tokenProvider,
    });

    const tokenA = await auth.getAccessToken();
    await auth.revokeToken();
    const tokenB = await auth.getAccessToken();

    expect(tokenA).toBe('token-1');
    expect(tokenB).toBe('token-2');
    expect(tokenProvider.revokeToken).toHaveBeenCalledWith('token-1');
    expect(tokenProvider.getToken).toHaveBeenCalledTimes(2);
  });

  it('revokes API tokens and clears cached token', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse({ ok: true }, { status: 200 }));

    const auth = new HostawayAuth({
      baseUrl: 'https://api.test',
      fetch: fetchMock,
      accessToken: 'token-1',
    });

    await auth.revokeToken();
    await auth.revokeToken();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://api.test/accessTokens?token=token-1');
    expect(init).toMatchObject({
      method: 'DELETE',
      headers: expect.objectContaining({
        Authorization: 'Bearer token-1',
      }),
    });
  });
});

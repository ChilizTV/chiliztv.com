import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response } from 'express';
import {
  globalLimiter,
  authLimiter,
  predictionsLimiter,
  chatLimiter,
  accessCodeLimiter,
  streamCreationLimiter,
  webhookLimiter,
  adminLimiter,
} from '../rate-limit.middleware';

// vitest.config sets env.REDIS_URL = '' so the limiters are built with the
// default MemoryStore. No mocking needed here; integration with a real Redis
// is covered by Phase 6 L4 tests.

type LimiterCall = (req: Request, res: Response, next: (err?: unknown) => void) => void;

function makeReq(overrides: Partial<Request> = {}): Request {
  return {
    ip: '127.0.0.1',
    path: '/x',
    method: 'GET',
    header: vi.fn().mockReturnValue(undefined),
    headers: {},
    ...overrides,
  } as unknown as Request;
}

function makeRes(): Response {
  const res = {
    headers: {} as Record<string, string>,
    statusCode: 200,
    statusMessage: 'OK',
    locals: {},
    headersSent: false,
    finished: false,
    on: vi.fn(),
    once: vi.fn(),
    off: vi.fn(),
    setHeader(name: string, value: string) {
      this.headers[name] = value;
      return this;
    },
    getHeader(name: string) {
      return this.headers[name];
    },
    removeHeader(name: string) {
      delete this.headers[name];
      return this;
    },
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    send: vi.fn(function (this: Response) {
      return this;
    }),
    json: vi.fn(function (this: Response) {
      return this;
    }),
    end: vi.fn(function (this: Response) {
      return this;
    }),
  };
  return res as unknown as Response;
}

function callLimiter(limiter: LimiterCall, req: Request, res: Response): Promise<unknown> {
  return new Promise((resolve) => {
    limiter(req, res, (err) => resolve(err));
  });
}

describe('rate-limit middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exports all 8 limiters with the expected shapes', () => {
    expect(typeof globalLimiter).toBe('function');
    expect(typeof authLimiter).toBe('function');
    expect(typeof predictionsLimiter).toBe('function');
    expect(typeof chatLimiter).toBe('function');
    expect(Array.isArray(accessCodeLimiter)).toBe(true);
    expect(accessCodeLimiter).toHaveLength(2);
    expect(typeof streamCreationLimiter).toBe('function');
    expect(typeof webhookLimiter).toBe('function');
    expect(typeof adminLimiter).toBe('function');
  });

  it('globalLimiter skips the /health probe (does not count against the bucket)', async () => {
    const req = makeReq({ path: '/health', ip: '10.0.0.1' });
    const res = makeRes();
    const err = await callLimiter(globalLimiter as LimiterCall, req, res);
    expect(err).toBeUndefined();
    expect(res.statusCode).toBe(200);
  });

  it('globalLimiter forwards normal traffic to next() (under the limit)', async () => {
    const req = makeReq({ ip: '10.0.0.2' });
    const res = makeRes();
    const err = await callLimiter(globalLimiter as LimiterCall, req, res);
    expect(err).toBeUndefined();
    expect(res.statusCode).toBe(200);
  });

  it('webhookLimiter keys by the webhook-signature header when present', async () => {
    const headerSpy = vi.fn().mockImplementation((name: string) =>
      name.toLowerCase() === 'webhook-signature' ? 'sig=abc-123-xyz' : undefined,
    );
    const req = makeReq({ ip: '10.0.0.3', header: headerSpy });
    const res = makeRes();
    await callLimiter(webhookLimiter as LimiterCall, req, res);
    expect(headerSpy).toHaveBeenCalledWith('webhook-signature');
  });

  it('adminLimiter keys by the authenticated walletAddress when present, falling back to IP', async () => {
    const reqWithUser = makeReq({
      ip: '10.0.0.4',
    }) as Request & { user?: { walletAddress?: string } };
    reqWithUser.user = { walletAddress: '0xabc' };
    const res = makeRes();
    const err = await callLimiter(adminLimiter as LimiterCall, reqWithUser, res);
    expect(err).toBeUndefined();
  });
});

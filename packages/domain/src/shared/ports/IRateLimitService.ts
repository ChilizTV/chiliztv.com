/**
 * Programmatic rate-limit port for use-case-level enforcement (writes by
 * wallet, internal job throttles, etc.). The HTTP middleware path uses
 * `rate-limit-redis` directly against the ioredis client and does not need
 * this port — kept narrow on purpose.
 */
export type RateLimitDecision =
  | { allowed: true; remaining: number; resetAt: Date }
  | { allowed: false; retryAfterSeconds: number };

export interface RateLimitCheckOptions {
  /** Logical bucket name (e.g. 'global', 'predictions', 'admin'). */
  bucket: string;
  /** Per-bucket identifier (ip, wallet, admin token hash). */
  identifier: string;
  limit: number;
  windowSeconds: number;
}

export interface IRateLimitService {
  check(opts: RateLimitCheckOptions): Promise<RateLimitDecision>;
}

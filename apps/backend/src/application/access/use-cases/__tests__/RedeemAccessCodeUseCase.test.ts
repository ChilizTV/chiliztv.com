import { describe, it, expect, vi } from 'vitest';
import { RedeemAccessCodeUseCase } from '../RedeemAccessCodeUseCase';
import type { IAccessCodeVerifier } from '@chiliztv/domain/access/ports/IAccessCodeVerifier';
import { NoopCacheService } from '../../../../infrastructure/cache/NoopCacheService';

function makeVerifier(result: boolean): IAccessCodeVerifier {
  return { verify: vi.fn().mockResolvedValue(result) };
}

describe('RedeemAccessCodeUseCase', () => {
  it('returns granted=true when verifier accepts the code', async () => {
    const uc = new RedeemAccessCodeUseCase(makeVerifier(true), new NoopCacheService());
    expect(await uc.execute('correct-code')).toEqual({ granted: true });
  });

  it('returns granted=false when verifier rejects the code', async () => {
    const uc = new RedeemAccessCodeUseCase(makeVerifier(false), new NoopCacheService());
    expect(await uc.execute('wrong-code')).toEqual({ granted: false });
  });

  it('serves a second call to the same code from the idempotency cache (no double verify)', async () => {
    const verifier = makeVerifier(true);
    const { InMemoryCache } = await import('../../../../testing/cache/InMemoryCache');
    const cache = new InMemoryCache();
    const uc = new RedeemAccessCodeUseCase(verifier, cache);

    const first = await uc.execute('hello');
    const second = await uc.execute('HELLO'); // case-insensitive — same hash

    expect(first).toEqual({ granted: true });
    expect(second).toEqual({ granted: true });
    expect(verifier.verify).toHaveBeenCalledTimes(1);
  });

  // L4 integration placeholders
  it.todo('POST /access/redeem returns 401 on wrong code with no body leak');
  it.todo('POST /access/redeem sets httpOnly cookie on correct code');
  it.todo('POST /access/redeem returns 429 after 5 attempts in < 1 min');
  it.todo('POST /waitlist returns 200 on duplicate email with same payload');
});

import { describe, it, expect, vi } from 'vitest';
import { RedeemAccessCodeUseCase } from '../RedeemAccessCodeUseCase';
import type { IAccessCodeVerifier } from '@chiliztv/domain/access/ports/IAccessCodeVerifier';

function makeVerifier(result: boolean): IAccessCodeVerifier {
  return { verify: vi.fn().mockResolvedValue(result) };
}

describe('RedeemAccessCodeUseCase', () => {
  it('returns granted=true when verifier accepts the code', async () => {
    const uc = new RedeemAccessCodeUseCase(makeVerifier(true));
    expect(await uc.execute('correct-code')).toEqual({ granted: true });
  });

  it('returns granted=false when verifier rejects the code', async () => {
    const uc = new RedeemAccessCodeUseCase(makeVerifier(false));
    expect(await uc.execute('wrong-code')).toEqual({ granted: false });
  });

  // L4 integration placeholders
  it.todo('POST /access/redeem returns 401 on wrong code with no body leak');
  it.todo('POST /access/redeem sets httpOnly cookie on correct code');
  it.todo('POST /access/redeem returns 429 after 5 attempts in < 1 min');
  it.todo('POST /waitlist returns 200 on duplicate email with same payload');
});

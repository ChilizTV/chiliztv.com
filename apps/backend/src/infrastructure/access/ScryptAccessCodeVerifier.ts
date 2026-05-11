import { injectable } from 'tsyringe';
import { scrypt, timingSafeEqual } from 'node:crypto';
import { IAccessCodeVerifier } from '@chiliztv/domain/access/ports/IAccessCodeVerifier';
import { env } from '../config/environment';

// Hash format stored in ACCESS_CODE_HASH env var: "<saltHex>:<derivedKeyHex>"
// Generate with: node scripts/gen-access-code-hash.js <plain-code>
// See docs/runbook-access-code.md for the full procedure.
const SCRYPT_PARAMS = { N: 16384, r: 8, p: 1 } as const;
const KEY_LEN = 64;

function deriveKey(code: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) =>
    scrypt(code, salt, KEY_LEN, SCRYPT_PARAMS, (err, key) =>
      err ? reject(err) : resolve(key)
    )
  );
}

@injectable()
export class ScryptAccessCodeVerifier implements IAccessCodeVerifier {
  private readonly salt: Buffer;
  private readonly stored: Buffer;

  constructor() {
    const parts = env.ACCESS_CODE_HASH.split(':');
    if (parts.length !== 2 || !parts[0] || !parts[1]) {
      throw new Error('ACCESS_CODE_HASH must be in "<saltHex>:<hashHex>" format');
    }
    this.salt = Buffer.from(parts[0], 'hex');
    this.stored = Buffer.from(parts[1], 'hex');
  }

  async verify(code: string): Promise<boolean> {
    try {
      const derived = await deriveKey(code.trim(), this.salt);
      if (derived.length !== this.stored.length) return false;
      return timingSafeEqual(derived, this.stored);
    } catch {
      return false;
    }
  }
}

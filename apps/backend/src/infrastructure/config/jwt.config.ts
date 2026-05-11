import type { SignOptions } from 'jsonwebtoken';
import { env } from './environment';

export const jwtConfig = {
  secret: env.JWT_SECRET,
  issuer: env.JWT_ISSUER,
  expiresIn: env.JWT_EXPIRY as unknown as SignOptions['expiresIn'],
  algorithm: 'HS256' as const,
};

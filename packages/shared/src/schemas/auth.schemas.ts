import { z } from 'zod';
import { ethereumAddressSchema } from './common.schemas';

export const generateTokenSchema = z.object({
  body: z
    .object({
      email: z.string().email().optional(),
      walletAddress: ethereumAddressSchema.optional(),
    })
    .refine((data) => data.email || data.walletAddress, {
      message: 'Either email or walletAddress is required',
    }),
});

export type GenerateTokenInput = z.infer<typeof generateTokenSchema>['body'];

import { z } from 'zod';

export const redeemAccessCodeSchema = z.object({
  code: z.string().min(4).max(128).trim(),
  company: z.string().max(0).optional(), // honeypot — must stay empty
});

export type RedeemAccessCodeDto = z.infer<typeof redeemAccessCodeSchema>;

import { z } from 'zod';
import { ethereumAddressSchema, uuidSchema } from './common.schemas';

export const streamStatusSchema = z.enum([
  'PENDING', 'LIVE', 'ENDED', 'FAILED',
]);

export const createStreamSchema = z.object({
  body: z.object({
    userId: uuidSchema,
    walletAddress: ethereumAddressSchema,
    title: z.string().min(1).max(200).trim(),
    description: z.string().max(1000).trim().optional(),
    streamKey: z.string().min(10).max(100),
    matchId: z.number().int().positive().optional(),
    isMatchStream: z.boolean().default(false),
  }),
});

export const startStreamSchema = z.object({
  params: z.object({ streamId: uuidSchema }),
});

export const endStreamSchema = z.object({
  params: z.object({ streamId: uuidSchema }),
});

export const getStreamByIdSchema = z.object({
  params: z.object({ streamId: uuidSchema }),
});

export const getUserStreamsSchema = z.object({
  params: z.object({ userId: uuidSchema }),
  query: z.object({
    status: streamStatusSchema.optional(),
    limit: z.coerce.number().int().min(1).max(100).default(50),
    offset: z.coerce.number().int().min(0).default(0),
  }),
});

export const deleteStreamSchema = z.object({
  params: z.object({ streamId: uuidSchema }),
});

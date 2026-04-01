import { z } from 'zod';
import {
  ethereumAddressSchema,
  transactionHashSchema,
  uuidSchema,
  paginationSchema,
} from './common.schemas';

export const predictionTypeSchema = z.enum([
  'WIN_HOME', 'WIN_AWAY', 'DRAW', 'OVER', 'UNDER',
]);

export const predictionStatusSchema = z.enum([
  'PENDING', 'IN_PROGRESS', 'WON', 'LOST', 'CANCELLED',
]);

export const createPredictionSchema = z.object({
  body: z.object({
    userId: uuidSchema,
    walletAddress: ethereumAddressSchema,
    username: z.string().min(1).max(50).trim(),
    matchId: z.number().int().positive(),
    matchName: z.string().min(1).max(200).trim(),
    predictionType: predictionTypeSchema,
    predictionValue: z.string().min(1).max(50),
    predictedTeam: z.string().min(1).max(100).trim(),
    odds: z.number().positive().max(100),
    transactionHash: transactionHashSchema,
    matchStartTime: z.coerce.date().refine(
      (date) => date > new Date(),
      'Match start time must be in the future'
    ),
  }),
});

export const getUserPredictionsSchema = z.object({
  params: z.object({ userId: uuidSchema }),
  query: paginationSchema.extend({
    status: predictionStatusSchema.optional(),
  }),
});

export const getPredictionByIdSchema = z.object({
  params: z.object({ predictionId: uuidSchema }),
});

export const getUserStatsSchema = z.object({
  params: z.object({ userId: uuidSchema }),
  query: z.object({}),
});

export const settlePredictionSchema = z.object({
  params: z.object({ predictionId: uuidSchema }),
  body: z.object({
    finalScore: z.object({
      home: z.number().int().min(0),
      away: z.number().int().min(0),
    }),
    result: z.enum(['WON', 'LOST']),
  }),
});

export type CreatePredictionInput = z.infer<typeof createPredictionSchema>['body'];

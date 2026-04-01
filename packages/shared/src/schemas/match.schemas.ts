import { z } from 'zod';
import { ethereumAddressSchema, positiveIntSchema } from './common.schemas';

export const matchStatusSchema = z.enum([
  'TBD', 'NS', '1H', 'HT', '2H', 'ET', 'P', 'FT',
  'AET', 'PEN', 'BT', 'SUSP', 'INT', 'PST', 'CANC',
  'ABD', 'AWA', 'WO', 'LIVE',
]);

export const syncMatchesSchema = z.object({
  body: z.object({
    date: z.coerce.date().optional(),
    league: z.number().int().positive().optional(),
    season: z.number().int().min(2020).max(2030).optional(),
  }),
});

export const getMatchByIdSchema = z.object({
  params: z.object({
    matchId: positiveIntSchema,
  }),
});

export const deployBettingContractSchema = z.object({
  params: z.object({ matchId: positiveIntSchema }),
  body: z.object({
    odds: z.object({
      home: z.number().positive(),
      draw: z.number().positive(),
      away: z.number().positive(),
    }),
  }),
});

export const updateMatchOddsSchema = z.object({
  params: z.object({ matchId: positiveIntSchema }),
  body: z.object({
    odds: z.object({
      home: z.number().positive(),
      draw: z.number().positive(),
      away: z.number().positive(),
    }),
  }),
});

export const resolveMatchSchema = z.object({
  params: z.object({ matchId: positiveIntSchema }),
  body: z.object({
    finalScore: z.object({
      home: z.number().int().min(0),
      away: z.number().int().min(0),
    }),
    status: z.enum(['FT', 'AET', 'PEN']),
    bettingContractAddress: ethereumAddressSchema.optional(),
  }),
});

import { z } from 'zod';
import { config } from 'dotenv';

config();

const addressRegex = /^0x[a-fA-F0-9]{40}$/;
const optionalAddress = z.string().regex(addressRegex).optional().or(z.literal('').transform(() => undefined));

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().min(1000).max(65535).default(3001),

  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(50),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(50).optional(),

  API_FOOTBALL_KEY: z.string().min(20),
  // Comma-separated list of API-Football league IDs to ingest. Leagues NOT in
  // this list are dropped post-fetch (the `/fixtures` endpoint isn't filterable
  // by multi-league when used with date/live params). Set to a single ID to
  // restrict ingest — e.g. `2` for UEFA Champions League only.
  //
  // Default below is the canonical Predcast allowlist (~45 competitions):
  //   - Top 9 domestic leagues (Ligue 1, La Liga, PL, Bundesliga, Serie A,
  //     Eredivisie, Primeira Liga, Süper Lig, Brasileirão)
  //   - All matching domestic cups + super cups (knockout)
  //   - UEFA club competitions (UCL, UEL, UECL, Super Cup)
  //   - UEFA Nations (Euro, Euro Quali, Nations League)
  //   - FIFA World Cup + all confederation qualifiers
  //   - Copa America, AFCON, CONMEBOL Libertadores / Sudamericana / Recopa
  //
  // Override in staging / dev via the .env file when you want a narrower scope
  // (faster sync, lower API quota burn). Update the master list via the
  // referential doc in docs/footballeagues.md — keep this default in sync.
  API_FOOTBALL_LEAGUE_IDS: z
    .string()
    .default(
      [
        // Top 5 European leagues
        61, 140, 39, 78, 135,
        // Other priority domestic leagues
        88, 94, 203, 71,
        // Domestic cups (knockout)
        66, 143, 45, 48, 81, 137, 90, 96, 97, 206, 73,
        // Super cups (single-match knockout)
        526, 556, 528, 529, 547, 92, 550, 75,
        // UEFA club competitions
        2, 3, 848, 531,
        // UEFA nations
        4, 960, 5,
        // FIFA World Cup + qualifications
        1, 32, 34, 31, 29, 30, 33,
        // Other confederations — nations
        9, 6,
        // CONMEBOL clubs
        13, 11, 541,
      ].join(','),
    )
    .transform((raw) =>
      raw
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
        .map((s) => Number.parseInt(s, 10))
        .filter((n) => Number.isFinite(n) && n > 0),
    ),

  NETWORK: z.enum(['testnet', 'mainnet']).default('testnet'),

  // Testnet contract addresses (required when NETWORK=testnet, validated at construction time
  // by NetworkConfigService — Zod requires them unconditionally so misconfigs fail fast).
  PARI_MATCH_FACTORY_ADDRESS: z.string().regex(addressRegex),
  STREAM_WALLET_FACTORY_ADDRESS: z.string().regex(addressRegex),
  CHILIZ_SWAP_ROUTER_ADDRESS: z.string().regex(addressRegex),
  LEADERBOARD_REWARDS_ADDRESS: z.string().regex(addressRegex),
  USDC_ADDRESS: z.string().regex(addressRegex),
  WCHZ_ADDRESS: z.string().regex(addressRegex),

  // Mainnet variants — optional until deployment.
  PARI_MATCH_FACTORY_ADDRESS_MAINNET: optionalAddress,
  STREAM_WALLET_FACTORY_ADDRESS_MAINNET: optionalAddress,
  CHILIZ_SWAP_ROUTER_ADDRESS_MAINNET: optionalAddress,
  LEADERBOARD_REWARDS_ADDRESS_MAINNET: optionalAddress,
  USDC_ADDRESS_MAINNET: optionalAddress,
  WCHZ_ADDRESS_MAINNET: optionalAddress,

  // RPC override — leave empty to use the chain default (https://spicy-rpc.chiliz.com or
  // https://rpc.ankr.com/chiliz). Set to a private/Quicknode/Alchemy URL in prod.
  CHILIZ_RPC_URL: z.string().url().optional().or(z.literal('').transform(() => undefined)),

  ADMIN_PRIVATE_KEY: z.string().regex(/^0x[a-fA-F0-9]{64}$/),

  JWT_SECRET: z.string().min(32),
  JWT_ISSUER: z.string().default('chiliz-football-api'),
  JWT_EXPIRY: z.string().default('24h'),

  ALLOWED_ORIGINS: z.string().default('http://localhost:3000'),

  REDIS_URL: z.string().url().optional().or(z.literal('').transform(() => undefined)),

  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),

  // Cloudflare Stream
  CLOUDFLARE_ACCOUNT_ID: z.string().min(1),
  CLOUDFLARE_STREAM_API_TOKEN: z.string().min(1),
  CLOUDFLARE_STREAM_WEBHOOK_SECRET: z.string().min(1),
  CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN: z.string().min(1),

  // Access code gate — must be generated with scripts/gen-access-code-hash.js
  // Format: "<saltHex>:<scryptDerivedKeyHex>"  See docs/runbook-access-code.md.
  ACCESS_CODE_HASH: z.string().min(64),
  // Secret for signing the cwk_access session cookie (HS256 JWT). Min 32 chars.
  ACCESS_CODE_COOKIE_SECRET: z.string().min(32),

  // Bearer token gating GET /health/metrics. Generate with `openssl rand -base64 48`.
  // Optional — when unset the endpoint refuses all callers (defense in depth).
  METRICS_TOKEN: z.string().min(32).optional().or(z.literal('').transform(() => undefined)),
});

export type Environment = z.infer<typeof envSchema>;

const parseResult = envSchema.safeParse(process.env);

if (!parseResult.success) {
  console.error('❌ Invalid environment variables:');
  console.error(JSON.stringify(parseResult.error.format(), null, 2));
  process.exit(1);
}

export const env = parseResult.data;

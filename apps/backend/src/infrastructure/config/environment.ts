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

  NETWORK: z.enum(['testnet', 'mainnet']).default('testnet'),

  // Testnet contract addresses (required when NETWORK=testnet, validated at construction time
  // by NetworkConfigService — Zod requires them unconditionally so misconfigs fail fast).
  BETTING_MATCH_FACTORY_ADDRESS: z.string().regex(addressRegex),
  STREAM_WALLET_FACTORY_ADDRESS: z.string().regex(addressRegex),
  CHILIZ_SWAP_ROUTER_ADDRESS: z.string().regex(addressRegex),
  LIQUIDITY_POOL_PROXY: z.string().regex(addressRegex),
  USDC_ADDRESS: z.string().regex(addressRegex),
  WCHZ_ADDRESS: z.string().regex(addressRegex),

  // Mainnet variants — optional until deployment.
  BETTING_MATCH_FACTORY_ADDRESS_MAINNET: optionalAddress,
  STREAM_WALLET_FACTORY_ADDRESS_MAINNET: optionalAddress,
  CHILIZ_SWAP_ROUTER_ADDRESS_MAINNET: optionalAddress,
  LIQUIDITY_POOL_PROXY_MAINNET: optionalAddress,
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
});

export type Environment = z.infer<typeof envSchema>;

const parseResult = envSchema.safeParse(process.env);

if (!parseResult.success) {
  console.error('❌ Invalid environment variables:');
  console.error(JSON.stringify(parseResult.error.format(), null, 2));
  process.exit(1);
}

export const env = parseResult.data;

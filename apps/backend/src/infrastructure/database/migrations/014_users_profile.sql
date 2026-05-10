-- Migration 014 — User profile cache (wallet → username/avatar).
--
-- Powers the display-name lookup used by donations / subscriptions / streamer
-- surfaces. Bets remain anonymous and never query this table.
--
-- The `users` table is a CACHE, not the source of identity. Dynamic Labs
-- is authoritative — the frontend upserts a row on login. A
-- multi-source fallback (chat_messages / predictions / live_streams)
-- self-warms the cache for wallets that never authenticated.

CREATE TABLE IF NOT EXISTS users (
    wallet_address text PRIMARY KEY,
    username       text,
    avatar_url     text,
    updated_at     timestamptz NOT NULL DEFAULT NOW()
);

-- Case-insensitive lookups by display name (future: profile pages).
CREATE INDEX IF NOT EXISTS idx_users_username_lower
    ON users ((LOWER(username)))
    WHERE username IS NOT NULL;

-- ─── Backfill — chat_messages ────────────────────────────────────────────
-- Latest non-System username per wallet.
INSERT INTO users (wallet_address, username, updated_at)
SELECT
    LOWER(wallet_address)        AS wallet_address,
    username,
    MAX(created_at)              AS updated_at
FROM chat_messages
WHERE wallet_address IS NOT NULL
  AND username       IS NOT NULL
  AND username <> 'System'
GROUP BY LOWER(wallet_address), username
ON CONFLICT (wallet_address) DO NOTHING;

-- ─── Backfill — predictions ──────────────────────────────────────────────
INSERT INTO users (wallet_address, username, updated_at)
SELECT DISTINCT ON (LOWER(wallet_address))
    LOWER(wallet_address),
    username,
    NOW()
FROM predictions
WHERE wallet_address IS NOT NULL
  AND username       IS NOT NULL
ORDER BY LOWER(wallet_address), placed_at DESC
ON CONFLICT (wallet_address) DO NOTHING;

-- ─── Backfill — live_streams (streamer display name) ─────────────────────
INSERT INTO users (wallet_address, username, updated_at)
SELECT DISTINCT ON (LOWER(streamer_wallet_address))
    LOWER(streamer_wallet_address),
    streamer_name,
    NOW()
FROM live_streams
WHERE streamer_wallet_address IS NOT NULL
  AND streamer_name           IS NOT NULL
ORDER BY LOWER(streamer_wallet_address), created_at DESC
ON CONFLICT (wallet_address) DO NOTHING;

-- Migration 038 — admin directory aggregates (admin-panel plan, lot 3).
--
-- Listing aggregates run as SQL functions called via .rpc() — supabase-js
-- has no GROUP BY. Computed on the fly + cached 60s in Redis by the API;
-- if volume explodes, the function bodies can switch to materialized views
-- without changing the API.

BEGIN;

-- ─── Indexes feeding the aggregates ─────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_bets_user_time ON bets (user_address, block_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_bets_time ON bets (block_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_bets_contract ON bets (contract_address);

-- ─── Player directory (sorted by lifetime stake) ───────────────────────────

CREATE FUNCTION admin_player_aggregates(p_limit INT, p_offset INT)
RETURNS TABLE (
    wallet        TEXT,
    bet_count     BIGINT,
    total_staked  TEXT,
    total_payout  TEXT,
    won_count     BIGINT,
    lost_count    BIGINT,
    pending_count BIGINT,
    last_bet_at   TIMESTAMPTZ,
    total_count   BIGINT
) AS $$
    SELECT
        b.user_address,
        COUNT(*),
        COALESCE(SUM(b.stake_amount), 0)::TEXT,
        COALESCE(SUM(b.payout_amount), 0)::TEXT,
        COUNT(*) FILTER (WHERE b.status = 'WON'),
        COUNT(*) FILTER (WHERE b.status = 'LOST'),
        COUNT(*) FILTER (WHERE b.status = 'PENDING'),
        MAX(b.block_timestamp),
        COUNT(*) OVER ()
    FROM bets b
    GROUP BY b.user_address
    ORDER BY SUM(b.stake_amount) DESC, b.user_address
    LIMIT p_limit OFFSET p_offset;
$$ LANGUAGE sql STABLE;

CREATE FUNCTION admin_player_summary(p_wallet TEXT)
RETURNS TABLE (
    wallet        TEXT,
    bet_count     BIGINT,
    total_staked  TEXT,
    total_payout  TEXT,
    won_count     BIGINT,
    lost_count    BIGINT,
    pending_count BIGINT,
    last_bet_at   TIMESTAMPTZ
) AS $$
    SELECT
        b.user_address,
        COUNT(*),
        COALESCE(SUM(b.stake_amount), 0)::TEXT,
        COALESCE(SUM(b.payout_amount), 0)::TEXT,
        COUNT(*) FILTER (WHERE b.status = 'WON'),
        COUNT(*) FILTER (WHERE b.status = 'LOST'),
        COUNT(*) FILTER (WHERE b.status = 'PENDING'),
        MAX(b.block_timestamp)
    FROM bets b
    WHERE b.user_address = lower(p_wallet)
    GROUP BY b.user_address;
$$ LANGUAGE sql STABLE;

-- ─── Streamer directory (donations + subscriptions revenue) ─────────────────

CREATE FUNCTION admin_streamer_aggregates(p_limit INT, p_offset INT)
RETURNS TABLE (
    wallet           TEXT,
    donation_count   BIGINT,
    donation_total   TEXT,
    sub_count        BIGINT,
    sub_revenue      TEXT,
    last_activity_at TIMESTAMPTZ,
    total_count      BIGINT
) AS $$
    WITH d AS (
        SELECT streamer_address, COUNT(*) AS cnt, SUM(streamer_amount) AS total, MAX(created_at) AS last_at
        FROM donations GROUP BY streamer_address
    ),
    s AS (
        SELECT streamer_address, COUNT(*) AS cnt, SUM(streamer_amount) AS total, MAX(created_at) AS last_at
        FROM subscriptions GROUP BY streamer_address
    )
    SELECT
        COALESCE(d.streamer_address, s.streamer_address),
        COALESCE(d.cnt, 0),
        COALESCE(d.total, 0)::TEXT,
        COALESCE(s.cnt, 0),
        COALESCE(s.total, 0)::TEXT,
        GREATEST(COALESCE(d.last_at, '-infinity'), COALESCE(s.last_at, '-infinity')),
        COUNT(*) OVER ()
    FROM d FULL OUTER JOIN s ON d.streamer_address = s.streamer_address
    ORDER BY COALESCE(d.total, 0) + COALESCE(s.total, 0) DESC
    LIMIT p_limit OFFSET p_offset;
$$ LANGUAGE sql STABLE;

-- ─── Per-contract bet volume (joined to matches by the API) ────────────────

CREATE FUNCTION admin_match_volumes()
RETURNS TABLE (
    contract_address TEXT,
    bet_count        BIGINT,
    total_staked     TEXT
) AS $$
    SELECT b.contract_address, COUNT(*), COALESCE(SUM(b.stake_amount), 0)::TEXT
    FROM bets b
    GROUP BY b.contract_address;
$$ LANGUAGE sql STABLE;

-- Backend-only surface: the API calls these with the service_role key.
REVOKE EXECUTE ON FUNCTION admin_player_aggregates(INT, INT) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION admin_player_summary(TEXT) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION admin_streamer_aggregates(INT, INT) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION admin_match_volumes() FROM anon, authenticated, public;

COMMIT;

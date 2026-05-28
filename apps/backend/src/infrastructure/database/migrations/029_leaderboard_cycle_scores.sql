-- Migration 029 — Per-cycle leaderboard scores.
--
-- Schema reset acceptable: no users on the site yet, no legacy data to preserve.
-- IF NOT EXISTS kept on CREATE only for re-run safety; the per-clause paranoia
-- of migration 011 is unnecessary here.
--
-- Score lifetime cumulative (leaderboard_scores) stays untouched — dual-write
-- from the indexer keeps both surfaces in sync. This table is the canonical
-- source for ranking; the lifetime table is reserved for a future Hall of Fame.

BEGIN;

CREATE TABLE IF NOT EXISTS leaderboard_cycle_scores (
    cycle_id      BIGINT NOT NULL,
    user_address  TEXT NOT NULL,
    score         NUMERIC(78, 0) NOT NULL DEFAULT 0,
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (cycle_id, user_address)
);

-- Top-N query per cycle: ORDER BY score DESC over a single cycle.
CREATE INDEX IF NOT EXISTS idx_leaderboard_cycle_scores_rank
    ON leaderboard_cycle_scores (cycle_id, score DESC);

-- Atomic increment: indexer events arrive concurrently across workers.
CREATE OR REPLACE FUNCTION increment_leaderboard_cycle_score(
    p_cycle_id BIGINT,
    p_user_address TEXT,
    p_delta NUMERIC
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO leaderboard_cycle_scores (cycle_id, user_address, score, updated_at)
    VALUES (p_cycle_id, p_user_address, p_delta, NOW())
    ON CONFLICT (cycle_id, user_address) DO UPDATE
    SET score = leaderboard_cycle_scores.score + p_delta,
        updated_at = NOW();
END;
$$;

-- 1-based rank within the cycle, NULL when user is absent or has zero score.
CREATE OR REPLACE FUNCTION leaderboard_cycle_rank_of(
    p_cycle_id BIGINT,
    p_user_address TEXT
)
RETURNS BIGINT
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    v_rank BIGINT;
BEGIN
    SELECT rank INTO v_rank FROM (
        SELECT user_address, ROW_NUMBER() OVER (ORDER BY score DESC) AS rank
        FROM leaderboard_cycle_scores
        WHERE cycle_id = p_cycle_id AND score > 0
    ) t
    WHERE user_address = p_user_address;
    RETURN v_rank;
END;
$$;

COMMIT;

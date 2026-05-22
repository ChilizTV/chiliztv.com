-- 024_leaderboard_schema.sql
-- Leaderboard pari-mutuel rewards: per-user cumulative score, epoch snapshots
-- with merkle root, and per-epoch claim ledger. Source-of-truth events live
-- in `LeaderboardRewards.sol` (WinRecorded, EpochClosed, PrizeClaimed,
-- EpochRolledOver). The `leaderboard_epochs.tx_hash` PK is the idempotency
-- key from CLI insert before tx confirmation; `epoch_id` is filled by the
-- indexer when EpochClosed lands. Ghost epochs (tx reverted) stay status
-- = 'pending' and are filtered out of every claimable query.

BEGIN;

CREATE TABLE IF NOT EXISTS leaderboard_scores (
    user_address    TEXT PRIMARY KEY,
    total_score     NUMERIC(78,0) NOT NULL DEFAULT 0,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_leaderboard_scores_total
    ON leaderboard_scores (total_score DESC);

CREATE TABLE IF NOT EXISTS leaderboard_epochs (
    tx_hash         TEXT PRIMARY KEY,
    epoch_id        BIGINT UNIQUE,
    merkle_root     TEXT NOT NULL,
    prize_pool      NUMERIC(78,0),
    claim_expiry    TIMESTAMPTZ,
    closed_at       TIMESTAMPTZ,
    rolled_over     NUMERIC(78,0),
    rolled_over_at  TIMESTAMPTZ,
    leaves_json     JSONB NOT NULL,
    status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'confirmed', 'rolled_over', 'expired')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_leaderboard_epochs_status
    ON leaderboard_epochs (status);
CREATE INDEX IF NOT EXISTS idx_leaderboard_epochs_epoch_id
    ON leaderboard_epochs (epoch_id) WHERE epoch_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS leaderboard_claims (
    epoch_id        BIGINT NOT NULL REFERENCES leaderboard_epochs(epoch_id),
    user_address    TEXT NOT NULL,
    amount          NUMERIC(78,0) NOT NULL,
    claimed_at      TIMESTAMPTZ NOT NULL,
    tx_hash         TEXT NOT NULL,
    PRIMARY KEY (epoch_id, user_address)
);
CREATE INDEX IF NOT EXISTS idx_leaderboard_claims_user
    ON leaderboard_claims (user_address);

-- Atomic increment used by the indexer — `WinRecorded` events stream in
-- concurrently, so the application can't read-modify-write safely.
CREATE OR REPLACE FUNCTION increment_leaderboard_score(
    p_user_address TEXT,
    p_delta NUMERIC
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO leaderboard_scores (user_address, total_score, updated_at)
    VALUES (p_user_address, p_delta, NOW())
    ON CONFLICT (user_address) DO UPDATE
    SET total_score = leaderboard_scores.total_score + p_delta,
        updated_at = NOW();
END;
$$;

-- 1-based rank by `total_score DESC` — returns NULL if the user is absent or
-- holds a 0 score. Sequential window function is fine at <100k rows.
CREATE OR REPLACE FUNCTION leaderboard_rank_of(p_user_address TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    v_rank INTEGER;
BEGIN
    SELECT rank INTO v_rank FROM (
        SELECT user_address,
               ROW_NUMBER() OVER (ORDER BY total_score DESC) AS rank
        FROM leaderboard_scores
        WHERE total_score > 0
    ) ranked
    WHERE user_address = p_user_address;
    RETURN v_rank;
END;
$$;

COMMIT;

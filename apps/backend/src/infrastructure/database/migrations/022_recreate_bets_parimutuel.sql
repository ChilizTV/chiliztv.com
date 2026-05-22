-- Migration 022 — recreate `bets` for the parimutuel model
--
-- Destructive: drops the existing bets. Acceptable because the previous
-- bookmaker/odds model no longer applies and any pre-cutover bet data is
-- testnet-only (no production users at this point of development).
--
-- New schema removes oddsX10000 / oddsIndex / betIndex / grossStake (no
-- per-bet odds in parimutuel — payouts emerge from pool ratios) and adds
-- outcome / stake_amount / newOutcomePool / newTotalPool fields that mirror
-- the PariMatchBase `PositionTaken` event payload.

DROP TABLE IF EXISTS bets CASCADE;

CREATE TABLE bets (
    id                BIGSERIAL PRIMARY KEY,
    tx_hash           text NOT NULL,
    log_index         integer NOT NULL,
    block_number      bigint NOT NULL,
    block_timestamp   timestamptz NOT NULL,
    contract_address  text NOT NULL,            -- PariMatch proxy (lowercased)
    market_id         bigint NOT NULL,
    user_address      text NOT NULL,
    outcome           bigint NOT NULL,           -- uint64 selection from the contract
    stake_amount      numeric(78, 0) NOT NULL,   -- USDC raw (6 dp)
    new_outcome_pool  numeric(78, 0) NOT NULL,   -- snapshot of the outcome pool after this stake
    new_total_pool    numeric(78, 0) NOT NULL,   -- snapshot of the total pool after this stake
    status            text NOT NULL DEFAULT 'PENDING'
                        CHECK (status IN ('PENDING', 'WON', 'LOST', 'REFUNDED')),
    payout_amount     numeric(78, 0),            -- filled on PositionClaimed / StakeRefunded
    claimed_at        timestamptz,
    created_at        timestamptz NOT NULL DEFAULT NOW(),
    UNIQUE (tx_hash, log_index)
);

CREATE INDEX idx_bets_user ON bets (lower(user_address));
CREATE INDEX idx_bets_market ON bets (lower(contract_address), market_id);
CREATE INDEX idx_bets_status ON bets (status);
CREATE INDEX idx_bets_user_market ON bets (lower(user_address), lower(contract_address), market_id);

-- REPLICA IDENTITY FULL is required so Supabase Realtime can publish UPDATE
-- events with old + new row, which the frontend uses to invalidate cached
-- pool queries on each PositionTaken/PositionClaimed.
ALTER TABLE bets REPLICA IDENTITY FULL;

-- Add the table to the supabase_realtime publication. The publication is
-- managed by Supabase and may already include `bets` from migration 020 —
-- adding it twice is a no-op (Postgres ignores duplicates).
DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE bets;
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;
END$$;

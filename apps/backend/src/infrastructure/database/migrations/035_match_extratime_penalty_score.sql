-- Migration 035 — Persist extra-time and penalty shootout scores + knockout flag.
--
-- Required to display "3 — 2 a.e.t." or "5 — 4 pen (1 — 1)" in the UI and to
-- resolve the FULL_TIME_WINNER market (knockout-only, added in a later lot).
-- The existing home_score / away_score columns continue to carry the 90'
-- score (used for the WINNER market resolution, by bookmaker convention).
--
-- All four score columns NULLABLE: only set for matches whose status reached
-- AET (extra time) or PEN (penalty shootout). FT matches keep them NULL.
-- Adapter parses `score.extratime.{home,away}` and `score.penalty.{home,away}`
-- from API-Football and the repository round-trips them via MatchRow.
--
-- `is_knockout` BOOLEAN NOT NULL DEFAULT FALSE:
--   - Computed ONCE at match create via isKnockoutMatch(rawMatch) policy.
--   - NOT updated on subsequent re-syncs: the on-chain proxy is deployed at
--     create time with or without the FULL_TIME_WINNER market — updating the
--     flag post-creation without redeploying the proxy creates entity↔contract
--     drift (DB says isKnockout=true, contract doesn't expose the market).
--   - If API-Football reclassifies league.round after creation, SyncMatchesUseCase
--     logs a `warn` for manual investigation but does NOT overwrite the flag.
--   - DEFAULT FALSE covers pre-migration rows safely (no FULL_TIME_WINNER market
--     on-chain anyway).
--
-- CHECK bounds [0, 50] mirror the convention from migration 034 (ht_*_score).
-- Realistic AET max is ~10, PEN shootouts historically capped under 20 (most
-- under 8). Loose bound catches API-Football data drift without being a tight
-- domain constraint.
--
-- `ADD CONSTRAINT` has no `IF NOT EXISTS` in Postgres ≤16, so we wrap each
-- constraint creation in a DO block that swallows `duplicate_object` — keeps
-- the migration idempotent under partial re-runs.

BEGIN;

ALTER TABLE matches
    ADD COLUMN IF NOT EXISTS aet_home_score SMALLINT,
    ADD COLUMN IF NOT EXISTS aet_away_score SMALLINT,
    ADD COLUMN IF NOT EXISTS pen_home_score SMALLINT,
    ADD COLUMN IF NOT EXISTS pen_away_score SMALLINT,
    ADD COLUMN IF NOT EXISTS is_knockout    BOOLEAN NOT NULL DEFAULT FALSE;

DO $$
BEGIN
    ALTER TABLE matches
        ADD CONSTRAINT matches_aet_home_score_check
            CHECK (aet_home_score IS NULL OR (aet_home_score >= 0 AND aet_home_score <= 50));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE matches
        ADD CONSTRAINT matches_aet_away_score_check
            CHECK (aet_away_score IS NULL OR (aet_away_score >= 0 AND aet_away_score <= 50));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE matches
        ADD CONSTRAINT matches_pen_home_score_check
            CHECK (pen_home_score IS NULL OR (pen_home_score >= 0 AND pen_home_score <= 50));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE matches
        ADD CONSTRAINT matches_pen_away_score_check
            CHECK (pen_away_score IS NULL OR (pen_away_score >= 0 AND pen_away_score <= 50));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

COMMIT;

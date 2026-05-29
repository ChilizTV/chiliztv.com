-- Migration 031 — Partial index supporting the `CloseLiveMarketsJob` query.
--
-- The job scans `matches` every 60s looking for rows that still have an open
-- on-chain contract and a status that warrants a close/cancel transition.
-- Without this index, the lookup is a full sequential scan over the entire
-- 7-day fetch window (~150-300 rows in steady state, growing during major
-- tournaments). With the partial predicate, only matches with a deployed
-- contract sit in the index — typically 10-20% of the table.
--
-- CRITICAL: the WHERE clause of the query MUST match this partial predicate
-- BYTE-FOR-BYTE (`betting_contract_address IS NOT NULL`) or the query planner
-- silently falls back to a seq scan. Always verify with `EXPLAIN ANALYZE`.
--
-- match_date in the index lets the use case bound the scan to the recent
-- window (`match_date >= now() - INTERVAL '6 hours'`) without an extra filter
-- pass.

BEGIN;

CREATE INDEX IF NOT EXISTS idx_matches_status_date
    ON matches (status, match_date)
    WHERE betting_contract_address IS NOT NULL;

COMMIT;

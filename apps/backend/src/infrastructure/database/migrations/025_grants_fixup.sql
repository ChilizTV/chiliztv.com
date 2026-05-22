-- 025_grants_fixup.sql
-- Catch-up grants for tables created by 011 / 015 / 022 / 023 / 024 that
-- didn't include explicit `GRANT … TO service_role` statements. Without
-- these, the backend (which connects with SERVICE_ROLE_KEY) hits a Postgres
-- `permission denied for table` on every read/write — the local Supabase
-- doesn't fall back to public privileges for `service_role`.
--
-- Idempotent: re-running on a database that already has the grants is a
-- no-op. New tables added in future migrations should include their own
-- GRANT statements rather than relying on this fixup.

BEGIN;

-- Indexer-owned tables (011_indexer_tables.sql).
GRANT SELECT, INSERT, UPDATE, DELETE ON indexer_checkpoints TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON wiring_alerts        TO service_role;

-- Matches + predictions (000_init_schema.sql variants that lacked the grant).
GRANT SELECT, INSERT, UPDATE, DELETE ON matches     TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON predictions TO service_role;

-- Token prices cache (015_token_prices.sql).
GRANT SELECT, INSERT, UPDATE, DELETE ON token_prices TO service_role;

-- Parimutuel core (022_recreate_bets_parimutuel.sql, 023_market_events_realtime.sql).
GRANT SELECT, INSERT, UPDATE, DELETE ON bets          TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON market_events TO service_role;

-- Leaderboard (024_leaderboard_schema.sql).
GRANT SELECT, INSERT, UPDATE, DELETE ON leaderboard_scores TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON leaderboard_epochs TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON leaderboard_claims TO service_role;

-- Helper RPCs from 024 — allow the service_role JWT to invoke them.
GRANT EXECUTE ON FUNCTION increment_leaderboard_score(TEXT, NUMERIC) TO service_role;
GRANT EXECUTE ON FUNCTION leaderboard_rank_of(TEXT)                  TO service_role;

-- Future-proof: any new public-schema table created afterwards inherits
-- these grants automatically for the service_role.
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT EXECUTE ON FUNCTIONS TO service_role;

COMMIT;

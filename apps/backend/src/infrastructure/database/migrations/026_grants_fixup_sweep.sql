-- 026_grants_fixup_sweep.sql
-- Belt-and-braces follow-up to 025: any public-schema table created before
-- 025 (which set `ALTER DEFAULT PRIVILEGES`) without an explicit grant to
-- `service_role` ends up unreadable by the backend. Rather than chase each
-- by name, sweep every existing public table + sequence + function in one
-- statement. Future tables are covered by the default-privileges block in
-- 025; this migration only fixes the legacy hangover.
--
-- Idempotent: re-running issues the same grants and is a no-op.

BEGIN;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES    IN SCHEMA public TO service_role;
GRANT USAGE, SELECT, UPDATE                 ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT EXECUTE                                ON ALL FUNCTIONS IN SCHEMA public TO service_role;

COMMIT;

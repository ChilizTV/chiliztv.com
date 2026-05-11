-- Migration 017 — drop whitelist concept from waitlist
-- Context: access is now gated by a single shared access code (server-side
-- hashed via scrypt), not by a per-row whitelist flag. Removes the historical
-- drift between the SQL column `is_whitelisted` and the TS field `has_access`
-- that was never aligned.

BEGIN;

ALTER TABLE waitlist DROP COLUMN IF EXISTS is_whitelisted;
ALTER TABLE waitlist DROP COLUMN IF EXISTS whitelisted_at;
DROP INDEX IF EXISTS idx_waitlist_is_whitelisted;

-- Enforce email lowercase at the DB level to prevent case-variant duplicates
-- (defense in depth alongside the repository-level normalization).
ALTER TABLE waitlist
    ADD CONSTRAINT waitlist_email_lower_chk
    CHECK (email = lower(email));

COMMIT;

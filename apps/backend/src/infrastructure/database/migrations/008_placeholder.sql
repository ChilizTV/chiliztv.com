-- Migration 008: placeholder — number reserved, no schema changes.
-- This migration was skipped during development; this file fills the sequence gap
-- so the CI validator (db-migrate.yml validate-sequence job) does not reject the set.
SELECT 1;

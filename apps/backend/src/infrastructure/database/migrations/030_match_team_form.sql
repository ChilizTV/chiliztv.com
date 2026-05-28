-- Migration 030 — Replace reference-odds JSONB with team form (W/D/L) per side.
--
-- Form columns are NULLABLE (not every team has 5 completed matches) and
-- CHECK-constrained to `[WDL]{1,5}` so a parsing bug can never poison the
-- table — INSERT/UPDATE reverts immediately and the bug surfaces in CI.
--
-- The `odds` JSONB column is dropped: it was only consumed by the now-removed
-- reference-odds cosmetic fallback in the UI. No on-chain or backend logic
-- ever depended on it.

BEGIN;

ALTER TABLE matches
    ADD COLUMN IF NOT EXISTS home_form TEXT,
    ADD COLUMN IF NOT EXISTS away_form TEXT;

ALTER TABLE matches
    ADD CONSTRAINT matches_home_form_check
        CHECK (home_form IS NULL OR home_form ~ '^[WDL]{1,5}$'),
    ADD CONSTRAINT matches_away_form_check
        CHECK (away_form IS NULL OR away_form ~ '^[WDL]{1,5}$');

-- active_matches view (mig 005) references matches.odds — drop it before
-- the column ALTER, then recreate without odds and with the new form fields.
-- View is documentation/tooling only; no application code reads it.
DROP VIEW IF EXISTS active_matches;

ALTER TABLE matches DROP COLUMN IF EXISTS odds;

CREATE VIEW active_matches AS
SELECT
    id,
    api_football_id,
    home_team->>'name'  AS home_team,
    away_team->>'name'  AS away_team,
    league->>'name'     AS league,
    season,
    status,
    match_date,
    venue,
    home_score,
    away_score,
    home_form,
    away_form,
    betting_contract_address,
    created_at,
    updated_at
FROM matches
WHERE match_date BETWEEN NOW() - INTERVAL '24 hours' AND NOW() + INTERVAL '7 days'
ORDER BY match_date ASC;

COMMIT;

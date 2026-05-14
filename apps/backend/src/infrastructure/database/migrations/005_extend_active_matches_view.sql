-- Migration 005: Extend active_matches view to match the new 7-day fetch window
-- The application queries the matches table directly; this view is for documentation
-- and tooling consistency only.
--
-- DROP + CREATE is required because CREATE OR REPLACE VIEW cannot change the data
-- type of an existing column. Migration 002 created home_team/away_team/league as
-- TEXT aliases (via ->>'name'); keeping them as TEXT here preserves the contract.

DROP VIEW IF EXISTS active_matches;

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
    odds,
    betting_contract_address,
    created_at,
    updated_at
FROM matches
WHERE match_date BETWEEN NOW() - INTERVAL '24 hours' AND NOW() + INTERVAL '7 days'
ORDER BY match_date ASC;

-- Migration 013 — Indexes supporting the match-retention policy.
--
-- The 24h match cleanup (`CleanupOldMatchesUseCase`) now preserves any
-- match still referenced by `bets.contract_address` or
-- `predictions.match_id`. These indexes keep the read paths (the bet→match
-- join + the cleanup exclusion lookup) fast as the bets table grows.
--
-- All statements are idempotent (`IF NOT EXISTS`) — safe to apply on top
-- of existing schemas without coordinating with prior migrations.

-- Speeds up the case-insensitive match lookup used by
-- SupabaseBetRepository.findByUserWithMatchInfo when joining bets to
-- matches by `betting_contract_address`. The expression matches the
-- existing JS-side `LOWER()` filter.
CREATE INDEX IF NOT EXISTS idx_matches_betting_contract_lower
    ON matches ((LOWER(betting_contract_address)))
    WHERE betting_contract_address IS NOT NULL;

-- Speeds up SupabaseBetRepository.listReferencedContractAddresses (the
-- retention-policy lookup). With this index, distinct-contract-address
-- scans on `bets` stay cheap even at 100k+ rows.
CREATE INDEX IF NOT EXISTS idx_bets_contract_address_lower
    ON bets ((LOWER(contract_address)));

-- Migration 021 — drop LP / pool tables (parimutuel model removes the LP)
--
-- The previous bookmaker model used `lp_positions` (per-holder shares /
-- cost_basis), `pool_events` (audit of LP + router), and `pool_apy_snapshots`
-- (APY computation). The parimutuel model has no LP — payouts are funded by
-- the losers in each market — so these tables become unreachable.
--
-- Router events still need an audit landing; they are now persisted in
-- `market_events` with `market_id = NULL` for non-bet events (see
-- `ChilizSwapRouterIndexer`).

DROP TABLE IF EXISTS pool_apy_snapshots CASCADE;
DROP TABLE IF EXISTS lp_positions CASCADE;
DROP TABLE IF EXISTS pool_events CASCADE;

-- Migration 023 — make `market_events` realtime-eligible
--
-- The frontend subscribes to `market_events` filtered by contract_address to
-- detect MarketResolved / MarketCancelled / MarketStateChanged transitions
-- (the `bets` subscription only fires on new PositionTaken — state changes
-- don't touch `bets` rows). REPLICA IDENTITY FULL + publication membership.

ALTER TABLE market_events REPLICA IDENTITY FULL;

DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE market_events;
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;
END$$;

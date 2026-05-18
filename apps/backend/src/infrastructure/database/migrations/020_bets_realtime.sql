-- Enables Supabase Realtime on `bets` so the dashboard "my bets" panel can
-- subscribe to inserts/updates filtered by `user_address` rather than polling
-- every 30 s. Filter on non-PK columns requires REPLICA IDENTITY FULL.
ALTER TABLE bets REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'bets'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE bets;
  END IF;
END $$;

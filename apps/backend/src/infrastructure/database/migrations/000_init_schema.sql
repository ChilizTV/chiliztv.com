-- Initial schema
--
-- Ordering : tables referenced by foreign keys come first (matches before
-- chat_messages / predictions / live_streams). Independent tables
-- (stream_wallets, donations, subscriptions, waitlist) come last.

-- ─── Shared trigger function (used by matches, chat_messages, predictions) ──
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ─── matches ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS matches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    api_football_id INTEGER UNIQUE NOT NULL,
    home_team TEXT NOT NULL,
    away_team TEXT NOT NULL,
    home_score INTEGER,
    away_score INTEGER,
    match_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL DEFAULT 'scheduled',
    league TEXT NOT NULL,
    season TEXT NOT NULL,
    venue TEXT,
    referee TEXT,
    odds JSONB,
    betting_contract_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_matches_api_football_id ON matches(api_football_id);
CREATE INDEX IF NOT EXISTS idx_matches_match_date ON matches(match_date);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_league ON matches(league);
CREATE INDEX IF NOT EXISTS idx_matches_betting_contract ON matches(betting_contract_address);

ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to matches" ON matches FOR SELECT USING (true);
CREATE POLICY "Allow insert/update access to matches" ON matches FOR ALL USING (true);

CREATE TRIGGER update_matches_updated_at
    BEFORE UPDATE ON matches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER PUBLICATION supabase_realtime ADD TABLE matches;

-- ─── chat_messages (FK → matches.api_football_id) ───────────────────────────
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    match_id INTEGER NOT NULL,
    user_id TEXT NOT NULL,
    wallet_address TEXT NOT NULL,
    username TEXT NOT NULL,
    message TEXT NOT NULL,
    message_type TEXT NOT NULL CHECK (message_type IN ('message', 'bet', 'system')),
    is_featured BOOLEAN DEFAULT false,
    bet_type TEXT,
    bet_sub_type TEXT,
    amount DECIMAL(10,2),
    odds DECIMAL(5,2),
    system_type TEXT,
    system_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_match_id ON chat_messages(match_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_message_type ON chat_messages(message_type);

ALTER TABLE chat_messages
    ADD CONSTRAINT fk_chat_messages_match_id
    FOREIGN KEY (match_id) REFERENCES matches(api_football_id) ON DELETE CASCADE;

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to chat messages" ON chat_messages FOR SELECT USING (true);
CREATE POLICY "Allow insert access to chat messages" ON chat_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update access to chat messages" ON chat_messages FOR UPDATE USING (true);

CREATE TRIGGER update_chat_messages_updated_at
    BEFORE UPDATE ON chat_messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;

-- ─── chat_connected_users (FK → matches.api_football_id) ────────────────────
CREATE TABLE IF NOT EXISTS chat_connected_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    match_id INTEGER NOT NULL,
    user_id TEXT NOT NULL,
    username TEXT NOT NULL,
    connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(match_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_chat_connected_users_match_id ON chat_connected_users(match_id);
CREATE INDEX IF NOT EXISTS idx_chat_connected_users_user_id ON chat_connected_users(user_id);

ALTER TABLE chat_connected_users
    ADD CONSTRAINT fk_chat_connected_users_match_id
    FOREIGN KEY (match_id) REFERENCES matches(api_football_id) ON DELETE CASCADE;

ALTER TABLE chat_connected_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to connected users" ON chat_connected_users FOR SELECT USING (true);
CREATE POLICY "Allow insert/update access to connected users" ON chat_connected_users FOR ALL USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE chat_connected_users;

-- ─── Views over matches + chat ──────────────────────────────────────────────
CREATE OR REPLACE VIEW active_matches AS
SELECT * FROM matches
WHERE match_date BETWEEN NOW() - INTERVAL '24 hours' AND NOW() + INTERVAL '24 hours'
ORDER BY match_date ASC;

CREATE OR REPLACE VIEW match_stats AS
SELECT
    m.api_football_id,
    m.home_team,
    m.away_team,
    m.match_date,
    m.status,
    COUNT(DISTINCT cm.id) AS message_count,
    COUNT(DISTINCT cu.user_id) AS connected_users_count
FROM matches m
LEFT JOIN chat_messages cm ON m.api_football_id = cm.match_id
LEFT JOIN chat_connected_users cu ON m.api_football_id = cu.match_id
GROUP BY m.api_football_id, m.home_team, m.away_team, m.match_date, m.status;

-- ─── predictions (FK → matches.api_football_id) ─────────────────────────────
CREATE TABLE IF NOT EXISTS predictions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    wallet_address TEXT NOT NULL,
    username TEXT NOT NULL,
    match_id INTEGER NOT NULL,
    match_name TEXT NOT NULL,
    prediction_type TEXT NOT NULL,
    prediction_value TEXT NOT NULL,
    predicted_team TEXT NOT NULL,
    odds DECIMAL(5,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'WON', 'LOST', 'CANCELLED')),
    actual_result TEXT,
    transaction_hash TEXT NOT NULL,
    placed_at TIMESTAMP WITH TIME ZONE NOT NULL,
    match_start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    settled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_predictions_user_id ON predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_predictions_wallet_address ON predictions(wallet_address);
CREATE INDEX IF NOT EXISTS idx_predictions_match_id ON predictions(match_id);
CREATE INDEX IF NOT EXISTS idx_predictions_status ON predictions(status);
CREATE INDEX IF NOT EXISTS idx_predictions_placed_at ON predictions(placed_at DESC);
CREATE INDEX IF NOT EXISTS idx_predictions_user_wallet ON predictions(user_id, wallet_address);

ALTER TABLE predictions
    ADD CONSTRAINT fk_predictions_match_id
    FOREIGN KEY (match_id) REFERENCES matches(api_football_id) ON DELETE CASCADE;

CREATE TRIGGER update_predictions_updated_at
    BEFORE UPDATE ON predictions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER PUBLICATION supabase_realtime ADD TABLE predictions;

CREATE OR REPLACE VIEW user_prediction_stats AS
SELECT
    user_id,
    wallet_address,
    COUNT(*) AS total_predictions,
    COUNT(CASE WHEN status = 'WON' THEN 1 END) AS total_wins,
    COUNT(CASE WHEN status = 'LOST' THEN 1 END) AS total_losses,
    COUNT(CASE WHEN status IN ('PENDING', 'IN_PROGRESS') THEN 1 END) AS active_predictions,
    CASE
        WHEN COUNT(CASE WHEN status IN ('WON', 'LOST') THEN 1 END) > 0
        THEN ROUND((COUNT(CASE WHEN status = 'WON' THEN 1 END)::DECIMAL / COUNT(CASE WHEN status IN ('WON', 'LOST') THEN 1 END)::DECIMAL) * 100, 2)
        ELSE 0
    END AS win_rate
FROM predictions
GROUP BY user_id, wallet_address;

CREATE OR REPLACE VIEW pending_settlement_predictions AS
SELECT
    p.*,
    m.home_team,
    m.away_team,
    m.home_score,
    m.away_score,
    m.status AS match_status
FROM predictions p
JOIN matches m ON p.match_id = m.api_football_id
WHERE p.status IN ('PENDING', 'IN_PROGRESS')
AND m.status = 'FT'
AND m.home_score IS NOT NULL
AND m.away_score IS NOT NULL;

-- ─── live_streams (FK → matches.api_football_id) ────────────────────────────
CREATE TABLE IF NOT EXISTS live_streams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    match_id INTEGER NOT NULL,
    streamer_id TEXT NOT NULL,
    streamer_name TEXT NOT NULL,
    streamer_wallet_address TEXT,
    stream_key TEXT UNIQUE NOT NULL,
    hls_playlist_url TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'ended')),
    viewer_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_live_streams_match_id
        FOREIGN KEY (match_id)
        REFERENCES matches(api_football_id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_live_streams_match_id ON live_streams(match_id);
CREATE INDEX IF NOT EXISTS idx_live_streams_stream_key ON live_streams(stream_key);
CREATE INDEX IF NOT EXISTS idx_live_streams_status ON live_streams(status);
CREATE INDEX IF NOT EXISTS idx_live_streams_streamer_wallet_address ON live_streams(streamer_wallet_address);
CREATE INDEX IF NOT EXISTS idx_live_streams_created_at ON live_streams(created_at DESC);

ALTER TABLE live_streams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active streams" ON live_streams
    FOR SELECT TO public, anon, authenticated USING (status = 'active');
CREATE POLICY "Public can create streams" ON live_streams
    FOR INSERT TO public, anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can update streams" ON live_streams
    FOR UPDATE TO public, anon, authenticated USING (true);
CREATE POLICY "Anyone can delete streams" ON live_streams
    FOR DELETE TO public, anon, authenticated USING (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON live_streams TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON live_streams TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON live_streams TO public;

ALTER PUBLICATION supabase_realtime ADD TABLE live_streams;

-- ─── stream_wallets (independent) ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS stream_wallets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    streamer_address TEXT NOT NULL UNIQUE,
    wallet_address TEXT NOT NULL UNIQUE,
    transaction_hash TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stream_wallets_streamer ON stream_wallets(streamer_address);
CREATE INDEX IF NOT EXISTS idx_stream_wallets_wallet ON stream_wallets(wallet_address);
CREATE INDEX IF NOT EXISTS idx_stream_wallets_tx_hash ON stream_wallets(transaction_hash);
CREATE INDEX IF NOT EXISTS idx_stream_wallets_created_at ON stream_wallets(created_at DESC);

ALTER TABLE stream_wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view stream wallets" ON stream_wallets
    FOR SELECT TO public, anon, authenticated USING (true);
CREATE POLICY "Anyone can insert stream wallets" ON stream_wallets
    FOR INSERT TO public, anon, authenticated WITH CHECK (true);

GRANT SELECT, INSERT ON stream_wallets TO authenticated;
GRANT SELECT, INSERT ON stream_wallets TO anon;
GRANT SELECT, INSERT ON stream_wallets TO public;

-- ─── donations (independent) ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS donations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    streamer_address TEXT NOT NULL,
    donor_address TEXT NOT NULL,
    stream_wallet_address TEXT NOT NULL,
    amount DECIMAL(20, 8) NOT NULL,
    message TEXT,
    transaction_hash TEXT NOT NULL UNIQUE,
    platform_fee DECIMAL(20, 8) NOT NULL,
    streamer_amount DECIMAL(20, 8) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_donations_streamer ON donations(streamer_address);
CREATE INDEX IF NOT EXISTS idx_donations_donor ON donations(donor_address);
CREATE INDEX IF NOT EXISTS idx_donations_created_at ON donations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_donations_tx_hash ON donations(transaction_hash);

ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view donations" ON donations
    FOR SELECT TO public, anon, authenticated USING (true);
CREATE POLICY "Anyone can insert donations" ON donations
    FOR INSERT TO public, anon, authenticated WITH CHECK (true);

GRANT SELECT, INSERT ON donations TO authenticated;
GRANT SELECT, INSERT ON donations TO anon;
GRANT SELECT, INSERT ON donations TO public;

ALTER PUBLICATION supabase_realtime ADD TABLE donations;

-- ─── subscriptions (independent) ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    streamer_address TEXT NOT NULL,
    subscriber_address TEXT NOT NULL,
    stream_wallet_address TEXT NOT NULL,
    amount DECIMAL(20, 8) NOT NULL,
    duration_seconds INTEGER NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    expiry_time TIMESTAMP WITH TIME ZONE NOT NULL,
    transaction_hash TEXT NOT NULL UNIQUE,
    platform_fee DECIMAL(20, 8) NOT NULL,
    streamer_amount DECIMAL(20, 8) NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_streamer ON subscriptions(streamer_address);
CREATE INDEX IF NOT EXISTS idx_subscriptions_subscriber ON subscriptions(subscriber_address);
CREATE INDEX IF NOT EXISTS idx_subscriptions_expiry ON subscriptions(expiry_time);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_tx_hash ON subscriptions(transaction_hash);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view subscriptions" ON subscriptions
    FOR SELECT TO public, anon, authenticated USING (true);
CREATE POLICY "Anyone can insert subscriptions" ON subscriptions
    FOR INSERT TO public, anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can update subscriptions" ON subscriptions
    FOR UPDATE TO public, anon, authenticated USING (true);

GRANT SELECT, INSERT, UPDATE ON subscriptions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON subscriptions TO anon;
GRANT SELECT, INSERT, UPDATE ON subscriptions TO public;

ALTER PUBLICATION supabase_realtime ADD TABLE subscriptions;

-- ─── waitlist (independent — pre-017 shape with is_whitelisted column;
--     migration 017 drops the whitelist columns and adds the CHECK constraint;
--     migration 018 enables RLS and the deny-all policies)
CREATE TABLE IF NOT EXISTS waitlist (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    wallet_address TEXT,
    is_whitelisted BOOLEAN DEFAULT false,
    whitelisted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);
CREATE INDEX IF NOT EXISTS idx_waitlist_is_whitelisted ON waitlist(is_whitelisted);

-- ─── Cleanup function (used by CleanupOldMatchesUseCase indirectly) ────────
CREATE OR REPLACE FUNCTION cleanup_old_matches()
RETURNS void AS $$
BEGIN
    DELETE FROM chat_messages
    WHERE match_id IN (
        SELECT api_football_id FROM matches WHERE match_date < NOW() - INTERVAL '24 hours'
    );
    DELETE FROM chat_connected_users
    WHERE match_id IN (
        SELECT api_football_id FROM matches WHERE match_date < NOW() - INTERVAL '24 hours'
    );
    DELETE FROM matches WHERE match_date < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;
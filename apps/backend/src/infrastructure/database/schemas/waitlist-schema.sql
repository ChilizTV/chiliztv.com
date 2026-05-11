-- =====================================================
-- WAITLIST TABLE SCHEMA (source of truth post-017/018)
-- =====================================================

CREATE TABLE IF NOT EXISTS waitlist (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    wallet_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT waitlist_email_lower_chk CHECK (email = lower(email))
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- The backend connects via service_role (bypasses RLS).
-- Explicit deny-all for anon and authenticated roles — email addresses are PII.

CREATE POLICY waitlist_deny_anon_read
  ON waitlist FOR SELECT TO anon, authenticated USING (false);

CREATE POLICY waitlist_deny_anon_insert
  ON waitlist FOR INSERT TO anon, authenticated WITH CHECK (false);

CREATE POLICY waitlist_deny_anon_update
  ON waitlist FOR UPDATE TO anon, authenticated USING (false);

CREATE POLICY waitlist_deny_anon_delete
  ON waitlist FOR DELETE TO anon, authenticated USING (false);

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE waitlist IS 'Beta waitlist — email + optional wallet. Access gate is separate (access_code).';

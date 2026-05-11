-- Migration 018 — enable RLS on waitlist
-- Context: the backend always connects with the service_role key (bypasses RLS),
-- so existing functionality is unaffected. RLS is added as defense in depth:
-- any direct access via the anon key or authenticated JWT is denied for all
-- operations. Email addresses are PII and must never leak through a client-side
-- query.

BEGIN;

ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Deny all for anon and authenticated roles.
-- No INSERT/SELECT/UPDATE/DELETE policies are created, which means the default
-- deny-all behaviour applies to every non-service_role principal.
-- The Express backend (service_role) bypasses RLS and retains full access.

-- Explicit deny-all to make intent visible in Supabase Studio.
CREATE POLICY waitlist_deny_anon_read
  ON waitlist FOR SELECT
  TO anon, authenticated
  USING (false);

CREATE POLICY waitlist_deny_anon_insert
  ON waitlist FOR INSERT
  TO anon, authenticated
  WITH CHECK (false);

CREATE POLICY waitlist_deny_anon_update
  ON waitlist FOR UPDATE
  TO anon, authenticated
  USING (false);

CREATE POLICY waitlist_deny_anon_delete
  ON waitlist FOR DELETE
  TO anon, authenticated
  USING (false);

COMMIT;

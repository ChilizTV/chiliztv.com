-- Migration 038 — admin panel foundations (docs/admin-panel.plan.md, lot 0).
--
-- Three tables: admin_wallets (RBAC grants), audit_log (append-only trail),
-- admin_onchain_actions (tx state machine for admin-signed operations).
-- 037 stays reserved for the chat RLS lockdown.
--
-- The role CHECK is a frozen security invariant — taxonomy changes require
-- a migration on purpose. Bootstrap grants go through `pnpm admin:grant`,
-- never through seed rows here.

BEGIN;

-- ─── admin_wallets — RBAC grants (one active grant per wallet) ─────────────

CREATE TABLE admin_wallets (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address      TEXT NOT NULL CHECK (wallet_address = lower(wallet_address)),
    role                TEXT NOT NULL CHECK (role IN ('super_admin', 'admin', 'moderator', 'finance')),
    granted_by_wallet   TEXT NOT NULL,          -- 'bootstrap' for the CLI seed
    granted_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    revoked_at          TIMESTAMPTZ,
    revoked_by_wallet   TEXT,
    revoke_note         TEXT,
    note                TEXT
);

-- Role changes are revoke + insert — history comes for free.
CREATE UNIQUE INDEX idx_admin_wallets_one_active
    ON admin_wallets (wallet_address) WHERE revoked_at IS NULL;
CREATE INDEX idx_admin_wallets_wallet ON admin_wallets (wallet_address, granted_at DESC);

-- ─── audit_log — append-only admin action trail ────────────────────────────

CREATE TABLE audit_log (
    id              BIGSERIAL PRIMARY KEY,
    actor_wallet    TEXT NOT NULL,
    actor_role      TEXT NOT NULL,              -- snapshot at action time
    -- Namespaced action ('moderation.ban.lift', 'config.report_config.update'…).
    -- Union TS in packages/shared — no SQL ENUM so new actions need no migration.
    action          TEXT NOT NULL,
    target_type     TEXT NOT NULL,
    target_id       TEXT NOT NULL,
    old_value       JSONB,
    new_value       JSONB,
    -- Admin-only collection (legitimate-interest security), purged after 12
    -- months by AuditRetentionJob (NULL-ified; the row itself stays).
    ip              INET,
    user_agent      TEXT,
    request_id      TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_actor  ON audit_log (actor_wallet, id DESC);
CREATE INDEX idx_audit_target ON audit_log (target_type, target_id, id DESC);
CREATE INDEX idx_audit_action ON audit_log (action, id DESC);

-- Append-only: grants apply even under RLS bypass, and the trigger catches
-- any path that would slip through.
REVOKE UPDATE, DELETE ON audit_log FROM service_role;

CREATE FUNCTION audit_log_immutable() RETURNS trigger AS $$
BEGIN
    RAISE EXCEPTION 'audit_log is append-only';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_audit_log_immutable
    BEFORE UPDATE OR DELETE ON audit_log
    FOR EACH ROW EXECUTE FUNCTION audit_log_immutable();

-- ─── admin_onchain_actions — tx state machine ──────────────────────────────

CREATE TABLE admin_onchain_actions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- Client-generated idempotency key: a re-POST returns the existing row.
    action_id           TEXT NOT NULL UNIQUE,
    action_type         TEXT NOT NULL,
    target_contract     TEXT,
    target_market_id    BIGINT,
    params              JSONB NOT NULL DEFAULT '{}'::jsonb,
    requested_by        TEXT NOT NULL,
    rbac_role           TEXT NOT NULL,
    two_fa_nonce        TEXT,
    simulation_result   JSONB,
    state_before        JSONB,
    nonce               BIGINT,
    tx_hash             TEXT,
    gas_used            BIGINT,
    status              TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'simulated', 'broadcast', 'confirmed', 'reverted', 'failed', 'stuck')),
    error               TEXT,
    parent_id           UUID REFERENCES admin_onchain_actions(id),   -- kill-switch batches
    retry_of            UUID REFERENCES admin_onchain_actions(id),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_admin_actions_status ON admin_onchain_actions (status, created_at DESC);
CREATE INDEX idx_admin_actions_parent ON admin_onchain_actions (parent_id) WHERE parent_id IS NOT NULL;

-- ─── RLS — backend-only access (service_role bypasses; no client reads) ────

ALTER TABLE admin_wallets         ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log             ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_onchain_actions ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON admin_wallets         FROM anon, authenticated;
REVOKE ALL ON audit_log             FROM anon, authenticated;
REVOKE ALL ON admin_onchain_actions FROM anon, authenticated;
REVOKE ALL ON SEQUENCE audit_log_id_seq FROM anon, authenticated;

COMMIT;

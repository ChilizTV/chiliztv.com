-- Migration 036 — community reporting + restricted-scope bans (plan v2).
--
-- Additive and non-breaking: four new tables + soft-delete columns on
-- chat_messages. The chat RLS lockdown is intentionally NOT here — it ships
-- separately as migration 037 (LOT 4-B) once the backend write path is the
-- only one in use.
--
-- reason_code has no SQL CHECK on purpose: the taxonomy lives in
-- packages/shared/src/dto/reporting/reasonCodes.ts (Zod at the API boundary)
-- and severity is computed server-side from it.

BEGIN;

-- ─── report_config — hot-reloadable singleton ──────────────────────────────

CREATE TABLE report_config (
    id                  SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    quorum_pct          SMALLINT NOT NULL DEFAULT 25 CHECK (quorum_pct BETWEEN 1 AND 100),
    floor_count         SMALLINT NOT NULL DEFAULT 5 CHECK (floor_count >= 1),
    min_presence_sec    INT      NOT NULL DEFAULT 120 CHECK (min_presence_sec >= 0),
    ban_first_hours     INT      NOT NULL DEFAULT 24,
    ban_second_hours    INT      NOT NULL DEFAULT 168,
    bypass_severity_threshold SMALLINT NOT NULL DEFAULT 4 CHECK (bypass_severity_threshold BETWEEN 1 AND 5),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
INSERT INTO report_config (id) VALUES (1) ON CONFLICT DO NOTHING;

-- ─── reports ───────────────────────────────────────────────────────────────

CREATE TYPE report_target_type AS ENUM ('stream', 'message', 'account');
CREATE TYPE report_status      AS ENUM ('open', 'auto_actioned', 'dismissed', 'closed');

CREATE TABLE reports (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    target_type             report_target_type NOT NULL,
    -- message: chat_messages.id / stream: live_streams.id / account: wallet lowercase
    target_id               TEXT NOT NULL,
    reporter_wallet         TEXT NOT NULL,
    live_context_match_id   BIGINT,
    live_context_stream_id  UUID,
    reason_code             TEXT NOT NULL,
    reason_free_text        TEXT,
    -- computed server-side from the taxonomy, never client-provided
    severity                SMALLINT NOT NULL CHECK (severity BETWEEN 1 AND 5),
    status                  report_status NOT NULL DEFAULT 'open',
    triggered_action_id     UUID,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    reviewed_at             TIMESTAMPTZ,
    reviewed_by_wallet      TEXT,
    review_note             TEXT
);

-- A plain UNIQUE constraint would not dedup NULL live contexts: two partial
-- unique indexes cover both cases.
CREATE UNIQUE INDEX idx_reports_dedup_live
    ON reports (reporter_wallet, target_type, target_id, live_context_match_id)
    WHERE live_context_match_id IS NOT NULL;
CREATE UNIQUE INDEX idx_reports_dedup_global
    ON reports (reporter_wallet, target_type, target_id)
    WHERE live_context_match_id IS NULL;

CREATE INDEX idx_reports_target_open ON reports (target_type, target_id) WHERE status = 'open';
CREATE INDEX idx_reports_live_ctx    ON reports (live_context_match_id, target_type, target_id) WHERE status = 'open';
CREATE INDEX idx_reports_reporter    ON reports (reporter_wallet, created_at DESC);
CREATE INDEX idx_reports_admin_queue ON reports (status, severity DESC, created_at DESC);

-- ─── bans ──────────────────────────────────────────────────────────────────

CREATE TYPE ban_status AS ENUM ('active', 'expired', 'lifted_by_admin', 'lifted_by_appeal');

CREATE TABLE bans (
    id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address           TEXT NOT NULL,
    status                   ban_status NOT NULL DEFAULT 'active',
    triggered_by_report_id   UUID REFERENCES reports(id),
    triggering_live_match_id BIGINT,
    quorum_snapshot          JSONB NOT NULL,
    starts_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
    -- NULL = permanent
    expires_at               TIMESTAMPTZ,
    ended_at                 TIMESTAMPTZ,
    escalation_index         SMALLINT NOT NULL CHECK (escalation_index >= 1),
    lifted_by_wallet         TEXT,
    lift_note                TEXT,
    created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Invariant: at most one active ban per wallet, DB-guaranteed.
CREATE UNIQUE INDEX idx_bans_one_active ON bans (wallet_address) WHERE status = 'active';
CREATE INDEX idx_bans_expiring ON bans (expires_at) WHERE status = 'active' AND expires_at IS NOT NULL;
CREATE INDEX idx_bans_history  ON bans (wallet_address, created_at DESC);

-- ─── report_actions ────────────────────────────────────────────────────────

CREATE TYPE action_kind AS ENUM ('soft_delete_message', 'stop_stream', 'ban_account');

CREATE TABLE report_actions (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kind                  action_kind NOT NULL,
    target_type           report_target_type NOT NULL,
    target_id             TEXT NOT NULL,
    live_context_match_id BIGINT,
    quorum_snapshot       JSONB NOT NULL,
    reporter_wallets      TEXT[] NOT NULL,
    triggered_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    reversed_at           TIMESTAMPTZ,
    reversed_by_wallet    TEXT,
    reverse_note          TEXT,
    affected_message_id   UUID,
    affected_stream_id    UUID,
    affected_ban_id       UUID REFERENCES bans(id)
);

-- One non-reversed action per target/context; COALESCE folds the NULL live
-- context into the same uniqueness space. Concurrent double-triggers violate
-- this index and are caught as "already done" by the repository.
CREATE UNIQUE INDEX idx_actions_one_active
    ON report_actions (target_type, target_id, COALESCE(live_context_match_id, -1))
    WHERE reversed_at IS NULL;

ALTER TABLE reports
    ADD CONSTRAINT fk_reports_action FOREIGN KEY (triggered_action_id) REFERENCES report_actions(id);

-- ─── chat_messages — soft-delete + deterministic dedup ─────────────────────

ALTER TABLE chat_messages
    ADD COLUMN IF NOT EXISTS removed_at           TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS removed_by_action_id UUID REFERENCES report_actions(id),
    ADD COLUMN IF NOT EXISTS client_temp_id       UUID;

CREATE INDEX idx_chat_messages_visible ON chat_messages (match_id, created_at DESC) WHERE removed_at IS NULL;

-- ─── RLS / grants ──────────────────────────────────────────────────────────
-- Zero public policy: reads and writes go exclusively through the backend
-- API (service_role bypasses RLS but still honours grants).

ALTER TABLE reports        ENABLE ROW LEVEL SECURITY;
ALTER TABLE bans           ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_config  ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON reports, bans, report_actions, report_config FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON reports, bans, report_actions, report_config TO service_role;

COMMIT;

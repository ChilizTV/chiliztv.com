-- Migration 016: live_streams.source_type
-- Discriminates the publisher path so cleanup + UI can adapt per source:
--   'obs'     — pushes via RTMP, lifecycle driven by mediamtx webhooks.
--   'browser' — pushes via WHIP/WebRTC, requires client heartbeat + beacon.
-- Existing rows default to 'obs' (the long-standing path before WHIP landed).

ALTER TABLE live_streams
  ADD COLUMN IF NOT EXISTS source_type text NOT NULL DEFAULT 'obs'
  CHECK (source_type IN ('obs', 'browser'));

-- StaleStreamCleanupJob filters on (status, source_type, last_heartbeat_at) —
-- OBS streams are excluded from the heartbeat sweep (cf. D10).
CREATE INDEX IF NOT EXISTS idx_live_streams_source_heartbeat
  ON live_streams (status, source_type, last_heartbeat_at);

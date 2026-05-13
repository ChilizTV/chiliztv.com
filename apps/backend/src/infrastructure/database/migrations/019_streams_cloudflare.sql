-- Migration 019: live_streams — Cloudflare Stream columns
-- Stores the CF live input references created by CloudflareStreamService.
-- Rows created before this migration keep all columns NULL,
-- which is intentional: the playback path falls back to hls_playlist_url.

ALTER TABLE live_streams
  ADD COLUMN IF NOT EXISTS cloudflare_input_uid          TEXT,
  ADD COLUMN IF NOT EXISTS cloudflare_rtmps_url          TEXT,
  ADD COLUMN IF NOT EXISTS cloudflare_rtmps_stream_key   TEXT,
  ADD COLUMN IF NOT EXISTS cloudflare_playback_hls_url   TEXT,
  ADD COLUMN IF NOT EXISTS cloudflare_webrtc_publish_url TEXT;

-- Unique partial index: at most one active row per CF input UID.
-- NULLs excluded so legacy rows do not collide.
CREATE UNIQUE INDEX IF NOT EXISTS idx_live_streams_cf_input_uid_unique
  ON live_streams (cloudflare_input_uid)
  WHERE cloudflare_input_uid IS NOT NULL;

-- Supporting index for the webhook handler lookup (findByCloudflareInputUid).
CREATE INDEX IF NOT EXISTS idx_live_streams_cf_input_uid
  ON live_streams (cloudflare_input_uid)
  WHERE cloudflare_input_uid IS NOT NULL;

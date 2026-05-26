-- 028_streams_recording_metadata.sql
-- Persist the Cloudflare Stream recording (replay) metadata on live_streams
-- so the upcoming "Watch replay" UI can read it directly from the row.
--
-- All three columns are NULLABLE on purpose:
--  - Existing rows can't be back-filled (CF only emits readyToStream once,
--    at recording finish — pre-migration streams have no recording).
--  - Browser-source streams never record, so the columns stay NULL for them.
--  - Readers MUST guard against NULL and fall back to the live HLS URL.
--
-- Idempotent: re-running issues IF NOT EXISTS per column.

ALTER TABLE live_streams
  ADD COLUMN IF NOT EXISTS recording_video_uid  TEXT,
  ADD COLUMN IF NOT EXISTS recording_hls_url    TEXT,
  ADD COLUMN IF NOT EXISTS recording_ready_at   TIMESTAMPTZ;

# Cloudflare Stream — Webhooks & Live Detection

> **Context:** During the MediaMTX → Cloudflare Stream migration, we discovered that
> Cloudflare's live input lifecycle webhooks have two independent issues that must both
> be handled for reliable OBS live detection. This document explains the problems and
> the dual-path solution we shipped.

---

## Problem 1 — Wrong webhook payload format

### What we assumed

The CF Stream documentation for live input webhooks wasn't immediately obvious.
We initially implemented the webhook controller expecting a top-level `type` field,
matching the common webhook pattern:

```json
{ "type": "live_input.connected", "uid": "abc123" }
```

### What CF actually sends

Live input lifecycle events use a **nested `data` object** with `event_type` and
`input_id`, wrapped in a top-level envelope:

```json
{
  "name": "webhook name",
  "text": "Human-readable description",
  "ts": 1715000000,
  "data": {
    "notification_name": "Stream Live Input",
    "input_id": "447b82c1575c1dc9be7de7c4aa45df72",
    "event_type": "live_input.connected",
    "updated_at": "2026-05-13T16:26:13Z"
  }
}
```

Supported `event_type` values:
- `live_input.connected` — publisher (OBS or WHIP) connected
- `live_input.disconnected` — publisher disconnected
- `live_input.errored` — ingest error (codec mismatch, GOP out of range, etc.)

Additionally, CF sends a **separate recording-ready webhook** when the stream
recording finishes processing. This one has **no `type` or `data` field** — it is
the raw video object:

```json
{
  "uid": "f6ed491c443fff754bb78c340edd025c",
  "liveInput": "447b82c1575c1dc9be7de7c4aa45df72",
  "readyToStream": true,
  "status": { "state": "ready", "pctComplete": "100.000000" },
  ...
}
```

### Consequence

Because our controller was reading `event.type` (which is `undefined` for all
CF live input events), **every `live_input.connected` and `live_input.disconnected`
event fell through to the `default` branch** and was silently discarded. OBS live
detection relied entirely on the webhook path, so it never worked.

### Fix — `cloudflare-stream-webhook.controller.ts`

The controller now distinguishes the two payload shapes at runtime:

```ts
// Live input lifecycle event — has a `data` object
if (payload['data'] && typeof payload['data'] === 'object') {
  const event = payload as unknown as CfLiveInputWebhookPayload;
  switch (event.data.event_type) {
    case 'live_input.connected':   lifecycleService.startStreamByLiveInput(event.data.input_id); break;
    case 'live_input.disconnected': lifecycleService.endStreamByLiveInput(event.data.input_id);  break;
    case 'live_input.errored':     logger.warn(...); break;
  }
  return;
}

// Recording ready — raw video object (no `data` wrapper)
if (typeof payload['uid'] === 'string') {
  if (video.readyToStream) logger.info('CF webhook: recording ready', { ... });
  return;
}
```

---

## Problem 2 — Unreliable webhook delivery during development

Even after fixing the payload format, webhooks are not guaranteed to arrive,
especially during local development (cloudflared tunnels, backend restarts, etc.).
A production backend behind a reliable public URL will receive them consistently,
but a single dropped `live_input.disconnected` event would leave a stream stuck
as LIVE in the database indefinitely.

### Solution — Dual-path live detection

Rather than relying solely on webhooks, the OBSSetupPanel polls
`GET /stream?streamerId=xxx&cloudflareInputUid=yyy` every 4 seconds.

The backend now uses `cloudflareInputUid` as a signal to **directly query the
Cloudflare API** as a fallback:

#### OBS connect detection

```
Poll arrives → no DB row + cloudflareInputUid provided
  → startStreamByLiveInput(uid)
      → getLiveInputStatus(uid)  [CF API]
      → if connected: getLiveInputDetails(uid) → create DB row as LIVE
  → re-query → return LIVE stream
```

#### OBS disconnect detection

```
Poll arrives → LIVE DB row exists + cloudflareInputUid provided
  → checkAndEndIfDisconnected(uid)
      → getLiveInputStatus(uid)  [CF API]
      → if not connected: endStreamByLiveInput(uid) → DB row marked ENDED
  → re-query → return empty
```

This means **OBS live state changes are detected within ~4 seconds** of the actual
connect/disconnect, regardless of webhook delivery. Webhooks still work when they
arrive (instant) — the polling is a reliable fallback, not a replacement.

### Viewer side — instant notification via Supabase Realtime

When the DB row transitions to `status = 'ended'`, Supabase Realtime fires on all
viewer VideoPlayer subscriptions within ~100ms:

```ts
supabase.channel(`stream-${stream.id}`)
  .on('postgres_changes', { event: 'UPDATE', table: 'live_streams', filter: `id=eq.${stream.id}` },
    payload => {
      if (payload.new.status === 'ended') {
        hls.destroy();         // stop the HLS pipeline (no more segment loop)
        setStreamEnded(true);  // show "Stream has ended" overlay
      }
    }
  )
```

This eliminates the "last 2 seconds looping" symptom: the HLS instance is destroyed
immediately when the backend marks the stream ENDED.

---

## Sequence diagram — OBS happy path (with fallback active)

```
OBS          CF Stream        cloudflared tunnel    Backend DB      Viewer
 |                |                   |                 |             |
 |── RTMPS ──────>|                   |                 |             |
 |                |── webhook ────────>|                 |             |
 |                |  live_input.connected               |             |
 |                |                   |── POST /webhook >|             |
 |                |                   |  (may fail)     |             |
 |                |                   |                 |             |
 |                |     [4s poll]     |                 |             |
 |         OBSPanel─────────────────────────────────>  |             |
 |         GET /stream?...&cloudflareInputUid=uid       |             |
 |         Backend: getLiveInputStatus(uid) ──[CF API]──>             |
 |                |   state=connected                   |             |
 |         Backend: create DB row as LIVE ────────────> DB            |
 |         Backend: return LIVE stream to OBSPanel      |             |
 |         OBSPanel shows "You're live" ✓               |             |
 |                |                                     |── Realtime─>|
 |                |                                     |  (status=live) |
 |                |                                     |             |
 |── stop ───────>|                                     |             |
 |                |── webhook ────────>|                 |             |
 |                |  live_input.disconnected            |             |
 |                |                   |── POST /webhook >|             |
 |                |                   |  (may fail)     |             |
 |                |                   |                 |             |
 |                |     [4s poll]     |                 |             |
 |         OBSPanel───────────────────────────────────> |             |
 |         Backend: checkAndEndIfDisconnected(uid)       |             |
 |         getLiveInputStatus(uid) ──[CF API]──>         |             |
 |                |   state=disconnected                |             |
 |         Backend: mark DB row ENDED ────────────────> DB            |
 |         Backend: return empty → OBSPanel resets       |             |
 |                |                                     |── Realtime─>|
 |                |                                     |  status=ended |
 |                |                                     |        hls.destroy()
 |                |                                     |        "Stream has ended" ✓
```

---

## Key files

| File | Role |
|---|---|
| `apps/backend/src/presentation/http/controllers/cloudflare-stream-webhook.controller.ts` | Parses both payload shapes, dispatches lifecycle calls |
| `apps/backend/src/infrastructure/streaming/cloudflare-stream-api.types.ts` | `CfLiveInputWebhookPayload` + `CfVideoWebhookPayload` types |
| `apps/backend/src/infrastructure/services/StreamLifecycleService.ts` | `startStreamByLiveInput`, `endStreamByLiveInput`, `checkAndEndIfDisconnected` |
| `apps/backend/src/presentation/http/controllers/stream.controller.ts` | `getActiveStreams` — triggers CF API fallback on every OBS poll |
| `apps/frontend/components/features/streaming/OBSSetupPanel.tsx` | Includes `cloudflareInputUid` in every poll |
| `apps/frontend/components/live/VideoPlayer.tsx` | Supabase Realtime subscription + HLS.js retry logic |

---

## CF API rate limits

`getLiveInputStatus` makes one `GET /accounts/{id}/stream/live_inputs/{uid}` call
per OBS poll. With a 4s interval and CF's default limit of 1200 requests/5min,
this supports ~16 concurrent OBS streamers before rate limiting. Acceptable for
early production; add Redis-based status caching if viewer scale requires it.

---

*Last updated: 2026-05-13*

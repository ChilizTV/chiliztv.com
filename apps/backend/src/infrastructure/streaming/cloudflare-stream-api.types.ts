export interface CfLiveInputRtmps {
  url: string;
  streamKey: string;
}

export interface CfLiveInputResponse {
  uid: string;
  rtmps: CfLiveInputRtmps;
  webRTC: { url: string };
  status: {
    current: { state: 'connected' | 'disconnected' | 'idle' };
  } | null;
  meta?: Record<string, string>;
}

export interface CfApiEnvelope<T> {
  success: boolean;
  errors: Array<{ code: number; message: string }>;
  messages: Array<{ code: number; message: string }>;
  result: T;
}

/**
 * Live input lifecycle webhook — actual CF payload format.
 * CF nests the event type under `data.event_type`, not a top-level `type` field.
 *
 * Ref: https://developers.cloudflare.com/stream/stream-live/webhooks/
 */
export interface CfLiveInputWebhookPayload {
  name: string;
  text: string;
  ts: number;
  data: {
    notification_name: string;
    input_id: string;
    event_type: 'live_input.connected' | 'live_input.disconnected' | 'live_input.errored';
    updated_at: string;
    live_input_errored?: {
      code: string;
      message: string;
      video_codec?: string;
      audio_codec?: string;
    };
  };
}

/**
 * On-demand / recording ready webhook — sent when a video recording from a live
 * input finishes processing. No structured `data` wrapper — just the video object.
 *
 * Ref: https://developers.cloudflare.com/stream/manage-video-library/using-webhooks/
 */
export interface CfVideoWebhookPayload {
  uid: string;
  liveInput?: string;
  readyToStream?: boolean;
  status?: { state: string; pctComplete?: string };
}

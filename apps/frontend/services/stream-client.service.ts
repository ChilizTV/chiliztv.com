'use client';

/**
 * StreamClientService — WHIP WebRTC publisher
 *
 * Browser → canvas.captureStream() → RTCPeerConnection → WHIP → Cloudflare Stream
 */
export class StreamClientService {
  private peerConnection: RTCPeerConnection | null = null;
  private animationFrameId: number | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private screenVideo: HTMLVideoElement | null = null;
  private cameraVideo: HTMLVideoElement | null = null;
  private overlayPosition: { x: number; y: number } = { x: 20, y: 20 };
  private overlaySize: { width: number; height: number } = { width: 200, height: 150 };
  private overlayVisible: boolean = true;
  private readonly width = 1280;
  private readonly height = 720;
  private readonly fps = 25;

  // ── Public API ───────────────────

  async startStream(whipUrl: string, mediaStream: MediaStream): Promise<void> {
    await this.publishViaWhip(whipUrl, this.buildSimpleCanvasStream(mediaStream));
  }

  async startStreamWithOverlay(
    whipUrl: string,
    screenStream: MediaStream,
    cameraStream: MediaStream,
    cameraPosition: { x: number; y: number },
    cameraSize: { width: number; height: number },
    cameraVisible: boolean,
    _containerWidth?: number,
    _containerHeight?: number,
    microphoneStream?: MediaStream,
  ): Promise<void> {
    this.overlayPosition = cameraPosition;
    this.overlaySize = cameraSize;
    this.overlayVisible = cameraVisible;
    await this.publishViaWhip(
      whipUrl,
      this.buildOverlayCanvasStream(screenStream, cameraStream, microphoneStream),
    );
  }

  stopStream(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.peerConnection?.close();
    this.peerConnection = null;
    this.canvas = null;
    this.ctx = null;
    this.screenVideo = null;
    this.cameraVideo = null;
  }

  updateOverlaySettings(
    position: { x: number; y: number },
    size: { width: number; height: number },
    visible: boolean,
    _containerWidth?: number,
    _containerHeight?: number,
  ): void {
    this.overlayPosition = position;
    this.overlaySize = size;
    this.overlayVisible = visible;
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  /**
   * Renders a single MediaStream onto a canvas and captures it.
   * The browser's GPU encoder handles H.264 compression.
   */
  private buildSimpleCanvasStream(mediaStream: MediaStream): MediaStream {
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: false })!;

    const video = document.createElement('video');
    video.srcObject = mediaStream;
    video.muted = true;
    video.autoplay = true;
    video.playsInline = true;
    video.play().catch(() => {});

    const draw = () => {
      if (!this.ctx || !this.canvas) return;
      this.ctx.drawImage(video, 0, 0, this.width, this.height);
      this.animationFrameId = requestAnimationFrame(draw);
    };
    this.animationFrameId = requestAnimationFrame(draw);

    const stream = this.canvas.captureStream(this.fps);
    const audioTrack = mediaStream.getAudioTracks()[0];
    if (audioTrack) stream.addTrack(audioTrack);
    return stream;
  }

  /**
   * Composites screen + camera overlay on a canvas and captures it.
   * Overlay position/size are updated live via updateOverlaySettings().
   */
  private buildOverlayCanvasStream(
    screenStream: MediaStream,
    cameraStream: MediaStream,
    microphoneStream?: MediaStream,
  ): MediaStream {
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: false })!;

    this.screenVideo = document.createElement('video');
    this.screenVideo.srcObject = screenStream;
    this.screenVideo.muted = true;
    this.screenVideo.autoplay = true;
    this.screenVideo.playsInline = true;
    this.screenVideo.play().catch(() => {});

    this.cameraVideo = document.createElement('video');
    this.cameraVideo.srcObject = cameraStream;
    this.cameraVideo.muted = true;
    this.cameraVideo.autoplay = true;
    this.cameraVideo.playsInline = true;
    this.cameraVideo.play().catch(() => {});

    const draw = () => {
      if (!this.ctx || !this.canvas || !this.screenVideo || !this.cameraVideo) return;
      // Full-screen background
      this.ctx.drawImage(this.screenVideo, 0, 0, this.width, this.height);
      // Camera overlay (draggable/resizable position updated in real time)
      if (this.overlayVisible) {
        this.ctx.drawImage(
          this.cameraVideo,
          this.overlayPosition.x,
          this.overlayPosition.y,
          this.overlaySize.width,
          this.overlaySize.height,
        );
      }
      this.animationFrameId = requestAnimationFrame(draw);
    };
    this.animationFrameId = requestAnimationFrame(draw);

    const stream = this.canvas.captureStream(this.fps);
    const audioSource = microphoneStream ?? cameraStream;
    const audioTrack = audioSource.getAudioTracks()[0];
    if (audioTrack) stream.addTrack(audioTrack);
    return stream;
  }

  /**
   * Publishes a MediaStream via the WHIP protocol.
   * WHIP = WebRTC HTTP Ingest Protocol (single POST with SDP offer/answer).
   */
  private async publishViaWhip(whipUrl: string, mediaStream: MediaStream): Promise<void> {
    this.peerConnection = new RTCPeerConnection({ iceServers: [] });

    for (const track of mediaStream.getTracks()) {
      this.peerConnection.addTrack(track, mediaStream);
    }

    // Force H.264 — Cloudflare Stream transcoder requires H.264 baseline; VP8/VP9 are rejected
    const videoTransceiver = this.peerConnection
      .getTransceivers()
      .find((t) => t.sender.track?.kind === 'video');
    if (videoTransceiver && RTCRtpSender.getCapabilities) {
      const codecs = RTCRtpSender.getCapabilities('video')?.codecs ?? [];
      const h264 = codecs.filter((c) => c.mimeType === 'video/H264');
      if (h264.length > 0) videoTransceiver.setCodecPreferences(h264);
    }

    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);

    // Wait for ICE gathering to complete (on localhost this is near-instant)
    await new Promise<void>((resolve) => {
      if (this.peerConnection?.iceGatheringState === 'complete') {
        resolve();
        return;
      }
      this.peerConnection?.addEventListener('icegatheringstatechange', () => {
        if (this.peerConnection?.iceGatheringState === 'complete') resolve();
      });
    });

    const response = await fetch(whipUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/sdp' },
      body: this.peerConnection.localDescription!.sdp,
    });

    if (!response.ok) {
      throw new Error(`WHIP publish failed: ${response.status} ${response.statusText}`);
    }

    const answerSdp = await response.text();
    await this.peerConnection.setRemoteDescription({ type: 'answer', sdp: answerSdp });
  }
}

export const streamClientService = new StreamClientService();

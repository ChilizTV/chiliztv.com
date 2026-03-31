/**
 * @notice Media stream acquisition utilities
 * @dev Handles getUserMedia and getDisplayMedia for different source types
 */

export interface MediaStreamResult {
  stream: MediaStream | null;
  screenStream?: MediaStream;
  cameraStream?: MediaStream;
  microphoneStream?: MediaStream;
}

/**
 * @notice Get media stream based on source type
 * @param sourceType Type of source (camera, screen, or both)
 * @param cameraEnabled Whether camera should be enabled
 * @param microphoneEnabled Whether microphone should be enabled
 * @return Media stream result with streams for each source
 */
export async function getMediaStream(
  sourceType: "camera" | "screen" | "both",
  cameraEnabled: boolean,
  microphoneEnabled: boolean
): Promise<MediaStreamResult> {
  try {
    if (sourceType === "screen") {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: microphoneEnabled,
      });
      return { stream };
    } else if (sourceType === "camera") {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: cameraEnabled,
        audio: microphoneEnabled,
      });
      return { stream };
    } else {
      // Both: get camera and screen separately
      const camStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      const scrStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: microphoneEnabled,
      });

      // Also get microphone stream separately as fallback for audio
      let micStream: MediaStream | null = null;
      if (microphoneEnabled) {
        try {
          micStream = await navigator.mediaDevices.getUserMedia({
            video: false,
            audio: true,
          });
        } catch (error) {
          console.warn("⚠️ Could not get microphone stream:", error);
        }
      }

      return {
        stream: scrStream,
        screenStream: scrStream,
        cameraStream: camStream,
        microphoneStream: micStream || undefined,
      };
    }
  } catch (error) {
    console.error("Error getting media stream:", error);
    return { stream: null };
  }
}

/**
 * @notice Stop all tracks in a media stream
 * @param stream Media stream to stop
 */
export function stopMediaStream(stream: MediaStream | null): void {
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
  }
}

/**
 * @notice Toggle audio tracks enabled state
 * @param stream Media stream containing audio tracks
 * @param enabled Whether audio should be enabled
 */
export function toggleAudioTracks(stream: MediaStream | null, enabled: boolean): void {
  if (stream) {
    stream.getAudioTracks().forEach((track) => {
      track.enabled = enabled;
    });
  }
}

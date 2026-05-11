import { SourceType, StreamStatus } from '../entities/Stream';

export interface WasInterruptedArgs {
  readonly previousStatus: StreamStatus;
  readonly nextStatus: StreamStatus;
  readonly sourceType: SourceType;
  /** True only when the user clicked an explicit "End stream" affordance. */
  readonly userInitiated: boolean;
}

/**
 * True when a browser stream went from LIVE to ENDED without an explicit
 * user action. OBS streams are never considered interrupted — their drops
 * are routine (reconnect, restart) and the OBS panel surfaces them via
 * `isLive` flipping on its own poll.
 */
export function wasInterrupted({
  previousStatus,
  nextStatus,
  sourceType,
  userInitiated,
}: WasInterruptedArgs): boolean {
  if (sourceType !== 'browser') return false;
  if (userInitiated) return false;
  return previousStatus === StreamStatus.LIVE && nextStatus === StreamStatus.ENDED;
}

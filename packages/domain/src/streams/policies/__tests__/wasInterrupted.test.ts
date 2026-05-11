import { describe, expect, it } from 'vitest';
import { StreamStatus } from '../../entities/Stream';
import { wasInterrupted } from '../wasInterrupted';

describe('wasInterrupted', () => {
    it('returns true for browser live→ended without user action', () => {
        expect(wasInterrupted({
            previousStatus: StreamStatus.LIVE,
            nextStatus: StreamStatus.ENDED,
            sourceType: 'browser',
            userInitiated: false,
        })).toBe(true);
    });

    it('returns false when the user explicitly ended', () => {
        expect(wasInterrupted({
            previousStatus: StreamStatus.LIVE,
            nextStatus: StreamStatus.ENDED,
            sourceType: 'browser',
            userInitiated: true,
        })).toBe(false);
    });

    it('returns false for OBS streams regardless of userInitiated', () => {
        expect(wasInterrupted({
            previousStatus: StreamStatus.LIVE,
            nextStatus: StreamStatus.ENDED,
            sourceType: 'obs',
            userInitiated: false,
        })).toBe(false);
        expect(wasInterrupted({
            previousStatus: StreamStatus.LIVE,
            nextStatus: StreamStatus.ENDED,
            sourceType: 'obs',
            userInitiated: true,
        })).toBe(false);
    });

    it('returns false when the transition is not live→ended', () => {
        expect(wasInterrupted({
            previousStatus: StreamStatus.CREATED,
            nextStatus: StreamStatus.LIVE,
            sourceType: 'browser',
            userInitiated: false,
        })).toBe(false);
        expect(wasInterrupted({
            previousStatus: StreamStatus.ENDED,
            nextStatus: StreamStatus.ENDED,
            sourceType: 'browser',
            userInitiated: false,
        })).toBe(false);
    });
});

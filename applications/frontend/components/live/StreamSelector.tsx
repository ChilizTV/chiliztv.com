"use client";

import { useEffect, useState, useRef, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Radio } from 'lucide-react';
import { streamViewerService } from '@/services';
import { LiveStream } from '@/models/stream.model';

interface StreamSelectorProps {
  matchId: number;
  selectedStreamId?: string;
  onStreamSelect: (stream: LiveStream) => void;
  onOwnStreamDetected?: (stream: LiveStream | null) => void;
  currentUserId?: string;
  initialStreamId?: string;
}

export default function StreamSelector({
  matchId,
  selectedStreamId,
  onStreamSelect,
  onOwnStreamDetected,
  currentUserId,
  initialStreamId,
}: StreamSelectorProps) {
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const isInitialMount = useRef(true);
    const onStreamSelectRef = useRef(onStreamSelect);
    const onOwnStreamDetectedRef = useRef(onOwnStreamDetected);
    const selectedStreamIdRef = useRef(selectedStreamId);
    const matchIdRef = useRef(matchId);
    const currentUserIdRef = useRef(currentUserId);
    const initialStreamIdRef = useRef(initialStreamId);

    // Keep refs up to date
  useEffect(() => {
        onStreamSelectRef.current = onStreamSelect;
        onOwnStreamDetectedRef.current = onOwnStreamDetected;
        selectedStreamIdRef.current = selectedStreamId;
        matchIdRef.current = matchId;
        currentUserIdRef.current = currentUserId;
        initialStreamIdRef.current = initialStreamId;
    }, [onStreamSelect, onOwnStreamDetected, selectedStreamId, matchId, currentUserId, initialStreamId]);

    const fetchStreams = useCallback(async (isInitial = false) => {
        try {
            if (isInitial) {
                setLoading(true);
            } else {
                setIsRefreshing(true);
            }
            setError(null);
            
            const result = await streamViewerService.getActiveStreams(matchIdRef.current);
      
      if (result.success) {
        setStreams(result.streams);

                // Notify parent of the user's own stream (or null if they stopped)
                if (currentUserIdRef.current) {
                    const ownStream = result.streams.find(s => s.streamerId === currentUserIdRef.current) ?? null;
                    onOwnStreamDetectedRef.current?.(ownStream);
                }

                // Auto-select on initial load
                if (isInitial && !selectedStreamIdRef.current) {
                    if (initialStreamIdRef.current && result.streams.length > 0) {
                        // URL param override: select specific stream
                        const selectableStreams = currentUserIdRef.current
                            ? result.streams.filter(s => s.streamerId !== currentUserIdRef.current)
                            : result.streams;
                        const target = selectableStreams.find(s => s.id === initialStreamIdRef.current);
                        if (target) onStreamSelectRef.current(target);
                    } else {
                        // Follow-aware preferred stream from backend
                        const preferred = await streamViewerService.getPreferredStream(
                            matchIdRef.current,
                            currentUserIdRef.current
                        );
                        if (preferred.stream) {
                            onStreamSelectRef.current(preferred.stream);
                        }
                    }
                }
      } else {
        setError(result.error || 'Failed to fetch streams');
      }
    } catch (err) {
      console.error('Error fetching streams:', err);
      setError('Failed to fetch streams');
    } finally {
      setLoading(false);
            setIsRefreshing(false);
    }
    }, []);

    useEffect(() => {
        // Reset initial mount flag when matchId changes
        isInitialMount.current = true;
        
        const isInitial = isInitialMount.current;
        if (isInitialMount.current) {
            isInitialMount.current = false;
          }
        
        fetchStreams(isInitial);
        
        // Refresh streams every 5 seconds (silently in background)
        const interval = setInterval(() => {
            fetchStreams(false);
        }, 5000);
        
        return () => clearInterval(interval);
    }, [matchId, fetchStreams]);

    if (loading && streams.length === 0) {
    return (
            <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="p-4">
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                    </div>
        </CardContent>
      </Card>
    );
  }

    if (error && streams.length === 0) {
    return (
            <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="p-4">
                    <p className="text-red-400 text-sm">{error}</p>
        </CardContent>
      </Card>
    );
  }

  // Show all live streams; own stream (created or live) appears at top with a badge
  const ownStream = streams.find(s => s.streamerId === currentUserId) ?? null;
  const otherStreams = streams.filter(s => s.status === 'live' && s.streamerId !== currentUserId);
  const displayStreams = ownStream ? [ownStream, ...otherStreams] : otherStreams;

  if (displayStreams.length === 0) {
    return (
            <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="p-4">
                    <p className="text-gray-400 text-sm">No one is streaming this match yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
        <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
                <div className="space-y-2">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-white">Available Streams</h3>
                        {isRefreshing && (
                            <Loader2 className="w-3 h-3 animate-spin text-gray-500" />
                        )}
                    </div>
                    {displayStreams.map((stream) => {
                        const isOwn = stream.streamerId === currentUserId;
                        const isSelected = selectedStreamId === stream.id;
                        return (
                        <Button
                            key={stream.id}
                            variant={isSelected ? 'default' : 'outline'}
                            onClick={() => onStreamSelect(stream)}
                            className={`w-full justify-start ${
                                isSelected
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                    : 'bg-zinc-800 border-zinc-700 text-gray-300 hover:bg-zinc-700'
                            }`}
                        >
                            <Radio className={`w-4 h-4 mr-2 ${isSelected ? 'text-white' : 'text-gray-400'}`} />
                            <div className="flex-1 text-left">
                                <p className="font-medium">
                                    {stream.streamerName}
                                    {isOwn && (
                                        <span className="ml-2 text-[10px] font-semibold uppercase tracking-wide text-emerald-400">
                                            Your stream
                                        </span>
                                    )}
                                </p>
                                <p className="text-xs opacity-70">
                                    {stream.viewerCount} viewer{stream.viewerCount !== 1 ? 's' : ''}
                                    {isOwn && stream.status === 'created' && ' · starting…'}
                                </p>
                    </div>
                        </Button>
                        );
                    })}
        </div>
      </CardContent>
    </Card>
  );
}


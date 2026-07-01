import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Mic, Square, Play, Pause, Trash2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoiceRecorderProps {
  onRecordingComplete: (blob: Blob, duration: number) => void;
  onRecordingClear: () => void;
  existingRecording?: { blob: Blob; duration: number } | null;
  className?: string;
}

type RecordingState = 'idle' | 'recording' | 'recorded' | 'playing';

export function VoiceRecorder({
  onRecordingComplete,
  onRecordingClear,
  existingRecording,
  className,
}: VoiceRecorderProps) {
  const [state, setState] = useState<RecordingState>(existingRecording ? 'recorded' : 'idle');
  const [duration, setDuration] = useState(existingRecording?.duration || 0);
  const [error, setError] = useState<string | null>(null);
  const [playbackProgress, setPlaybackProgress] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recordedBlobRef = useRef<Blob | null>(existingRecording?.blob || null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Update state when existingRecording changes
  useEffect(() => {
    if (existingRecording) {
      setState('recorded');
      setDuration(existingRecording.duration);
      recordedBlobRef.current = existingRecording.blob;
    } else {
      setState('idle');
      setDuration(0);
      recordedBlobRef.current = null;
    }
  }, [existingRecording]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = useCallback(async () => {
    setError(null);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        }
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4',
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mediaRecorder.mimeType });
        recordedBlobRef.current = blob;
        onRecordingComplete(blob, duration);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.onerror = () => {
        setError('Recording failed. Please try again.');
        setState('idle');
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(100); // Collect data every 100ms
      setState('recording');
      setDuration(0);

      // Start timer
      const startTime = Date.now();
      timerRef.current = window.setInterval(() => {
        setDuration((Date.now() - startTime) / 1000);
      }, 100);

    } catch (err) {
      console.error('Error accessing microphone:', err);
      if ((err as Error).name === 'NotAllowedError') {
        setError('Microphone access was denied. Please allow microphone access to record.');
      } else if ((err as Error).name === 'NotFoundError') {
        setError('No microphone found. Please connect a microphone.');
      } else {
        setError('Could not start recording. Please try again.');
      }
    }
  }, [duration, onRecordingComplete]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && state === 'recording') {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      mediaRecorderRef.current.stop();
      setState('recorded');
    }
  }, [state]);

  const playRecording = useCallback(() => {
    if (!recordedBlobRef.current) return;

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const url = URL.createObjectURL(recordedBlobRef.current);
    audioRef.current = new Audio(url);
    
    audioRef.current.onplay = () => setState('playing');
    audioRef.current.onended = () => {
      setState('recorded');
      setPlaybackProgress(0);
      URL.revokeObjectURL(url);
    };
    audioRef.current.onerror = () => {
      setError('Could not play recording.');
      setState('recorded');
    };
    audioRef.current.ontimeupdate = () => {
      if (audioRef.current && duration > 0) {
        setPlaybackProgress((audioRef.current.currentTime / duration) * 100);
      }
    };

    audioRef.current.play();
  }, [duration]);

  const pausePlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setState('recorded');
    }
  }, []);

  const deleteRecording = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    recordedBlobRef.current = null;
    setState('idle');
    setDuration(0);
    setPlaybackProgress(0);
    onRecordingClear();
  }, [onRecordingClear]);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Error message */}
      {error && (
        <div 
          className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/30 rounded-lg"
          role="alert"
          aria-live="assertive"
        >
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-destructive font-medium">{error}</p>
        </div>
      )}

      {/* Recording controls */}
      <div className="flex flex-col items-center gap-4">
        {/* Timer display */}
        <div 
          className={cn(
            'text-3xl font-mono font-bold tabular-nums',
            state === 'recording' && 'text-recording'
          )}
          aria-live="polite"
          aria-atomic="true"
        >
          {formatTime(duration)}
        </div>

        {/* Progress bar for playback */}
        {state === 'playing' && (
          <div 
            className="w-full h-2 bg-muted rounded-full overflow-hidden"
            role="progressbar"
            aria-valuenow={playbackProgress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Playback progress"
          >
            <div 
              className="h-full bg-playing transition-all duration-100"
              style={{ width: `${playbackProgress}%` }}
            />
          </div>
        )}

        {/* Main action buttons */}
        <div className="flex items-center gap-3">
          {state === 'idle' && (
            <button
              type="button"
              onClick={startRecording}
              className="btn-record flex items-center gap-3 px-6 py-4"
              aria-label="Start recording your message"
            >
              <Mic className="w-6 h-6" aria-hidden="true" />
              <span className="text-lg font-semibold">Record your message</span>
            </button>
          )}

          {state === 'recording' && (
            <button
              type="button"
              onClick={stopRecording}
              className="btn-record recording-pulse flex items-center gap-3 px-6 py-4"
              data-recording="true"
              aria-label="Stop recording"
            >
              <Square className="w-6 h-6" aria-hidden="true" />
              <span className="text-lg font-semibold">Stop recording</span>
            </button>
          )}

          {(state === 'recorded' || state === 'playing') && (
            <>
              {state === 'recorded' ? (
                <button
                  type="button"
                  onClick={playRecording}
                  className="btn-play flex items-center gap-3 px-5 py-3"
                  aria-label="Play your recording"
                >
                  <Play className="w-6 h-6" aria-hidden="true" />
                  <span className="font-semibold">Play recording</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={pausePlayback}
                  className="btn-play flex items-center gap-3 px-5 py-3"
                  aria-label="Pause playback"
                >
                  <Pause className="w-6 h-6" aria-hidden="true" />
                  <span className="font-semibold">Pause</span>
                </button>
              )}

              <button
                type="button"
                onClick={deleteRecording}
                className="btn-ghost text-destructive flex items-center gap-2 px-4 py-3"
                aria-label="Delete recording and start over"
              >
                <Trash2 className="w-5 h-5" aria-hidden="true" />
                <span className="font-medium">Delete</span>
              </button>
            </>
          )}
        </div>

        {/* Recording status */}
        {state === 'recording' && (
          <p className="text-center text-muted-foreground animate-pulse-soft" role="status">
            Recording... Tap "Stop recording" when finished.
          </p>
        )}

        {state === 'recorded' && (
          <p className="text-center text-success font-medium" role="status">
            ✓ Recording saved ({formatTime(duration)})
          </p>
        )}
      </div>
    </div>
  );
}

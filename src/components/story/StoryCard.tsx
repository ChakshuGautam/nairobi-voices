import React, { useState, useRef } from 'react';
import { Play, Pause, Volume2, MapPin, Clock } from 'lucide-react';
import { Story, CATEGORY_LABELS } from '@/types/story';
import { speakText, stopSpeaking } from '@/lib/apiClient';
import { cn } from '@/lib/utils';

interface StoryCardProps {
  story: Story;
  className?: string;
}

export function StoryCard({ story, className }: StoryCardProps) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isReadingAloud, setIsReadingAloud] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString('en-KE', { month: 'short', day: 'numeric' });
  };

  const handlePlayAudio = () => {
    if (!story.audioUrl && !story.audioBlob) return;

    if (isPlayingAudio && audioRef.current) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
      return;
    }

    const url = story.audioUrl || (story.audioBlob ? URL.createObjectURL(story.audioBlob) : null);
    if (!url) return;

    audioRef.current = new Audio(url);
    audioRef.current.onended = () => {
      setIsPlayingAudio(false);
      if (story.audioBlob) URL.revokeObjectURL(url);
    };
    audioRef.current.onerror = () => {
      setIsPlayingAudio(false);
    };
    audioRef.current.play();
    setIsPlayingAudio(true);
  };

  const handleReadAloud = async () => {
    if (isReadingAloud) {
      stopSpeaking();
      setIsReadingAloud(false);
      return;
    }

    const textToRead = `${story.title}. ${story.description}`;
    setIsReadingAloud(true);
    await speakText(textToRead);
    setIsReadingAloud(false);
  };

  const getCategoryBadgeClass = () => {
    switch (story.category) {
      case 'complaint': return 'badge-complaint';
      case 'idea': return 'badge-idea';
      case 'appreciation': return 'badge-appreciation';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const truncatedDescription = story.description.length > 150 && !expanded
    ? story.description.slice(0, 150) + '...'
    : story.description;

  return (
    <article 
      className={cn('story-card animate-fade-in', className)}
      aria-labelledby={`story-title-${story.id}`}
    >
      {/* Header with category and time */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <span 
          className={cn(
            'inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold',
            getCategoryBadgeClass()
          )}
        >
          {CATEGORY_LABELS[story.category]}
        </span>
        <time 
          dateTime={story.createdAt}
          className="flex items-center gap-1 text-sm text-muted-foreground"
        >
          <Clock className="w-4 h-4" aria-hidden="true" />
          {formatRelativeTime(story.createdAt)}
        </time>
      </div>

      {/* Title */}
      <h3 
        id={`story-title-${story.id}`}
        className="text-xl font-bold text-foreground mb-2"
      >
        {story.title}
      </h3>

      {/* Location */}
      {(story.wardName || story.locationDescription) && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
          <MapPin className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
          <span>
            {story.wardName && `${story.wardName} Ward`}
            {story.wardName && story.locationDescription && ' • '}
            {story.locationDescription}
          </span>
        </p>
      )}

      {/* Description */}
      {story.description && (
        <div className="mb-4">
          <p className="text-foreground leading-relaxed">
            {truncatedDescription}
          </p>
          {story.description.length > 150 && (
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="text-primary font-medium mt-1 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
            >
              {expanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>
      )}

      {/* Audio/Voice actions */}
      <div className="flex flex-wrap gap-3">
        {/* Play voice message */}
        {(story.audioUrl || story.audioBlob) && (
          <button
            type="button"
            onClick={handlePlayAudio}
            className={cn(
              'btn-accessible text-sm',
              isPlayingAudio 
                ? 'bg-playing text-white'
                : 'bg-muted text-foreground hover:bg-muted/80'
            )}
            aria-label={isPlayingAudio ? 'Pause voice message' : 'Play voice message'}
            aria-pressed={isPlayingAudio}
          >
            {isPlayingAudio ? (
              <Pause className="w-5 h-5" aria-hidden="true" />
            ) : (
              <Play className="w-5 h-5" aria-hidden="true" />
            )}
            <span>{isPlayingAudio ? 'Pause' : 'Play voice message'}</span>
          </button>
        )}

        {/* Read aloud text */}
        {story.description && (
          <button
            type="button"
            onClick={handleReadAloud}
            className={cn(
              'btn-accessible text-sm',
              isReadingAloud
                ? 'bg-secondary text-secondary-foreground'
                : 'bg-muted text-foreground hover:bg-muted/80'
            )}
            aria-label={isReadingAloud ? 'Stop reading' : 'Read this story aloud'}
            aria-pressed={isReadingAloud}
          >
            <Volume2 className="w-5 h-5" aria-hidden="true" />
            <span>{isReadingAloud ? 'Stop reading' : 'Read aloud'}</span>
          </button>
        )}
      </div>
    </article>
  );
}

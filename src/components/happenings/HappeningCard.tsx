import React, { useState } from 'react';
import { Calendar, MapPin, ExternalLink, Volume2, Building2, Navigation } from 'lucide-react';
import { Happening, HAPPENING_TYPE_LABELS, HAPPENING_TYPE_ICONS } from '@/types/happenings';
import { speakText, stopSpeaking } from '@/lib/apiClient';
import { cn } from '@/lib/utils';

// Haversine distance calculation
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

interface HappeningCardProps {
  happening: Happening;
  className?: string;
  onClick?: () => void;
  userLat?: number;
  userLng?: number;
}

export function HappeningCard({ happening, className, onClick, userLat, userLng }: HappeningCardProps) {
  const [isReading, setIsReading] = useState(false);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-KE', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const handleReadAloud = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    if (isReading) {
      stopSpeaking();
      setIsReading(false);
      return;
    }

    const textToRead = `${happening.title}. ${happening.summary}. From ${happening.source}.`;
    setIsReading(true);
    await speakText(textToRead);
    setIsReading(false);
  };

  const handleExternalLink = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
  };

  const getTypeColor = () => {
    switch (happening.type) {
      case 'INFRASTRUCTURE': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'EVENT': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'NOTICE': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'SERVICE': return 'bg-green-100 text-green-800 border-green-200';
      case 'EMERGENCY': return 'bg-red-100 text-red-800 border-red-200';
      case 'COMMUNITY': return 'bg-teal-100 text-teal-800 border-teal-200';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <article 
      className={cn(
        'bg-card rounded-xl border border-border p-4 shadow-soft hover:shadow-medium transition-all cursor-pointer',
        'hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        className
      )}
      aria-labelledby={`happening-title-${happening.id}`}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      tabIndex={0}
      role="button"
    >
      {/* Type badge and date */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <span 
          className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border',
            getTypeColor()
          )}
        >
          <span aria-hidden="true">{HAPPENING_TYPE_ICONS[happening.type]}</span>
          {HAPPENING_TYPE_LABELS[happening.type]}
        </span>
        
        <time 
          dateTime={happening.date}
          className="flex items-center gap-1 text-xs text-muted-foreground"
        >
          <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
          {formatDate(happening.date)}
          {happening.endDate && ` - ${formatDate(happening.endDate)}`}
        </time>
      </div>

      {/* Title */}
      <h3 
        id={`happening-title-${happening.id}`}
        className="font-bold text-foreground mb-2"
      >
        {happening.title}
      </h3>

      {/* Summary */}
      <p className="text-sm text-muted-foreground leading-relaxed mb-3 line-clamp-2">
        {happening.summary}
      </p>

      {/* Source, ward, and distance */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-3">
        <span className="flex items-center gap-1">
          <Building2 className="w-3.5 h-3.5" aria-hidden="true" />
          {happening.source}
        </span>
        {happening.wardName && (
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
            {happening.wardName} Ward
          </span>
        )}
        {userLat !== undefined && userLng !== undefined && happening.lat && happening.lng && (
          <span className="flex items-center gap-1 text-primary font-medium">
            <Navigation className="w-3.5 h-3.5" aria-hidden="true" />
            {calculateDistance(userLat, userLng, happening.lat, happening.lng).toFixed(1)} km away
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-border">
        {/* Read aloud button */}
        <button
          type="button"
          onClick={handleReadAloud}
          className={cn(
            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
            isReading
              ? 'bg-secondary text-secondary-foreground'
              : 'bg-muted text-foreground hover:bg-muted/80'
          )}
          aria-label={isReading ? 'Stop reading' : 'Read this update aloud'}
          aria-pressed={isReading}
        >
          <Volume2 className="w-4 h-4" aria-hidden="true" />
          {isReading ? 'Stop' : 'Read aloud'}
        </button>

        {/* External link */}
        {happening.link && (
          <a
            href={happening.link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleExternalLink}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-muted text-foreground hover:bg-muted/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <ExternalLink className="w-4 h-4" aria-hidden="true" />
            More details
          </a>
        )}

        {/* View details hint */}
        <span className="ml-auto text-xs text-muted-foreground">
          Tap for details →
        </span>
      </div>
    </article>
  );
}

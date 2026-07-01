import React, { useState, useEffect } from 'react';
import { Bell, MapPin, RefreshCw, Volume2 } from 'lucide-react';
import { Happening } from '@/types/happenings';
import { happeningsApi } from '@/lib/happeningsApi';
import { speakText, stopSpeaking } from '@/lib/apiClient';
import { HappeningCard } from './HappeningCard';
import { ProjectDetailDrawer } from './ProjectDetailDrawer';
import { cn } from '@/lib/utils';

interface HappeningsFeedProps {
  wardCode?: string;
  lat?: number;
  lng?: number;
  radiusKm?: number;
  className?: string;
}

export function HappeningsFeed({ wardCode, lat, lng, radiusKm = 5, className }: HappeningsFeedProps) {
  const [happenings, setHappenings] = useState<Happening[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isReadingAll, setIsReadingAll] = useState(false);
  const [selectedHappening, setSelectedHappening] = useState<Happening | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const loadHappenings = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await happeningsApi.getHappenings({
        wardCode,
        lat,
        lng,
        radiusKm,
      });
      setHappenings(result);
    } catch (err) {
      console.error('Error loading happenings:', err);
      setError('Could not load updates. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHappenings();
  }, [wardCode, lat, lng, radiusKm]);

  const handleReadAllAloud = async () => {
    if (isReadingAll) {
      stopSpeaking();
      setIsReadingAll(false);
      return;
    }

    if (happenings.length === 0) return;

    const allText = happenings
      .map((h, i) => `Update ${i + 1}: ${h.title}. ${h.summary}`)
      .join('. Next update: ');

    setIsReadingAll(true);
    await speakText(`Here's what's happening around you. ${allText}`);
    setIsReadingAll(false);
  };

  const handleCardClick = (happening: Happening) => {
    setSelectedHappening(happening);
    setIsDrawerOpen(true);
  };

  const hasLocation = lat !== undefined && lng !== undefined;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
            <Bell className="w-5 h-5 text-secondary-foreground" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">
              What's Happening Around You
            </h2>
            <p className="text-sm text-muted-foreground">
              {hasLocation 
                ? 'Updates near your selected location'
                : 'Local government and community updates'
              }
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {happenings.length > 0 && (
            <button
              type="button"
              onClick={handleReadAllAloud}
              className={cn(
                'btn-accessible text-sm',
                isReadingAll
                  ? 'bg-secondary text-secondary-foreground'
                  : 'btn-ghost'
              )}
              aria-label={isReadingAll ? 'Stop reading all updates' : 'Read all updates aloud'}
              aria-pressed={isReadingAll}
            >
              <Volume2 className="w-5 h-5" aria-hidden="true" />
              <span className="hidden sm:inline">{isReadingAll ? 'Stop' : 'Read all'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={loadHappenings}
            disabled={isLoading}
            className="btn-ghost"
            aria-label="Refresh updates"
          >
            <RefreshCw className={cn('w-5 h-5', isLoading && 'animate-spin')} aria-hidden="true" />
          </button>
        </div>
      </div>

      {hasLocation && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg">
          <MapPin className="w-4 h-4" aria-hidden="true" />
          <span>Showing updates within {radiusKm}km of your selected location</span>
        </div>
      )}

      {error && (
        <div 
          className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive"
          role="alert"
        >
          {error}
        </div>
      )}

      {isLoading && (
        <div className="space-y-4" aria-busy="true" aria-label="Loading updates">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card rounded-xl border border-border p-4 animate-pulse">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-6 w-24 bg-muted rounded-full" />
                <div className="h-4 w-16 bg-muted rounded ml-auto" />
              </div>
              <div className="h-5 w-3/4 bg-muted rounded mb-2" />
              <div className="h-4 w-full bg-muted rounded mb-1" />
              <div className="h-4 w-2/3 bg-muted rounded" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && happenings.length > 0 && (
        <div className="space-y-4" role="feed" aria-label="Local updates and announcements">
          {happenings.map((happening) => (
            <HappeningCard 
              key={happening.id} 
              happening={happening}
              onClick={() => handleCardClick(happening)}
              userLat={lat}
              userLng={lng}
            />
          ))}
        </div>
      )}

      {!isLoading && happenings.length === 0 && (
        <div className="text-center py-8 bg-muted/30 rounded-xl">
          <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-3" aria-hidden="true" />
          <p className="text-lg text-muted-foreground mb-1">No updates right now</p>
          <p className="text-sm text-muted-foreground">
            {hasLocation 
              ? 'Check back later for news about your area.'
              : 'Select a location on the map to see nearby updates.'
            }
          </p>
        </div>
      )}

      {/* Project Detail Drawer */}
      <ProjectDetailDrawer 
        happening={selectedHappening}
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
      />
    </div>
  );
}

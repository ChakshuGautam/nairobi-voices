import React, { useState, useEffect } from 'react';
import { RefreshCw, Filter, X } from 'lucide-react';
import { Story, StoryCategory, CATEGORY_LABELS, Ward } from '@/types/story';
import { apiClient } from '@/lib/apiClient';
import { StoryCard } from './StoryCard';
import { cn } from '@/lib/utils';

interface StoryFeedProps {
  className?: string;
  refreshTrigger?: number;
}

export function StoryFeed({ className, refreshTrigger }: StoryFeedProps) {
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filters
  const [categoryFilter, setCategoryFilter] = useState<StoryCategory | ''>('');
  const [wardFilter, setWardFilter] = useState('');

  // Live Bomet wards (boundary-service) for the ward filter dropdown.
  const [wards, setWards] = useState<Ward[]>([]);
  useEffect(() => {
    apiClient.getWards().then(setWards).catch(() => setWards([]));
  }, []);
  const wardName = (code: string) => wards.find((w) => w.code === code)?.name || code;

  const loadStories = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await apiClient.getStories({
        category: categoryFilter || undefined,
        wardCode: wardFilter || undefined,
      });
      setStories(result);
    } catch (err) {
      console.error('Error loading stories:', err);
      setError('Could not load stories. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStories();
  }, [categoryFilter, wardFilter, refreshTrigger]);

  const clearFilters = () => {
    setCategoryFilter('');
    setWardFilter('');
  };

  const hasActiveFilters = categoryFilter || wardFilter;

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">My Reports</h2>
          <p className="text-muted-foreground">
            Complaints you've filed in Bomet
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Refresh button */}
          <button
            type="button"
            onClick={loadStories}
            disabled={isLoading}
            className="btn-ghost flex items-center gap-2"
            aria-label="Refresh stories"
          >
            <RefreshCw className={cn('w-5 h-5', isLoading && 'animate-spin')} aria-hidden="true" />
            <span className="sr-only md:not-sr-only">Refresh</span>
          </button>

          {/* Filter toggle */}
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'btn-ghost flex items-center gap-2',
              hasActiveFilters && 'bg-primary text-primary-foreground'
            )}
            aria-expanded={showFilters}
            aria-controls="story-filters"
          >
            <Filter className="w-5 h-5" aria-hidden="true" />
            <span>Filter</span>
            {hasActiveFilters && (
              <span className="sr-only"> (filters active)</span>
            )}
          </button>
        </div>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div 
          id="story-filters"
          className="bg-muted rounded-xl p-4 space-y-4 animate-slide-up"
          role="region"
          aria-label="Story filters"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Filter Stories</h3>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                <X className="w-4 h-4" aria-hidden="true" />
                Clear all
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category filter */}
            <div>
              <label htmlFor="category-filter" className="block font-medium text-foreground mb-2">
                Category
              </label>
              <select
                id="category-filter"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as StoryCategory | '')}
                className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All categories</option>
                {(Object.keys(CATEGORY_LABELS) as StoryCategory[]).map((cat) => (
                  <option key={cat} value={cat}>
                    {CATEGORY_LABELS[cat]}
                  </option>
                ))}
              </select>
            </div>

            {/* Ward filter */}
            <div>
              <label htmlFor="ward-filter" className="block font-medium text-foreground mb-2">
                Ward
              </label>
              <select
                id="ward-filter"
                value={wardFilter}
                onChange={(e) => setWardFilter(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All wards</option>
                {wards.map((ward) => (
                  <option key={ward.code} value={ward.code}>
                    {ward.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Active filter pills */}
      {hasActiveFilters && !showFilters && (
        <div className="flex flex-wrap gap-2" role="status" aria-label="Active filters">
          {categoryFilter && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
              {CATEGORY_LABELS[categoryFilter]}
              <button
                type="button"
                onClick={() => setCategoryFilter('')}
                className="hover:bg-primary/20 rounded-full p-0.5"
                aria-label={`Remove ${CATEGORY_LABELS[categoryFilter]} filter`}
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </span>
          )}
          {wardFilter && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
              {wardName(wardFilter)}
              <button
                type="button"
                onClick={() => setWardFilter('')}
                className="hover:bg-primary/20 rounded-full p-0.5"
                aria-label={`Remove ward filter`}
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Error state */}
      {error && (
        <div 
          className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-4" aria-busy="true" aria-label="Loading stories">
          {[1, 2, 3].map((i) => (
            <div key={i} className="story-card animate-pulse">
              <div className="h-6 w-24 bg-muted rounded-full mb-3" />
              <div className="h-7 w-3/4 bg-muted rounded mb-2" />
              <div className="h-4 w-1/2 bg-muted rounded mb-3" />
              <div className="h-20 bg-muted rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Stories list */}
      {!isLoading && stories.length > 0 && (
        <div className="space-y-4" role="feed" aria-label="My reports">
          {stories.map((story, index) => (
            <StoryCard 
              key={story.id} 
              story={story}
              aria-setsize={stories.length}
              aria-posinset={index + 1}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && stories.length === 0 && (
        <div className="text-center py-12">
          <p className="text-xl text-muted-foreground mb-2">No reports yet</p>
          <p className="text-muted-foreground">
            {hasActiveFilters
              ? 'Try changing your filters or check back later.'
              : "File a complaint or sign in to see the ones you've filed."
            }
          </p>
        </div>
      )}
    </div>
  );
}

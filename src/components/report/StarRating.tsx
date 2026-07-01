import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  label?: string;
  className?: string;
}

export function StarRating({ rating, onRatingChange, label, className }: StarRatingProps) {
  return (
    <div className={className}>
      {label && (
        <label className="text-lg font-semibold text-foreground mb-2 block">
          {label}
        </label>
      )}
      <div className="flex gap-1" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            className={cn(
              'p-1 rounded focus-visible:ring-2 focus-visible:ring-primary transition-all',
              'hover:scale-110'
            )}
            aria-label={`${star} star${star > 1 ? 's' : ''}`}
            aria-checked={rating >= star}
            role="radio"
          >
            <Star
              className={cn(
                'w-8 h-8 transition-colors',
                rating >= star
                  ? 'fill-secondary text-secondary'
                  : 'text-muted-foreground'
              )}
            />
          </button>
        ))}
      </div>
      <p className="text-sm text-muted-foreground mt-1">
        {rating === 0 && 'Tap to rate'}
        {rating === 1 && 'Very poor'}
        {rating === 2 && 'Poor'}
        {rating === 3 && 'Average'}
        {rating === 4 && 'Good'}
        {rating === 5 && 'Excellent'}
      </p>
    </div>
  );
}

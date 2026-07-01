import React, { useState, useEffect } from 'react';
import { MapPin, Hand, Keyboard, Mic, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MapGuideProps {
  onDismiss: () => void;
  className?: string;
}

export function MapGuide({ onDismiss, className }: MapGuideProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animate in after a short delay
    const timer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(onDismiss, 300);
  };

  return (
    <div
      className={cn(
        'absolute top-4 left-4 right-4 z-[1000] transition-all duration-300',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4',
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="bg-card/95 backdrop-blur-sm border border-border rounded-xl shadow-strong p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            {/* Animated pin icon */}
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-6 h-6 text-primary animate-bounce" aria-hidden="true" />
            </div>
            
            <div className="space-y-2">
              <p className="font-semibold text-foreground text-lg">
                Mark your location
              </p>
              <p className="text-muted-foreground">
                Show us where this is happening:
              </p>
              
              {/* Methods */}
              <div className="flex flex-wrap gap-3 mt-3">
                <div className="flex items-center gap-2 text-sm bg-muted px-3 py-1.5 rounded-full">
                  <Hand className="w-4 h-4 text-primary" aria-hidden="true" />
                  <span>Tap the map</span>
                </div>
                <div className="flex items-center gap-2 text-sm bg-muted px-3 py-1.5 rounded-full">
                  <Keyboard className="w-4 h-4 text-primary" aria-hidden="true" />
                  <span>Press Enter</span>
                </div>
                <div className="flex items-center gap-2 text-sm bg-muted px-3 py-1.5 rounded-full">
                  <Mic className="w-4 h-4 text-primary" aria-hidden="true" />
                  <span>Say "Mark here"</span>
                </div>
              </div>
            </div>
          </div>

          {/* Dismiss button */}
          <button
            type="button"
            onClick={handleDismiss}
            className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Dismiss guide"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}

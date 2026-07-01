import React, { useEffect, useState } from 'react';
import { MapPin, Navigation, Loader2, Check, Edit3 } from 'lucide-react';
import { findWardByCoords, getNearbyLandmarks } from '@/lib/happeningsApi';
import { cn } from '@/lib/utils';

interface LocationCardProps {
  lat: number;
  lng: number;
  onLocationDescriptionChange?: (description: string) => void;
  className?: string;
}

export function LocationCard({ lat, lng, onLocationDescriptionChange, className }: LocationCardProps) {
  const [ward, setWard] = useState<{ code: string; name: string } | null>(null);
  const [landmarks, setLandmarks] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showTextInput, setShowTextInput] = useState(false);
  const [customDescription, setCustomDescription] = useState('');

  useEffect(() => {
    const loadLocationInfo = async () => {
      setIsLoading(true);
      
      // Get ward info
      const wardInfo = findWardByCoords(lat, lng);
      setWard(wardInfo);
      
      // Get nearby landmarks
      const nearbyLandmarks = await getNearbyLandmarks(lat, lng);
      setLandmarks(nearbyLandmarks);
      
      setIsLoading(false);
    };

    loadLocationInfo();
  }, [lat, lng]);

  const handleDescriptionChange = (value: string) => {
    setCustomDescription(value);
    onLocationDescriptionChange?.(value);
  };

  return (
    <div 
      className={cn(
        'bg-card border border-border rounded-xl shadow-medium overflow-hidden animate-slide-up',
        className
      )}
      role="region"
      aria-label="Selected location details"
    >
      {/* Header */}
      <div className="bg-success/10 border-b border-success/20 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-success flex items-center justify-center">
            <Check className="w-5 h-5 text-success-foreground" aria-hidden="true" />
          </div>
          <div>
            <p className="font-semibold text-success">Location Selected!</p>
            <p className="text-sm text-muted-foreground">
              {lat.toFixed(4)}, {lng.toFixed(4)}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {isLoading ? (
          <div className="flex items-center gap-3 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
            <span>Finding your location details...</span>
          </div>
        ) : (
          <>
            {/* Ward info */}
            {ward && (
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="font-semibold text-foreground">
                    {ward.name} Ward
                  </p>
                  <p className="text-sm text-muted-foreground">
                    You've selected a location in {ward.name}
                  </p>
                </div>
              </div>
            )}

            {/* Nearby landmarks */}
            {landmarks.length > 0 && (
              <div className="flex items-start gap-3">
                <Navigation className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="font-medium text-foreground">Nearby landmarks</p>
                  <ul className="text-sm text-muted-foreground">
                    {landmarks.map((landmark, index) => (
                      <li key={index}>• {landmark}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Custom description toggle */}
            <div className="border-t border-border pt-4">
              {!showTextInput ? (
                <button
                  type="button"
                  onClick={() => setShowTextInput(true)}
                  className="flex items-center gap-2 text-sm text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                >
                  <Edit3 className="w-4 h-4" aria-hidden="true" />
                  <span>Can't find your exact spot? Add a description</span>
                </button>
              ) : (
                <div>
                  <label 
                    htmlFor="location-description" 
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Describe your location
                  </label>
                  <textarea
                    id="location-description"
                    value={customDescription}
                    onChange={(e) => handleDescriptionChange(e.target.value)}
                    placeholder="Example: Near the blue gate, opposite the chemist on Main Street"
                    rows={2}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

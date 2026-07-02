import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Mic, MicOff, Navigation, ChevronDown, HardHat, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/apiClient';
import { MAP_CENTER } from '@/lib/config';
import { Ward } from '@/types/story';
import { Badge } from '@/components/ui/badge';
import { ComplaintIntent, LinkedProject } from './ComplaintIntentStep';
import 'leaflet/dist/leaflet.css';

// Custom marker icon
const locationMarkerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export interface LocationData {
  coordinates: {
    lat: number;
    lng: number;
  } | null;
  admin: {
    subCounty: string;
    ward: string;
    wardCode: string;
    zone: string;
  };
  description: string;
}

interface LocationStepProps {
  location: LocationData;
  onLocationChange: (location: LocationData) => void;
  intent?: ComplaintIntent | null;
  linkedProject?: LinkedProject | null;
  onLinkedProjectChange?: (project: LinkedProject | null) => void;
}

// Map click handler component
function MapClickHandler({ 
  onLocationSelect 
}: { 
  onLocationSelect: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
}

// Use my location button
function UseMyLocationButton({ 
  onLocationFound 
}: { 
  onLocationFound: (lat: number, lng: number) => void;
}) {
  const map = useMap();
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    if (!navigator.geolocation) return;
    
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        map.setView([latitude, longitude], 15);
        onLocationFound(latitude, longitude);
        setLoading(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        setLoading(false);
      },
      { enableHighAccuracy: true }
    );
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="absolute top-3 right-3 z-[1000] bg-background border border-border rounded-lg p-2.5 shadow-md hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
      aria-label="Use my current location"
    >
      <Navigation className={cn("w-5 h-5", loading && "animate-pulse")} />
    </button>
  );
}

export function LocationStep({ location, onLocationChange, intent, linkedProject, onLinkedProjectChange }: LocationStepProps) {
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  
  // Real Bomet ADMIN wards (boundary-service + localization) via apiClient.
  const [bometWards, setBometWards] = useState<Ward[]>([]);
  const [wardsLoading, setWardsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setWardsLoading(true);
      try {
        const wards = await apiClient.getWards();
        if (!cancelled) setBometWards(wards);
      } catch (err) {
        console.error('Failed to load wards:', err);
      } finally {
        if (!cancelled) setWardsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleMapClick = (lat: number, lng: number) => {
    // The map only contributes coordinates. The ward is chosen explicitly from
    // the real Bomet ward list below (client-side reverse geocoding to real
    // boundary codes is not available).
    onLocationChange({
      ...location,
      coordinates: { lat, lng }
    });
  };

  const handleWardChange = (wardCode: string) => {
    const ward = bometWards.find(w => w.code === wardCode);
    onLocationChange({
      ...location,
      admin: {
        ...location.admin,
        subCounty: ward?.subcounty || location.admin.subCounty,
        ward: ward?.name || '',
        wardCode,
        zone: ''
      }
    });
  };

  const handleDescriptionChange = (description: string) => {
    onLocationChange({
      ...location,
      description
    });
  };

  // Voice recording logic
  const startVoiceRecording = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setVoiceError('Voice input is not supported in your browser. Please use Chrome or Edge.');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-KE';

    recognition.onstart = () => {
      setIsVoiceRecording(true);
      setVoiceError(null);
    };

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join('');
      setVoiceTranscript(transcript);
    };

    recognition.onend = () => {
      setIsVoiceRecording(false);
      // Save transcript to location description
      if (voiceTranscript) {
        onLocationChange({
          ...location,
          description: voiceTranscript
        });
      }
    };

    recognition.onerror = (event: any) => {
      setIsVoiceRecording(false);
      if (event.error === 'not-allowed') {
        setVoiceError('Microphone access was denied. Please allow microphone access.');
      } else {
        setVoiceError('Voice input failed. Please try again or type your location.');
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopVoiceRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  // Default map centre (Bomet County).
  const NAIROBI_CENTER: [number, number] = [MAP_CENTER.lat, MAP_CENTER.lng];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-2">
          Where is the issue?
        </h2>
        <p className="text-muted-foreground text-sm">
          Choose one of three ways to tell us the location: tap the map, use your voice, or select from the dropdowns below.
        </p>
      </div>

      {/* Section A: Vanilla Map */}
      <div className="space-y-3">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary" />
          Option 1: Tap on the map
        </h3>
        <p className="text-sm text-muted-foreground">
          Tap on the map to drop a pin, or use your current location.
        </p>
        
        <div 
          className="relative rounded-xl overflow-hidden border border-border"
          role="application"
          aria-label="Map of Nairobi. Use this to select where the issue is."
        >
          <MapContainer
            center={location.coordinates ? [location.coordinates.lat, location.coordinates.lng] : NAIROBI_CENTER}
            zoom={12}
            style={{ height: '280px', width: '100%' }}
            className="z-0"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapClickHandler onLocationSelect={handleMapClick} />
            <UseMyLocationButton onLocationFound={handleMapClick} />
            
            {location.coordinates && (
              <Marker 
                position={[location.coordinates.lat, location.coordinates.lng]}
                icon={locationMarkerIcon}
                draggable={true}
                eventHandlers={{
                  dragend: (e) => {
                    const marker = e.target;
                    const position = marker.getLatLng();
                    handleMapClick(position.lat, position.lng);
                  }
                }}
              />
            )}
          </MapContainer>
        </div>

        {location.coordinates && (
          <div className="flex items-center gap-2 text-sm text-primary bg-primary/10 px-3 py-2 rounded-lg">
            <MapPin className="w-4 h-4" />
            <span>
              Location selected: {location.coordinates.lat.toFixed(5)}, {location.coordinates.lng.toFixed(5)}
            </span>
          </div>
        )}
      </div>

      {/* Section B: Voice Input */}
      <div className="space-y-3 border-t border-border pt-6">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Mic className="w-4 h-4 text-primary" />
          Option 2: Describe with your voice
        </h3>
        <p className="text-sm text-muted-foreground">
          Speak a description of the location, for example: "Near KICC main gate" or "Along Juja Road, opposite Pangani Girls."
        </p>

        <button
          type="button"
          onClick={isVoiceRecording ? stopVoiceRecording : startVoiceRecording}
          className={cn(
            "w-full flex items-center justify-center gap-3 px-4 py-4 rounded-xl font-medium transition-all border-2",
            isVoiceRecording 
              ? "border-destructive bg-destructive/10 text-destructive animate-pulse" 
              : "border-border bg-card text-foreground hover:border-primary/50"
          )}
          aria-label={isVoiceRecording ? "Stop recording" : "Record your voice description of the location"}
        >
          {isVoiceRecording ? (
            <>
              <MicOff className="w-5 h-5" />
              <span>Stop recording...</span>
            </>
          ) : (
            <>
              <Mic className="w-5 h-5" />
              <span>Describe the area with your voice</span>
            </>
          )}
        </button>

        {voiceError && (
          <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
            {voiceError}
          </p>
        )}

        {(voiceTranscript || location.description) && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Voice transcription:
            </label>
            <textarea
              value={location.description || voiceTranscript}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              placeholder="Your voice description will appear here..."
              rows={2}
              className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none text-sm"
            />
          </div>
        )}
      </div>

      {/* Section C: Screen-Reader Friendly Dropdowns */}
      <div className="space-y-4 border-t border-border pt-6">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <ChevronDown className="w-4 h-4 text-primary" />
          Option 3: Select from list
        </h3>
        <p className="text-sm text-muted-foreground">
          Choose your ward, and optionally add a nearby landmark.
        </p>

        {/* Ward dropdown (real Bomet ADMIN wards) */}
        <div>
          <label htmlFor="ward-select" className="block text-sm font-medium text-foreground mb-1.5">
            Ward <span className="text-destructive">*</span>
          </label>
          <select
            id="ward-select"
            value={location.admin.wardCode}
            onChange={(e) => handleWardChange(e.target.value)}
            disabled={wardsLoading}
            className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed appearance-none"
            aria-describedby="ward-help"
          >
            <option value="">{wardsLoading ? 'Loading wards...' : 'Select ward...'}</option>
            {bometWards.map((ward) => (
              <option key={ward.code} value={ward.code}>
                {ward.name}
              </option>
            ))}
          </select>
          <p id="ward-help" className="text-xs text-muted-foreground mt-1">
            {wardsLoading
              ? 'Fetching wards from the county register...'
              : 'The ward where the issue is located'}
          </p>
        </div>

        {/* Free-text landmark field */}
        <div>
          <label htmlFor="landmark-input" className="block text-sm font-medium text-foreground mb-1.5">
            Nearby landmark <span className="text-muted-foreground text-xs">(optional)</span>
          </label>
          <input
            id="landmark-input"
            type="text"
            value={location.description}
            onChange={(e) => handleDescriptionChange(e.target.value)}
            placeholder="e.g., Near KICC, opposite the main entrance"
            className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            aria-describedby="landmark-help"
          />
          <p id="landmark-help" className="text-xs text-muted-foreground mt-1">
            Add a landmark or street name to help us find the exact spot
          </p>
        </div>
      </div>

      {/* Location summary */}
      {(location.coordinates || location.admin.wardCode || location.description) && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-2">
          <h4 className="font-medium text-foreground text-sm">Location Summary</h4>
          <div className="text-sm text-muted-foreground space-y-1">
            {location.coordinates && (
              <p>📍 Map pin: {location.coordinates.lat.toFixed(4)}, {location.coordinates.lng.toFixed(4)}</p>
            )}
            {location.admin.wardCode && location.admin.ward && (
              <p>🏛️ {location.admin.ward}</p>
            )}
            {location.description && (
              <p>📝 {location.description}</p>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

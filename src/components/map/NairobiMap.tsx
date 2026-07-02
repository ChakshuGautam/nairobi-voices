import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation, Mic, MicOff, AlertCircle, Locate } from 'lucide-react';
import { MapGuide } from './MapGuide';
import { LocationCard } from './LocationCard';
import { MAP_CENTER } from '@/lib/config';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom marker icons
const userMarkerIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface NairobiMapProps {
  selectedLocation: { lat: number; lng: number } | null;
  onLocationSelect: (location: { lat: number; lng: number }) => void;
  onLocationDescriptionChange?: (description: string) => void;
  showHappenings?: boolean;
  className?: string;
}

function MapInteractionHandler({ 
  onLocationSelect,
  mapRef,
}: { 
  onLocationSelect: (location: { lat: number; lng: number }) => void;
  mapRef: React.MutableRefObject<L.Map | null>;
}) {
  const map = useMapEvents({
    click: (e) => {
      onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });

  useEffect(() => {
    mapRef.current = map;
  }, [map, mapRef]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && document.activeElement?.closest('.leaflet-container')) {
        const center = map.getCenter();
        onLocationSelect({ lat: center.lat, lng: center.lng });
      }
    };

    const container = map.getContainer();
    container.addEventListener('keydown', handleKeyDown);
    container.setAttribute('tabindex', '0');
    container.setAttribute('role', 'application');
    container.setAttribute('aria-label', 'Interactive map of Nairobi. Click or tap to select a location, or press Enter to mark the center.');
    
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [map, onLocationSelect]);

  return null;
}

function MapCenterButton({ center }: { center: [number, number] }) {
  const map = useMap();
  
  const handleCenter = () => {
    map.setView(center, 13, { animate: true });
  };

  return (
    <button
      type="button"
      onClick={handleCenter}
      className="absolute top-20 right-3 z-[1000] bg-card text-foreground p-2.5 rounded-lg shadow-md hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary border border-border"
      aria-label="Center map on Nairobi CBD"
    >
      <Navigation className="w-5 h-5" aria-hidden="true" />
    </button>
  );
}

function UseMyLocationButton({ onLocationSelect }: { onLocationSelect: (location: { lat: number; lng: number }) => void }) {
  const map = useMap();
  const [isLocating, setIsLocating] = useState(false);
  
  const handleLocate = () => {
    setIsLocating(true);
    
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          map.setView([latitude, longitude], 15, { animate: true });
          onLocationSelect({ lat: latitude, lng: longitude });
          setIsLocating(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  };

  return (
    <button
      type="button"
      onClick={handleLocate}
      disabled={isLocating}
      className="absolute top-32 right-3 z-[1000] bg-card text-foreground p-2.5 rounded-lg shadow-md hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary border border-border disabled:opacity-50"
      aria-label="Use my current location"
    >
      <Locate className={`w-5 h-5 ${isLocating ? 'animate-pulse' : ''}`} aria-hidden="true" />
    </button>
  );
}

export function NairobiMap({ 
  selectedLocation, 
  onLocationSelect,
  onLocationDescriptionChange,
  showHappenings = true,
  className 
}: NairobiMapProps) {
  const [isMapReady, setIsMapReady] = useState(false);
  const [showGuide, setShowGuide] = useState(true);
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [currentLocation] = useState<{ lat: number; lng: number }>({
    lat: MAP_CENTER.lat,
    lng: MAP_CENTER.lng,
  });
  const mapRef = useRef<L.Map | null>(null);

  // County centre (Bomet) as the default map view.
  const nairobiCenter: [number, number] = [MAP_CENTER.lat, MAP_CENTER.lng];

  useEffect(() => {
    const hasSeenGuide = localStorage.getItem('nairobi_map_guide_seen');
    if (hasSeenGuide) {
      setShowGuide(false);
    }
  }, []);

  const handleDismissGuide = () => {
    setShowGuide(false);
    localStorage.setItem('nairobi_map_guide_seen', 'true');
  };

  const handleVoiceCommand = useCallback(async () => {
    setVoiceError(null);
    
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setVoiceError('Voice commands not supported in your browser. Please tap the map instead.');
      return;
    }

    setIsVoiceListening(true);
    
    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        console.log('Voice command:', transcript);
        
        if (transcript.includes('mark') || transcript.includes('here') || transcript.includes('this')) {
          if (mapRef.current) {
            const center = mapRef.current.getCenter();
            onLocationSelect({ lat: center.lat, lng: center.lng });
          }
        }
        setIsVoiceListening(false);
      };
      
      recognition.onerror = () => {
        setVoiceError('Could not hear you. Please try again or tap the map.');
        setIsVoiceListening(false);
      };
      
      recognition.onend = () => {
        setIsVoiceListening(false);
      };
      
      recognition.start();
    } catch (err) {
      setVoiceError('Voice commands not available. Please tap the map.');
      setIsVoiceListening(false);
    }
  }, [onLocationSelect]);

  useEffect(() => {
    const timer = setTimeout(() => setIsMapReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={className}>
      <div className="sr-only" id="map-description">
        Interactive map for selecting a location. You can select a location by clicking or tapping on the map,
        pressing Enter to mark the center, using the location button, or voice commands by saying "Mark here."
      </div>

      <div
        className="map-container relative h-[350px] md:h-[400px]"
        role="application"
        aria-label="Map of Nairobi for selecting location"
        aria-describedby="map-description"
      >
        {showGuide && !selectedLocation && (
          <MapGuide onDismiss={handleDismissGuide} />
        )}

        <MapContainer
          center={nairobiCenter}
          zoom={13}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
          whenReady={() => setIsMapReady(true)}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MapInteractionHandler 
            onLocationSelect={onLocationSelect} 
            mapRef={mapRef}
          />
          <MapCenterButton center={nairobiCenter} />
          <UseMyLocationButton onLocationSelect={onLocationSelect} />
          
          {selectedLocation && (
            <Marker 
              position={[selectedLocation.lat, selectedLocation.lng]} 
              icon={userMarkerIcon}
            >
              <Popup>
                <strong>Your selected location</strong>
              </Popup>
            </Marker>
          )}

          {/* Current Location Indicator - "You are here" */}
          <CircleMarker
            center={[currentLocation.lat, currentLocation.lng]}
            radius={10}
            pathOptions={{
              fillColor: '#4285F4',
              fillOpacity: 1,
              color: '#fff',
              weight: 3,
            }}
          >
            <Popup>
              <div className="flex items-center gap-2 py-1">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                <strong className="text-sm">You are here</strong>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Bomet County</p>
            </Popup>
          </CircleMarker>
          {/* Outer pulse ring for current location */}
          <CircleMarker
            center={[currentLocation.lat, currentLocation.lng]}
            radius={20}
            pathOptions={{
              fillColor: '#4285F4',
              fillOpacity: 0.2,
              color: '#4285F4',
              weight: 1,
              opacity: 0.5,
            }}
          />
        </MapContainer>
        
        {!isMapReady && (
          <div className="absolute inset-0 bg-muted flex items-center justify-center rounded-xl">
            <div className="text-center">
              <MapPin className="w-8 h-8 text-primary animate-pulse mx-auto mb-2" />
              <p className="text-muted-foreground">Loading map...</p>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={handleVoiceCommand}
          disabled={isVoiceListening}
          className={`absolute bottom-4 left-4 z-[1000] flex items-center gap-2 px-4 py-2.5 rounded-lg shadow-md border border-border transition-all ${
            isVoiceListening 
              ? 'bg-destructive text-destructive-foreground animate-pulse' 
              : 'bg-card text-foreground hover:bg-muted'
          }`}
          aria-label={isVoiceListening ? 'Listening for voice command...' : 'Use voice command to mark location'}
        >
          {isVoiceListening ? (
            <>
              <MicOff className="w-5 h-5" aria-hidden="true" />
              <span className="text-sm font-medium">Listening...</span>
            </>
          ) : (
            <>
              <Mic className="w-5 h-5" aria-hidden="true" />
              <span className="text-sm font-medium">Say "Mark here"</span>
            </>
          )}
        </button>
      </div>

      {voiceError && (
        <div 
          className="mt-3 flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm"
          role="alert"
        >
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" aria-hidden="true" />
          <p className="text-destructive">{voiceError}</p>
        </div>
      )}

      {selectedLocation && (
        <LocationCard
          lat={selectedLocation.lat}
          lng={selectedLocation.lng}
          onLocationDescriptionChange={onLocationDescriptionChange}
          className="mt-4"
        />
      )}

      {!selectedLocation && !showGuide && (
        <p className="mt-3 text-sm text-muted-foreground">
          <strong>Tap on the map</strong>, use your location, press Enter, or say "Mark here" to select your location.
        </p>
      )}

      {/* Legend */}
      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#4285F4] border-2 border-white shadow-sm" />
          <span>You are here</span>
        </div>
        {selectedLocation && (
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-primary" />
            <span>Selected</span>
          </div>
        )}
      </div>
    </div>
  );
}

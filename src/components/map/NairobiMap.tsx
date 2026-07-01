import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation, Mic, MicOff, AlertCircle, Locate, Car, Heart, Shield, Droplets, Trash2, Zap, LayoutGrid } from 'lucide-react';
import { MapGuide } from './MapGuide';
import { LocationCard } from './LocationCard';
import { Happening } from '@/types/happenings';
import { happeningsApi } from '@/lib/happeningsApi';
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

// Orange marker for government happenings
const happeningMarkerIcon = new L.DivIcon({
  className: 'happening-marker',
  html: `<div style="
    width: 24px;
    height: 24px;
    background: hsl(var(--secondary));
    border: 3px solid white;
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  "></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12],
});

// Map filter categories with colors
const MAP_FILTERS = [
  { id: 'all', label: 'All', icon: LayoutGrid, color: '#6B7280' },
  { id: 'traffic', label: 'Traffic', icon: Car, color: '#E74C3C' },
  { id: 'health', label: 'Health', icon: Heart, color: '#E91E63' },
  { id: 'safety', label: 'Safety', icon: Shield, color: '#3B82F6' },
  { id: 'water', label: 'Water', icon: Droplets, color: '#06B6D4' },
  { id: 'waste', label: 'Waste', icon: Trash2, color: '#8B5CF6' },
  { id: 'power', label: 'Power', icon: Zap, color: '#F59E0B' },
] as const;

type MapFilterId = typeof MAP_FILTERS[number]['id'];
type ProjectCategory = Exclude<MapFilterId, 'all'>;

// Mock projects data by category around Upper Hill area
export interface MapProject {
  id: string;
  category: ProjectCategory;
  title: string;
  description: string;
  lat: number;
  lng: number;
  status: 'active' | 'planned' | 'completed';
}

export const MOCK_PROJECTS: MapProject[] = [
  // Traffic projects
  { id: 't1', category: 'traffic', title: 'Mbagathi Way Traffic Lights', description: 'New traffic signal installation', lat: -1.2985, lng: 36.8150, status: 'active' },
  { id: 't2', category: 'traffic', title: 'Hospital Road Expansion', description: 'Road widening project', lat: -1.2890, lng: 36.8180, status: 'planned' },
  { id: 't3', category: 'traffic', title: 'Kenyatta Hospital Junction', description: 'Roundabout construction', lat: -1.3010, lng: 36.8090, status: 'active' },
  
  // Health projects
  { id: 'h1', category: 'health', title: 'Upper Hill Clinic Upgrade', description: 'Medical facility renovation', lat: -1.2930, lng: 36.8250, status: 'active' },
  { id: 'h2', category: 'health', title: 'Community Health Center', description: 'New primary care facility', lat: -1.2870, lng: 36.8300, status: 'planned' },
  { id: 'h3', category: 'health', title: 'Mobile Clinic Station', description: 'Weekly mobile health services', lat: -1.2960, lng: 36.8120, status: 'completed' },
  
  // Safety projects
  { id: 's1', category: 'safety', title: 'CCTV Installation Phase 2', description: 'Security camera network expansion', lat: -1.2900, lng: 36.8200, status: 'active' },
  { id: 's2', category: 'safety', title: 'Street Lighting Upgrade', description: 'LED streetlight installation', lat: -1.2950, lng: 36.8280, status: 'active' },
  { id: 's3', category: 'safety', title: 'Police Patrol Post', description: 'New community police booth', lat: -1.2880, lng: 36.8150, status: 'completed' },
  
  // Water projects
  { id: 'w1', category: 'water', title: 'Water Pipeline Repair', description: 'Main pipe replacement', lat: -1.2940, lng: 36.8170, status: 'active' },
  { id: 'w2', category: 'water', title: 'Community Borehole', description: 'New borehole drilling', lat: -1.2910, lng: 36.8260, status: 'planned' },
  { id: 'w3', category: 'water', title: 'Rainwater Harvesting', description: 'Public water collection tanks', lat: -1.2970, lng: 36.8230, status: 'completed' },
  
  // Waste projects
  { id: 'g1', category: 'waste', title: 'Garbage Collection Point', description: 'New waste disposal area', lat: -1.2925, lng: 36.8190, status: 'active' },
  { id: 'g2', category: 'waste', title: 'Recycling Center', description: 'Community recycling facility', lat: -1.2895, lng: 36.8240, status: 'planned' },
  { id: 'g3', category: 'waste', title: 'Street Cleaning Initiative', description: 'Regular cleanup program', lat: -1.2955, lng: 36.8160, status: 'active' },
  
  // Power projects
  { id: 'p1', category: 'power', title: 'Transformer Upgrade', description: 'Power capacity increase', lat: -1.2915, lng: 36.8210, status: 'active' },
  { id: 'p2', category: 'power', title: 'Solar Streetlights', description: 'Renewable energy lighting', lat: -1.2945, lng: 36.8140, status: 'completed' },
  { id: 'p3', category: 'power', title: 'Underground Cabling', description: 'Power line undergrounding', lat: -1.2875, lng: 36.8270, status: 'planned' },
];

// Create category-specific marker icons
const createCategoryIcon = (color: string, iconSvg: string) => new L.DivIcon({
  className: 'category-marker',
  html: `<div style="
    width: 32px;
    height: 32px;
    background: ${color};
    border: 3px solid white;
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    display: flex;
    align-items: center;
    justify-content: center;
  ">${iconSvg}</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

const CATEGORY_ICONS: Record<ProjectCategory, L.DivIcon> = {
  traffic: createCategoryIcon('#E74C3C', '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>'),
  health: createCategoryIcon('#E91E63', '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>'),
  safety: createCategoryIcon('#3B82F6', '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>'),
  water: createCategoryIcon('#06B6D4', '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></svg>'),
  waste: createCategoryIcon('#8B5CF6', '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>'),
  power: createCategoryIcon('#F59E0B', '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/></svg>'),
};

export { MAP_FILTERS };
export type { MapFilterId, ProjectCategory };


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
  const [happenings, setHappenings] = useState<Happening[]>([]);
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<MapFilterId>('all');
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number }>({ 
    lat: -1.2921, 
    lng: 36.8219 
  }); // Upper Hill, Nairobi
  const mapRef = useRef<L.Map | null>(null);
  
  // Upper Hill, Nairobi as default center
  const nairobiCenter: [number, number] = [-1.2921, 36.8219];

  useEffect(() => {
    const hasSeenGuide = localStorage.getItem('nairobi_map_guide_seen');
    if (hasSeenGuide) {
      setShowGuide(false);
    }
  }, []);

  useEffect(() => {
    if (showHappenings) {
      happeningsApi.getAllHappeningsForMap().then(setHappenings);
    }
  }, [showHappenings]);

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
        Interactive map of Nairobi County. You can select a location by clicking or tapping on the map,
        pressing Enter to mark the center, using the location button, or voice commands by saying "Mark here."
        Government project locations are shown as orange markers.
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap gap-2 mb-4" role="group" aria-label="Map category filters">
        {MAP_FILTERS.map((filter) => {
          const Icon = filter.icon;
          const isActive = activeFilter === filter.id;
          return (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                isActive
                  ? 'bg-primary text-primary-foreground border-primary shadow-md'
                  : 'bg-card text-foreground border-border hover:bg-muted hover:border-primary/50'
              }`}
              aria-pressed={isActive}
            >
              <Icon className="w-4 h-4" aria-hidden="true" />
              {filter.label}
            </button>
          );
        })}
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
              <p className="text-xs text-muted-foreground mt-1">Upper Hill, Nairobi</p>
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

          {/* Category Project Markers */}
          {MOCK_PROJECTS
            .filter(project => activeFilter === 'all' || project.category === activeFilter)
            .map((project) => {
              const filterConfig = MAP_FILTERS.find(f => f.id === project.category);
              return (
                <Marker
                  key={project.id}
                  position={[project.lat, project.lng]}
                  icon={CATEGORY_ICONS[project.category]}
                >
                  <Popup>
                    <div className="max-w-[220px]">
                      <div className="flex items-center gap-2 mb-1">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: filterConfig?.color }}
                        />
                        <span className="text-xs font-medium uppercase text-muted-foreground">
                          {filterConfig?.label}
                        </span>
                      </div>
                      <p className="font-semibold text-sm">{project.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{project.description}</p>
                      <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full ${
                        project.status === 'active' ? 'bg-green-100 text-green-700' :
                        project.status === 'planned' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                      </span>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
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
        {activeFilter !== 'all' ? (
          <div className="flex items-center gap-1.5">
            <div 
              className="w-3 h-3 rounded-full border border-white shadow-sm" 
              style={{ backgroundColor: MAP_FILTERS.find(f => f.id === activeFilter)?.color }}
            />
            <span>{MAP_FILTERS.find(f => f.id === activeFilter)?.label} projects</span>
          </div>
        ) : (
          <>
            {MAP_FILTERS.filter(f => f.id !== 'all').map((filter) => (
              <div key={filter.id} className="flex items-center gap-1.5">
                <div 
                  className="w-3 h-3 rounded-full border border-white shadow-sm" 
                  style={{ backgroundColor: filter.color }}
                />
                <span>{filter.label}</span>
              </div>
            ))}
          </>
        )}
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

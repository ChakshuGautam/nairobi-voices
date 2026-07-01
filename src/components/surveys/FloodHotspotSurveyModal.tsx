import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Check, AlertTriangle } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { NAIROBI_WARDS } from '@/types/story';
import { toast } from 'sonner';

// Fix Leaflet default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom flood marker icon
const floodIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface FloodHotspotSurveyModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: FloodHotspotData) => void;
}

export interface FloodHotspotData {
  surveyId: string;
  ward: string;
  location: {
    lat: number;
    lng: number;
  };
  userDescription: string;
  timestamp: string;
}

// Map click handler component
function MapClickHandler({ 
  onLocationSelect 
}: { 
  onLocationSelect: (lat: number, lng: number) => void 
}) {
  useMapEvents({
    click: (e) => {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Draggable marker component
function DraggableMarker({
  position,
  onPositionChange,
}: {
  position: [number, number];
  onPositionChange: (lat: number, lng: number) => void;
}) {
  const markerRef = useRef<L.Marker>(null);

  const eventHandlers = {
    dragend() {
      const marker = markerRef.current;
      if (marker) {
        const latlng = marker.getLatLng();
        onPositionChange(latlng.lat, latlng.lng);
      }
    },
  };

  return (
    <Marker
      position={position}
      draggable={true}
      eventHandlers={eventHandlers}
      ref={markerRef}
      icon={floodIcon}
    />
  );
}

export const FloodHotspotSurveyModal: React.FC<FloodHotspotSurveyModalProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const [ward, setWard] = useState('westlands');
  const [pinLocation, setPinLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [description, setDescription] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [reportCount] = useState(241); // Mock ward report count

  // Get ward center for map
  const selectedWard = NAIROBI_WARDS.find(w => w.code === ward);
  const mapCenter: [number, number] = selectedWard 
    ? [selectedWard.center.lat, selectedWard.center.lng] 
    : [-1.2864, 36.8172];

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setWard('westlands');
      setPinLocation(null);
      setDescription('');
      setIsSubmitted(false);
    }
  }, [open]);

  const handleLocationSelect = (lat: number, lng: number) => {
    setPinLocation({ lat, lng });
  };

  const handleSubmit = () => {
    if (!pinLocation) {
      toast.error('Please drop a pin on the map to mark the flood-prone area.');
      return;
    }

    const data: FloodHotspotData = {
      surveyId: 'survey_005',
      ward: selectedWard?.name || ward,
      location: pinLocation,
      userDescription: description,
      timestamp: new Date().toISOString(),
    };

    onSubmit(data);
    setIsSubmitted(true);
    toast.success('Your flood hotspot has been recorded.');
  };

  if (isSubmitted) {
    return (
      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <DialogContent className="sm:max-w-md bg-card">
          <div className="py-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-success/10 flex items-center justify-center">
              <Check className="w-10 h-10 text-success" aria-hidden="true" />
            </div>
            <DialogHeader className="mb-4">
              <DialogTitle className="text-2xl">Thank You!</DialogTitle>
              <DialogDescription className="text-base mt-2">
                Your flood hotspot has been recorded. This data helps the county plan better drainage infrastructure.
              </DialogDescription>
            </DialogHeader>
            <p className="text-sm text-muted-foreground mb-6">
              <span className="font-semibold text-info">{reportCount + 1}</span> reports so far in {selectedWard?.name || 'your ward'}.
            </p>
            <Button onClick={onClose} className="ncc-btn-primary">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent 
        className="sm:max-w-lg max-h-[90vh] overflow-y-auto bg-card"
        aria-describedby="flood-survey-description"
      >
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-warning" aria-hidden="true" />
            <DialogTitle className="text-xl font-bold text-foreground">
              Flood Hotspot Mapping
            </DialogTitle>
          </div>
          <DialogDescription id="flood-survey-description" className="text-muted-foreground">
            Help identify flood-prone areas before the next rainy season.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-5">
          {/* Question */}
          <p className="font-semibold text-foreground">
            Which area in your ward floods most frequently?
          </p>

          {/* Ward Selector */}
          <div className="space-y-2">
            <Label htmlFor="ward-select">Your Ward</Label>
            <Select value={ward} onValueChange={setWard}>
              <SelectTrigger id="ward-select" className="w-full bg-background">
                <SelectValue placeholder="Select your ward" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                {NAIROBI_WARDS.map((w) => (
                  <SelectItem key={w.code} value={w.code}>
                    {w.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Map */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-info" aria-hidden="true" />
              Drop a pin on the flood-prone area
            </Label>
            <p className="text-xs text-muted-foreground mb-2">
              Tap or click on the map to place a marker. You can drag it to adjust.
            </p>
            <div 
              className="rounded-lg overflow-hidden border border-border"
              style={{ height: '280px' }}
              role="application"
              aria-label="Interactive map for selecting flood location"
            >
              <MapContainer
                center={mapCenter}
                zoom={14}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={false}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapClickHandler onLocationSelect={handleLocationSelect} />
                {pinLocation && (
                  <DraggableMarker
                    position={[pinLocation.lat, pinLocation.lng]}
                    onPositionChange={handleLocationSelect}
                  />
                )}
              </MapContainer>
            </div>
            {pinLocation && (
              <p className="text-xs text-muted-foreground">
                📍 Location: {pinLocation.lat.toFixed(5)}, {pinLocation.lng.toFixed(5)}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="flood-description">
              Describe the location <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="flood-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="E.g., Near Kangemi Market, along Naivasha Rd underpass, next to a stage, close to a drainage channel..."
              className="min-h-[80px] bg-background resize-none"
              maxLength={300}
            />
            <p className="text-xs text-muted-foreground text-right">
              {description.length}/300
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={!pinLocation}
              className="flex-1 bg-success hover:bg-success/90 text-success-foreground disabled:opacity-50"
            >
              Submit Response
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

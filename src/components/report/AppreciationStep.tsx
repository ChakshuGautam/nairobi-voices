import React, { useState } from 'react';
import { Heart, Camera, Mic, Upload, X } from 'lucide-react';
import { StarRating } from './StarRating';
import { VoiceRecorder } from '@/components/voice/VoiceRecorder';
import { cn } from '@/lib/utils';

const DEPARTMENTS = [
  'Environment',
  'Water and Sewerage',
  'Works',
  'Public Health',
  'Mobility and ICT Infrastructure',
  'Finance and Economic Planning',
  'Education and Youth Affairs',
  'Lands, Urban Planning and Housing',
];

const WARDS = [
  'Westlands', 'Kilimani', 'Kileleshwa', 'Lavington', 'Parklands/Highridge',
  'Karura', 'Karen', 'Langata', 'Nairobi South', 'Upper Hill', 'Starehe',
  'Kasarani', 'Roysambu', 'Ruaraka', 'Embakasi', 'Dandora', 'Kayole',
];

export interface AppreciationData {
  department: string;
  ward: string;
  staffOrTeam: string;
  message: string;
  rating: number;
  photo: File | null;
  audioRecording: { blob: Blob; duration: number } | null;
}

interface AppreciationStepProps {
  data: AppreciationData;
  onDataChange: (data: AppreciationData) => void;
}

export const AppreciationStep: React.FC<AppreciationStepProps> = ({
  data,
  onDataChange,
}) => {
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const updateField = <K extends keyof AppreciationData>(
    field: K,
    value: AppreciationData[K]
  ) => {
    onDataChange({ ...data, [field]: value });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateField('photo', file);
      const reader = new FileReader();
      reader.onload = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    updateField('photo', null);
    setPhotoPreview(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Heart className="w-8 h-8 text-secondary" />
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">
          Share Your Appreciation
        </h2>
        <p className="text-muted-foreground">
          Your appreciation helps celebrate great work and motivates better service.
        </p>
      </div>

      {/* Department Selection */}
      <div>
        <label htmlFor="department" className="block text-sm font-semibold text-foreground mb-2">
          Department / Service Area <span className="text-destructive">*</span>
        </label>
        <select
          id="department"
          value={data.department}
          onChange={(e) => updateField('department', e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Select a department</option>
          {DEPARTMENTS.map((dept) => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>
      </div>

      {/* Ward Selection */}
      <div>
        <label htmlFor="ward" className="block text-sm font-semibold text-foreground mb-2">
          Ward <span className="text-muted-foreground font-normal">(optional)</span>
        </label>
        <select
          id="ward"
          value={data.ward}
          onChange={(e) => updateField('ward', e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Select a ward</option>
          {WARDS.map((ward) => (
            <option key={ward} value={ward}>{ward}</option>
          ))}
        </select>
      </div>

      {/* Staff/Team */}
      <div>
        <label htmlFor="staffOrTeam" className="block text-sm font-semibold text-foreground mb-2">
          Staff / Team <span className="text-muted-foreground font-normal">(optional)</span>
        </label>
        <input
          id="staffOrTeam"
          type="text"
          value={data.staffOrTeam}
          onChange={(e) => updateField('staffOrTeam', e.target.value)}
          placeholder="Who or which team would you like to appreciate?"
          className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Message */}
      <div>
        <label htmlFor="message" className="block text-sm font-semibold text-foreground mb-2">
          Your Message <span className="text-destructive">*</span>
        </label>
        <textarea
          id="message"
          value={data.message}
          onChange={(e) => updateField('message', e.target.value)}
          placeholder="e.g., The waste collection team in Kileleshwa arrived early and cleaned up the street efficiently."
          rows={4}
          className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          maxLength={1000}
        />
        <p className="text-xs text-muted-foreground mt-1 text-right">
          {data.message.length}/1000
        </p>
      </div>

      {/* Rating */}
      <div>
        <StarRating
          rating={data.rating}
          onRatingChange={(rating) => updateField('rating', rating)}
          label="How satisfied were you? (optional)"
        />
      </div>

      {/* Photo & Audio */}
      <div className="space-y-4">
        <p className="text-sm font-semibold text-foreground">
          Add a photo or voice note <span className="text-muted-foreground font-normal">(optional)</span>
        </p>

        <div className="flex gap-3">
          {/* Photo Upload */}
          <label
            className={cn(
              'flex-1 flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 border-dashed cursor-pointer transition-all',
              photoPreview
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            )}
          >
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
            {photoPreview ? (
              <div className="relative">
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    removePhoto();
                  }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <Camera className="w-6 h-6 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Add Photo</span>
              </>
            )}
          </label>

          {/* Voice Note Toggle */}
          <button
            type="button"
            onClick={() => setShowVoiceRecorder(!showVoiceRecorder)}
            className={cn(
              'flex-1 flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 border-dashed transition-all',
              data.audioRecording || showVoiceRecorder
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            )}
          >
            <Mic className="w-6 h-6 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {data.audioRecording ? 'Recording added' : 'Add Voice Note'}
            </span>
          </button>
        </div>

        {/* Voice Recorder */}
        {showVoiceRecorder && (
          <div className="bg-muted/30 rounded-lg p-4">
            <VoiceRecorder
              onRecordingComplete={(blob, duration) => 
                updateField('audioRecording', { blob, duration })
              }
              onRecordingClear={() => updateField('audioRecording', null)}
              existingRecording={data.audioRecording}
            />
          </div>
        )}
      </div>
    </div>
  );
};

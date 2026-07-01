import React, { useState } from 'react';
import { Send, FileText, Mic, ChevronDown, ChevronUp, MapPin, AlertCircle, CheckCircle } from 'lucide-react';
import { VoiceRecorder } from '@/components/voice/VoiceRecorder';
import { StoryCategory, CATEGORY_LABELS, CATEGORY_DESCRIPTIONS, NAIROBI_WARDS, StorySubmission } from '@/types/story';
import { cn } from '@/lib/utils';

interface NewStoryPanelProps {
  selectedLocation: { lat: number; lng: number } | null;
  onSubmit: (submission: StorySubmission) => Promise<void>;
  className?: string;
}

type InputMode = 'text' | 'voice';

export function NewStoryPanel({ selectedLocation, onSubmit, className }: NewStoryPanelProps) {
  const [category, setCategory] = useState<StoryCategory>('complaint');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [locationText, setLocationText] = useState('');
  const [inputMode, setInputMode] = useState<InputMode>('text');
  const [recording, setRecording] = useState<{ blob: Blob; duration: number } | null>(null);
  const [wardCode, setWardCode] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [reporterPhone, setReporterPhone] = useState('');
  const [showContactFields, setShowContactFields] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const hasContent = inputMode === 'text' ? description.trim().length > 0 : recording !== null;
  const hasLocation = selectedLocation !== null || locationText.trim().length > 0;
  const canSubmit = title.trim().length > 0 && hasContent && hasLocation;

  const handleRecordingComplete = (blob: Blob, duration: number) => {
    setRecording({ blob, duration });
  };

  const handleRecordingClear = () => {
    setRecording(null);
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setRecording(null);
    setLocationText('');
    setWardCode('');
    setReporterName('');
    setReporterPhone('');
    setShowContactFields(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canSubmit || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage('');
    setSubmitStatus('idle');

    try {
      const submission: StorySubmission = {
        category,
        title: title.trim(),
        description: inputMode === 'text' ? description.trim() : undefined,
        audioBlob: inputMode === 'voice' ? recording?.blob : undefined,
        audioDuration: inputMode === 'voice' ? recording?.duration : undefined,
        lat: selectedLocation?.lat,
        lng: selectedLocation?.lng,
        locationDescription: locationText.trim() || undefined,
        wardCode: wardCode || undefined,
        reporterName: reporterName.trim() || undefined,
        reporterPhone: reporterPhone.trim() || undefined,
      };

      await onSubmit(submission);
      setSubmitStatus('success');
      resetForm();
      
      // Reset success status after 3 seconds
      setTimeout(() => setSubmitStatus('idle'), 3000);
    } catch (err) {
      console.error('Error submitting story:', err);
      setErrorMessage('We could not save your story. Please try again.');
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn('bg-card rounded-2xl shadow-medium border border-border', className)}>
      <form onSubmit={handleSubmit} className="p-5 md:p-6 space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-foreground">Share Your Story</h2>
          <p className="text-muted-foreground mt-1">
            Tell us what is happening in your area
          </p>
        </div>

        {/* Success message */}
        {submitStatus === 'success' && (
          <div 
            className="flex items-center gap-3 p-4 bg-success/10 border border-success/30 rounded-lg"
            role="alert"
            aria-live="polite"
          >
            <CheckCircle className="w-6 h-6 text-success" aria-hidden="true" />
            <p className="text-success font-medium">Your story has been shared! Thank you.</p>
          </div>
        )}

        {/* Error message */}
        {submitStatus === 'error' && errorMessage && (
          <div 
            className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/30 rounded-lg"
            role="alert"
            aria-live="assertive"
          >
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-destructive font-medium">{errorMessage}</p>
          </div>
        )}

        {/* Category selection */}
        <fieldset>
          <legend className="text-lg font-semibold text-foreground mb-3">
            What kind of story is this?
          </legend>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(Object.keys(CATEGORY_LABELS) as StoryCategory[]).map((cat) => (
              <label
                key={cat}
                className={cn(
                  'flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all',
                  'hover:border-primary/50 focus-within:ring-2 focus-within:ring-primary',
                  category === cat
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-card'
                )}
              >
                <input
                  type="radio"
                  name="category"
                  value={cat}
                  checked={category === cat}
                  onChange={(e) => setCategory(e.target.value as StoryCategory)}
                  className="sr-only"
                />
                <span className={cn(
                  'text-sm font-bold uppercase tracking-wide mb-1',
                  cat === 'complaint' && 'text-complaint',
                  cat === 'idea' && 'text-idea',
                  cat === 'appreciation' && 'text-success'
                )}>
                  {CATEGORY_LABELS[cat]}
                </span>
                <span className="text-sm text-muted-foreground">
                  {CATEGORY_DESCRIPTIONS[cat]}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Title */}
        <div>
          <label htmlFor="story-title" className="block text-lg font-semibold text-foreground mb-2">
            Short title <span className="text-destructive" aria-label="required">*</span>
          </label>
          <input
            id="story-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Example: Broken water pipe on Main Street"
            className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            required
            aria-describedby="title-hint"
            maxLength={100}
          />
          <p id="title-hint" className="mt-1 text-sm text-muted-foreground">
            A short description of what is happening (max 100 characters)
          </p>
        </div>

        {/* Input mode toggle */}
        <fieldset>
          <legend className="text-lg font-semibold text-foreground mb-3">
            How do you want to tell your story?
          </legend>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setInputMode('text')}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all',
                'border-2 focus-visible:ring-2 focus-visible:ring-primary',
                inputMode === 'text'
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card text-foreground hover:border-primary/50'
              )}
              aria-pressed={inputMode === 'text'}
            >
              <FileText className="w-5 h-5" aria-hidden="true" />
              <span>Type it</span>
            </button>
            <button
              type="button"
              onClick={() => setInputMode('voice')}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all',
                'border-2 focus-visible:ring-2 focus-visible:ring-primary',
                inputMode === 'voice'
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card text-foreground hover:border-primary/50'
              )}
              aria-pressed={inputMode === 'voice'}
            >
              <Mic className="w-5 h-5" aria-hidden="true" />
              <span>Record it</span>
            </button>
          </div>
        </fieldset>

        {/* Text input */}
        {inputMode === 'text' && (
          <div>
            <label htmlFor="story-description" className="block text-lg font-semibold text-foreground mb-2">
              Tell us more <span className="text-destructive" aria-label="required">*</span>
            </label>
            <textarea
              id="story-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what is happening, where exactly, and any other details that might help..."
              rows={5}
              className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              required={inputMode === 'text'}
              maxLength={1000}
            />
            <p className="mt-1 text-sm text-muted-foreground">
              {description.length}/1000 characters
            </p>
          </div>
        )}

        {/* Voice input */}
        {inputMode === 'voice' && (
          <div>
            <p className="text-lg font-semibold text-foreground mb-3">
              Record your message <span className="text-destructive" aria-label="required">*</span>
            </p>
            <VoiceRecorder
              onRecordingComplete={handleRecordingComplete}
              onRecordingClear={handleRecordingClear}
              existingRecording={recording}
            />
          </div>
        )}

        {/* Location text fallback */}
        {!selectedLocation && (
          <div>
            <label htmlFor="location-text" className="block text-lg font-semibold text-foreground mb-2">
              <MapPin className="inline w-5 h-5 mr-1" aria-hidden="true" />
              Describe the location
            </label>
            <input
              id="location-text"
              type="text"
              value={locationText}
              onChange={(e) => setLocationText(e.target.value)}
              placeholder="Example: Near the main market, opposite the post office"
              className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              aria-describedby="location-hint"
            />
            <p id="location-hint" className="mt-1 text-sm text-muted-foreground">
              If you cannot use the map, describe where this is happening
            </p>
          </div>
        )}

        {/* Ward selection */}
        <div>
          <label htmlFor="ward-select" className="block text-lg font-semibold text-foreground mb-2">
            Ward (optional)
          </label>
          <select
            id="ward-select"
            value={wardCode}
            onChange={(e) => setWardCode(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Select your ward...</option>
            {NAIROBI_WARDS.map((ward) => (
              <option key={ward.code} value={ward.code}>
                {ward.name}
              </option>
            ))}
          </select>
        </div>

        {/* Contact info (collapsible) */}
        <div className="border border-border rounded-lg">
          <button
            type="button"
            onClick={() => setShowContactFields(!showContactFields)}
            className="w-full flex items-center justify-between px-4 py-3 text-left font-medium text-foreground hover:bg-muted/50 rounded-lg focus-visible:ring-2 focus-visible:ring-primary"
            aria-expanded={showContactFields}
            aria-controls="contact-fields"
          >
            <span>Add your contact info (optional)</span>
            {showContactFields ? (
              <ChevronUp className="w-5 h-5" aria-hidden="true" />
            ) : (
              <ChevronDown className="w-5 h-5" aria-hidden="true" />
            )}
          </button>
          
          {showContactFields && (
            <div id="contact-fields" className="px-4 pb-4 space-y-4">
              <p className="text-sm text-muted-foreground">
                If you want us to contact you about this, please share your details.
              </p>
              <div>
                <label htmlFor="reporter-name" className="block font-medium text-foreground mb-1">
                  Your name
                </label>
                <input
                  id="reporter-name"
                  type="text"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label htmlFor="reporter-phone" className="block font-medium text-foreground mb-1">
                  Phone number
                </label>
                <input
                  id="reporter-phone"
                  type="tel"
                  value={reporterPhone}
                  onChange={(e) => setReporterPhone(e.target.value)}
                  placeholder="07XX XXX XXX"
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          )}
        </div>

        {/* Validation message */}
        {!canSubmit && (
          <p className="text-muted-foreground text-sm" role="status">
            Please fill in: 
            {!title.trim() && ' a title,'}
            {!hasContent && (inputMode === 'text' ? ' a description,' : ' a voice recording,')}
            {!hasLocation && ' a location (on map or in text).'}
          </p>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={!canSubmit || isSubmitting}
          className={cn(
            'w-full btn-secondary text-lg py-4',
            (!canSubmit || isSubmitting) && 'opacity-50 cursor-not-allowed'
          )}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="animate-pulse-soft">Sending...</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5" aria-hidden="true" />
              <span>Share Your Story</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}

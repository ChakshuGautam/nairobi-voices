import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, FileText, Mic, User, ChevronDown, Users } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ReportStepper } from '@/components/report/ReportStepper';
import { CategoryPicker } from '@/components/report/CategoryPicker';
import { PhotoUpload } from '@/components/report/PhotoUpload';

import { VoiceRecorder } from '@/components/voice/VoiceRecorder';
import { LocationStep, LocationData } from '@/components/report/LocationStep';
import { ComplaintIntentStep, ComplaintIntent, LinkedProject } from '@/components/report/ComplaintIntentStep';
import { apiClient } from '@/lib/apiClient';
import { ensureSession, getSession, isValidKeMobile } from '@/lib/auth';
import { mapServiceCodeToIssueCategory } from '@/lib/digitMappers';
import { StorySubmission, IssueCategory, NairobiDepartment, CATEGORY_TO_DEPARTMENT, NAIROBI_DEPARTMENTS, DepartmentSelectionSource } from '@/types/story';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Building2, Info } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

const RELATIONSHIP_OPTIONS = [
  "Family member",
  "Neighbour", 
  "Community group",
  "Other"
];

const STANDARD_STEPS = [
  { number: 1, label: 'Intent' },
  { number: 2, label: 'Location' },
  { number: 3, label: 'Category' },
  { number: 4, label: 'Photos' },
  { number: 5, label: 'Details' },
  { number: 6, label: 'Submit' },
];

const Report = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketId, setTicketId] = useState<string | null>(null);

  // Form state
  const [locationData, setLocationData] = useState<LocationData>({
    coordinates: null,
    admin: { subCounty: '', ward: '', wardCode: '', zone: '' },
    description: ''
  });
  const [complaintIntent, setComplaintIntent] = useState<ComplaintIntent | null>(null);
  const [linkedProject, setLinkedProject] = useState<LinkedProject | null>(null);
  const [issueCategory, setIssueCategory] = useState<IssueCategory | null>(null);
  // Live Bomet PGR serviceCode + display name selected via the category picker.
  const [serviceCode, setServiceCode] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState<string>('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [inputMode, setInputMode] = useState<'text' | 'voice'>('text');
  const [recording, setRecording] = useState<{ blob: Blob; duration: number } | null>(null);
  
  const [reporterName, setReporterName] = useState('');
  const [reporterPhone, setReporterPhone] = useState('');
  const [shareContactWithDepartment, setShareContactWithDepartment] = useState(true);
  const [isOnBehalf, setIsOnBehalf] = useState(false);
  const [beneficiaryName, setBeneficiaryName] = useState('');
  const [beneficiaryPhone, setBeneficiaryPhone] = useState('');
  const [beneficiaryRelationship, setBeneficiaryRelationship] = useState('');
  const [beneficiaryReceiveUpdates, setBeneficiaryReceiveUpdates] = useState(false);
  const [responsibleDepartment, setResponsibleDepartment] = useState<NairobiDepartment>('To be assigned');
  const [departmentSelectionSource, setDepartmentSelectionSource] = useState<DepartmentSelectionSource>('AUTO');

  // Pre-fill contact info from the real citizen session, if one exists.
  // Never pre-fill from anything else: a made-up default would silently file
  // real PGR complaints under a phantom citizen.
  useEffect(() => {
    const session = getSession();
    if (session) {
      setReporterName(session.user?.name ?? '');
      setReporterPhone(session.mobile ?? '');
    }
  }, []);
  
  const STEPS = STANDARD_STEPS;
  const maxStep = 6;

  const canProceed = () => {
    switch (currentStep) {
      case 1: return complaintIntent !== null;
      case 2:
        return locationData.coordinates !== null ||
               Boolean(locationData.admin.wardCode) ||
               locationData.description.trim().length > 0;
      case 3:
        return complaintIntent === 'feedback' || serviceCode !== null;
      case 4: return true;
      case 5: return title.trim().length > 0 && (description.trim().length > 0 || recording !== null);
      case 6: return true;
      default: return false;
    }
  };

  const handleNext = () => {
    if (currentStep < maxStep) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleIntentChange = (intent: ComplaintIntent) => {
    setComplaintIntent(intent);
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    // Phone is required to file against DIGIT PGR (it's the citizen identity).
    const phone = reporterPhone.trim();
    if (!isValidKeMobile(phone)) {
      toast.error('A valid phone number is required', {
        description: 'Enter your Kenyan mobile number (e.g. 0712 345 678) so we can create your ticket and send you updates.',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Ensure a citizen session up-front (R2) so auth failures surface clearly
      // and separately from create failures. createStory reuses this session.
      await ensureSession(phone, reporterName.trim() || undefined);

      const submission: StorySubmission = {
        category: 'complaint',
        issueCategory: issueCategory ?? undefined,
        serviceCode: serviceCode ?? undefined,
        title: title.trim(),
        description: inputMode === 'text' ? description.trim() : undefined,
        audioBlob: inputMode === 'voice' ? recording?.blob : undefined,
        audioDuration: inputMode === 'voice' ? recording?.duration : undefined,
        photos: photos.length > 0 ? photos : undefined,
        lat: locationData.coordinates?.lat,
        lng: locationData.coordinates?.lng,
        locationDescription: locationData.description.trim() || undefined,
        wardCode: locationData.admin.wardCode || undefined,
        wardName: locationData.admin.ward || undefined,
        reporterName: reporterName.trim() || undefined,
        reporterPhone: phone,
        shareContactWithDepartment,
        responsibleDepartment,
        departmentSelectionSource,
        beneficiary: isOnBehalf ? {
          isOnBehalf: true,
          name: beneficiaryName.trim() || undefined,
          phone: beneficiaryPhone.trim() || undefined,
          relationship: beneficiaryRelationship || undefined,
          receiveUpdates: beneficiaryReceiveUpdates,
        } : undefined,
      };

      const result = await apiClient.createStory(submission);
      setTicketId(result.ticketId);
    } catch (err) {
      console.error('Error submitting:', err);
      toast.error('Could not submit your report', {
        description: err instanceof Error
          ? err.message
          : 'Something went wrong. Please check your connection and try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (ticketId) {
    return (
      <AppLayout>
        <div className="max-w-lg mx-auto text-center py-12">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Report Submitted!
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            Your ticket ID is:
          </p>
          <p className="text-2xl font-mono font-bold text-primary bg-primary/10 px-6 py-3 rounded-lg inline-block mb-8">
            {ticketId}
          </p>
          <p className="text-muted-foreground mb-8">
            Save this ID to track your report. We'll work on resolving your issue as soon as possible.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/my-tickets')}
              className="btn-primary"
            >
              View My Tickets
            </button>
            <button
              onClick={() => navigate('/')}
              className="btn-secondary"
            >
              Back to Home
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          Share Your Voice
        </h1>
        <p className="text-muted-foreground">
          Help us build a better Nairobi together.
        </p>
      </div>

      {/* Stepper */}
      <ReportStepper steps={STEPS} currentStep={currentStep} className="mb-8" />

      {/* Step Content */}
      <div className="bg-card rounded-2xl border border-border p-5 md:p-6 mb-6">
        {/* Step 1: Intent */}
        {currentStep === 1 && (
          <ComplaintIntentStep
            intent={complaintIntent}
            onIntentChange={handleIntentChange}
            linkedProject={linkedProject}
            onLinkedProjectChange={setLinkedProject}
            wardCode={locationData.admin.wardCode}
          />
        )}

        {/* Standard Flow - Step 2: Location */}
        {currentStep === 2 && (
          <LocationStep 
            location={locationData}
            onLocationChange={setLocationData}
            intent={complaintIntent}
            linkedProject={linkedProject}
            onLinkedProjectChange={setLinkedProject}
          />
        )}

        {/* Standard Flow - Step 3: Category */}
        {currentStep === 3 && (
          <CategoryPicker
            selected={serviceCode}
            onSelect={(def) => {
              setServiceCode(def.serviceCode);
              setCategoryName(def.name);
              // Derive a best-effort IssueCategory so the department auto-map and
              // downstream Story rendering stay consistent with the live code.
              const derived = mapServiceCodeToIssueCategory(def.serviceCode, def.name);
              setIssueCategory(derived);
              const mappedDept = CATEGORY_TO_DEPARTMENT[derived];
              setResponsibleDepartment(mappedDept);
              setDepartmentSelectionSource('AUTO');
            }}
          />
        )}

        {/* Standard Flow - Step 4: Photos */}
        {currentStep === 4 && (
          <PhotoUpload
            photos={photos}
            onPhotosChange={setPhotos}
            maxPhotos={3}
          />
        )}

        {/* Standard Flow - Step 5: Details */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-lg font-semibold text-foreground mb-2">
                Short title <span className="text-destructive">*</span>
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Large pothole on Kenyatta Avenue"
                className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                maxLength={100}
              />
            </div>

            {/* Department Assignment Section (read-only) */}
            <div className="bg-muted/30 rounded-xl p-4 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-5 h-5 text-primary" />
                <span className="font-semibold text-foreground">Who will handle this?</span>
              </div>
              <p className="text-sm text-muted-foreground">
                The responsible department is assigned automatically based on the complaint
                type you selected. You don't need to choose one.
              </p>
            </div>

            <fieldset>
              <legend className="text-lg font-semibold text-foreground mb-3">
                Describe the issue
              </legend>
              <div className="flex gap-3 mb-4">
                <button
                  type="button"
                  onClick={() => setInputMode('text')}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all border-2',
                    inputMode === 'text'
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-card text-foreground hover:border-primary/50'
                  )}
                >
                  <FileText className="w-5 h-5" />
                  <span>Type it</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('voice')}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all border-2',
                    inputMode === 'voice'
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-card text-foreground hover:border-primary/50'
                  )}
                >
                  <Mic className="w-5 h-5" />
                  <span>Record it</span>
                </button>
              </div>

              {inputMode === 'text' ? (
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the issue in detail..."
                  rows={5}
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  maxLength={1000}
                />
              ) : (
                <VoiceRecorder
                  onRecordingComplete={(blob, duration) => setRecording({ blob, duration })}
                  onRecordingClear={() => setRecording(null)}
                  existingRecording={recording}
                />
              )}
            </fieldset>

            {/* Contact Info Section */}
            <div className="bg-muted/30 rounded-xl p-4 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-5 h-5 text-primary" />
                <span className="font-semibold text-foreground">Your contact info (optional)</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                We'll use this only to send you updates about this issue.
              </p>
              
              <div className="grid gap-4 sm:grid-cols-2 mb-4">
                <div>
                  <label htmlFor="reporter-name" className="block font-medium text-foreground mb-1 text-sm">
                    Name
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
                  <label htmlFor="reporter-phone" className="block font-medium text-foreground mb-1 text-sm">
                    Phone
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

              {/* Privacy Checkbox */}
              <div className="flex items-start gap-3 py-3 border-t border-border">
                <Checkbox
                  id="share-contact"
                  checked={!shareContactWithDepartment}
                  onCheckedChange={(checked) => setShareContactWithDepartment(!checked)}
                  aria-label="Do not share my contact with departments"
                />
                <div className="flex-1">
                  <label 
                    htmlFor="share-contact" 
                    className="text-sm font-medium text-foreground cursor-pointer"
                  >
                    Don't share my information with departments handling this issue
                  </label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    We'll use your contact only to send you updates about this issue.
                  </p>
                </div>
              </div>

              {/* On Behalf Checkbox */}
              <Collapsible open={isOnBehalf} onOpenChange={setIsOnBehalf}>
                <div className="flex items-start gap-3 py-3 border-t border-border">
                  <CollapsibleTrigger asChild>
                    <Checkbox
                      id="on-behalf"
                      checked={isOnBehalf}
                      onCheckedChange={(checked) => setIsOnBehalf(checked === true)}
                      aria-expanded={isOnBehalf}
                    />
                  </CollapsibleTrigger>
                  <div className="flex-1">
                    <label 
                      htmlFor="on-behalf" 
                      className="text-sm font-medium text-foreground cursor-pointer flex items-center gap-2"
                    >
                      <Users className="w-4 h-4" />
                      I am filing this on behalf of someone else
                    </label>
                  </div>
                </div>

                <CollapsibleContent className="pt-3 border-t border-border/50 mt-3">
                  <div className="space-y-4 pl-7">
                    <div>
                      <label htmlFor="beneficiary-name" className="block font-medium text-foreground mb-1 text-sm">
                        Person's name
                      </label>
                      <input
                        id="beneficiary-name"
                        type="text"
                        value={beneficiaryName}
                        onChange={(e) => setBeneficiaryName(e.target.value)}
                        placeholder="e.g., My neighbour, James"
                        className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="beneficiary-phone" className="block font-medium text-foreground mb-1 text-sm">
                          Their phone (optional)
                        </label>
                        <input
                          id="beneficiary-phone"
                          type="tel"
                          value={beneficiaryPhone}
                          onChange={(e) => setBeneficiaryPhone(e.target.value)}
                          placeholder="07XX XXX XXX"
                          className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label htmlFor="beneficiary-relationship" className="block font-medium text-foreground mb-1 text-sm">
                          Relationship (optional)
                        </label>
                        <Select
                          value={beneficiaryRelationship}
                          onValueChange={setBeneficiaryRelationship}
                        >
                          <SelectTrigger id="beneficiary-relationship" className="bg-background">
                            <SelectValue placeholder="Select relationship" />
                          </SelectTrigger>
                          <SelectContent className="bg-popover">
                            {RELATIONSHIP_OPTIONS.map((rel) => (
                              <SelectItem key={rel} value={rel}>{rel}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    {beneficiaryPhone && (
                      <div className="flex items-center gap-3">
                        <Checkbox
                          id="beneficiary-updates"
                          checked={beneficiaryReceiveUpdates}
                          onCheckedChange={(checked) => setBeneficiaryReceiveUpdates(checked === true)}
                        />
                        <label 
                          htmlFor="beneficiary-updates" 
                          className="text-sm text-foreground cursor-pointer"
                        >
                          Send updates to them as well
                        </label>
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </div>
        )}

        {/* Standard Flow - Step 6: Review & Submit */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-foreground">
              Review your report
            </h2>
            
            <div className="space-y-4 text-sm">
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Location</span>
                <span className="text-foreground font-medium text-right max-w-[60%]">
                  {locationData.coordinates
                    ? `${locationData.coordinates.lat.toFixed(4)}, ${locationData.coordinates.lng.toFixed(4)}`
                    : locationData.admin.ward
                      ? locationData.admin.ward
                      : locationData.description || 'Not specified'}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Category</span>
                <span className="text-foreground font-medium">{categoryName || issueCategory}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Photos</span>
                <span className="text-foreground font-medium">{photos.length} attached</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Title</span>
                <span className="text-foreground font-medium">{title}</span>
              </div>
              <div className="py-2 border-b border-border">
                <span className="text-muted-foreground block mb-1">Description</span>
                <span className="text-foreground">
                  {inputMode === 'text' ? description : '🎤 Voice recording attached'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={handleBack}
          disabled={currentStep === 1}
          className={cn(
            'flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all',
            currentStep === 1
              ? 'opacity-0 pointer-events-none'
              : 'bg-muted text-foreground hover:bg-muted/80'
          )}
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        {currentStep < maxStep ? (
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className="btn-primary flex items-center gap-2"
          >
            <span>Next</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="btn-primary flex items-center gap-2"
          >
            {isSubmitting ? (
              <span className="animate-pulse">Submitting...</span>
            ) : (
              <>
                <Check className="w-5 h-5" />
                <span>Submit Report</span>
              </>
            )}
          </button>
        )}
      </div>
    </AppLayout>
  );
};

export default Report;

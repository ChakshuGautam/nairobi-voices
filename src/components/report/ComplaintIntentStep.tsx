import React, { useState } from 'react';
import { Mic, MicOff, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ComplaintIntent = 'service' | 'project' | 'feedback' | 'appreciation';

export interface LinkedProject {
  id: string;
  title: string;
  category: string;
  status: 'Planned' | 'Ongoing' | 'Completed';
  agency: string;
}

interface ComplaintIntentStepProps {
  intent: ComplaintIntent | null;
  onIntentChange: (intent: ComplaintIntent) => void;
  linkedProject: LinkedProject | null;
  onLinkedProjectChange: (project: LinkedProject | null) => void;
  wardCode?: string;
}

const INTENT_OPTIONS = [
  {
    id: 'service' as ComplaintIntent,
    icon: '🧾',
    title: 'Report a Service Issue',
    description: 'Help us fix problems with water, waste, street lighting, traffic, or other county services.',
    examples: 'e.g., "Garbage not collected", "Streetlight not working"'
  },
  {
    id: 'project' as ComplaintIntent,
    icon: '🚧',
    title: 'Share Project Feedback',
    description: 'Share your experience or feedback about an ongoing or completed county project.',
    examples: 'e.g., "Construction update needed", "Great progress on road works"'
  },
  {
    id: 'feedback' as ComplaintIntent,
    icon: '💬',
    title: 'Give Us a Suggestion',
    description: 'Share ideas or general comments to help improve our community.',
    examples: 'e.g., "Idea for better waste bins", "Suggestion for park improvements"'
  },
  {
    id: 'appreciation' as ComplaintIntent,
    icon: '🌟',
    title: 'Provide Appreciation',
    description: 'Recognize excellent service or a staff member who helped you.',
    examples: 'e.g., "Great job by the waste collection team!", "Thank you for quick response"'
  }
];

export const ComplaintIntentStep: React.FC<ComplaintIntentStepProps> = ({
  intent,
  onIntentChange,
  linkedProject,
  onLinkedProjectChange,
  wardCode
}) => {
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice input is not supported in your browser.');
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-KE';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      setVoiceTranscript(transcript);

      // Auto-detect intent from voice
      if (transcript.includes('appreciate') || transcript.includes('thank') || transcript.includes('great job') || transcript.includes('well done') || transcript.includes('excellent')) {
        onIntentChange('appreciation');
      } else if (transcript.includes('project') || transcript.includes('construction') || transcript.includes('building')) {
        onIntentChange('project');
      } else if (transcript.includes('feedback') || transcript.includes('suggestion') || transcript.includes('idea')) {
        onIntentChange('feedback');
      } else {
        // Default to service complaint
        onIntentChange('service');
      }
    };

    recognition.onerror = () => setIsListening(false);
    recognition.start();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">
          What would you like to share today?
        </h2>
        <p className="text-muted-foreground">
          Help us route your feedback to the right team.
        </p>
      </div>

      {/* Voice Input Option */}
      <div className="flex justify-center">
        <button
          onClick={handleVoiceInput}
          disabled={isListening}
          className={cn(
            'flex items-center gap-2 px-5 py-3 rounded-full font-medium transition-all border-2',
            isListening
              ? 'border-primary bg-primary/10 text-primary animate-pulse'
              : 'border-border bg-card text-foreground hover:border-primary/50'
          )}
          aria-label="Record your voice to tell us what you want to do"
        >
          {isListening ? (
            <>
              <MicOff className="w-5 h-5" />
              <span>Listening...</span>
            </>
          ) : (
            <>
              <Mic className="w-5 h-5" />
              <span>Tell us what you want to do</span>
            </>
          )}
        </button>
      </div>

      {/* Voice Transcript */}
      {voiceTranscript && (
        <div className="bg-muted/50 rounded-lg p-3 text-center">
          <p className="text-sm text-muted-foreground">You said:</p>
          <p className="text-foreground font-medium">"{voiceTranscript}"</p>
        </div>
      )}

      {/* Intent Options */}
      <div className="grid gap-4">
        {INTENT_OPTIONS.map((option) => (
          <button
            key={option.id}
            onClick={() => {
              onIntentChange(option.id);
              // Clear linked project when changing intent
              if (option.id !== 'project') {
                onLinkedProjectChange(null);
              }
            }}
            className={cn(
              'w-full text-left p-5 rounded-xl border-2 transition-all',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
              intent === option.id
                ? 'border-primary bg-primary/5'
                : 'border-border bg-card hover:border-primary/40'
            )}
            role="button"
            aria-pressed={intent === option.id}
          >
            <div className="flex items-start gap-4">
              <span className="text-3xl" aria-hidden="true">{option.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground text-lg">
                    {option.title}
                  </h3>
                  {intent === option.id && (
                    <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  )}
                </div>
                <p className="text-muted-foreground mt-1">
                  {option.description}
                </p>
                <p className="text-sm text-muted-foreground/70 mt-2 italic">
                  {option.examples}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Info message for project intent */}
      {intent === 'project' && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
          <p className="text-sm text-foreground">
            <strong>Next step:</strong> You'll select the location, and then we'll show you 
            nearby projects to link your feedback to.
          </p>
        </div>
      )}

      {/* Feedback Intent Additional Info */}
      {intent === 'feedback' && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
          <p className="text-sm text-foreground">
            <strong>Great!</strong> On the next screens, you'll be able to share your suggestion 
            or general comment. Your feedback helps us improve services for everyone.
          </p>
        </div>
      )}

      {/* Appreciation Intent Additional Info */}
      {intent === 'appreciation' && (
        <div className="bg-secondary/10 border border-secondary/30 rounded-xl p-4">
          <p className="text-sm text-foreground">
            <strong>Thank you!</strong> On the next screen, you'll tell us who you'd like to 
            appreciate. Your recognition helps celebrate great work and motivates better service.
          </p>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  number: number;
  label: string;
}

interface ReportStepperProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export function ReportStepper({ steps, currentStep, className }: ReportStepperProps) {
  return (
    <nav aria-label="Report progress" className={className}>
      <ol className="flex items-center gap-1 sm:gap-2 flex-wrap">
        {steps.map((step, index) => {
          const isCompleted = step.number < currentStep;
          const isCurrent = step.number === currentStep;
          
          return (
            <li key={step.number} className="flex items-center">
              <div className="flex items-center gap-1 sm:gap-2">
                <span
                  className={cn(
                    'w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all shrink-0',
                    isCompleted && 'bg-primary text-primary-foreground',
                    isCurrent && 'bg-secondary text-secondary-foreground ring-2 ring-secondary ring-offset-2',
                    !isCompleted && !isCurrent && 'bg-muted text-muted-foreground'
                  )}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" aria-hidden="true" />
                  ) : (
                    step.number
                  )}
                </span>
                <span className={cn(
                  'text-sm font-medium hidden sm:inline',
                  isCurrent ? 'text-foreground' : 'text-muted-foreground'
                )}>
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={cn(
                  'w-3 sm:w-12 h-0.5 mx-1 sm:mx-2 shrink-0',
                  isCompleted ? 'bg-primary' : 'bg-muted'
                )} />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

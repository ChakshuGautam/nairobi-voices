import React from 'react';
import { Button } from '@/components/ui/button';
import type { Survey } from '@/types/survey';

interface SurveyCardProps {
  survey: Survey;
  onParticipate: (survey: Survey) => void;
}

export const SurveyCard: React.FC<SurveyCardProps> = ({
  survey,
  onParticipate
}) => {
  return (
    <article
      className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow"
      aria-labelledby={`survey-title-${survey.id}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3
            id={`survey-title-${survey.id}`}
            className="font-semibold text-foreground text-base mb-1"
          >
            {survey.title}
          </h3>
          <p className="text-muted-foreground text-sm mb-3">
            {survey.description}
          </p>
          
          <div className="text-sm">
            <span className="text-info font-medium">{survey.responses}</span>
            <span className="text-muted-foreground"> responses</span>
            <span className="text-muted-foreground mx-2">•</span>
            <span className="text-muted-foreground">{survey.daysLeft} days left</span>
          </div>
        </div>

        <div className="flex-shrink-0">
          <Button
            onClick={() => onParticipate(survey)}
            className="bg-info hover:bg-info/90 text-info-foreground px-6"
            aria-label={`Participate in ${survey.title}`}
          >
            Participate
          </Button>
        </div>
      </div>
    </article>
  );
};

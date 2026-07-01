import React, { useState, useEffect, useMemo } from 'react';
import { CheckCircle, Users, Clock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import type { Survey, SurveyOption } from '@/types/survey';

interface SurveyModalProps {
  survey: Survey | null;
  open: boolean;
  onClose: () => void;
  onSubmit: (surveyId: string, answers: Record<string, string>) => void;
}

type ModalView = 'voting' | 'results';

export const SurveyModal: React.FC<SurveyModalProps> = ({
  survey,
  open,
  onClose,
  onSubmit
}) => {
  const [view, setView] = useState<ModalView>('voting');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [localOptions, setLocalOptions] = useState<Record<string, SurveyOption[]>>({});
  const [hasVotedBefore, setHasVotedBefore] = useState(false);
  const [animateResults, setAnimateResults] = useState(false);

  // Reset state when modal opens with a new survey
  useEffect(() => {
    if (open && survey) {
      setView('voting');
      setAnswers({});
      setHasVotedBefore(false);
      setAnimateResults(false);
      // Initialize local options from survey
      const optionsMap: Record<string, SurveyOption[]> = {};
      survey.questions.forEach(q => {
        optionsMap[q.id] = [...q.options];
      });
      setLocalOptions(optionsMap);
    }
  }, [open, survey?.id]);

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = () => {
    if (!survey) return;
    
    // Update local vote counts
    const updatedOptions: Record<string, SurveyOption[]> = {};
    survey.questions.forEach(q => {
      const selectedLabel = answers[q.id];
      updatedOptions[q.id] = (localOptions[q.id] || q.options).map(opt => ({
        ...opt,
        votes: opt.label === selectedLabel ? opt.votes + 1 : opt.votes
      }));
    });
    setLocalOptions(updatedOptions);
    
    onSubmit(survey.id, answers);
    setView('results');
    setHasVotedBefore(true);
    
    // Trigger animation after a brief delay
    setTimeout(() => setAnimateResults(true), 100);
  };

  const handleVoteAgain = () => {
    setView('voting');
    setAnswers({});
    setAnimateResults(false);
  };

  const allQuestionsAnswered = survey?.questions.every(q => answers[q.id]);

  // Calculate totals and percentages for results
  const getQuestionStats = (questionId: string) => {
    const options = localOptions[questionId] || [];
    const totalVotes = options.reduce((sum, opt) => sum + opt.votes, 0);
    return { options, totalVotes };
  };

  if (!survey) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent 
        className="sm:max-w-lg max-h-[90vh] overflow-y-auto bg-card"
        aria-describedby="survey-modal-description"
      >
        {/* Header */}
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-xl font-bold text-foreground pr-8">
            {survey.title}
          </DialogTitle>
          <DialogDescription id="survey-modal-description" className="text-muted-foreground">
            {survey.description}
          </DialogDescription>
        </DialogHeader>

        {/* Metadata row */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground py-2 border-b border-border">
          <span className="inline-flex items-center gap-1.5">
            <Users className="w-4 h-4 text-info" aria-hidden="true" />
            <span className="font-medium text-foreground">
              {view === 'results' 
                ? getQuestionStats(survey.questions[0].id).totalVotes 
                : survey.responses}
            </span>
            <span>responses</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-warning" aria-hidden="true" />
            <span>{survey.daysLeft} days left</span>
          </span>
        </div>

        {view === 'voting' ? (
          // Voting Mode
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
            className="mt-4 space-y-6"
          >
            {survey.questions.map((question, qIndex) => (
              <fieldset key={question.id} className="space-y-3">
                <legend className="font-semibold text-foreground text-base">
                  {survey.questions.length > 1 && `${qIndex + 1}. `}{question.text}
                </legend>
                <RadioGroup
                  value={answers[question.id] || ''}
                  onValueChange={(value) => handleAnswerChange(question.id, value)}
                  className="space-y-2"
                >
                  {question.options.map((option, oIndex) => (
                    <div
                      key={oIndex}
                      className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <RadioGroupItem
                        value={option.label}
                        id={`${question.id}-${oIndex}`}
                      />
                      <Label
                        htmlFor={`${question.id}-${oIndex}`}
                        className="flex-1 cursor-pointer text-foreground"
                      >
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </fieldset>
            ))}

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
                type="submit"
                disabled={!allQuestionsAnswered}
                className="flex-1 bg-info hover:bg-info/90 text-info-foreground disabled:opacity-50"
              >
                Submit Vote
              </Button>
            </div>
          </form>
        ) : (
          // Results Mode
          <div className="mt-4 space-y-6">
            {/* Confirmation message */}
            <div className="flex items-center gap-2 p-3 rounded-lg bg-success/10 text-success">
              <CheckCircle className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
              <span className="font-medium">
                {hasVotedBefore && Object.keys(answers).length > 0 
                  ? 'Your updated vote has been recorded'
                  : 'Your vote has been recorded'}
              </span>
            </div>

            {/* Results for each question */}
            {survey.questions.map((question) => {
              const { options, totalVotes } = getQuestionStats(question.id);
              const userChoice = answers[question.id];

              return (
                <div key={question.id} className="space-y-4">
                  {survey.questions.length > 1 && (
                    <h4 className="font-semibold text-foreground">{question.text}</h4>
                  )}
                  
                  <div className="space-y-3">
                    {options.map((option, idx) => {
                      const percentage = totalVotes > 0 
                        ? Math.round((option.votes / totalVotes) * 100) 
                        : 0;
                      const isUserChoice = option.label === userChoice;

                      return (
                        <div 
                          key={idx} 
                          className="space-y-1.5"
                          role="listitem"
                          aria-label={`${option.label}: ${percentage}% with ${option.votes} votes${isUserChoice ? ', your choice' : ''}`}
                        >
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <span className="text-foreground">{option.label}</span>
                              {isUserChoice && (
                                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-info/15 text-info">
                                  Your choice
                                </span>
                              )}
                            </div>
                            <span className="font-semibold text-foreground">{percentage}%</span>
                          </div>
                          
                          <div className="relative h-3 w-full bg-muted rounded-full overflow-hidden">
                            <div
                              className="absolute top-0 left-0 h-full bg-info rounded-full transition-all duration-700 ease-out"
                              style={{ 
                                width: animateResults ? `${percentage}%` : '0%',
                              }}
                              aria-hidden="true"
                            />
                          </div>
                          
                          <p className="text-xs text-muted-foreground">
                            {option.votes} votes
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  <p className="text-sm text-muted-foreground pt-2 border-t border-border">
                    Total participants: <span className="font-medium text-foreground">{totalVotes}</span>
                  </p>
                </div>
              );
            })}

            {/* Footer buttons */}
            <div className="flex gap-3 pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Close
              </Button>
              <Button
                type="button"
                onClick={handleVoteAgain}
                className="flex-1 bg-info hover:bg-info/90 text-info-foreground"
              >
                Vote Again
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

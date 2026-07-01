import React from 'react';
import { Check, Circle, Clock } from 'lucide-react';
import { WorkflowHistoryItem, WORKFLOW_ACTION_LABELS, WorkflowAction } from '@/types/story';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';

interface TicketTimelineProps {
  history: WorkflowHistoryItem[];
  currentStatus: string;
}

const WORKFLOW_STEPS: WorkflowAction[] = ['CREATE', 'ASSIGN', 'IN_PROGRESS', 'RESOLVE'];

export function TicketTimeline({ history, currentStatus }: TicketTimelineProps) {
  const completedActions = new Set(history.map(h => h.action));
  
  // Determine which step we're at
  const getStepStatus = (action: WorkflowAction): 'completed' | 'current' | 'pending' => {
    const stepIndex = WORKFLOW_STEPS.indexOf(action);
    const lastCompletedIndex = WORKFLOW_STEPS.findIndex(s => !completedActions.has(s)) - 1;
    
    if (completedActions.has(action)) return 'completed';
    if (stepIndex === lastCompletedIndex + 1) return 'current';
    return 'pending';
  };

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="relative">
        <div className="flex justify-between items-center">
          {WORKFLOW_STEPS.map((step, index) => {
            const status = getStepStatus(step);
            const actionInfo = WORKFLOW_ACTION_LABELS[step];
            
            return (
              <div key={step} className="flex flex-col items-center relative z-10">
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all',
                  status === 'completed' && 'bg-green-500 text-white',
                  status === 'current' && 'bg-primary text-primary-foreground ring-4 ring-primary/20',
                  status === 'pending' && 'bg-muted text-muted-foreground'
                )}>
                  {status === 'completed' ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span>{actionInfo.icon}</span>
                  )}
                </div>
                <span className={cn(
                  'text-xs mt-2 font-medium text-center',
                  status === 'completed' && 'text-green-600',
                  status === 'current' && 'text-primary',
                  status === 'pending' && 'text-muted-foreground'
                )}>
                  {actionInfo.label}
                </span>
              </div>
            );
          })}
        </div>
        {/* Connector line */}
        <div className="absolute top-5 left-[10%] right-[10%] h-0.5 bg-muted -z-0">
          <div 
            className="h-full bg-green-500 transition-all"
            style={{
              width: `${(WORKFLOW_STEPS.filter(s => completedActions.has(s)).length - 1) / (WORKFLOW_STEPS.length - 1) * 100}%`
            }}
          />
        </div>
      </div>

      {/* Detailed history */}
      <div className="border-t border-border pt-4">
        <h4 className="text-sm font-semibold text-foreground mb-3">Activity Log</h4>
        <div className="space-y-3">
          {history.slice().reverse().map((item, index) => {
            const actionInfo = WORKFLOW_ACTION_LABELS[item.action];
            const isEscalated = item.action === 'ESCALATE';
            
            return (
              <div key={item.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm',
                    isEscalated ? 'bg-red-100 text-red-600' : 'bg-primary/10 text-primary'
                  )}>
                    {actionInfo.icon}
                  </div>
                  {index < history.length - 1 && (
                    <div className="w-0.5 h-full bg-border flex-1 mt-1" />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={cn(
                      'text-sm font-medium',
                      isEscalated ? 'text-red-600' : 'text-foreground'
                    )}>
                      {actionInfo.label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      by {item.performedBy}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" />
                    {format(parseISO(item.timestamp), 'PPp')}
                  </p>
                  {item.note && (
                    <p className="text-sm text-muted-foreground mt-1 bg-muted/50 rounded px-2 py-1">
                      {item.note}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
import React from 'react';
import { MessageSquare, Clock, Building2, ChevronRight } from 'lucide-react';
import { Policy, PolicyStatus } from '@/types/policy';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getDaysRemaining } from '@/lib/policyData';

interface PolicyCardProps {
  policy: Policy;
  onClick: () => void;
}

const getStatusBadge = (status: PolicyStatus, daysRemaining: number) => {
  switch (status) {
    case 'open':
      return {
        label: 'Open for feedback',
        className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      };
    case 'closing_soon':
      return {
        label: `Closing in ${daysRemaining} days`,
        className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
      };
    case 'closed':
      return {
        label: 'Closed',
        className: 'bg-muted text-muted-foreground'
      };
  }
};

export const PolicyCard: React.FC<PolicyCardProps> = ({ policy, onClick }) => {
  const daysRemaining = getDaysRemaining(policy.deadline);
  const statusBadge = getStatusBadge(policy.status, daysRemaining);
  const isActive = policy.status !== 'closed';

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left p-5 rounded-xl border-2 transition-all',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        isActive
          ? 'border-primary/20 bg-primary/5 hover:border-primary/40 hover:bg-primary/10'
          : 'border-border bg-card hover:border-border/80'
      )}
      aria-label={`View policy: ${policy.title}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Status Badge */}
          <div className="flex items-center gap-2 mb-2">
            <Badge className={cn('text-xs font-medium', statusBadge.className)}>
              {statusBadge.label}
            </Badge>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-foreground text-lg mb-1 line-clamp-1">
            {policy.title}
          </h3>

          {/* Summary */}
          <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
            {policy.summary}
          </p>

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Building2 className="w-4 h-4" />
              {policy.department}
            </span>
            {isActive && (
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {daysRemaining} days left
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4" />
              {policy.engagement.commentCount} inputs
            </span>
          </div>
        </div>

        {/* Arrow */}
        <div className="flex-shrink-0 mt-2">
          <div className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center',
            isActive ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
          )}>
            <ChevronRight className="w-5 h-5" />
          </div>
        </div>
      </div>
    </button>
  );
};

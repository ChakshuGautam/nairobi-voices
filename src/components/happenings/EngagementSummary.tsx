import React from 'react';
import { Users, MessageSquare, Ticket, ClipboardList, TrendingUp } from 'lucide-react';
import { ProjectEngagement } from '@/types/happenings';
import { cn } from '@/lib/utils';

interface EngagementSummaryProps {
  engagement: ProjectEngagement;
  isFollowing: boolean;
  onFollowToggle: () => void;
  className?: string;
}

export function EngagementSummary({ 
  engagement, 
  isFollowing, 
  onFollowToggle,
  className 
}: EngagementSummaryProps) {
  const metrics = [
    { 
      icon: Users, 
      value: engagement.followers, 
      label: 'Followers',
      trend: engagement.followersThisWeek > 0 ? `+${engagement.followersThisWeek} this week` : null
    },
    { 
      icon: MessageSquare, 
      value: engagement.comments, 
      label: 'Comments',
      trend: null
    },
    { 
      icon: Ticket, 
      value: engagement.linkedComplaints, 
      label: 'Linked Complaints',
      trend: null
    },
    { 
      icon: ClipboardList, 
      value: engagement.surveyResponses, 
      label: 'Survey Responses',
      trend: null
    },
  ];

  return (
    <div className={cn('bg-muted/50 rounded-lg p-4', className)}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground">
          How people are engaging
        </h3>
        <button
          onClick={onFollowToggle}
          className={cn(
            'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
            isFollowing
              ? 'bg-primary text-primary-foreground'
              : 'bg-background border border-border hover:bg-muted'
          )}
        >
          {isFollowing ? '✓ Following' : 'Follow Project'}
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {metrics.map((metric, index) => (
          <div 
            key={index}
            className="bg-background rounded-md p-3 border border-border"
          >
            <div className="flex items-center gap-2 mb-1">
              <metric.icon className="w-4 h-4 text-muted-foreground" />
              <span className="text-lg font-bold text-foreground">
                {metric.value}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{metric.label}</p>
            {metric.trend && (
              <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3" />
                {metric.trend}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

import React from 'react';
import { Check, Clock, Circle } from 'lucide-react';
import { ProjectTimelineItem } from '@/types/happenings';
import { cn } from '@/lib/utils';

interface ProjectTimelineProps {
  timeline: ProjectTimelineItem[];
  className?: string;
}

export function ProjectTimeline({ timeline, className }: ProjectTimelineProps) {
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'TBD';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-KE', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusIcon = (status: ProjectTimelineItem['status']) => {
    switch (status) {
      case 'DONE':
        return (
          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
            <Check className="w-4 h-4 text-white" />
          </div>
        );
      case 'IN_PROGRESS':
        return (
          <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center animate-pulse">
            <Clock className="w-4 h-4 text-white" />
          </div>
        );
      case 'PENDING':
        return (
          <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-gray-300 flex items-center justify-center">
            <Circle className="w-4 h-4 text-gray-400" />
          </div>
        );
    }
  };

  const getLineColor = (status: ProjectTimelineItem['status'], nextStatus?: ProjectTimelineItem['status']) => {
    if (status === 'DONE') {
      return 'bg-green-500';
    }
    if (status === 'IN_PROGRESS') {
      return 'bg-gradient-to-b from-orange-500 to-gray-200';
    }
    return 'bg-gray-200';
  };

  return (
    <div className={cn('relative', className)}>
      {timeline.map((item, index) => {
        const isLast = index === timeline.length - 1;
        const nextItem = timeline[index + 1];

        return (
          <div key={index} className="relative flex gap-4">
            {/* Vertical line and icon */}
            <div className="flex flex-col items-center">
              {getStatusIcon(item.status)}
              {!isLast && (
                <div 
                  className={cn(
                    'w-0.5 flex-1 min-h-[40px]',
                    getLineColor(item.status, nextItem?.status)
                  )}
                />
              )}
            </div>

            {/* Content */}
            <div className={cn('pb-6 flex-1', isLast && 'pb-0')}>
              <div className="flex items-start justify-between gap-2">
                <h4 className={cn(
                  'font-medium text-sm',
                  item.status === 'PENDING' ? 'text-muted-foreground' : 'text-foreground'
                )}>
                  {item.stage}
                </h4>
                <time className={cn(
                  'text-xs whitespace-nowrap',
                  item.status === 'PENDING' ? 'text-muted-foreground/60' : 'text-muted-foreground'
                )}>
                  {formatDate(item.date)}
                </time>
              </div>
              {item.note && (
                <p className="text-xs text-muted-foreground mt-1">
                  {item.note}
                </p>
              )}
              {item.status === 'IN_PROGRESS' && (
                <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-700 rounded-full">
                  Current Stage
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

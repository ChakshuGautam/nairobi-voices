import React from 'react';
import { Clock, AlertTriangle, MessageSquare, ChevronRight } from 'lucide-react';
import { Story, STATUS_LABELS, ISSUE_CATEGORIES } from '@/types/story';
import { cn } from '@/lib/utils';
import { formatDistanceToNow, isPast, parseISO } from 'date-fns';

interface TicketCardProps {
  ticket: Story;
  onViewDetails: (ticket: Story) => void;
  className?: string;
}

export function TicketCard({ ticket, onViewDetails, className }: TicketCardProps) {
  const statusInfo = STATUS_LABELS[ticket.status];
  const issueCat = ISSUE_CATEGORIES.find(c => c.code === ticket.issueCategory);
  const isOverdue = ticket.slaDeadline && isPast(parseISO(ticket.slaDeadline)) && ticket.status !== 'resolved';
  
  const slaText = ticket.slaDeadline 
    ? (isPast(parseISO(ticket.slaDeadline)) 
        ? `Overdue by ${formatDistanceToNow(parseISO(ticket.slaDeadline))}` 
        : `Due ${formatDistanceToNow(parseISO(ticket.slaDeadline), { addSuffix: true })}`)
    : null;

  return (
    <article 
      className={cn(
        'bg-card rounded-xl border border-border p-4 shadow-sm hover:shadow-md transition-all cursor-pointer',
        isOverdue && 'border-destructive/50',
        className
      )}
      onClick={() => onViewDetails(ticket)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onViewDetails(ticket)}
      aria-label={`Ticket ${ticket.ticketId}: ${ticket.title}`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {issueCat && (
              <span className="text-lg" aria-hidden="true">{issueCat.icon}</span>
            )}
            <span className="text-xs font-mono text-muted-foreground">
              {ticket.ticketId}
            </span>
          </div>
          <h3 className="font-semibold text-foreground line-clamp-2">
            {ticket.title}
          </h3>
        </div>
        <span className={cn(
          'px-2 py-1 rounded-full text-xs font-medium text-white flex-shrink-0',
          statusInfo.color
        )}>
          {statusInfo.label}
        </span>
      </div>

      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
        {ticket.description}
      </p>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          {slaText && (
            <div className={cn(
              'flex items-center gap-1',
              isOverdue && 'text-destructive'
            )}>
              {isOverdue ? (
                <AlertTriangle className="w-3.5 h-3.5" />
              ) : (
                <Clock className="w-3.5 h-3.5" />
              )}
              <span>{slaText}</span>
            </div>
          )}
          {ticket.updates && ticket.updates.length > 0 && (
            <div className="flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{ticket.updates.length}</span>
            </div>
          )}
        </div>
        <ChevronRight className="w-4 h-4" />
      </div>

      {ticket.wardName && (
        <p className="text-xs text-muted-foreground mt-2">
          📍 {ticket.wardName}
        </p>
      )}
    </article>
  );
}

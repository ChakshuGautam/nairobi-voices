import React, { useState } from 'react';
import { X, Clock, AlertTriangle, Send, MapPin, Star } from 'lucide-react';
import { Story, STATUS_LABELS, ISSUE_CATEGORIES } from '@/types/story';
import { StarRating } from '@/components/report/StarRating';
import { apiClient } from '@/lib/apiClient';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow, isPast, parseISO } from 'date-fns';

interface TicketDetailsProps {
  ticket: Story;
  onClose: () => void;
  onUpdate: (ticket: Story) => void;
}

export function TicketDetails({ ticket, onClose, onUpdate }: TicketDetailsProps) {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [escalateReason, setEscalateReason] = useState('');
  const [showEscalate, setShowEscalate] = useState(false);
  const [satisfaction, setSatisfaction] = useState(ticket.satisfactionRating || 0);

  const statusInfo = STATUS_LABELS[ticket.status];
  const issueCat = ISSUE_CATEGORIES.find(c => c.code === ticket.issueCategory);
  const isOverdue = ticket.slaDeadline && isPast(parseISO(ticket.slaDeadline)) && ticket.status !== 'resolved';

  const handleAddComment = async () => {
    if (!comment.trim() || isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      await apiClient.addComment(ticket.id, comment.trim());
      const updated = await apiClient.getStory(ticket.id);
      if (updated) onUpdate(updated);
      setComment('');
    } catch (err) {
      console.error('Error adding comment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEscalate = async () => {
    if (!escalateReason.trim() || isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      const updated = await apiClient.escalateTicket(ticket.id, escalateReason.trim());
      if (updated) onUpdate(updated);
      setShowEscalate(false);
      setEscalateReason('');
    } catch (err) {
      console.error('Error escalating:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRateSatisfaction = async (rating: number) => {
    setSatisfaction(rating);
    await apiClient.rateSatisfaction(ticket.id, rating);
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="bg-card rounded-2xl border border-border shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col"
        role="dialog"
        aria-labelledby="ticket-title"
      >
        {/* Header */}
        <div className="flex items-start justify-between p-4 border-b border-border">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {issueCat && <span className="text-xl">{issueCat.icon}</span>}
              <span className="text-xs font-mono text-muted-foreground">{ticket.ticketId}</span>
              <span className={cn(
                'px-2 py-0.5 rounded-full text-xs font-medium text-white',
                statusInfo.color
              )}>
                {statusInfo.label}
              </span>
            </div>
            <h2 id="ticket-title" className="font-bold text-lg text-foreground">
              {ticket.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted"
            aria-label="Close details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Overdue Warning */}
          {isOverdue && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <span className="text-sm text-destructive font-medium">
                This ticket is overdue. You can escalate it below.
              </span>
            </div>
          )}

          {/* Description */}
          <div>
            <h3 className="font-semibold text-foreground mb-2">Description</h3>
            <p className="text-muted-foreground">{ticket.description}</p>
          </div>

          {/* Location */}
          {ticket.wardName && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{ticket.wardName}</span>
            </div>
          )}

          {/* Timeline */}
          <div>
            <h3 className="font-semibold text-foreground mb-3">Updates</h3>
            <div className="space-y-3">
              {ticket.updates?.map((update) => (
                <div key={update.id} className="flex gap-3">
                  <div className={cn(
                    'w-2 h-2 rounded-full mt-2',
                    update.authorType === 'staff' ? 'bg-primary' : 'bg-secondary'
                  )} />
                  <div className="flex-1">
                    <p className="text-sm text-foreground">{update.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {update.author} • {formatDistanceToNow(parseISO(update.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add Comment */}
          {ticket.status !== 'resolved' && (
            <div>
              <h3 className="font-semibold text-foreground mb-2">Add a comment</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  onClick={handleAddComment}
                  disabled={!comment.trim() || isSubmitting}
                  className="btn-primary p-2"
                  aria-label="Send comment"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Escalate */}
          {(isOverdue || ticket.status === 'in_progress') && ticket.status !== 'escalated' && (
            <div>
              {!showEscalate ? (
                <button
                  onClick={() => setShowEscalate(true)}
                  className="text-sm text-destructive hover:underline"
                >
                  ⚠️ Escalate this ticket
                </button>
              ) : (
                <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg space-y-2">
                  <p className="text-sm font-medium text-destructive">Why are you escalating?</p>
                  <textarea
                    value={escalateReason}
                    onChange={(e) => setEscalateReason(e.target.value)}
                    placeholder="Explain why this needs urgent attention..."
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg border border-destructive/30 bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-destructive"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleEscalate}
                      disabled={!escalateReason.trim() || isSubmitting}
                      className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg text-sm font-medium hover:brightness-110 disabled:opacity-50"
                    >
                      Confirm Escalation
                    </button>
                    <button
                      onClick={() => setShowEscalate(false)}
                      className="px-4 py-2 bg-muted text-foreground rounded-lg text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Satisfaction Rating */}
          {ticket.status === 'resolved' && (
            <div className="pt-4 border-t border-border">
              <StarRating
                rating={satisfaction}
                onRatingChange={handleRateSatisfaction}
                label="How satisfied are you with the resolution?"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { MessageSquare, ThumbsUp, HelpCircle, Shield, ChevronDown, ChevronUp, Send } from 'lucide-react';
import { ProjectComment } from '@/types/happenings';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface CommunityFeedbackProps {
  comments: ProjectComment[];
  onAddComment: (text: string, affectedAs?: string) => void;
  className?: string;
}

const AFFECTED_OPTIONS = [
  'Resident nearby',
  'Business owner',
  'Commuter who passes here',
  'Other'
];

export function CommunityFeedback({ comments, onAddComment, className }: CommunityFeedbackProps) {
  const [newComment, setNewComment] = useState('');
  const [affectedAs, setAffectedAs] = useState('');
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());

  const formatTimeAgo = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-KE', { month: 'short', day: 'numeric' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    onAddComment(newComment.trim(), affectedAs || undefined);
    setNewComment('');
    setAffectedAs('');
    toast.success('Your feedback has been posted');
  };

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedComments);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedComments(newExpanded);
  };

  const lastUpdateDays = comments.length > 0 
    ? Math.floor((new Date().getTime() - new Date(comments[0].timestamp).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          Community Feedback
        </h3>
        <span className="text-xs text-muted-foreground">
          {comments.length} comments
          {lastUpdateDays !== null && lastUpdateDays >= 0 && (
            <> • Last update {lastUpdateDays === 0 ? 'today' : `${lastUpdateDays} days ago`}</>
          )}
        </span>
      </div>

      {/* Comment input */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Share your feedback on this project..."
          className="w-full min-h-[80px] px-3 py-2 text-sm rounded-lg border border-border bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          aria-label="Your feedback"
        />
        <div className="flex items-center gap-2">
          <select
            value={affectedAs}
            onChange={(e) => setAffectedAs(e.target.value)}
            className="flex-1 px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="How are you affected?"
          >
            <option value="">How are you affected? (optional)</option>
            {AFFECTED_OPTIONS.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <button
            type="submit"
            disabled={!newComment.trim()}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
              newComment.trim()
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            )}
          >
            <Send className="w-4 h-4" />
            Post
          </button>
        </div>
      </form>

      {/* Comments list */}
      <div className="space-y-3 max-h-[300px] overflow-y-auto">
        {comments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No comments yet. Be the first to share your feedback!
          </p>
        ) : (
          comments.map((comment) => {
            const isLong = comment.text.length > 150;
            const isExpanded = expandedComments.has(comment.id);
            const displayText = isLong && !isExpanded 
              ? comment.text.slice(0, 150) + '...'
              : comment.text;

            return (
              <div 
                key={comment.id}
                className="bg-background rounded-lg border border-border p-3"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-foreground">
                      {comment.author}
                    </span>
                    {comment.authorType === 'official' && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-blue-100 text-blue-700">
                        <Shield className="w-3 h-3" />
                        Official
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatTimeAgo(comment.timestamp)}
                  </span>
                </div>
                
                {comment.affectedAs && (
                  <p className="text-xs text-muted-foreground mb-2">
                    {comment.affectedAs}
                  </p>
                )}

                <p className="text-sm text-foreground leading-relaxed">
                  {displayText}
                </p>

                {isLong && (
                  <button
                    onClick={() => toggleExpand(comment.id)}
                    className="text-xs text-primary font-medium mt-1 flex items-center gap-1"
                  >
                    {isExpanded ? (
                      <>Show less <ChevronUp className="w-3 h-3" /></>
                    ) : (
                      <>Show more <ChevronDown className="w-3 h-3" /></>
                    )}
                  </button>
                )}

                <div className="flex items-center gap-4 mt-2 pt-2 border-t border-border">
                  <button className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                    <ThumbsUp className="w-3 h-3" />
                    Helpful ({comment.helpfulCount})
                  </button>
                  <button className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                    <HelpCircle className="w-3 h-3" />
                    Needs clarification
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { 
  X, FileText, MessageSquare, ThumbsUp, ThumbsDown, Lightbulb, AlertTriangle, 
  ExternalLink, Volume2, VolumeX, Mic, MicOff, Clock, Building2, 
  Calendar, FileDown, Send, Check, ChevronDown
} from 'lucide-react';
import { Policy, PolicyComment } from '@/types/policy';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import { getDaysRemaining } from '@/lib/policyData';
import { format, formatDistanceToNow } from 'date-fns';

interface PolicyDetailModalProps {
  policy: Policy;
  isOpen: boolean;
  onClose: () => void;
}

const AUTHOR_TYPES = [
  { value: 'resident', label: 'Resident' },
  { value: 'business', label: 'Business owner' },
  { value: 'youth', label: 'Youth' },
  { value: 'trader', label: 'Trader' },
  { value: 'community', label: 'Community group' },
  { value: 'other', label: 'Other' },
];

export const PolicyDetailModal: React.FC<PolicyDetailModalProps> = ({
  policy,
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState('summary');
  const [isReading, setIsReading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [authorType, setAuthorType] = useState('');
  const [selectedClause, setSelectedClause] = useState('');
  const [comments, setComments] = useState<PolicyComment[]>(policy.comments);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  
  // Voting state
  const [supportCount, setSupportCount] = useState(policy.engagement.supportCount);
  const [opposeCount, setOpposeCount] = useState(policy.engagement.opposeCount);
  const [userVote, setUserVote] = useState<'support' | 'oppose' | null>(null);

  if (!isOpen) return null;

  const daysRemaining = getDaysRemaining(policy.deadline);
  const totalVotes = supportCount + opposeCount;
  const supportPercentage = totalVotes > 0 ? Math.round((supportCount / totalVotes) * 100) : 0;
  const isActive = policy.status !== 'closed';

  const handleVote = (vote: 'support' | 'oppose') => {
    if (!isActive) return;
    
    if (userVote === vote) {
      // Remove vote
      if (vote === 'support') {
        setSupportCount(prev => prev - 1);
      } else {
        setOpposeCount(prev => prev - 1);
      }
      setUserVote(null);
    } else if (userVote === null) {
      // New vote
      if (vote === 'support') {
        setSupportCount(prev => prev + 1);
      } else {
        setOpposeCount(prev => prev + 1);
      }
      setUserVote(vote);
    } else {
      // Change vote
      if (vote === 'support') {
        setSupportCount(prev => prev + 1);
        setOpposeCount(prev => prev - 1);
      } else {
        setOpposeCount(prev => prev + 1);
        setSupportCount(prev => prev - 1);
      }
      setUserVote(vote);
    }
  };

  const handleReadAloud = () => {
    if (isReading) {
      window.speechSynthesis.cancel();
      setIsReading(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(policy.fullDescription);
      utterance.lang = 'en-KE';
      utterance.onend = () => setIsReading(false);
      window.speechSynthesis.speak(utterance);
      setIsReading(true);
    }
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice input is not supported in your browser.');
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-KE';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setFeedbackText(prev => prev + (prev ? ' ' : '') + transcript);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.start();
  };

  const handleSubmitFeedback = () => {
    if (!feedbackText.trim()) return;

    const clauseLabel = selectedClause 
      ? policy.clauses?.find(c => c.id === selectedClause)?.title 
      : undefined;

    const newComment: PolicyComment = {
      id: `c-${Date.now()}`,
      author: authorType ? AUTHOR_TYPES.find(t => t.value === authorType)?.label || 'Citizen' : 'Citizen',
      authorType: authorType as any || 'other',
      comment: feedbackText.trim(),
      timestamp: new Date().toISOString(),
      relatedClause: clauseLabel,
      reactions: { helpful: 0, insightful: 0, concern: 0 }
    };

    setComments(prev => [newComment, ...prev]);
    setFeedbackText('');
    setAuthorType('');
    setSelectedClause('');
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 3000);
  };

  const toggleCommentExpand = (commentId: string) => {
    setExpandedComments(prev => {
      const next = new Set(prev);
      if (next.has(commentId)) {
        next.delete(commentId);
      } else {
        next.add(commentId);
      }
      return next;
    });
  };

  const getStatusColor = () => {
    switch (policy.status) {
      case 'open': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'closing_soon': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      case 'closed': return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="policy-title"
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-card border border-border rounded-t-2xl sm:rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-xl">
        {/* Header */}
        <div className="flex-shrink-0 p-5 border-b border-border">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge className={cn('text-xs', getStatusColor())}>
                  {policy.status === 'open' ? 'Open for feedback' : 
                   policy.status === 'closing_soon' ? `Closing in ${daysRemaining} days` : 'Closed'}
                </Badge>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" />
                  {policy.department}
                </span>
              </div>
              <h2 id="policy-title" className="text-xl font-bold text-foreground">
                {policy.title}
              </h2>
              {isActive && (
                <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Feedback closes {format(new Date(policy.deadline), 'MMMM d, yyyy')}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-muted transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Voting Buttons & Read Aloud */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            {isActive && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleVote('support')}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all border-2',
                    userVote === 'support'
                      ? 'border-green-500 bg-green-500 text-white'
                      : 'border-green-500/30 bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30'
                  )}
                  aria-label="I support this policy"
                  aria-pressed={userVote === 'support'}
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span>Support</span>
                  <span className="font-bold">{supportCount}</span>
                </button>
                <button
                  onClick={() => handleVote('oppose')}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all border-2',
                    userVote === 'oppose'
                      ? 'border-red-500 bg-red-500 text-white'
                      : 'border-red-500/30 bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30'
                  )}
                  aria-label="I have concerns about this policy"
                  aria-pressed={userVote === 'oppose'}
                >
                  <ThumbsDown className="w-4 h-4" />
                  <span>Concerns</span>
                  <span className="font-bold">{opposeCount}</span>
                </button>
              </div>
            )}
            <button
              onClick={handleReadAloud}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all',
                isReading
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground hover:bg-muted/80'
              )}
              aria-label={isReading ? 'Stop reading' : 'Read policy aloud'}
            >
              {isReading ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              {isReading ? 'Stop' : 'Read aloud'}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start px-5 pt-3 bg-transparent border-b border-border rounded-none">
              <TabsTrigger value="summary" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                Summary
              </TabsTrigger>
              <TabsTrigger value="document" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                Document
              </TabsTrigger>
              <TabsTrigger value="feedback" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                Feedback ({comments.length})
              </TabsTrigger>
            </TabsList>

            {/* Summary Tab */}
            <TabsContent value="summary" className="p-5 space-y-6">
              <div>
                <h3 className="font-semibold text-foreground mb-3">About this policy</h3>
                <div className="prose prose-sm text-muted-foreground max-w-none whitespace-pre-line">
                  {policy.fullDescription}
                </div>
              </div>

              {/* Policy Breakdown - Clause by Clause */}
              {policy.clauses && policy.clauses.length > 0 && (
                <div className="border border-border rounded-xl overflow-hidden">
                  <div className="bg-muted/50 px-4 py-3 border-b border-border">
                    <h4 className="font-semibold text-foreground flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" />
                      Policy Breakdown
                    </h4>
                    <p className="text-sm text-muted-foreground mt-0.5">Review clause by clause</p>
                  </div>
                  <Accordion type="single" collapsible className="w-full">
                    {policy.clauses.map((clause, index) => (
                      <AccordionItem key={clause.id} value={clause.id} className="border-b border-border last:border-0">
                        <AccordionTrigger className="px-4 py-3 hover:bg-muted/30 text-left">
                          <div className="flex items-start gap-3">
                            <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">
                              {clause.section || `Clause ${index + 1}`}
                            </span>
                            <span className="font-medium text-foreground text-sm">{clause.title}</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4 pt-0">
                          <div className="pl-12 text-sm text-muted-foreground leading-relaxed">
                            {clause.content}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              )}

              {/* Key Facts */}
              <div className="bg-muted/30 rounded-xl p-4">
                <h4 className="font-medium text-foreground mb-3">Key Facts</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Department</span>
                    <p className="font-medium text-foreground">{policy.department}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Published</span>
                    <p className="font-medium text-foreground">{format(new Date(policy.publishedDate), 'MMM d, yyyy')}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Deadline</span>
                    <p className="font-medium text-foreground">{format(new Date(policy.deadline), 'MMM d, yyyy')}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Public inputs</span>
                    <p className="font-medium text-foreground">{comments.length} comments</p>
                  </div>
                </div>
              </div>

              {/* Engagement Summary with Live Stats */}
              <div className="p-4 bg-primary/5 rounded-xl">
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{supportPercentage}%</div>
                    <div className="text-xs text-muted-foreground">support</div>
                  </div>
                  <div className="flex-1">
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all duration-300"
                        style={{ width: `${supportPercentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>{supportCount} support</span>
                      <span>{opposeCount} concerns</span>
                    </div>
                  </div>
                </div>
                {userVote && (
                  <p className="text-sm text-primary mt-3 flex items-center gap-1">
                    <Check className="w-4 h-4" />
                    Your vote has been recorded
                  </p>
                )}
              </div>
            </TabsContent>

            {/* Document Tab */}
            <TabsContent value="document" className="p-5 space-y-4">
              <div className="border border-border rounded-xl p-5 text-center">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <h4 className="font-medium text-foreground mb-1">{policy.documentName}</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  PDF • {policy.documentSize} • Published {format(new Date(policy.publishedDate), 'MMM d, yyyy')}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <a
                    href={policy.documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Read Full Document
                  </a>
                  <a
                    href={policy.documentUrl}
                    download
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-muted text-foreground rounded-lg font-medium hover:bg-muted/80 transition-colors"
                  >
                    <FileDown className="w-4 h-4" />
                    Download
                  </a>
                </div>
              </div>

              <p className="text-sm text-muted-foreground text-center">
                Review the full policy document before submitting your feedback.
              </p>
            </TabsContent>

            {/* Feedback Tab */}
            <TabsContent value="feedback" className="p-5 space-y-6">
              {/* Aggregate Stats */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <ThumbsUp className="w-4 h-4 text-primary" />
                  {supportPercentage}% support
                </span>
                <span>•</span>
                <span>{comments.length} total comments</span>
              </div>

              {/* Add Feedback Form */}
              {isActive && (
                <div className="bg-muted/30 rounded-xl p-4 space-y-4">
                  <h4 className="font-medium text-foreground">Share your feedback</h4>
                  
                  {isSubmitted && (
                    <div className="flex items-center gap-2 p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-sm">
                      <Check className="w-4 h-4" />
                      Your feedback has been recorded. Thank you for contributing!
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={handleVoiceInput}
                      disabled={isListening}
                      className={cn(
                        'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                        isListening
                          ? 'bg-primary text-primary-foreground animate-pulse'
                          : 'bg-card border border-border text-foreground hover:bg-muted'
                      )}
                      aria-label="Share feedback with your voice"
                    >
                      {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                      {isListening ? 'Listening...' : 'Use voice'}
                    </button>
                  </div>

                  <textarea
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Share your views or experiences related to this policy..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    aria-label="Your feedback or suggestion"
                  />

                  <div className="flex flex-col gap-3">
                    {/* Section selector - optional */}
                    {policy.clauses && policy.clauses.length > 0 && (
                      <select
                        value={selectedClause}
                        onChange={(e) => setSelectedClause(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        aria-label="Which section is your feedback about?"
                      >
                        <option value="">Which section is this about? (optional)</option>
                        {policy.clauses.map(clause => (
                          <option key={clause.id} value={clause.id}>
                            {clause.section}: {clause.title}
                          </option>
                        ))}
                      </select>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3">
                      <select
                        value={authorType}
                        onChange={(e) => setAuthorType(e.target.value)}
                        className="flex-1 px-4 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        aria-label="How does this policy affect you?"
                      >
                        <option value="">How does this affect you? (optional)</option>
                        {AUTHOR_TYPES.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>

                      <button
                        onClick={handleSubmitFeedback}
                        disabled={!feedbackText.trim()}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="w-4 h-4" />
                        Send Feedback
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Comments List */}
              <div className="space-y-4">
                <h4 className="font-medium text-foreground">Public feedback ({comments.length})</h4>
                
                {comments.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No comments yet. Be the first to share your views!
                  </p>
                ) : (
                  <div className="space-y-3">
                    {comments.map((comment) => {
                      const isExpanded = expandedComments.has(comment.id);
                      const isLong = comment.comment.length > 200;
                      
                      return (
                        <div key={comment.id} className="p-4 bg-card border border-border rounded-xl">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div>
                              <span className="font-medium text-foreground">{comment.author}</span>
                              <span className="text-muted-foreground text-sm ml-2">
                                {formatDistanceToNow(new Date(comment.timestamp), { addSuffix: true })}
                              </span>
                            </div>
                          </div>
                          {comment.relatedClause && (
                            <div className="mb-2">
                              <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">
                                Re: {comment.relatedClause}
                              </span>
                            </div>
                          )}
                          <p className={cn('text-muted-foreground text-sm', !isExpanded && isLong && 'line-clamp-3')}>
                            {comment.comment}
                          </p>
                          {isLong && (
                            <button
                              onClick={() => toggleCommentExpand(comment.id)}
                              className="text-primary text-sm font-medium mt-1 hover:underline"
                            >
                              {isExpanded ? 'Show less' : 'View more'}
                            </button>
                          )}
                          
                          {/* Reactions */}
                          {comment.reactions && (
                            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border">
                              <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                                <ThumbsUp className="w-4 h-4" />
                                <span>{comment.reactions.helpful}</span>
                              </button>
                              <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                                <Lightbulb className="w-4 h-4" />
                                <span>{comment.reactions.insightful}</span>
                              </button>
                              <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                                <AlertTriangle className="w-4 h-4" />
                                <span>{comment.reactions.concern}</span>
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

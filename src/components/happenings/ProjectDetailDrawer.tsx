import React, { useState } from 'react';
import { 
  Calendar, MapPin, Building2, Banknote, Volume2, ExternalLink, 
  MessageSquare, Ticket, ClipboardList, Share2, X
} from 'lucide-react';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Happening, 
  HAPPENING_TYPE_LABELS, 
  HAPPENING_TYPE_ICONS,
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_COLORS,
  ProjectComment
} from '@/types/happenings';
import { ProjectTimeline } from './ProjectTimeline';
import { EngagementSummary } from './EngagementSummary';
import { CommunityFeedback } from './CommunityFeedback';
import { speakText, stopSpeaking } from '@/lib/apiClient';
import { cn } from '@/lib/utils';

interface ProjectDetailDrawerProps {
  happening: Happening | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProjectDetailDrawer({ happening, open, onOpenChange }: ProjectDetailDrawerProps) {
  const [isReading, setIsReading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [localComments, setLocalComments] = useState<ProjectComment[]>([]);

  if (!happening) return null;

  const details = happening.projectDetails;
  const allComments = [...(details?.comments || []), ...localComments].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-KE', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleReadAloud = async () => {
    if (isReading) {
      stopSpeaking();
      setIsReading(false);
      return;
    }

    const textToRead = `${happening.title}. ${details?.fullDescription || happening.summary}. Project by ${happening.source} in ${happening.wardName} Ward.`;
    setIsReading(true);
    await speakText(textToRead);
    setIsReading(false);
  };

  const handleFollowToggle = () => {
    setIsFollowing(!isFollowing);
  };

  const handleAddComment = (text: string, affectedAs?: string) => {
    const newComment: ProjectComment = {
      id: `comment_${Date.now()}`,
      author: 'You',
      authorType: 'citizen',
      text,
      timestamp: new Date().toISOString(),
      affectedAs,
      helpfulCount: 0
    };
    setLocalComments(prev => [newComment, ...prev]);
  };

  const getTypeColor = () => {
    switch (happening.type) {
      case 'INFRASTRUCTURE': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'EVENT': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'NOTICE': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'SERVICE': return 'bg-green-100 text-green-800 border-green-200';
      case 'EMERGENCY': return 'bg-red-100 text-red-800 border-red-200';
      case 'COMMUNITY': return 'bg-teal-100 text-teal-800 border-teal-200';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="border-b border-border pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              {/* Category and Status badges */}
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className={cn(
                  'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border',
                  getTypeColor()
                )}>
                  <span aria-hidden="true">{HAPPENING_TYPE_ICONS[happening.type]}</span>
                  {HAPPENING_TYPE_LABELS[happening.type]}
                </span>
                {details?.status && (
                  <span className={cn(
                    'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border',
                    PROJECT_STATUS_COLORS[details.status]
                  )}>
                    {PROJECT_STATUS_LABELS[details.status]}
                  </span>
                )}
              </div>
              
              <DrawerTitle className="text-xl font-bold text-foreground text-left">
                {happening.title}
              </DrawerTitle>
              
              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Building2 className="w-4 h-4" />
                  {happening.source}
                </span>
                {happening.wardName && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {happening.wardName} Ward
                  </span>
                )}
                {details?.expectedEndDate && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Due: {formatDate(details.expectedEndDate)}
                  </span>
                )}
              </div>
            </div>
            
            <DrawerClose className="rounded-full p-2 hover:bg-muted transition-colors">
              <X className="w-5 h-5" />
              <span className="sr-only">Close</span>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <ScrollArea className="flex-1 px-4 py-4">
          <div className="space-y-6 pb-6">
            {/* Engagement Summary */}
            {details?.engagement && (
              <EngagementSummary
                engagement={details.engagement}
                isFollowing={isFollowing}
                onFollowToggle={handleFollowToggle}
              />
            )}

            {/* Overview Section */}
            <section>
              <h3 className="text-sm font-semibold text-foreground mb-3">Overview</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                {details?.fullDescription || happening.summary}
              </p>
              
              {/* Key Facts Table */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Agency:</span>
                    <span className="ml-2 font-medium text-foreground">{happening.source}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Ward:</span>
                    <span className="ml-2 font-medium text-foreground">{happening.wardName}</span>
                  </div>
                  {details?.budget && (
                    <div>
                      <span className="text-muted-foreground">Budget:</span>
                      <span className="ml-2 font-medium text-foreground">{details.budget}</span>
                    </div>
                  )}
                  {details?.financialYear && (
                    <div>
                      <span className="text-muted-foreground">Funding:</span>
                      <span className="ml-2 font-medium text-foreground">{details.financialYear}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">Start:</span>
                    <span className="ml-2 font-medium text-foreground">{formatDate(happening.date)}</span>
                  </div>
                  {details?.expectedEndDate && (
                    <div>
                      <span className="text-muted-foreground">Expected End:</span>
                      <span className="ml-2 font-medium text-foreground">{formatDate(details.expectedEndDate)}</span>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Vertical Timeline */}
            {details?.timeline && details.timeline.length > 0 && (
              <section>
                <h3 className="text-sm font-semibold text-foreground mb-4">Project Timeline</h3>
                <ProjectTimeline timeline={details.timeline} />
              </section>
            )}

            {/* Community Feedback */}
            <section>
              <CommunityFeedback 
                comments={allComments}
                onAddComment={handleAddComment}
              />
            </section>

            {/* Related Activity */}
            {(details?.relatedTickets?.length || details?.relatedSurveys?.length || details?.publicUpdates?.length) && (
              <section>
                <h3 className="text-sm font-semibold text-foreground mb-3">Related Activity</h3>
                
                {/* Related Tickets */}
                {details?.relatedTickets && details.relatedTickets.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                      <Ticket className="w-3 h-3" />
                      Linked Complaints ({details.relatedTickets.length})
                    </h4>
                    <ul className="space-y-2">
                      {details.relatedTickets.map(ticket => (
                        <li 
                          key={ticket.id}
                          className="text-sm flex items-start gap-2 pl-2 border-l-2 border-muted-foreground/30"
                        >
                          <div className="flex-1">
                            <span className="text-foreground">{ticket.summary}</span>
                            <span className="text-xs text-muted-foreground font-mono block mt-0.5">{ticket.id}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Related Surveys */}
                {details?.relatedSurveys && details.relatedSurveys.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                      <ClipboardList className="w-3 h-3" />
                      Related Surveys
                    </h4>
                    <ul className="space-y-1">
                      {details.relatedSurveys.map(survey => (
                        <li 
                          key={survey.id}
                          className="text-sm bg-blue-50 text-blue-700 rounded px-3 py-2 flex items-center gap-2"
                        >
                          <ClipboardList className="w-4 h-4" />
                          {survey.title}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Public Updates */}
                {details?.publicUpdates && details.publicUpdates.length > 0 && (
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      Public Updates
                    </h4>
                    <ul className="space-y-2">
                      {details.publicUpdates.map((update, index) => (
                        <li 
                          key={index}
                          className="text-sm border-l-2 border-primary pl-3 py-1"
                        >
                          <time className="text-xs text-muted-foreground block mb-1">
                            {formatDate(update.date)}
                          </time>
                          <p className="text-foreground">{update.text}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            )}

            {/* Citizen Tools */}
            <section className="pt-4 border-t border-border">
              <h3 className="text-sm font-semibold text-foreground mb-3">Actions</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleReadAloud}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                    isReading
                      ? 'bg-secondary text-secondary-foreground'
                      : 'bg-muted text-foreground hover:bg-muted/80'
                  )}
                >
                  <Volume2 className="w-4 h-4" />
                  {isReading ? 'Stop Reading' : 'Read Aloud'}
                </button>
                
                <button
                  onClick={handleFollowToggle}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                    isFollowing
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground hover:bg-muted/80'
                  )}
                >
                  {isFollowing ? '✓ Following' : 'Follow Project'}
                </button>

                <button
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-muted text-foreground hover:bg-muted/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <Ticket className="w-4 h-4" />
                  View Related Complaints
                </button>

                <button
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-muted text-foreground hover:bg-muted/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>

                {happening.link && (
                  <a
                    href={happening.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-muted text-foreground hover:bg-muted/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <ExternalLink className="w-4 h-4" />
                    More Details
                  </a>
                )}
              </div>
            </section>
          </div>
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
}

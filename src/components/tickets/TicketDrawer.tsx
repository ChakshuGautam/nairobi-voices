import React, { useState } from 'react';
import { X, MapPin, Clock, AlertTriangle, User, Phone, FileText, Paperclip, ChevronRight } from 'lucide-react';
import { Story, STATUS_LABELS, ISSUE_CATEGORIES, PRIORITY_LABELS, TicketStatus } from '@/types/story';
import { TicketTimeline } from './TicketTimeline';
import { TicketRemarks } from './TicketRemarks';
import { StarRating } from '@/components/report/StarRating';
import { apiClient } from '@/lib/apiClient';
import { cn } from '@/lib/utils';
import { format, parseISO, isPast, formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from '@/components/ui/drawer';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';

interface TicketDrawerProps {
  ticket: Story | null;
  open: boolean;
  onClose: () => void;
  onUpdate: (ticket: Story) => void;
}

export function TicketDrawer({ ticket, open, onClose, onUpdate }: TicketDrawerProps) {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('overview');
  const [showEscalate, setShowEscalate] = useState(false);
  const [escalateReason, setEscalateReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [satisfaction, setSatisfaction] = useState(ticket?.satisfactionRating || 0);

  if (!ticket) return null;

  const statusInfo = STATUS_LABELS[ticket.status];
  const issueCat = ISSUE_CATEGORIES.find(c => c.code === ticket.issueCategory);
  const priorityInfo = ticket.priority ? PRIORITY_LABELS[ticket.priority] : null;
  const isOverdue = ticket.slaDeadline && isPast(parseISO(ticket.slaDeadline)) && ticket.status !== 'resolved';

  // Calculate SLA progress
  const getSlaProgress = () => {
    if (!ticket.sla) return null;
    const total = ticket.sla.dueInHours;
    const remaining = Math.max(0, ticket.sla.remaining);
    return Math.round((1 - remaining / total) * 100);
  };

  const handleAddRemark = async (text: string) => {
    await apiClient.addRemark(ticket.id, text, 'citizen');
    const updated = await apiClient.getStory(ticket.id);
    if (updated) onUpdate(updated);
  };

  const handleEscalate = async () => {
    if (!escalateReason.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const updated = await apiClient.escalateTicket(ticket.id, escalateReason.trim());
      if (updated) onUpdate(updated);
      setShowEscalate(false);
      setEscalateReason('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRateSatisfaction = async (rating: number) => {
    setSatisfaction(rating);
    await apiClient.rateSatisfaction(ticket.id, rating);
  };

  const slaProgress = getSlaProgress();

  const DrawerBody = () => (
    <div className="flex flex-col h-full">
      {/* Header with status */}
      <div className="p-4 border-b border-border space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              {issueCat && <span className="text-xl">{issueCat.icon}</span>}
              <span className="font-mono text-sm text-primary font-medium">{ticket.ticketId}</span>
              <span className={cn(
                'px-2 py-0.5 rounded-full text-xs font-semibold',
                statusInfo.bgColor, statusInfo.color
              )}>
                {statusInfo.label}
              </span>
              {priorityInfo && (
                <span className={cn('text-xs font-medium', priorityInfo.color)}>
                  {priorityInfo.label} Priority
                </span>
              )}
            </div>
            <h2 className="text-lg font-bold text-foreground line-clamp-2">{ticket.title}</h2>
          </div>
        </div>

        {/* Location & Service Time bar */}
        <div className="flex items-center gap-4 text-sm">
          {ticket.wardName && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{ticket.wardName}</span>
            </div>
          )}
          {ticket.assignedDepartment && (
            <div className="text-muted-foreground">
              → {ticket.assignedDepartment}
            </div>
          )}
        </div>

        {/* Service Time Progress */}
        {slaProgress !== null && ticket.status !== 'resolved' && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Expected Service Time</span>
              <span className={cn(
                'font-medium',
                isOverdue ? 'text-destructive' : 'text-foreground'
              )}>
                {isOverdue ? (
                  <span className="flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Overdue by {formatDistanceToNow(parseISO(ticket.slaDeadline!))}
                  </span>
                ) : (
                  `Due ${formatDistanceToNow(parseISO(ticket.slaDeadline!), { addSuffix: true })}`
                )}
              </span>
            </div>
            <Progress 
              value={Math.min(slaProgress, 100)} 
              className={cn(
                'h-2',
                isOverdue && '[&>div]:bg-destructive'
              )}
            />
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="grid grid-cols-4 mx-4 mt-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="remarks">
            Remarks {ticket.remarks?.length ? `(${ticket.remarks.length})` : ''}
          </TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto p-4">
          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-0 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">Description</h3>
              <p className="text-sm text-muted-foreground">{ticket.description}</p>
            </div>

            {/* Attachments */}
            {ticket.attachments && ticket.attachments.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1">
                  <Paperclip className="w-4 h-4" />
                  Attachments
                </h3>
                <div className="flex gap-2 flex-wrap">
                  {ticket.attachments.map((att) => (
                    <div key={att.fileStoreId} className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{att.fileName}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Citizen Info */}
            {ticket.citizen && (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">Reported By</h3>
                <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span>{ticket.citizen.name}</span>
                  </div>
                  {ticket.citizen.mobileNumber && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      <span>{ticket.citizen.mobileNumber}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground block mb-1">Date Logged</span>
                <span className="font-medium">{format(parseISO(ticket.createdAt), 'PPp')}</span>
              </div>
              {ticket.updatedAt && (
                <div>
                  <span className="text-muted-foreground block mb-1">Last Updated</span>
                  <span className="font-medium">{format(parseISO(ticket.updatedAt), 'PPp')}</span>
                </div>
              )}
            </div>

            {/* Assigned Officer */}
            {ticket.assignedTo && (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">Assigned To</h3>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium">{ticket.assignedTo}</p>
                    <p className="text-xs text-muted-foreground">{ticket.assignedDepartment}</p>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="mt-0">
            {ticket.history && ticket.history.length > 0 ? (
              <TicketTimeline history={ticket.history} currentStatus={ticket.status} />
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No workflow history available.
              </p>
            )}
          </TabsContent>

          {/* Remarks Tab */}
          <TabsContent value="remarks" className="mt-0">
            <TicketRemarks
              remarks={ticket.remarks || []}
              onAddRemark={handleAddRemark}
              disabled={ticket.status === 'resolved'}
            />
          </TabsContent>

          {/* Actions Tab */}
          <TabsContent value="actions" className="mt-0 space-y-4">
            {/* Escalate */}
            {(isOverdue || ticket.status === 'in_progress') && ticket.status !== 'escalated' && ticket.status !== 'resolved' && (
              <div>
                {!showEscalate ? (
                  <Button
                    variant="destructive"
                    onClick={() => setShowEscalate(true)}
                    className="w-full"
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Escalate Ticket
                  </Button>
                ) : (
                  <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg space-y-3">
                    <p className="text-sm font-medium text-destructive">Why are you escalating?</p>
                    <textarea
                      value={escalateReason}
                      onChange={(e) => setEscalateReason(e.target.value)}
                      placeholder="Explain why this needs urgent attention..."
                      rows={3}
                      className="w-full px-3 py-2 rounded-lg border border-destructive/30 bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-destructive"
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="destructive"
                        onClick={handleEscalate}
                        disabled={!escalateReason.trim() || isSubmitting}
                      >
                        Confirm Escalation
                      </Button>
                      <Button variant="ghost" onClick={() => setShowEscalate(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Satisfaction Rating */}
            {ticket.status === 'resolved' && (
              <div className="p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
                <StarRating
                  rating={satisfaction}
                  onRatingChange={handleRateSatisfaction}
                  label="How satisfied are you with the resolution?"
                />
              </div>
            )}

            {/* Status info */}
            {ticket.status === 'resolved' && !satisfaction && (
              <p className="text-sm text-muted-foreground text-center py-4">
                This ticket has been resolved. Please rate your satisfaction above.
              </p>
            )}

            {ticket.status === 'escalated' && (
              <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-700 dark:text-red-400">
                  This ticket has been escalated and is receiving priority attention.
                </p>
              </div>
            )}

            {ticket.status === 'new' && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Your ticket is in queue and will be assigned to a department soon.
              </p>
            )}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );

  // Use Sheet for desktop, Drawer for mobile
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
        <DrawerContent className="h-[90vh]">
          <DrawerHeader className="sr-only">
            <DrawerTitle>Ticket Details</DrawerTitle>
          </DrawerHeader>
          <DrawerClose className="absolute right-4 top-4 z-10" onClick={onClose}>
            <X className="w-5 h-5" />
          </DrawerClose>
          <DrawerBody />
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-xl p-0 overflow-hidden">
        <SheetHeader className="sr-only">
          <SheetTitle>Ticket Details</SheetTitle>
        </SheetHeader>
        <SheetClose className="absolute right-4 top-4 z-10" onClick={onClose}>
          <X className="w-5 h-5" />
        </SheetClose>
        <DrawerBody />
      </SheetContent>
    </Sheet>
  );
}
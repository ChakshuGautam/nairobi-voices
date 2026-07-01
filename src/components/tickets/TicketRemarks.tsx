import React, { useState } from 'react';
import { Send, User, Building2 } from 'lucide-react';
import { TicketRemark } from '@/types/story';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface TicketRemarksProps {
  remarks: TicketRemark[];
  onAddRemark: (text: string) => Promise<void>;
  disabled?: boolean;
}

export function TicketRemarks({ remarks, onAddRemark, disabled }: TicketRemarksProps) {
  const [newRemark, setNewRemark] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!newRemark.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await onAddRemark(newRemark.trim());
      setNewRemark('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Remarks list */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {remarks.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No remarks yet. Start the conversation below.
          </p>
        ) : (
          remarks.map((remark) => (
            <div
              key={remark.id}
              className={cn(
                'flex gap-3 p-3 rounded-lg',
                remark.byRole === 'citizen' ? 'bg-primary/5' : 'bg-muted/50'
              )}
            >
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                remark.byRole === 'citizen' ? 'bg-primary/20 text-primary' : 'bg-secondary text-secondary-foreground'
              )}>
                {remark.byRole === 'citizen' ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Building2 className="w-4 h-4" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-foreground">
                    {remark.by}
                  </span>
                  <span className={cn(
                    'text-xs px-1.5 py-0.5 rounded',
                    remark.byRole === 'citizen' ? 'bg-primary/10 text-primary' : 'bg-secondary/50 text-secondary-foreground'
                  )}>
                    {remark.byRole === 'citizen' ? 'Citizen' : 'County Staff'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {format(parseISO(remark.timestamp), 'PPp')}
                  </span>
                </div>
                <p className="text-sm text-foreground mt-1">{remark.text}</p>
                {remark.attachments && remark.attachments.length > 0 && (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {remark.attachments.map((att) => (
                      <span
                        key={att.fileStoreId}
                        className="text-xs text-primary underline cursor-pointer"
                      >
                        📎 {att.fileName}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add remark form */}
      {!disabled && (
        <div className="border-t border-border pt-4">
          <Textarea
            value={newRemark}
            onChange={(e) => setNewRemark(e.target.value)}
            placeholder="Type your message..."
            rows={3}
            className="resize-none mb-2"
          />
          <div className="flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={!newRemark.trim() || isSubmitting}
              className="ncc-btn-primary"
            >
              <Send className="w-4 h-4 mr-2" />
              Send Message
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
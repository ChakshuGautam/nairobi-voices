import React from 'react';
import { Eye, AlertTriangle, Clock, ChevronUp, ChevronDown } from 'lucide-react';
import { Story, STATUS_LABELS, ISSUE_CATEGORIES, TicketStatus } from '@/types/story';
import { cn } from '@/lib/utils';
import { formatDistanceToNow, parseISO, isPast } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';

interface TicketTableProps {
  tickets: Story[];
  selectedIds: string[];
  onSelectTicket: (id: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onViewTicket: (ticket: Story) => void;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (field: string) => void;
}

export function TicketTable({
  tickets,
  selectedIds,
  onSelectTicket,
  onSelectAll,
  onViewTicket,
  sortField,
  sortDirection,
  onSort,
}: TicketTableProps) {
  const allSelected = tickets.length > 0 && selectedIds.length === tickets.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < tickets.length;

  const getSlaDisplay = (ticket: Story) => {
    if (!ticket.sla && !ticket.slaDeadline) return null;
    
    const deadline = ticket.sla?.deadline || ticket.slaDeadline;
    if (!deadline) return null;
    
    const isOverdue = isPast(parseISO(deadline)) && ticket.status !== 'resolved';
    const remaining = ticket.sla?.remaining;
    
    if (remaining !== undefined) {
      if (remaining < 0) {
        return { text: `Overdue by ${Math.abs(remaining)}h`, isOverdue: true };
      }
      return { text: `${remaining}h remaining`, isOverdue: false };
    }
    
    const distanceText = formatDistanceToNow(parseISO(deadline), { addSuffix: false });
    return {
      text: isOverdue ? `Overdue by ${distanceText}` : `Due in ${distanceText}`,
      isOverdue,
    };
  };

  const SortableHeader = ({ field, children }: { field: string; children: React.ReactNode }) => (
    <button
      onClick={() => onSort?.(field)}
      className="flex items-center gap-1 hover:text-foreground transition-colors"
    >
      {children}
      {sortField === field && (
        sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
      )}
    </button>
  );

  return (
    <div className="ncc-card overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-12">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={(checked) => onSelectAll(!!checked)}
                  aria-label="Select all tickets"
                  className={someSelected ? 'data-[state=checked]:bg-primary/50' : ''}
                />
              </TableHead>
              <TableHead className="min-w-[140px]">
                <SortableHeader field="ticketId">Ticket ID</SortableHeader>
              </TableHead>
              <TableHead className="min-w-[120px]">Category</TableHead>
              <TableHead className="min-w-[120px]">Ward</TableHead>
              <TableHead className="min-w-[200px]">Issue Summary</TableHead>
              <TableHead className="min-w-[100px]">
                <SortableHeader field="status">Status</SortableHeader>
              </TableHead>
              <TableHead className="min-w-[130px]">
                <SortableHeader field="sla">Expected By</SortableHeader>
              </TableHead>
              <TableHead className="min-w-[140px]">Assigned To</TableHead>
              <TableHead className="min-w-[120px]">
                <SortableHeader field="updatedAt">Last Updated</SortableHeader>
              </TableHead>
              <TableHead className="w-24 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.map((ticket) => {
              const statusInfo = STATUS_LABELS[ticket.status];
              const issueCat = ISSUE_CATEGORIES.find(c => c.code === ticket.issueCategory);
              const slaInfo = getSlaDisplay(ticket);
              const isSelected = selectedIds.includes(ticket.id);

              return (
                <TableRow
                  key={ticket.id}
                  className={cn(
                    'cursor-pointer hover:bg-muted/50 transition-colors',
                    isSelected && 'bg-primary/5',
                    slaInfo?.isOverdue && 'bg-destructive/5'
                  )}
                  onClick={() => onViewTicket(ticket)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) => onSelectTicket(ticket.id, !!checked)}
                      aria-label={`Select ticket ${ticket.ticketId}`}
                    />
                  </TableCell>
                  <TableCell className="font-mono text-sm font-medium text-primary">
                    {ticket.ticketId}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {issueCat && (
                        <span className="text-lg" aria-hidden="true">{issueCat.icon}</span>
                      )}
                      <span className="text-sm">{issueCat?.label || 'General'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {ticket.wardName || '—'}
                  </TableCell>
                  <TableCell>
                    <p className="text-sm line-clamp-2 max-w-[250px]" title={ticket.title}>
                      {ticket.title}
                    </p>
                  </TableCell>
                  <TableCell>
                    <span className={cn(
                      'inline-flex px-2.5 py-1 rounded-full text-xs font-semibold',
                      statusInfo.bgColor,
                      statusInfo.color
                    )}>
                      {statusInfo.label}
                    </span>
                  </TableCell>
                  <TableCell>
                    {slaInfo && (
                      <div className={cn(
                        'flex items-center gap-1.5 text-sm',
                        slaInfo.isOverdue ? 'text-destructive font-medium' : 'text-muted-foreground'
                      )}>
                        {slaInfo.isOverdue ? (
                          <AlertTriangle className="w-4 h-4" />
                        ) : (
                          <Clock className="w-4 h-4" />
                        )}
                        <span>{slaInfo.text}</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    {ticket.assignedTo || (
                      <span className="text-muted-foreground italic">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {ticket.updatedAt
                      ? formatDistanceToNow(parseISO(ticket.updatedAt), { addSuffix: true })
                      : formatDistanceToNow(parseISO(ticket.createdAt), { addSuffix: true })}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewTicket(ticket)}
                      className="h-8 px-2"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {tickets.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} className="h-32 text-center text-muted-foreground">
                  No tickets found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
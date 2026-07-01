import React, { useState, useEffect, useMemo } from 'react';
import { Search, Ticket, ArrowRight, Filter, LayoutGrid, LayoutList, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { TicketTable } from '@/components/tickets/TicketTable';
import { TicketCard } from '@/components/tickets/TicketCard';
import { TicketDrawer } from '@/components/tickets/TicketDrawer';
import { Story, STATUS_LABELS, TicketStatus } from '@/types/story';
import { apiClient } from '@/lib/apiClient';
import { getSession, verifyAndLogin, isValidKeMobile, Session } from '@/lib/auth';
import { MOCK_OTP } from '@/lib/config';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

type ViewMode = 'table' | 'cards';

const MyTickets = () => {
  const isMobile = useIsMobile();
  const [authSession, setAuthSession] = useState<Session | null>(() => getSession());
  const [phoneInput, setPhoneInput] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [tickets, setTickets] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Story | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<TicketStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>(isMobile ? 'cards' : 'table');
  const [sortField, setSortField] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    // Only load tickets once a citizen is signed in (getMyTickets is session-scoped).
    if (authSession) {
      loadTickets();
    } else {
      setIsLoading(false);
    }
  }, [authSession]);

  useEffect(() => {
    // Auto-switch to cards on mobile
    if (isMobile && viewMode === 'table') {
      setViewMode('cards');
    }
  }, [isMobile]);

  const loadTickets = async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.getMyTickets();
      setTickets(data);
    } catch (err) {
      console.error('Error loading tickets:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    if (isLoggingIn) return;
    if (!isValidKeMobile(phoneInput)) {
      toast.error('Enter a valid phone number', {
        description: 'Use your Kenyan mobile number, e.g. 0712 345 678.',
      });
      return;
    }
    setIsLoggingIn(true);
    try {
      // Mock OTP (123456) is auto-accepted by the Bomet gateway.
      const session = await verifyAndLogin(phoneInput, MOCK_OTP);
      setAuthSession(session);
    } catch (err) {
      console.error('Login failed:', err);
      toast.error('Could not sign you in', {
        description: err instanceof Error ? err.message : 'Please try again in a moment.',
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleTicketUpdate = (updated: Story) => {
    setTickets(prev => prev.map(t => t.id === updated.id ? updated : t));
    setSelectedTicket(updated);
  };

  const handleViewTicket = (ticket: Story) => {
    setSelectedTicket(ticket);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setTimeout(() => setSelectedTicket(null), 300);
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSelectTicket = (id: string, selected: boolean) => {
    setSelectedIds(prev => 
      selected ? [...prev, id] : prev.filter(i => i !== id)
    );
  };

  const handleSelectAll = (selected: boolean) => {
    setSelectedIds(selected ? filteredTickets.map(t => t.id) : []);
  };

  const filteredTickets = useMemo(() => {
    let result = tickets.filter(t => {
      const matchesStatus = filterStatus === 'all' || t.status === filterStatus;
      const matchesSearch = !searchQuery || 
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.ticketId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.wardName?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });

    // Sort
    result.sort((a, b) => {
      let aVal: string | number = '';
      let bVal: string | number = '';

      switch (sortField) {
        case 'ticketId':
          aVal = a.ticketId;
          bVal = b.ticketId;
          break;
        case 'status':
          aVal = a.status;
          bVal = b.status;
          break;
        case 'sla':
          aVal = a.slaDeadline || '';
          bVal = b.slaDeadline || '';
          break;
        case 'updatedAt':
        default:
          aVal = a.updatedAt || a.createdAt;
          bVal = b.updatedAt || b.createdAt;
          break;
      }

      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      }
      return aVal < bVal ? 1 : -1;
    });

    return result;
  }, [tickets, filterStatus, searchQuery, sortField, sortDirection]);

  // Stats
  const stats = useMemo(() => ({
    total: tickets.length,
    new: tickets.filter(t => t.status === 'new').length,
    assigned: tickets.filter(t => t.status === 'assigned').length,
    inProgress: tickets.filter(t => t.status === 'in_progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
    escalated: tickets.filter(t => t.status === 'escalated').length,
  }), [tickets]);

  // Login gate: getMyTickets is scoped to the signed-in citizen, so require a
  // phone (mock OTP) before we can fetch anything.
  if (!authSession) {
    return (
      <AppLayout>
        <section className="mb-6" aria-labelledby="tickets-hero-title">
          <div className="ncc-hero ncc-hero-pattern p-6 md:p-8">
            <div className="max-w-3xl">
              <h1 id="tickets-hero-title" className="text-2xl md:text-3xl font-bold mb-2 text-white drop-shadow-md">
                My Tickets
              </h1>
              <p className="text-base text-white font-medium drop-shadow-sm">
                Track, manage, and communicate on your submitted reports.
              </p>
            </div>
          </div>
        </section>

        <div className="ncc-card max-w-md mx-auto text-center py-10 px-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Phone className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Sign in to view your tickets</h2>
          <p className="text-muted-foreground mb-6">
            Enter the phone number you used when reporting. We'll look up all tickets filed with it.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
            className="space-y-4 text-left"
          >
            <div>
              <label htmlFor="login-phone" className="block text-sm font-medium text-foreground mb-1.5">
                Phone number
              </label>
              <input
                id="login-phone"
                type="tel"
                inputMode="tel"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="07XX XXX XXX"
                autoComplete="tel"
                className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <Button type="submit" className="w-full gap-2" disabled={isLoggingIn}>
              {isLoggingIn ? 'Signing in...' : 'View my tickets'}
              {!isLoggingIn && <ArrowRight className="w-4 h-4" />}
            </Button>
          </form>
          <p className="text-xs text-muted-foreground mt-4">
            No password needed. This uses a one-time code sent to your phone.
          </p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* Hero */}
      <section className="mb-6" aria-labelledby="tickets-hero-title">
        <div className="ncc-hero ncc-hero-pattern p-6 md:p-8">
          <div className="max-w-3xl">
            <h1 id="tickets-hero-title" className="text-2xl md:text-3xl font-bold mb-2 text-white drop-shadow-md">
              My Tickets
            </h1>
            <p className="text-base text-white font-medium drop-shadow-sm">
              Track, manage, and communicate on your submitted reports.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
        {[
          { label: 'Total', value: stats.total, color: 'bg-slate-100 text-slate-700' },
          { label: 'New', value: stats.new, color: 'bg-blue-100 text-blue-700' },
          { label: 'Assigned', value: stats.assigned, color: 'bg-purple-100 text-purple-700' },
          { label: 'In Progress', value: stats.inProgress, color: 'bg-amber-100 text-amber-700' },
          { label: 'Resolved', value: stats.resolved, color: 'bg-green-100 text-green-700' },
          { label: 'Escalated', value: stats.escalated, color: 'bg-red-100 text-red-700' },
        ].map((stat) => (
          <div key={stat.label} className={cn('rounded-xl p-3 text-center', stat.color)}>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs font-medium">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ticket ID, title, or location..."
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
          />
        </div>

        {/* View Toggle */}
        {!isMobile && (
          <div className="flex gap-1 p-1 bg-muted rounded-lg">
            <Button
              variant={viewMode === 'table' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
              className="gap-2"
            >
              <LayoutList className="w-4 h-4" />
              Table
            </Button>
            <Button
              variant={viewMode === 'cards' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('cards')}
              className="gap-2"
            >
              <LayoutGrid className="w-4 h-4" />
              Cards
            </Button>
          </div>
        )}
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-thin">
        <button
          onClick={() => setFilterStatus('all')}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all',
            filterStatus === 'all'
              ? 'bg-primary text-primary-foreground shadow-md'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          )}
        >
          All ({stats.total})
        </button>
        {(Object.keys(STATUS_LABELS) as TicketStatus[]).map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all',
              filterStatus === status
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            {STATUS_LABELS[status].label}
          </button>
        ))}
      </div>

      {/* Bulk Actions (when items selected) */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-4 p-3 bg-primary/10 border border-primary/20 rounded-lg mb-4">
          <span className="text-sm font-medium">
            {selectedIds.length} ticket{selectedIds.length > 1 ? 's' : ''} selected
          </span>
          <Button variant="outline" size="sm" onClick={() => setSelectedIds([])}>
            Clear Selection
          </Button>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="space-y-4">
          {viewMode === 'table' ? (
            <div className="ncc-card h-64 animate-pulse" />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-muted rounded-xl animate-pulse" />
              ))}
            </div>
          )}
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="ncc-card text-center py-16 px-8">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Ticket className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">No tickets found</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            {searchQuery || filterStatus !== 'all' 
              ? 'Try adjusting your search or filters.'
              : 'You haven\'t submitted any reports yet. Start by reporting an issue in your area.'}
          </p>
          {!searchQuery && filterStatus === 'all' && (
            <Link to="/report" className="ncc-btn-primary inline-flex">
              Report an Issue
              <ArrowRight className="w-5 h-5" />
            </Link>
          )}
        </div>
      ) : viewMode === 'table' ? (
        <TicketTable
          tickets={filteredTickets}
          selectedIds={selectedIds}
          onSelectTicket={handleSelectTicket}
          onSelectAll={handleSelectAll}
          onViewTicket={handleViewTicket}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredTickets.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              onViewDetails={handleViewTicket}
            />
          ))}
        </div>
      )}

      {/* Ticket Drawer */}
      <TicketDrawer
        ticket={selectedTicket}
        open={drawerOpen}
        onClose={handleCloseDrawer}
        onUpdate={handleTicketUpdate}
      />
    </AppLayout>
  );
};

export default MyTickets;
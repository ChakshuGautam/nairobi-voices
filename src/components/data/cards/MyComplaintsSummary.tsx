import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  User, Clock, CheckCircle2, AlertTriangle, ArrowRight, TrendingUp,
  FileText, FolderKanban, MessageSquare,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Story } from '@/types/story';
import { apiClient } from '@/lib/apiClient';
import { cn } from '@/lib/utils';
import { InfoTooltip } from '../ServiceAnalytics';

export function MyComplaintsSummary() {
  const [myTickets, setMyTickets] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const tickets = await apiClient.getMyTickets();
      setMyTickets(tickets);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate personal stats with breakdown
  const myStats = useMemo(() => {
    const complaints = myTickets.filter(t => t.category === 'complaint');
    // For now, mock project complaints as complaints without issue category
    const serviceComplaints = complaints.filter(t => t.issueCategory);
    const projectComplaints = complaints.filter(t => !t.issueCategory);
    const feedbacks = myTickets.filter(t => t.category === 'idea' || t.category === 'appreciation');
    
    return {
      total: myTickets.length,
      serviceComplaints: serviceComplaints.length,
      projectComplaints: projectComplaints.length,
      feedbacks: feedbacks.length,
      new: complaints.filter(t => t.status === 'new').length,
      inProgress: complaints.filter(t => t.status === 'in_progress' || t.status === 'assigned').length,
      resolved: complaints.filter(t => t.status === 'resolved').length,
      escalated: complaints.filter(t => t.status === 'escalated').length,
      overdue: complaints.filter(t => t.isOverdue || (t.sla && t.sla.remaining < 0)).length,
    };
  }, [myTickets]);

  if (isLoading) {
    return (
      <Card className="ncc-card">
        <CardContent className="p-6">
          <div className="h-32 flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading your data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (myTickets.length === 0) {
    return (
      <Card className="ncc-card border-primary/20 bg-primary/5">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">No complaints yet</h3>
              <p className="text-sm text-muted-foreground">
                Report an issue to see your personal analytics and compare with similar complaints.
              </p>
            </div>
            <Link to="/report">
              <Button className="gap-2">
                Report Issue
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* My Tickets Summary */}
      <Card className="ncc-card border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">My Tickets Summary</CardTitle>
              <InfoTooltip definition="Summary of all your submitted tickets including service complaints, project complaints, and general feedback." />
            </div>
            <Link to="/my-tickets">
              <Button variant="outline" size="sm" className="gap-2">
                View All
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Ticket Type Breakdown */}
          <div className="grid grid-cols-3 gap-3 pb-4 border-b border-border">
            <StatCard 
              label="Service Complaints" 
              value={myStats.serviceComplaints} 
              icon={<FileText className="w-4 h-4" />}
              className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
            />
            <StatCard 
              label="Project Complaints" 
              value={myStats.projectComplaints} 
              icon={<FolderKanban className="w-4 h-4" />}
              className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
            />
            <StatCard 
              label="Feedbacks Given" 
              value={myStats.feedbacks} 
              icon={<MessageSquare className="w-4 h-4" />}
              className="bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300"
            />
          </div>

          {/* Status Breakdown */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <StatCard 
              label="New" 
              value={myStats.new} 
              icon={<Clock className="w-4 h-4" />}
              className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
            />
            <StatCard 
              label="In Progress" 
              value={myStats.inProgress} 
              icon={<TrendingUp className="w-4 h-4" />}
              className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
            />
            <StatCard 
              label="Resolved" 
              value={myStats.resolved} 
              icon={<CheckCircle2 className="w-4 h-4" />}
              className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
            />
            <StatCard 
              label="Escalated" 
              value={myStats.escalated} 
              icon={<AlertTriangle className="w-4 h-4" />}
              className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
            />
            <StatCard 
              label="Overdue" 
              value={myStats.overdue} 
              icon={<Clock className="w-4 h-4" />}
              className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ 
  label, 
  value, 
  icon, 
  className 
}: { 
  label: string; 
  value: number; 
  icon: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('rounded-xl p-3 flex flex-col items-center justify-center min-h-[80px]', className)}>
      <div className="flex items-center justify-center gap-1.5 mb-1">
        {icon}
        <span className="text-2xl font-bold leading-none">{value}</span>
      </div>
      <p className="text-xs font-medium text-center leading-tight">{label}</p>
    </div>
  );
}

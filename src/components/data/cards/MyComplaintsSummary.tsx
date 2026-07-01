import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  User, AlertCircle, Clock, CheckCircle2, AlertTriangle, ArrowRight, Users, TrendingUp,
  FileText, FolderKanban, MessageSquare,
  Waves, CloudRain, Home, Construction, LifeBuoy, Trees,
  Route, Droplet, Trash2, Lightbulb, Volume2, ClipboardList,
  LucideIcon,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Story, ISSUE_CATEGORIES } from '@/types/story';
import { apiClient } from '@/lib/apiClient';
import { cn } from '@/lib/utils';
import { InfoTooltip } from '../ServiceAnalytics';
import { getComplaintsByDepartment } from '@/lib/serviceAnalyticsData';
import { DepartmentRatingsDetail } from './DepartmentRatingsDetail';

// Category to Department mapping
const CATEGORY_TO_DEPARTMENT: Record<string, string> = {
  'WASTE': 'Environment',
  'WATER': 'Water and Sewerage',
  'ROADS': 'Works',
  'STREETLIGHTS': 'Mobility and ICT Infrastructure',
  'NOISE': 'Public Health',
  'OTHER': 'Public Health',
};

interface SimilarComplaint {
  category: string;
  categoryLabel: string;
  icon: LucideIcon;
  myCount: number;
  othersCount: number;
  totalCount: number;
  topLocations: string[];
  avgResolutionWeeks: number;
  avgResolutionLabel?: string;
}


const DISASTER_COMPLAINTS: SimilarComplaint[] = [
  {
    category: 'DM_URBAN_FLOODING',
    categoryLabel: 'Urban Flooding / Waterlogging',
    icon: Waves,
    myCount: 1,
    othersCount: 411,
    totalCount: 412,
    topLocations: ['Nairobi Central', 'Mathare'],
    avgResolutionWeeks: 8 / 168,
    avgResolutionLabel: '8 hours',
  },
  {
    category: 'DM_DRAIN_OVERFLOW',
    categoryLabel: 'Drain Overflow During Rainfall',
    icon: CloudRain,
    myCount: 1,
    othersCount: 237,
    totalCount: 238,
    topLocations: ['Eastleigh', 'Mukuru'],
    avgResolutionWeeks: 10 / 168,
    avgResolutionLabel: '10 hours',
  },
  {
    category: 'DM_FLOODED_HOMES',
    categoryLabel: 'Flooded Homes / Property Inundation',
    icon: Home,
    myCount: 1,
    othersCount: 163,
    totalCount: 164,
    topLocations: ['Kibera', 'Mathare'],
    avgResolutionWeeks: 12 / 168,
    avgResolutionLabel: '12 hours',
  },
  {
    category: 'DM_STORMWATER_BLOCKED',
    categoryLabel: 'Blocked Stormwater Channel',
    icon: Construction,
    myCount: 1,
    othersCount: 195,
    totalCount: 196,
    topLocations: ['South B', 'Industrial Area'],
    avgResolutionWeeks: 14 / 168,
    avgResolutionLabel: '14 hours',
  },
  {
    category: 'DM_EVACUATION',
    categoryLabel: 'Emergency Evacuation Support',
    icon: LifeBuoy,
    myCount: 1,
    othersCount: 72,
    totalCount: 73,
    topLocations: ['Mukuru', 'Korogocho'],
    avgResolutionWeeks: 4 / 168,
    avgResolutionLabel: '4 hours',
  },
  {
    category: 'DM_FALLEN_TREE',
    categoryLabel: 'Fallen Tree / Obstruction After Storm',
    icon: Trees,
    myCount: 1,
    othersCount: 90,
    totalCount: 91,
    topLocations: ['Karen', 'Westlands'],
    avgResolutionWeeks: 9 / 168,
    avgResolutionLabel: '9 hours',
  },
];

interface MyComplaintsSummaryProps {
  categoryFilter?: string;
}

const CATEGORY_ICON_MAP: Record<string, LucideIcon> = {
  roads: Route,
  water: Droplet,
  waste: Trash2,
  streetlights: Lightbulb,
  noise: Volume2,
  other: ClipboardList,
  WASTE: Trash2,
  WATER: Droplet,
  ROADS: Route,
  STREETLIGHTS: Lightbulb,
  NOISE: Volume2,
  OTHER: ClipboardList,
};

export function MyComplaintsSummary({ categoryFilter = 'all' }: MyComplaintsSummaryProps = {}) {
  const [myTickets, setMyTickets] = useState<Story[]>([]);
  const [allStories, setAllStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [tickets, stories] = await Promise.all([
        apiClient.getMyTickets(),
        apiClient.getStories()
      ]);
      setMyTickets(tickets);
      setAllStories(stories);
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

  // Calculate similar complaints based on user's categories with department data
  const similarComplaints = useMemo((): SimilarComplaint[] => {
    // When filtering by Disaster Management, show only disaster-related complaint types
    if (categoryFilter === 'disaster') {
      return DISASTER_COMPLAINTS;
    }

    const myCategories = new Set(myTickets.map(t => t.issueCategory).filter(Boolean));
    
    if (myCategories.size === 0) return DISASTER_COMPLAINTS;

    // Get department data for "Others" counts
    const departmentData = getComplaintsByDepartment();

    const userDerived = Array.from(myCategories).map(categoryCode => {
      const categoryInfo = ISSUE_CATEGORIES.find(c => c.code === categoryCode);
      const myCount = myTickets.filter(t => t.issueCategory === categoryCode).length;
      
      // Get "Others" count from department data
      const departmentName = CATEGORY_TO_DEPARTMENT[categoryCode || 'OTHER'];
      const deptData = departmentData.find(d => d.department === departmentName);
      const othersCount = deptData ? deptData.count : Math.round(Math.random() * 500 + 100);
      
      // Get top locations from all stories in this category
      const allInCategory = allStories.filter(s => s.issueCategory === categoryCode);
      const locationCounts = allInCategory.reduce((acc, s) => {
        if (s.wardName) {
          acc[s.wardName] = (acc[s.wardName] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);
      
      const topLocations = Object.entries(locationCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name]) => name);

      // Mock avg resolution time in weeks (1-4 weeks range)
      const avgResolutionWeeks = Math.round((Math.random() * 3 + 1) * 10) / 10;

      return {
        category: categoryCode || 'other',
        categoryLabel: categoryInfo?.label || 'Other',
        icon: CATEGORY_ICON_MAP[categoryCode || 'other'] || ClipboardList,
        myCount,
        othersCount,
        totalCount: myCount + othersCount,
        topLocations,
        avgResolutionWeeks,
      };
    });
    return [...userDerived, ...DISASTER_COMPLAINTS];
  }, [myTickets, allStories, categoryFilter]);

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

      {/* Department Ratings from General Feedback */}
      <DepartmentRatingsDetail />

      {/* Similar Complaints Section */}
      {similarComplaints.length > 0 && (
        <Card className="ncc-card">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-muted-foreground" />
              <CardTitle className="text-lg">Similar Complaints from Others</CardTitle>
              <InfoTooltip definition="Complaints from other citizens in the same categories as yours. See how many others are facing similar issues." />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {similarComplaints.map((similar) => {
                const Icon = similar.icon;
                return (
                <div 
                  key={similar.category}
                  className="p-4 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  {/* Header with icon, title, and badge */}
                  <div className="flex items-start gap-3 mb-4">
                    <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground leading-tight">{similar.categoryLabel}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        You: {similar.myCount} • Others: {similar.othersCount.toLocaleString()}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs flex-shrink-0 whitespace-nowrap">
                      {similar.totalCount.toLocaleString()} total
                    </Badge>
                  </div>
                  
                  {/* Avg Resolution Row */}
                  <div className="flex items-center justify-between text-sm py-2 border-t border-border/50">
                    <span className="text-muted-foreground">Avg. Resolution:</span>
                    <span className="font-semibold text-foreground">{similar.avgResolutionLabel ?? `${similar.avgResolutionWeeks} weeks`}</span>
                  </div>
                  
                  {/* Hot spots */}
                  {similar.topLocations.length > 0 && (
                    <div className="pt-2 border-t border-border/50">
                      <span className="text-xs text-muted-foreground block mb-1.5">Hot spots:</span>
                      <div className="flex flex-wrap gap-1">
                        {similar.topLocations.map((loc) => (
                          <Badge key={loc} variant="outline" className="text-xs">
                            {loc}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
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

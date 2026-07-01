import React, { useState } from 'react';
import { Star, Heart, TrendingUp, TrendingDown, Info, Clock, CheckCircle2, Target, X, BarChart3 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, 
  LineChart, Line, Cell, PieChart, Pie
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

export interface DepartmentData {
  name: string;
  rating: number;
  totalFeedback: number;
  appreciations: number;
  trend: number; // positive = improvement, negative = decline
  // Detail view data
  totalComplaints: number;
  closedComplaints: number;
  onTimeResolutionPercent: number;
  avgResolveTime: number; // in days
  serviceCompletionRate: number;
  topComplaintTypes: { type: string; count: number }[];
  monthlyTrend: { month: string; complaints: number; closed: number }[];
  praiseTerms: { term: string; count: number }[];
}

// Enhanced mock data
const DEPARTMENT_DATA: DepartmentData[] = [
  {
    name: 'Environment',
    rating: 4.2,
    totalFeedback: 156,
    appreciations: 48,
    trend: 0.3,
    totalComplaints: 342,
    closedComplaints: 298,
    onTimeResolutionPercent: 87,
    avgResolveTime: 2.4,
    serviceCompletionRate: 89,
    topComplaintTypes: [
      { type: 'Garbage not collected', count: 124 },
      { type: 'Illegal dumping', count: 89 },
      { type: 'Blocked drains', count: 67 },
      { type: 'Street sweeping', count: 42 },
      { type: 'Tree maintenance', count: 20 },
    ],
    monthlyTrend: [
      { month: 'Jul', complaints: 45, closed: 42 },
      { month: 'Aug', complaints: 52, closed: 48 },
      { month: 'Sep', complaints: 48, closed: 45 },
      { month: 'Oct', complaints: 55, closed: 52 },
      { month: 'Nov', complaints: 62, closed: 58 },
      { month: 'Dec', complaints: 80, closed: 53 },
    ],
    praiseTerms: [
      { term: 'Quick response', count: 24 },
      { term: 'Professional', count: 18 },
      { term: 'Friendly staff', count: 12 },
      { term: 'Clean streets', count: 8 },
    ],
  },
  {
    name: 'Water and Sewerage',
    rating: 3.8,
    totalFeedback: 203,
    appreciations: 32,
    trend: -0.2,
    totalComplaints: 456,
    closedComplaints: 378,
    onTimeResolutionPercent: 72,
    avgResolveTime: 3.8,
    serviceCompletionRate: 83,
    topComplaintTypes: [
      { type: 'Water outage', count: 156 },
      { type: 'Low pressure', count: 98 },
      { type: 'Sewage overflow', count: 87 },
      { type: 'Billing dispute', count: 65 },
      { type: 'Pipe burst', count: 50 },
    ],
    monthlyTrend: [
      { month: 'Jul', complaints: 68, closed: 55 },
      { month: 'Aug', complaints: 72, closed: 62 },
      { month: 'Sep', complaints: 85, closed: 70 },
      { month: 'Oct', complaints: 78, closed: 68 },
      { month: 'Nov', complaints: 82, closed: 70 },
      { month: 'Dec', complaints: 71, closed: 53 },
    ],
    praiseTerms: [
      { term: 'Fast repair', count: 15 },
      { term: 'Helpful', count: 10 },
      { term: 'Good communication', count: 7 },
    ],
  },
  {
    name: 'Works',
    rating: 3.5,
    totalFeedback: 178,
    appreciations: 22,
    trend: 0.1,
    totalComplaints: 512,
    closedComplaints: 398,
    onTimeResolutionPercent: 68,
    avgResolveTime: 5.2,
    serviceCompletionRate: 78,
    topComplaintTypes: [
      { type: 'Pothole', count: 198 },
      { type: 'Road damage', count: 134 },
      { type: 'Footpath repair', count: 78 },
      { type: 'Drainage issue', count: 56 },
      { type: 'Road marking', count: 46 },
    ],
    monthlyTrend: [
      { month: 'Jul', complaints: 78, closed: 58 },
      { month: 'Aug', complaints: 82, closed: 65 },
      { month: 'Sep', complaints: 90, closed: 72 },
      { month: 'Oct', complaints: 85, closed: 68 },
      { month: 'Nov', complaints: 88, closed: 70 },
      { month: 'Dec', complaints: 89, closed: 65 },
    ],
    praiseTerms: [
      { term: 'Quality work', count: 12 },
      { term: 'Efficient', count: 8 },
      { term: 'Professional', count: 2 },
    ],
  },
  {
    name: 'Public Health',
    rating: 4.0,
    totalFeedback: 92,
    appreciations: 28,
    trend: 0.4,
    totalComplaints: 234,
    closedComplaints: 212,
    onTimeResolutionPercent: 91,
    avgResolveTime: 1.8,
    serviceCompletionRate: 91,
    topComplaintTypes: [
      { type: 'Food hygiene', count: 78 },
      { type: 'Noise complaint', count: 65 },
      { type: 'Pest control', count: 42 },
      { type: 'Air quality', count: 28 },
      { type: 'Health hazard', count: 21 },
    ],
    monthlyTrend: [
      { month: 'Jul', complaints: 32, closed: 30 },
      { month: 'Aug', complaints: 38, closed: 35 },
      { month: 'Sep', complaints: 42, closed: 40 },
      { month: 'Oct', complaints: 40, closed: 38 },
      { month: 'Nov', complaints: 45, closed: 42 },
      { month: 'Dec', complaints: 37, closed: 27 },
    ],
    praiseTerms: [
      { term: 'Thorough inspection', count: 14 },
      { term: 'Helpful advice', count: 9 },
      { term: 'Quick action', count: 5 },
    ],
  },
  {
    name: 'Mobility and ICT Infrastructure',
    rating: 3.9,
    totalFeedback: 64,
    appreciations: 18,
    trend: 0.2,
    totalComplaints: 187,
    closedComplaints: 156,
    onTimeResolutionPercent: 79,
    avgResolveTime: 2.9,
    serviceCompletionRate: 83,
    topComplaintTypes: [
      { type: 'Streetlight out', count: 98 },
      { type: 'Traffic signal', count: 45 },
      { type: 'Public WiFi', count: 24 },
      { type: 'CCTV issue', count: 12 },
      { type: 'Digital signage', count: 8 },
    ],
    monthlyTrend: [
      { month: 'Jul', complaints: 28, closed: 24 },
      { month: 'Aug', complaints: 32, closed: 28 },
      { month: 'Sep', complaints: 30, closed: 26 },
      { month: 'Oct', complaints: 35, closed: 30 },
      { month: 'Nov', complaints: 32, closed: 28 },
      { month: 'Dec', complaints: 30, closed: 20 },
    ],
    praiseTerms: [
      { term: 'Fast repair', count: 10 },
      { term: 'Good coverage', count: 5 },
      { term: 'Modern equipment', count: 3 },
    ],
  },
  {
    name: 'Disaster Management',
    rating: 4.1,
    totalFeedback: 87,
    appreciations: 35,
    trend: 0.5,
    totalComplaints: 1174,
    closedComplaints: 982,
    onTimeResolutionPercent: 84,
    avgResolveTime: 0.4,
    serviceCompletionRate: 86,
    topComplaintTypes: [
      { type: 'Urban Flooding / Waterlogging', count: 412 },
      { type: 'Drain Overflow During Rainfall', count: 238 },
      { type: 'Blocked Stormwater Channel', count: 196 },
      { type: 'Flooded Homes / Property Inundation', count: 164 },
      { type: 'Fallen Tree / Obstruction After Storm', count: 91 },
      { type: 'Emergency Evacuation Support', count: 73 },
    ],
    monthlyTrend: [
      { month: 'Jul', complaints: 120, closed: 102 },
      { month: 'Aug', complaints: 145, closed: 124 },
      { month: 'Sep', complaints: 210, closed: 178 },
      { month: 'Oct', complaints: 245, closed: 208 },
      { month: 'Nov', complaints: 268, closed: 224 },
      { month: 'Dec', complaints: 186, closed: 146 },
    ],
    praiseTerms: [
      { term: 'Rapid response', count: 18 },
      { term: 'Coordinated', count: 9 },
      { term: 'Compassionate', count: 6 },
    ],
  },
];

const chartConfig = {
  complaints: { label: 'Total Complaints', color: 'hsl(var(--primary))' },
  closed: { label: 'Closed', color: 'hsl(var(--success))' },
};

interface DepartmentRatingsDetailProps {
  className?: string;
}

export function DepartmentRatingsDetail({ className }: DepartmentRatingsDetailProps) {
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentData | null>(null);

  return (
    <>
      <Card className={cn("ncc-card", className)}>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-secondary" />
            <CardTitle className="text-lg">Department Ratings</CardTitle>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-4 h-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Rating is based on citizen feedback and complaint resolutions. Appreciations reflect positive mentions submitted through the portal.</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
            {DEPARTMENT_DATA.map((dept) => (
              <button
                key={dept.name}
                onClick={() => setSelectedDepartment(dept)}
                className="p-3 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 hover:border-primary/50 transition-all text-left cursor-pointer group"
              >
                <div className="flex items-start gap-1 mb-2 min-h-[2rem]">
                  <p className="text-xs font-medium text-muted-foreground line-clamp-2 group-hover:text-foreground transition-colors flex-1" title={dept.name}>
                    {dept.name}
                  </p>
                  {dept.name === 'Disaster Management' && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-3 h-3 text-muted-foreground flex-shrink-0 mt-0.5" onClick={(e) => e.stopPropagation()} />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>Covers emergency complaints related to flooding, storms, evacuation support, and disaster response coordination.</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
                
                {/* Rating Row */}
                <div className="flex items-center gap-1.5 mb-2">
                  <Star className={cn(
                    "w-4 h-4 flex-shrink-0",
                    dept.rating >= 4 ? "text-yellow-500 fill-yellow-500" : 
                    dept.rating >= 3 ? "text-yellow-500 fill-yellow-500/50" : 
                    "text-yellow-500"
                  )} />
                  <span className="text-lg font-bold text-foreground">{dept.rating.toFixed(1)}</span>
                  <span className="text-xs text-muted-foreground">({dept.totalFeedback})</span>
                </div>

                {/* Appreciations & Trend Row */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-rose-500">
                    <Heart className="w-3 h-3 fill-rose-500" />
                    <span>{dept.appreciations}</span>
                  </div>
                  <div className={cn(
                    "flex items-center gap-0.5",
                    dept.trend > 0 ? "text-success" : "text-destructive"
                  )}>
                    {dept.trend > 0 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    <span>{dept.trend > 0 ? '+' : ''}{dept.trend.toFixed(1)}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <Dialog open={!!selectedDepartment} onOpenChange={() => setSelectedDepartment(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedDepartment && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">Department of {selectedDepartment.name}</DialogTitle>
              </DialogHeader>

              {/* Header Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 py-4 border-b border-border">
                <MetricCard 
                  label="Overall Rating" 
                  value={`${selectedDepartment.rating.toFixed(1)} / 5`}
                  icon={<Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                />
                <MetricCard 
                  label="Total Feedback" 
                  value={selectedDepartment.totalFeedback.toString()}
                  icon={<BarChart3 className="w-4 h-4 text-primary" />}
                />
                <MetricCard 
                  label="Appreciations" 
                  value={selectedDepartment.appreciations.toString()}
                  icon={<Heart className="w-4 h-4 text-rose-500 fill-rose-500" />}
                />
                <MetricCard 
                  label="Service Completion" 
                  value={`${selectedDepartment.serviceCompletionRate}%`}
                  icon={<CheckCircle2 className="w-4 h-4 text-success" />}
                />
                <MetricCard 
                  label="Avg. Resolve Time" 
                  value={`${selectedDepartment.avgResolveTime} days`}
                  icon={<Clock className="w-4 h-4 text-muted-foreground" />}
                />
                <MetricCard 
                  label="Last Month Trend" 
                  value={`${selectedDepartment.trend > 0 ? '+' : ''}${selectedDepartment.trend.toFixed(1)}`}
                  icon={selectedDepartment.trend > 0 ? 
                    <TrendingUp className="w-4 h-4 text-success" /> : 
                    <TrendingDown className="w-4 h-4 text-destructive" />
                  }
                  valueColor={selectedDepartment.trend > 0 ? 'text-success' : 'text-destructive'}
                />
              </div>

              {/* Tabs */}
              <Tabs defaultValue="summary" className="mt-4">
                <TabsList>
                  <TabsTrigger value="summary">Summary Dashboard</TabsTrigger>
                </TabsList>

                <TabsContent value="summary" className="space-y-6 mt-4">
                  {/* Row 1: Complaints Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="ncc-card">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Complaints</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold text-foreground">{selectedDepartment.totalComplaints}</p>
                        <p className="text-xs text-muted-foreground">This month</p>
                      </CardContent>
                    </Card>

                    <Card className="ncc-card">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Closed Complaints</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold text-success">{selectedDepartment.closedComplaints}</p>
                        <p className="text-xs text-muted-foreground">Successfully resolved</p>
                      </CardContent>
                    </Card>

                    <Card className="ncc-card">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">On-Time Resolution</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-3">
                          <div className="relative w-16 h-16">
                            <svg className="w-16 h-16 transform -rotate-90">
                              <circle
                                cx="32" cy="32" r="28"
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="none"
                                className="text-muted"
                              />
                              <circle
                                cx="32" cy="32" r="28"
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="none"
                                strokeDasharray={`${selectedDepartment.onTimeResolutionPercent * 1.76} 176`}
                                className="text-primary"
                              />
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
                              {selectedDepartment.onTimeResolutionPercent}%
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">Resolved within expected service time</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Row 2: Charts */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Top Complaint Types */}
                    <Card className="ncc-card">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Top Complaint Types</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ChartContainer config={chartConfig} className="h-[200px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart 
                              data={selectedDepartment.topComplaintTypes} 
                              layout="vertical"
                              margin={{ left: 0, right: 20 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                              <XAxis type="number" tick={{ fontSize: 10 }} />
                              <YAxis 
                                type="category" 
                                dataKey="type" 
                                tick={{ fontSize: 10 }} 
                                width={100}
                              />
                              <ChartTooltip content={<ChartTooltipContent />} />
                              <Bar dataKey="count" fill="hsl(var(--primary))" radius={4} />
                            </BarChart>
                          </ResponsiveContainer>
                        </ChartContainer>
                      </CardContent>
                    </Card>

                    {/* Monthly Trend */}
                    <Card className="ncc-card">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Monthly Trend</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ChartContainer config={chartConfig} className="h-[200px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={selectedDepartment.monthlyTrend}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                              <YAxis tick={{ fontSize: 10 }} />
                              <ChartTooltip content={<ChartTooltipContent />} />
                              <Line 
                                type="monotone" 
                                dataKey="complaints" 
                                stroke="hsl(var(--primary))" 
                                strokeWidth={2}
                                dot={{ r: 3 }}
                              />
                              <Line 
                                type="monotone" 
                                dataKey="closed" 
                                stroke="hsl(var(--success))" 
                                strokeWidth={2}
                                dot={{ r: 3 }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </ChartContainer>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Row 3: Appreciations */}
                  <Card className="ncc-card">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                        <CardTitle className="text-sm font-medium">Appreciations Received</CardTitle>
                        <Badge variant="secondary">{selectedDepartment.appreciations} total</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {selectedDepartment.praiseTerms.map((term) => (
                          <Badge 
                            key={term.term} 
                            variant="outline"
                            className="text-sm py-1.5 px-3"
                            style={{ 
                              fontSize: `${Math.min(0.875 + term.count * 0.02, 1.125)}rem`,
                              opacity: Math.min(0.6 + term.count * 0.02, 1)
                            }}
                          >
                            {term.term} ({term.count})
                          </Badge>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-3">Most-used praise terms from citizen feedback</p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function MetricCard({ 
  label, 
  value, 
  icon,
  valueColor = 'text-foreground'
}: { 
  label: string; 
  value: string; 
  icon: React.ReactNode;
  valueColor?: string;
}) {
  return (
    <div className="text-center p-3 rounded-lg bg-muted/30">
      <div className="flex items-center justify-center mb-1">{icon}</div>
      <p className={cn("text-lg font-bold", valueColor)}>{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

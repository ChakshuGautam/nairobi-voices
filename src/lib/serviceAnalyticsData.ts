// Mock data for service analytics dashboard

export interface ComplaintStats {
  totalComplaints: number;
  closedComplaints: number;
  slaAchievementPercent: number;
  completionRatePercent: number;
}

export interface TimeSeriesData {
  month: string;
  total: number;
  closed: number;
  reopened: number;
}

export interface SourceData {
  source: string;
  count: number;
}

export interface StatusData {
  status: string;
  count: number;
  color: string;
}

export interface DepartmentData {
  department: string;
  count: number;
  color: string;
}

export interface ChannelData {
  channel: string;
  count: number;
  color: string;
}

export interface UniqueCitizensData {
  month: string;
  count: number;
}

export interface TopComplaintData {
  category: string;
  count: number;
}

export interface StatusByBoundary {
  boundary: string;
  open: number;
  assigned: number;
  rejected: number;
  reassignRequested: number;
  reassigned: number;
  reopened: number;
  resolved: number;
  closed: number;
  total: number;
  completionRate: number;
  slaAchievement: number;
}

// KPI Definitions for tooltips
export const KPI_DEFINITIONS = {
  totalComplaints: "Unique number of complaints raised by citizen or employee. Total = Open + Assigned + Resolved + Closed + Reopened + Reassigned + Rejected.",
  closedComplaints: "Total number of complaints successfully resolved by the concerned authorities.",
  slaAchievement: "Percentage of complaints resolved within expected service time. Formula: (# complaints resolved within expected service time / Total Complaints) × 100.",
  completionRate: "Closed Complaints / Total Complaints. Formula: (Closed Complaints / Total Complaints) × 100.",
  reopenedComplaints: "Number of complaints reopened by the citizen (directly or via counter employee) due to unsuccessful resolution earlier.",
  openComplaints: "Number of complaints that have been filed by citizens and await further action (assignment).",
  assignedComplaints: "Number of complaints that have been assigned to an individual in the respective department.",
  rejectedComplaints: "Number of complaints terminated by the redressal officer; citizens must file a new complaint in such cases.",
  reassignRequested: "Number of complaints for which a reassignment has been requested by the last mile employee.",
  reassignedComplaints: "Number of complaints that have been reassigned to the redressal officer.",
  resolvedComplaints: "Number of complaints marked as done by last-mile employee and awaiting citizen feedback.",
  averageSolutionTime: "Average of (start to end) in a workflow, irrespective of status. The event duration is based on the metric.",
  uniqueCitizens: "Unique number of citizens who have filed at least one complaint for a given time range.",
  complaintsBySource: "Total complaints = aggregate of all complaints (open + assigned + closed + reassign requested + rejected + reopened).",
  complaintsByStatus: "Total complaints = aggregate of all complaints by status for the selected month/time range.",
  complaintsByDepartment: "Total complaints = aggregate of all complaints grouped by the department responsible.",
  complaintsByChannel: "Aggregate of all complaints grouped by the source they originate from – web/mobile/IVR/call centre/etc.",
};

// Base total for consistent data across charts (for 30days, all locations)
const BASE_TOTAL = 6250;

// Mock data generators
export function getOverviewStats(timeRange: string, subCounty: string): ComplaintStats {
  const baseMultiplier = timeRange === '7days' ? 0.25 : timeRange === '30days' ? 1 : timeRange === '90days' ? 3 : 4;
  const locationMultiplier = subCounty === 'all' ? 1 : 0.2;
  
  const total = Math.round(BASE_TOTAL * baseMultiplier * locationMultiplier);
  const closed = Math.round(total * 0.52); // 52% closed rate
  
  return {
    totalComplaints: total,
    closedComplaints: closed,
    slaAchievementPercent: 78.5,
    completionRatePercent: Math.round((closed / total) * 100 * 10) / 10,
  };
}

export function getCumulativeData(timeRange: string): TimeSeriesData[] {
  const periods = timeRange === '7days' 
    ? ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7']
    : timeRange === '30days'
    ? ['Week 1', 'Week 2', 'Week 3', 'Week 4']
    : timeRange === '90days'
    ? ['Month 1', 'Month 2', 'Month 3']
    : ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const multiplier = timeRange === '7days' ? 0.25 : timeRange === '30days' ? 1 : timeRange === '90days' ? 3 : 4;
  const targetTotal = Math.round(BASE_TOTAL * multiplier);
  const periodIncrement = targetTotal / periods.length;

  let totalCum = 0;
  let closedCum = 0;
  let reopenedCum = 0;

  return periods.map((period, index) => {
    totalCum = Math.round(periodIncrement * (index + 1));
    closedCum = Math.round(totalCum * 0.52);
    reopenedCum = Math.round(totalCum * 0.024);
    return {
      month: period,
      total: totalCum,
      closed: closedCum,
      reopened: reopenedCum,
    };
  });
}

// Source/Channel data - totals: 6,250
export function getComplaintsBySource(): SourceData[] {
  return [
    { source: 'Mobile App', count: 2200 },
    { source: 'Web Portal', count: 1400 },
    { source: 'Call Centre', count: 900 },
    { source: 'WhatsApp', count: 800 },
    { source: 'Walk-in Counter', count: 450 },
    { source: 'IVR', count: 300 },
    { source: 'USSD', count: 200 },
  ];
}

// Status data - totals: 6,250
export function getComplaintsByStatus(): StatusData[] {
  return [
    { status: 'Open', count: 230, color: 'hsl(205, 85%, 45%)' },
    { status: 'Assigned', count: 390, color: 'hsl(270, 60%, 50%)' },
    { status: 'In Progress', count: 310, color: 'hsl(38, 95%, 50%)' },
    { status: 'Resolved', count: 1780, color: 'hsl(145, 70%, 35%)' },
    { status: 'Closed', count: 3250, color: 'hsl(145, 75%, 28%)' },
    { status: 'Reopened', count: 150, color: 'hsl(0, 75%, 50%)' },
    { status: 'Rejected', count: 85, color: 'hsl(0, 0%, 45%)' },
    { status: 'Reassign Requested', count: 55, color: 'hsl(30, 90%, 55%)' },
  ];
}

// Department data - totals: 6,250
export function getComplaintsByDepartment(): DepartmentData[] {
  return [
    { department: 'Environment', count: 2050, color: 'hsl(145, 70%, 35%)' },
    { department: 'Water and Sewerage', count: 1650, color: 'hsl(205, 85%, 45%)' },
    { department: 'Works', count: 1350, color: 'hsl(38, 95%, 50%)' },
    { department: 'Public Health', count: 750, color: 'hsl(270, 60%, 50%)' },
    { department: 'Mobility and ICT Infrastructure', count: 450, color: 'hsl(0, 75%, 50%)' },
    { department: 'Disaster Management', count: 1174, color: 'hsl(190, 65%, 28%)' },
  ];
}

// Channel data - totals: 6,250
export function getComplaintsByChannel(): ChannelData[] {
  return [
    { channel: 'Mobile App', count: 2200, color: 'hsl(145, 70%, 35%)' },
    { channel: 'Web', count: 1400, color: 'hsl(205, 85%, 45%)' },
    { channel: 'Call Centre/IVR', count: 1200, color: 'hsl(38, 95%, 50%)' },
    { channel: 'WhatsApp', count: 800, color: 'hsl(145, 75%, 40%)' },
    { channel: 'Walk-in', count: 450, color: 'hsl(0, 75%, 50%)' },
    { channel: 'USSD', count: 200, color: 'hsl(270, 60%, 50%)' },
  ];
}

export function getAverageSolutionTime(): { avg: number; min: number; median: number; max: number } {
  return { avg: 0.6, min: 0.1, median: 0.4, max: 3 }; // weeks
}

export function getUniqueCitizensData(timeRange: string): UniqueCitizensData[] {
  const periods = timeRange === '7days' 
    ? ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7']
    : timeRange === '30days'
    ? ['Week 1', 'Week 2', 'Week 3', 'Week 4']
    : timeRange === '90days'
    ? ['Month 1', 'Month 2', 'Month 3']
    : ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Unique citizens should be ~70% of total complaints
  const baseCitizens = [950, 980, 1020, 1050, 1100, 1150, 1200];
  
  return periods.map((period, index) => ({
    month: period,
    count: baseCitizens[index % baseCitizens.length],
  }));
}

// Top complaints - totals: 7,424 (6,250 base + 1,174 Disaster Management)
export function getTopComplaints(): TopComplaintData[] {
  return [
    { category: 'Garbage Collection Missed', count: 1400 },
    { category: 'Water Supply Interrupted', count: 1100 },
    { category: 'Pothole Repair Needed', count: 950 },
    { category: 'Streetlight Not Working', count: 700 },
    { category: 'Illegal Dumping', count: 600 },
    { category: 'Sewage Overflow', count: 550 },
    { category: 'Road Flooding', count: 550 },
    { category: 'Urban Flooding / Waterlogging', count: 412 },
    { category: 'Noisy Construction', count: 400 },
    { category: 'Drain Overflow During Rainfall', count: 238 },
    { category: 'Blocked Stormwater Channel', count: 196 },
    { category: 'Flooded Homes / Property Inundation', count: 164 },
    { category: 'Fallen Tree / Obstruction After Storm', count: 91 },
    { category: 'Emergency Evacuation Support', count: 73 },
  ];
}

export function getStatusByBoundary(dimension: 'ward' | 'department'): StatusByBoundary[] {
  // Fixed data for consistency
  const wardData = [
    { boundary: 'Westlands', open: 35, assigned: 58, rejected: 12, reassignRequested: 8, reassigned: 5, reopened: 22, resolved: 265, closed: 485, total: 890 },
    { boundary: 'Kilimani', open: 28, assigned: 48, rejected: 10, reassignRequested: 7, reassigned: 4, reopened: 18, resolved: 220, closed: 405, total: 740 },
    { boundary: 'Parklands', open: 32, assigned: 52, rejected: 11, reassignRequested: 7, reassigned: 5, reopened: 20, resolved: 238, closed: 435, total: 800 },
    { boundary: 'Eastleigh', open: 30, assigned: 50, rejected: 11, reassignRequested: 7, reassigned: 4, reopened: 19, resolved: 225, closed: 414, total: 760 },
    { boundary: 'Kasarani', open: 38, assigned: 62, rejected: 14, reassignRequested: 9, reassigned: 6, reopened: 24, resolved: 282, closed: 515, total: 950 },
    { boundary: 'Embakasi', open: 40, assigned: 65, rejected: 14, reassignRequested: 9, reassigned: 6, reopened: 25, resolved: 295, closed: 546, total: 1000 },
    { boundary: 'Lang\'ata', open: 22, assigned: 38, rejected: 8, reassignRequested: 5, reassigned: 3, reopened: 14, resolved: 168, closed: 312, total: 570 },
    { boundary: 'Dagoretti', open: 25, assigned: 42, rejected: 9, reassignRequested: 6, reassigned: 4, reopened: 16, resolved: 190, closed: 348, total: 640 },
  ];
  
  const deptData = [
    { boundary: 'Solid Waste', open: 52, assigned: 85, rejected: 18, reassignRequested: 12, reassigned: 8, reopened: 32, resolved: 380, closed: 700, total: 1287 },
    { boundary: 'Water & Sewerage', open: 48, assigned: 78, rejected: 17, reassignRequested: 11, reassigned: 7, reopened: 30, resolved: 350, closed: 644, total: 1185 },
    { boundary: 'Roads', open: 42, assigned: 68, rejected: 15, reassignRequested: 10, reassigned: 6, reopened: 26, resolved: 305, closed: 563, total: 1035 },
    { boundary: 'Street Lighting', open: 25, assigned: 42, rejected: 9, reassignRequested: 6, reassigned: 4, reopened: 16, resolved: 188, closed: 345, total: 635 },
    { boundary: 'Public Health', open: 35, assigned: 58, rejected: 13, reassignRequested: 8, reassigned: 5, reopened: 22, resolved: 262, closed: 482, total: 885 },
    { boundary: 'Markets', open: 28, assigned: 46, rejected: 10, reassignRequested: 7, reassigned: 4, reopened: 18, resolved: 210, closed: 390, total: 713 },
  ];

  const items = dimension === 'ward' ? wardData : deptData;

  return items.map((item) => ({
    ...item,
    completionRate: Math.round((item.closed / item.total) * 100 * 10) / 10,
    slaAchievement: Math.round((item.closed + item.resolved) / item.total * 85 * 10) / 10,
  }));
}

// Time ranges — only windows the analytics KPI API actually supports.
// Values map to KPI windows via toAnalyticsWindow() in analyticsApi.ts.
export const TIME_RANGES = [
  { value: '1day', label: 'Last 24 hours' },
  { value: '7days', label: 'Last 7 days' },
  { value: '30days', label: 'Last 30 days' },
  { value: 'mtd', label: 'Month to date' },
];

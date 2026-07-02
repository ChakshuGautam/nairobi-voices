// Static config for the service analytics dashboard.

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

// Time ranges — only windows the analytics KPI API actually supports.
// Values map to KPI windows via toAnalyticsWindow() in analyticsApi.ts.
export const TIME_RANGES = [
  { value: '1day', label: 'Last 24 hours' },
  { value: '7days', label: 'Last 7 days' },
  { value: '30days', label: 'Last 30 days' },
  { value: 'mtd', label: 'Month to date' },
];

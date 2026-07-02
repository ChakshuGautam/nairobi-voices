// DIGIT PGR-ready data structures for Nairobi County Citizen Engagement

export type IssueCategory = 'roads' | 'water' | 'waste' | 'streetlights' | 'noise' | 'other';
export type StoryCategory = 'complaint' | 'idea' | 'appreciation';
export type TicketStatus = 'new' | 'assigned' | 'in_progress' | 'resolved' | 'escalated';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type WorkflowAction = 'CREATE' | 'ASSIGN' | 'IN_PROGRESS' | 'REQUEST_INFO' | 'RESOLVE' | 'ESCALATE' | 'CLOSE' | 'REOPEN';

export interface WorkflowHistoryItem {
  id: string;
  performedBy: string;
  performedByRole: 'citizen' | 'officer' | 'system';
  action: WorkflowAction;
  note?: string;
  timestamp: string;
}

export interface TicketRemark {
  id: string;
  by: string;
  byRole: 'citizen' | 'officer';
  text: string;
  timestamp: string;
  attachments?: { fileStoreId: string; fileName: string }[];
}

export interface CitizenInfo {
  name: string;
  mobileNumber?: string;
  email?: string;
}

export interface SLAInfo {
  dueInHours: number;
  remaining: number; // can be negative if overdue
  deadline: string;
}

export interface Story {
  id: string;
  ticketId: string; // Reference number for citizens
  tenantId: string;
  category: StoryCategory;
  issueCategory?: IssueCategory;
  serviceCode?: string; // DIGIT PGR service code
  title: string;
  description: string;
  audioUrl?: string;
  audioBlob?: Blob;
  audioDuration?: number;
  photos?: string[]; // URLs to uploaded photos
  attachments?: { fileStoreId: string; fileName: string }[];
  lat: number;
  lng: number;
  locationDescription?: string;
  wardCode?: string;
  wardName?: string;
  createdAt: string;
  updatedAt?: string;
  source: string;
  
  // Contact info
  reporterName?: string;
  reporterPhone?: string;
  citizen?: CitizenInfo;
  
  // Rating (1-5 stars)
  serviceRating?: number;
  
  // Status tracking
  status: TicketStatus;
  priority?: TicketPriority;
  assignedTo?: string;
  assignedDepartment?: string;
  departmentCode?: string;
  
  // SLA tracking
  slaDeadline?: string;
  sla?: SLAInfo;
  isOverdue?: boolean;
  
  // Updates and comments (legacy)
  updates?: TicketUpdate[];
  satisfactionRating?: number; // Post-resolution rating
  
  // Workflow history (DIGIT-compatible)
  history?: WorkflowHistoryItem[];
  remarks?: TicketRemark[];
  
  // DIGIT PGR mapping
  serviceRequestId?: string;
}

export interface TicketUpdate {
  id: string;
  message: string;
  author: string;
  authorType: 'citizen' | 'staff';
  createdAt: string;
}

export type DepartmentSelectionSource = 'AUTO' | 'USER_OVERRIDE';

export type NairobiDepartment = 
  | 'Environment'
  | 'Water and Sewerage'
  | 'Works'
  | 'Public Health'
  | 'Mobility and ICT Infrastructure'
  | 'To be assigned';

export const NAIROBI_DEPARTMENTS: NairobiDepartment[] = [
  'Environment',
  'Water and Sewerage',
  'Works',
  'Public Health',
  'Mobility and ICT Infrastructure',
];

export const CATEGORY_TO_DEPARTMENT: Record<IssueCategory, NairobiDepartment> = {
  roads: 'Works',
  water: 'Water and Sewerage',
  waste: 'Environment',
  streetlights: 'Mobility and ICT Infrastructure',
  noise: 'Public Health',
  other: 'To be assigned',
};

export interface BeneficiaryInfo {
  isOnBehalf: boolean;
  name?: string;
  phone?: string;
  relationship?: string;
  receiveUpdates: boolean;
}

export interface StorySubmission {
  category: StoryCategory;
  issueCategory?: IssueCategory;
  // Live DIGIT PGR service code (set by the category picker once wired to
  // MDMS ServiceDefs). Preferred over `issueCategory` when building a PGR
  // _create body; falls back to the ISSUE_CATEGORIES mapping when absent.
  serviceCode?: string;
  // Human-readable ward name (from boundary localization) paired with wardCode.
  wardName?: string;
  title: string;
  description?: string;
  audioBlob?: Blob;
  audioDuration?: number;
  photos?: File[];
  lat?: number;
  lng?: number;
  locationDescription?: string;
  wardCode?: string;
  reporterName?: string;
  reporterPhone?: string;
  shareContactWithDepartment?: boolean;
  serviceRating?: number;
  responsibleDepartment?: NairobiDepartment;
  departmentSelectionSource?: DepartmentSelectionSource;
  beneficiary?: BeneficiaryInfo;
}

export interface Ward {
  code: string;
  name: string;
  subcounty: string;
  center: { lat: number; lng: number };
}

// Nairobi County wards (sample data)
export const NAIROBI_WARDS: Ward[] = [
  { code: 'westlands', name: 'Westlands', subcounty: 'Westlands', center: { lat: -1.2673, lng: 36.8058 } },
  { code: 'parklands', name: 'Parklands/Highridge', subcounty: 'Westlands', center: { lat: -1.2621, lng: 36.8135 } },
  { code: 'kilimani', name: 'Kilimani', subcounty: 'Dagoretti North', center: { lat: -1.2892, lng: 36.7865 } },
  { code: 'karen', name: 'Karen', subcounty: 'Lang\'ata', center: { lat: -1.3196, lng: 36.7128 } },
  { code: 'langata', name: 'Lang\'ata', subcounty: 'Lang\'ata', center: { lat: -1.3550, lng: 36.7600 } },
  { code: 'kibera', name: 'Kibera', subcounty: 'Kibra', center: { lat: -1.3133, lng: 36.7833 } },
  { code: 'embakasi_central', name: 'Embakasi Central', subcounty: 'Embakasi Central', center: { lat: -1.3100, lng: 36.8900 } },
  { code: 'ruaraka', name: 'Ruaraka', subcounty: 'Ruaraka', center: { lat: -1.2450, lng: 36.8750 } },
  { code: 'kasarani', name: 'Kasarani', subcounty: 'Kasarani', center: { lat: -1.2208, lng: 36.8956 } },
  { code: 'roysambu', name: 'Roysambu', subcounty: 'Roysambu', center: { lat: -1.2167, lng: 36.8833 } },
  { code: 'mathare', name: 'Mathare', subcounty: 'Mathare', center: { lat: -1.2633, lng: 36.8583 } },
  { code: 'starehe', name: 'Starehe', subcounty: 'Starehe', center: { lat: -1.2833, lng: 36.8333 } },
  { code: 'nairobi_central', name: 'Nairobi Central', subcounty: 'Starehe', center: { lat: -1.2864, lng: 36.8172 } },
];

export const ISSUE_CATEGORIES: { code: IssueCategory; label: string; icon: string; description: string; serviceCode: string }[] = [
  { code: 'roads', label: 'Roads & Potholes', icon: '🛣️', description: 'Potholes, road damage, traffic issues', serviceCode: 'ROAD_MAINTENANCE' },
  { code: 'water', label: 'Water & Sewage', icon: '💧', description: 'Leaks, blockages, water supply', serviceCode: 'WATER_SUPPLY' },
  { code: 'waste', label: 'Waste & Garbage', icon: '🗑️', description: 'Garbage collection, dumping', serviceCode: 'WASTE_MANAGEMENT' },
  { code: 'streetlights', label: 'Streetlights', icon: '💡', description: 'Broken or missing lights', serviceCode: 'STREET_LIGHTING' },
  { code: 'noise', label: 'Noise & Pollution', icon: '🔊', description: 'Noise complaints, air quality', serviceCode: 'ENVIRONMENTAL' },
  { code: 'other', label: 'Other Issues', icon: '📋', description: 'Other service requests', serviceCode: 'GENERAL' },
];

export const CATEGORY_LABELS: Record<StoryCategory, string> = {
  complaint: 'Report a Problem',
  idea: 'Share an Idea',
  appreciation: 'Give Thanks',
};

export const CATEGORY_DESCRIPTIONS: Record<StoryCategory, string> = {
  complaint: 'Something that needs fixing or attention',
  idea: 'A suggestion to improve our county',
  appreciation: 'Something good that happened',
};

export const STATUS_LABELS: Record<TicketStatus, { label: string; color: string; bgColor: string }> = {
  new: { label: 'New', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  assigned: { label: 'Assigned', color: 'text-purple-700', bgColor: 'bg-purple-100' },
  in_progress: { label: 'In Progress', color: 'text-amber-700', bgColor: 'bg-amber-100' },
  resolved: { label: 'Resolved', color: 'text-green-700', bgColor: 'bg-green-100' },
  escalated: { label: 'Escalated', color: 'text-red-700', bgColor: 'bg-red-100' },
};

export const PRIORITY_LABELS: Record<TicketPriority, { label: string; color: string }> = {
  LOW: { label: 'Low', color: 'text-slate-600' },
  MEDIUM: { label: 'Medium', color: 'text-blue-600' },
  HIGH: { label: 'High', color: 'text-orange-600' },
  URGENT: { label: 'Urgent', color: 'text-red-600' },
};

export const WORKFLOW_ACTION_LABELS: Record<WorkflowAction, { label: string; icon: string }> = {
  CREATE: { label: 'Created', icon: '📝' },
  ASSIGN: { label: 'Assigned', icon: '👤' },
  IN_PROGRESS: { label: 'In Progress', icon: '🔧' },
  REQUEST_INFO: { label: 'Info Requested', icon: '❓' },
  RESOLVE: { label: 'Resolved', icon: '✅' },
  ESCALATE: { label: 'Escalated', icon: '⚠️' },
  CLOSE: { label: 'Closed', icon: '🔒' },
  REOPEN: { label: 'Reopened', icon: '🔓' },
};
// Types for government and community updates - "What's Happening Around Me"

export type HappeningType = 
  | 'INFRASTRUCTURE'
  | 'EVENT'
  | 'NOTICE'
  | 'SERVICE'
  | 'EMERGENCY'
  | 'COMMUNITY';

export type ProjectStatus = 
  | 'PLANNED'
  | 'FUNDED'
  | 'PROCUREMENT'
  | 'WORKS_ONGOING'
  | 'COMPLETED'
  | 'DELAYED';

export type TimelineStageStatus = 'DONE' | 'IN_PROGRESS' | 'PENDING';

export interface ProjectTimelineItem {
  stage: string;
  status: TimelineStageStatus;
  date: string | null;
  note?: string;
}

export interface RelatedTicket {
  id: string;
  summary: string;
}

export interface RelatedSurvey {
  id: string;
  title: string;
}

export interface PublicUpdate {
  date: string;
  text: string;
}

export interface ProjectComment {
  id: string;
  author: string;
  authorType: 'citizen' | 'official';
  text: string;
  timestamp: string;
  affectedAs?: string;
  helpfulCount: number;
}

export interface ProjectEngagement {
  followers: number;
  followersThisWeek: number;
  comments: number;
  linkedComplaints: number;
  surveyResponses: number;
}

export interface ProjectDetails {
  status: ProjectStatus;
  budget?: string;
  financialYear?: string;
  expectedEndDate?: string;
  fullDescription?: string;
  timeline?: ProjectTimelineItem[];
  relatedTickets?: RelatedTicket[];
  relatedSurveys?: RelatedSurvey[];
  publicUpdates?: PublicUpdate[];
  comments?: ProjectComment[];
  engagement?: ProjectEngagement;
}

export interface Happening {
  id: string;
  wardCode: string;
  wardName?: string;
  title: string;
  summary: string;
  source: string;
  date: string;
  endDate?: string;
  type: HappeningType;
  lat: number;
  lng: number;
  link?: string;
  isActive: boolean;
  // Extended project details
  projectDetails?: ProjectDetails;
}

export const HAPPENING_TYPE_LABELS: Record<HappeningType, string> = {
  INFRASTRUCTURE: 'Road & Infrastructure',
  EVENT: 'Community Event',
  NOTICE: 'Official Notice',
  SERVICE: 'Service Update',
  EMERGENCY: 'Emergency Alert',
  COMMUNITY: 'Community Activity',
};

export const HAPPENING_TYPE_ICONS: Record<HappeningType, string> = {
  INFRASTRUCTURE: '🚧',
  EVENT: '📅',
  NOTICE: '📢',
  SERVICE: '🏛️',
  EMERGENCY: '⚠️',
  COMMUNITY: '🤝',
};

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  PLANNED: 'Planned',
  FUNDED: 'Funded',
  PROCUREMENT: 'Procurement',
  WORKS_ONGOING: 'Works Ongoing',
  COMPLETED: 'Completed',
  DELAYED: 'Delayed',
};

export const PROJECT_STATUS_COLORS: Record<ProjectStatus, string> = {
  PLANNED: 'bg-gray-100 text-gray-700 border-gray-200',
  FUNDED: 'bg-blue-100 text-blue-700 border-blue-200',
  PROCUREMENT: 'bg-purple-100 text-purple-700 border-purple-200',
  WORKS_ONGOING: 'bg-orange-100 text-orange-700 border-orange-200',
  COMPLETED: 'bg-green-100 text-green-700 border-green-200',
  DELAYED: 'bg-red-100 text-red-700 border-red-200',
};

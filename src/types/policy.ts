export type PolicyStatus = 'open' | 'closing_soon' | 'closed';

export interface PolicyComment {
  id: string;
  author: string;
  authorType?: 'resident' | 'business' | 'youth' | 'trader' | 'community' | 'other';
  comment: string;
  timestamp: string;
  relatedClause?: string; // Optional: which clause this feedback relates to
  reactions?: {
    helpful: number;
    insightful: number;
    concern: number;
  };
}

export interface PolicyEngagement {
  supportCount: number;
  opposeCount: number;
  commentCount: number;
}

export interface PolicyClause {
  id: string;
  title: string;
  content: string;
  section?: string;
}

export interface Policy {
  id: string;
  title: string;
  summary: string;
  fullDescription: string;
  department: string;
  status: PolicyStatus;
  deadline: string;
  documentUrl: string;
  documentName: string;
  documentSize: string;
  publishedDate: string;
  comments: PolicyComment[];
  engagement: PolicyEngagement;
  clauses?: PolicyClause[];
}

// Pure mappers between DIGIT PGR shapes and the app's `Story` model.
//
// Nothing here performs I/O — everything is a deterministic transform so it can
// be unit-tested and reused by both apiClient and the analytics reducers.

import {
  IssueCategory,
  ISSUE_CATEGORIES,
  Story,
  StorySubmission,
  TicketRemark,
  TicketStatus,
  TicketUpdate,
  WorkflowAction,
  WorkflowHistoryItem,
} from '@/types/story';
import { CITY_TENANT_ID, MAP_CENTER, PGR_SOURCE } from './config';
import type { Session } from './auth';

// ---------------------------------------------------------------------------
// PGR wire types (subset of the fields Bomet returns — see contract §PGR)
// ---------------------------------------------------------------------------

export interface PgrCitizen {
  id?: string | number;
  uuid?: string;
  name?: string;
  mobileNumber?: string;
  emailId?: string;
}

export interface PgrGeoLocation {
  latitude?: number;
  longitude?: number;
}

export interface PgrAddress {
  tenantId?: string;
  city?: string;
  locality?: { code?: string; name?: string };
  geoLocation?: PgrGeoLocation;
}

export interface PgrDocument {
  id?: string;
  documentType?: string;
  fileStoreId?: string;
  documentUid?: string;
  fileName?: string;
}

export interface PgrAuditDetails {
  createdBy?: string;
  lastModifiedBy?: string;
  createdTime?: number;
  lastModifiedTime?: number;
}

export interface PgrProcessInstance {
  id?: string;
  action?: string;
  comment?: string | null;
  assigner?: { name?: string; uuid?: string } | null;
  assignes?: Array<{ name?: string; uuid?: string }> | null;
  state?: { state?: string; applicationStatus?: string } | null;
  auditDetails?: PgrAuditDetails;
}

export interface PgrService {
  id?: string;
  tenantId?: string;
  serviceCode?: string;
  serviceRequestId?: string;
  description?: string;
  accountId?: string;
  rating?: number;
  source?: string;
  applicationStatus?: string;
  active?: boolean;
  citizen?: PgrCitizen;
  address?: PgrAddress;
  additionalDetail?: { department?: string; serviceName?: string; [k: string]: unknown } | null;
  documents?: PgrDocument[] | null;
  auditDetails?: PgrAuditDetails;
  processInstance?: PgrProcessInstance | null;
}

export interface ServiceWrapper {
  service: PgrService;
  workflow?: unknown;
  processInstance?: PgrProcessInstance | null;
}

/** A row from MDMS RAINMAKER-PGR.ServiceDefs (contract §Categories). */
export interface ServiceDef {
  serviceCode: string;
  name: string;
  menuPath?: string;
  department?: string;
  slaHours?: number;
  keywords?: string[];
  active?: boolean;
}

/** Optional per-ticket enrichment fed in by apiClient (needs extra calls). */
export interface PgrToStoryOptions {
  /** SLA window in hours (from the matching ServiceDef). Enables sla/slaDeadline. */
  slaHours?: number;
  /** Full workflow history for the ticket (from workflow process _search). */
  processes?: PgrProcessInstance[];
  /** UUID of the logged-in citizen, used to attribute remark authorship. */
  citizenUuid?: string;
}

// ---------------------------------------------------------------------------
// Status + action maps
// ---------------------------------------------------------------------------

/** PGR applicationStatus → app TicketStatus (collapsed to the 5 UI buckets). */
export const STATUS_MAP: Record<string, TicketStatus> = {
  PENDINGFORASSIGNMENT: 'new',
  PENDINGFORREASSIGNMENT: 'assigned',
  PENDINGATLME: 'assigned',
  PENDINGATSUPERVISOR: 'in_progress',
  RESOLVED: 'resolved',
  RESOLVEDBYSUPERVISOR: 'resolved',
  CLOSEDAFTERRESOLUTION: 'resolved',
  REJECTED: 'resolved',
  CLOSEDAFTERREJECTION: 'resolved',
  CANCELLED: 'resolved',
};

export function mapStatus(applicationStatus?: string): TicketStatus {
  if (!applicationStatus) return 'new';
  return STATUS_MAP[applicationStatus.toUpperCase()] ?? 'new';
}

/** PGR workflow action → app WorkflowAction. Unmapped actions are skipped from the timeline. */
const ACTION_MAP: Record<string, WorkflowAction | undefined> = {
  APPLY: 'CREATE',
  ASSIGN: 'ASSIGN',
  REASSIGN: 'ASSIGN',
  SENDBACK: 'REQUEST_INFO',
  SENDBACKTOCITIZEN: 'REQUEST_INFO',
  RESOLVE: 'RESOLVE',
  REJECT: 'CLOSE',
  CLOSE: 'CLOSE',
  CLOSEAFTERRESOLUTION: 'CLOSE',
  ESCALATE: 'ESCALATE',
  REOPEN: 'REOPEN',
};

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

function toIso(epochMs?: number): string | undefined {
  return typeof epochMs === 'number' && epochMs > 0 ? new Date(epochMs).toISOString() : undefined;
}

/** "BOMET_BOMET_CENTRAL" → "Bomet Central" (drops the leading county token). */
export function prettifyBoundaryCode(code?: string): string {
  if (!code) return '';
  let segments = code.split('_').filter(Boolean);
  if (segments.length > 1 && segments[0].toUpperCase() === 'BOMET') segments = segments.slice(1);
  return segments
    .map((s) => (s.length ? s[0].toUpperCase() + s.slice(1).toLowerCase() : s))
    .join(' ');
}

/** A complaint's headline + body are packed into PGR `description` as "title\n\nbody". */
function splitDescription(raw?: string): { title: string; description: string } {
  const text = (raw ?? '').trim();
  if (!text) return { title: 'Complaint', description: '' };
  const idx = text.indexOf('\n\n');
  if (idx >= 0) return { title: text.slice(0, idx).trim(), description: text.slice(idx + 2).trim() };
  return { title: text, description: text };
}

function composeDescription(title: string, body?: string): string {
  const t = (title ?? '').trim();
  const b = (body ?? '').trim();
  return b ? `${t}\n\n${b}` : t;
}

/**
 * Best-effort mapping of a PGR serviceCode to one of the 6 app IssueCategory
 * values. Bomet's 47 codes are health-sector, so most fall through to 'other'
 * (which the UI renders gracefully — no icon, no crash).
 */
export function mapServiceCodeToIssueCategory(serviceCode?: string, serviceName?: string): IssueCategory {
  const hay = `${serviceCode ?? ''} ${serviceName ?? ''}`.toLowerCase();
  if (/road|pothole|street(?!light)/.test(hay)) return 'roads';
  if (/water|sewer|borehole|tap/.test(hay)) return 'water';
  if (/waste|garbage|refuse|dump|sanitation/.test(hay)) return 'waste';
  if (/light|lamp|electric/.test(hay)) return 'streetlights';
  if (/noise|pollution|environment/.test(hay)) return 'noise';
  return 'other';
}

/** Resolve the PGR serviceCode to send for a submission (prefers a live code). */
export function resolveServiceCode(submission: StorySubmission): string | undefined {
  if (submission.serviceCode) return submission.serviceCode;
  const match = ISSUE_CATEGORIES.find((c) => c.code === submission.issueCategory);
  return match?.serviceCode;
}

function mapDocuments(docs?: PgrDocument[] | null): Story['attachments'] {
  if (!docs || docs.length === 0) return undefined;
  return docs
    .filter((d) => d.fileStoreId)
    .map((d) => ({ fileStoreId: d.fileStoreId as string, fileName: d.fileName || d.documentType || 'Attachment' }));
}

function buildHistory(s: PgrService, processes?: PgrProcessInstance[]): WorkflowHistoryItem[] {
  const ref = s.serviceRequestId || s.id || 'ticket';
  const items: WorkflowHistoryItem[] = [
    {
      id: `${ref}-create`,
      performedBy: s.citizen?.name || 'Citizen',
      performedByRole: 'citizen',
      action: 'CREATE',
      timestamp: toIso(s.auditDetails?.createdTime) || new Date().toISOString(),
      note: 'Complaint filed',
    },
  ];

  const source = processes && processes.length ? processes : s.processInstance ? [s.processInstance] : [];
  for (const p of source) {
    const action = ACTION_MAP[(p.action || '').toUpperCase()];
    if (!action || action === 'CREATE') continue;
    items.push({
      id: p.id || `${ref}-${action}-${p.auditDetails?.createdTime ?? items.length}`,
      performedBy: p.assigner?.name || p.assignes?.[0]?.name || 'County Staff',
      performedByRole: 'officer',
      action,
      timestamp: toIso(p.auditDetails?.createdTime) || new Date().toISOString(),
      note: p.comment || undefined,
    });
  }

  items.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  return items;
}

function buildRemarks(
  s: PgrService,
  processes?: PgrProcessInstance[],
  citizenUuid?: string,
): TicketRemark[] | undefined {
  const source = processes && processes.length ? processes : s.processInstance ? [s.processInstance] : [];
  const remarks: TicketRemark[] = [];
  const ref = s.serviceRequestId || s.id || 'ticket';
  for (const p of source) {
    const text = (p.comment || '').trim();
    if (!text) continue;
    const authorUuid = p.assigner?.uuid;
    const byCitizen = Boolean(citizenUuid && authorUuid && authorUuid === citizenUuid);
    remarks.push({
      id: p.id || `${ref}-remark-${p.auditDetails?.createdTime ?? remarks.length}`,
      by: p.assigner?.name || (byCitizen ? s.citizen?.name || 'Citizen' : 'County Staff'),
      byRole: byCitizen ? 'citizen' : 'officer',
      text,
      timestamp: toIso(p.auditDetails?.createdTime) || new Date().toISOString(),
    });
  }
  return remarks.length ? remarks : undefined;
}

/** Ticket "updates" feed (used by TicketCard comment count + timelines) — derived from remarks. */
function buildUpdates(remarks?: TicketRemark[]): TicketUpdate[] | undefined {
  if (!remarks || !remarks.length) return undefined;
  return remarks.map((r) => ({
    id: r.id,
    message: r.text,
    author: r.by,
    authorType: r.byRole === 'citizen' ? 'citizen' : 'staff',
    createdAt: r.timestamp,
  }));
}

// ---------------------------------------------------------------------------
// PGR → Story
// ---------------------------------------------------------------------------

export function pgrToStory(wrapper: ServiceWrapper, opts: PgrToStoryOptions = {}): Story {
  const s: PgrService = wrapper.service || {};
  const processes = opts.processes ?? (wrapper.processInstance ? [wrapper.processInstance] : undefined);

  const status = mapStatus(s.applicationStatus);
  const { title, description } = splitDescription(s.description);
  const wardCode = s.address?.locality?.code;
  const wardName = s.address?.locality?.name || prettifyBoundaryCode(wardCode) || undefined;
  const lat = s.address?.geoLocation?.latitude ?? MAP_CENTER.lat;
  const lng = s.address?.geoLocation?.longitude ?? MAP_CENTER.lng;
  const citizenName = s.citizen?.name;
  const createdAt = toIso(s.auditDetails?.createdTime) || new Date().toISOString();
  const updatedAt = toIso(s.auditDetails?.lastModifiedTime);
  const ref = s.serviceRequestId || s.id || '';

  const story: Story = {
    id: ref || createdAt,
    ticketId: ref,
    tenantId: s.tenantId || CITY_TENANT_ID,
    category: 'complaint',
    issueCategory: mapServiceCodeToIssueCategory(s.serviceCode, s.additionalDetail?.serviceName),
    serviceCode: s.serviceCode,
    title,
    description,
    lat,
    lng,
    wardCode,
    wardName,
    createdAt,
    updatedAt,
    source: 'BOMET_VOICES',
    reporterName: citizenName,
    reporterPhone: s.citizen?.mobileNumber,
    citizen: citizenName
      ? { name: citizenName, mobileNumber: s.citizen?.mobileNumber, email: s.citizen?.emailId }
      : undefined,
    serviceRating: s.rating,
    satisfactionRating: s.rating,
    status,
    assignedDepartment: s.additionalDetail?.department,
    departmentCode: s.additionalDetail?.department,
    attachments: mapDocuments(s.documents),
    history: buildHistory(s, processes),
    remarks: buildRemarks(s, processes, opts.citizenUuid),
    serviceRequestId: s.serviceRequestId,
  };
  story.updates = buildUpdates(story.remarks);

  if (opts.slaHours && s.auditDetails?.createdTime) {
    const deadlineMs = s.auditDetails.createdTime + opts.slaHours * 3600 * 1000;
    const remainingH = Math.round((deadlineMs - Date.now()) / 3600000);
    const deadlineIso = new Date(deadlineMs).toISOString();
    story.slaDeadline = deadlineIso;
    story.sla = { dueInHours: opts.slaHours, remaining: remainingH, deadline: deadlineIso };
    story.isOverdue = remainingH < 0 && status !== 'resolved';
  }

  return story;
}

// ---------------------------------------------------------------------------
// StorySubmission → PGR service (for _create)
// ---------------------------------------------------------------------------

/**
 * Build the `service` object for a PGR `_create` from a report submission.
 * The citizen block is intentionally omitted — PGR derives it from the auth
 * token. `session` is accepted for symmetry/future use (e.g. accountId).
 */
export function storySubmissionToPgr(
  submission: StorySubmission,
  session?: Session,
): PgrService {
  void session;
  const serviceCode = resolveServiceCode(submission);
  const wardCode = submission.wardCode;
  const wardName = submission.wardName || prettifyBoundaryCode(wardCode) || undefined;

  return {
    tenantId: CITY_TENANT_ID,
    serviceCode,
    description: composeDescription(submission.title, submission.description),
    source: PGR_SOURCE,
    address: {
      tenantId: CITY_TENANT_ID,
      city: 'Bomet',
      locality: wardCode ? { code: wardCode, name: wardName } : undefined,
      // geoLocation MUST be a non-null object — persister crashes otherwise.
      geoLocation: {
        latitude: submission.lat ?? MAP_CENTER.lat,
        longitude: submission.lng ?? MAP_CENTER.lng,
      },
    },
  };
}

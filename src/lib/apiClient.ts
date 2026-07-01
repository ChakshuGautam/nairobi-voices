// API Client for the Nairobi Voices citizen-engagement SPA.
//
// This module is served FROM the Bomet DIGIT server, so every call is
// same-origin and hits the live PGR / MDMS / boundary / localization services
// through http.ts. The public surface (method names + signatures) is unchanged
// from the previous in-memory mock — only the implementations now talk to
// DIGIT. See BOMET_API_CONTRACT.md for the authoritative contract.

import {
  IssueCategory,
  Story,
  StoryCategory,
  StorySubmission,
  TicketRemark,
  TicketStatus,
  TicketUpdate,
  Ward,
} from '@/types/story';
import { CITY_TENANT_ID, DEFAULT_LOCALE, MAP_CENTER, STATE_TENANT_ID } from './config';
import { digitPost, digitUpload } from './http';
import { ensureSession, getSession, normalizeKeMobile, Session } from './auth';
import {
  PgrProcessInstance,
  PgrService,
  pgrToStory,
  prettifyBoundaryCode,
  ServiceDef,
  ServiceWrapper,
  storySubmissionToPgr,
} from './digitMappers';

// ---------------------------------------------------------------------------
// Endpoints
// ---------------------------------------------------------------------------

const PGR_CREATE = '/pgr-services/v2/request/_create';
const PGR_SEARCH = '/pgr-services/v2/request/_search';
const PGR_UPDATE = '/pgr-services/v2/request/_update';
const MDMS_SEARCH = '/mdms-v2/v2/_search';
const BOUNDARY_SEARCH = '/boundary-service/boundary/_search';
const LOCALIZATION_SEARCH = '/localization/messages/v1/_search';
const FILESTORE_UPLOAD = '/filestore/v1/files';
const WORKFLOW_SEARCH = '/egov-workflow-v2/egov-wf/process/_search';

interface PgrResponse {
  ServiceWrappers?: ServiceWrapper[];
}

function generateLocalId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

// ---------------------------------------------------------------------------
// PGR search helpers
// ---------------------------------------------------------------------------

type SearchQuery = Record<string, string | number | undefined>;

async function pgrSearch(query: SearchQuery, session?: Session | null): Promise<ServiceWrapper[]> {
  const res = await digitPost<PgrResponse>(
    PGR_SEARCH,
    {},
    { auth: session ?? undefined, query: { tenantId: CITY_TENANT_ID, ...query } },
  );
  return res.ServiceWrappers ?? [];
}

/** Page through PGR search until fewer than a full page is returned. */
async function pgrSearchAll(query: SearchQuery, session?: Session | null): Promise<ServiceWrapper[]> {
  const pageSize = 100;
  const all: ServiceWrapper[] = [];
  let offset = 0;
  for (let guard = 0; guard < 100; guard++) {
    const page = await pgrSearch({ ...query, limit: pageSize, offset }, session);
    all.push(...page);
    if (page.length < pageSize) break;
    offset += pageSize;
  }
  return all;
}

async function fetchRawService(serviceRequestId: string, session: Session): Promise<PgrService | null> {
  const wrappers = await pgrSearch({ serviceRequestId }, session);
  return wrappers[0]?.service ?? null;
}

async function fetchWorkflowProcesses(serviceRequestId: string): Promise<PgrProcessInstance[]> {
  try {
    const res = await digitPost<{ ProcessInstances?: PgrProcessInstance[] }>(
      WORKFLOW_SEARCH,
      {},
      { auth: getSession() ?? undefined, query: { tenantId: CITY_TENANT_ID, businessIds: serviceRequestId, history: true } },
    );
    return res.ProcessInstances ?? [];
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// ServiceDefs + localization caches
// ---------------------------------------------------------------------------

let serviceDefsCache: ServiceDef[] | null = null;
let slaMapCache: Map<string, number> | null = null;
const localizationCache = new Map<string, Map<string, string>>();

async function loadServiceDefs(): Promise<ServiceDef[]> {
  if (serviceDefsCache) return serviceDefsCache;
  try {
    const res = await digitPost<{ mdms?: Array<{ data?: Record<string, unknown> }> }>(
      MDMS_SEARCH,
      { MdmsCriteria: { tenantId: CITY_TENANT_ID, schemaCode: 'RAINMAKER-PGR.ServiceDefs', limit: 500 } },
      { auth: getSession() ?? undefined },
    );
    const defs: ServiceDef[] = (res.mdms ?? [])
      .map((m) => (m.data ?? {}) as Record<string, unknown>)
      .filter((d) => typeof d.serviceCode === 'string')
      .map((d) => ({
        serviceCode: d.serviceCode as string,
        name: (d.name as string) ?? '',
        menuPath: d.menuPath as string | undefined,
        department: d.department as string | undefined,
        slaHours: typeof d.slaHours === 'number' ? (d.slaHours as number) : undefined,
        keywords: Array.isArray(d.keywords) ? (d.keywords as string[]) : undefined,
        active: d.active as boolean | undefined,
      }));
    serviceDefsCache = defs;
    return defs;
  } catch {
    return [];
  }
}

async function slaHoursMap(): Promise<Map<string, number>> {
  if (slaMapCache) return slaMapCache;
  const map = new Map<string, number>();
  for (const d of await loadServiceDefs()) {
    if (d.serviceCode && typeof d.slaHours === 'number') map.set(d.serviceCode, d.slaHours);
  }
  slaMapCache = map;
  return map;
}

async function loadLocalization(module: string): Promise<Map<string, string>> {
  const cached = localizationCache.get(module);
  if (cached) return cached;
  const map = new Map<string, string>();
  try {
    const res = await digitPost<{ messages?: Array<{ code: string; message: string }> }>(
      LOCALIZATION_SEARCH,
      {},
      { auth: getSession() ?? undefined, query: { tenantId: STATE_TENANT_ID, locale: DEFAULT_LOCALE, module } },
    );
    for (const m of res.messages ?? []) map.set(m.code, m.message);
  } catch {
    /* localization is best-effort — fall back to prettified codes */
  }
  localizationCache.set(module, map);
  return map;
}

/** Map a list of wrappers to Story[], enriching SLA from cached ServiceDefs. */
async function toStories(wrappers: ServiceWrapper[], session?: Session | null): Promise<Story[]> {
  const slaMap = await slaHoursMap();
  const uuid = session?.user?.uuid;
  return wrappers.map((w) =>
    pgrToStory(w, { slaHours: slaMap.get(w.service?.serviceCode ?? ''), citizenUuid: uuid }),
  );
}

// ---------------------------------------------------------------------------
// _update helper
// ---------------------------------------------------------------------------

async function pgrUpdate(
  serviceRequestId: string,
  workflow: { action: string; comments?: string; assignes?: unknown },
  mutate?: (service: PgrService) => void,
): Promise<Story | null> {
  const session = getSession();
  if (!session) return null;
  const service = await fetchRawService(serviceRequestId, session);
  if (!service) return null;
  if (mutate) mutate(service);

  const res = await digitPost<PgrResponse>(PGR_UPDATE, { service, workflow }, { auth: session });
  const wrapper = res.ServiceWrappers?.[0];
  if (!wrapper) return null;

  const slaMap = await slaHoursMap();
  const processes = await fetchWorkflowProcesses(serviceRequestId);
  return pgrToStory(wrapper, {
    slaHours: slaMap.get(wrapper.service?.serviceCode ?? ''),
    processes,
    citizenUuid: session.user?.uuid,
  });
}

// ---------------------------------------------------------------------------
// Public API — identical signatures to the previous mock
// ---------------------------------------------------------------------------

export const apiClient = {
  /**
   * Create a complaint (DIGIT PGR /_create).
   * Silently ensures a citizen session from the reporter's phone/name first,
   * uploads any photos to filestore, then files the complaint. Returns a Story
   * whose `ticketId` is the DIGIT serviceRequestId (e.g. PG-PGR-YYYY-MM-DD-NNNNNN).
   */
  async createStory(submission: StorySubmission): Promise<Story> {
    const mobile = normalizeKeMobile(submission.reporterPhone);
    if (!mobile) {
      throw new Error('A valid Kenyan mobile number is required to file a complaint.');
    }

    const session = await ensureSession(mobile, submission.reporterName);
    const service = storySubmissionToPgr(submission, session);
    if (!service.serviceCode) {
      throw new Error(
        'No serviceCode resolved for this complaint. Wire the category picker to live ServiceDefs ' +
          '(apiClient.getServiceDefs) so the submission carries a real Bomet serviceCode.',
      );
    }

    // Upload photos + voice note to filestore and attach as PGR documents (best-effort).
    const documents: Array<{ documentType: string; fileStoreId: string }> = [];
    if (submission.photos && submission.photos.length > 0) {
      try {
        const uploaded = await digitUpload<{ files?: Array<{ fileStoreId: string }> }>(
          FILESTORE_UPLOAD,
          submission.photos,
          { query: { tenantId: CITY_TENANT_ID, module: 'pgr' }, auth: session },
        );
        for (const f of uploaded.files ?? []) {
          if (f.fileStoreId) documents.push({ documentType: 'PHOTO', fileStoreId: f.fileStoreId });
        }
      } catch (err) {
        console.warn('Photo upload failed; filing complaint without photos.', err);
      }
    }
    if (submission.audioBlob) {
      try {
        const voiceFile = new File(
          [submission.audioBlob],
          'voice-note.webm',
          { type: submission.audioBlob.type || 'audio/webm' },
        );
        const uploaded = await digitUpload<{ files?: Array<{ fileStoreId: string }> }>(
          FILESTORE_UPLOAD,
          [voiceFile],
          { query: { tenantId: CITY_TENANT_ID, module: 'pgr' }, auth: session },
        );
        for (const f of uploaded.files ?? []) {
          if (f.fileStoreId) documents.push({ documentType: 'VOICE_NOTE', fileStoreId: f.fileStoreId });
        }
      } catch (err) {
        console.warn('Voice-note upload failed; filing complaint without audio.', err);
      }
    }
    if (documents.length > 0) {
      service.documents = documents;
    }

    const res = await digitPost<PgrResponse>(
      PGR_CREATE,
      { service, workflow: { action: 'APPLY' } },
      { auth: session },
    );
    const wrapper = res.ServiceWrappers?.[0];
    if (!wrapper) {
      throw new Error('PGR _create returned no ServiceWrapper.');
    }

    const slaMap = await slaHoursMap();
    return pgrToStory(wrapper, {
      slaHours: slaMap.get(wrapper.service?.serviceCode ?? ''),
      citizenUuid: session.user?.uuid,
    });
  },

  /**
   * Search complaints (DIGIT PGR /_search). With a citizen token PGR scopes
   * results to the logged-in citizen; filters are applied client-side against
   * the mapped Story[]. Returns [] when there is no session.
   */
  async getStories(filters?: {
    category?: StoryCategory;
    issueCategory?: IssueCategory;
    wardCode?: string;
    status?: TicketStatus;
    limit?: number;
  }): Promise<Story[]> {
    const session = getSession();
    if (!session) return [];

    const wrappers = await pgrSearchAll({}, session);
    let stories = await toStories(wrappers, session);

    if (filters?.category) stories = stories.filter((s) => s.category === filters.category);
    if (filters?.issueCategory) stories = stories.filter((s) => s.issueCategory === filters.issueCategory);
    if (filters?.wardCode) stories = stories.filter((s) => s.wardCode === filters.wardCode);
    if (filters?.status) stories = stories.filter((s) => s.status === filters.status);
    if (filters?.limit) stories = stories.slice(0, filters.limit);

    return stories;
  },

  /**
   * The current citizen's complaints (DIGIT PGR /_search?mobileNumber=).
   * If a phone is supplied and there is no session, one is established silently.
   */
  async getMyTickets(phone?: string): Promise<Story[]> {
    let session = getSession();
    if (!session && phone) {
      const mobile = normalizeKeMobile(phone);
      if (mobile) session = await ensureSession(mobile);
    }
    if (!session) return [];

    const wrappers = await pgrSearchAll({ mobileNumber: session.mobile }, session);
    return toStories(wrappers, session);
  },

  /**
   * Fetch a single complaint by its serviceRequestId (== Story.id / ticketId),
   * enriched with workflow history for the timeline + remarks tabs.
   */
  async getStory(id: string): Promise<Story | null> {
    const session = getSession();
    const wrappers = await pgrSearch({ serviceRequestId: id }, session);
    const wrapper = wrappers[0];
    if (!wrapper) return null;

    const serviceRequestId = wrapper.service?.serviceRequestId || id;
    const [processes, slaMap] = await Promise.all([
      fetchWorkflowProcesses(serviceRequestId),
      slaHoursMap(),
    ]);
    return pgrToStory(wrapper, {
      processes,
      slaHours: slaMap.get(wrapper.service?.serviceCode ?? ''),
      citizenUuid: session?.user?.uuid,
    });
  },

  /** Fetch by ticket reference — identical to getStory (ticketId == serviceRequestId). */
  async getStoryByTicketId(ticketId: string): Promise<Story | null> {
    return this.getStory(ticketId);
  },

  /**
   * Add a citizen comment (DIGIT PGR /_update, action COMMENT). Returns an
   * optimistic TicketUpdate; callers re-fetch via getStory to render the
   * persisted thread.
   */
  async addComment(storyId: string, message: string): Promise<TicketUpdate> {
    const session = getSession();
    await pgrUpdate(storyId, { action: 'COMMENT', comments: message });
    return {
      id: generateLocalId(),
      message,
      author: session?.user?.name || 'Citizen',
      authorType: 'citizen',
      createdAt: new Date().toISOString(),
    };
  },

  /** Add a remark (DIGIT PGR /_update, action COMMENT). Returns an optimistic TicketRemark. */
  async addRemark(
    storyId: string,
    text: string,
    byRole: 'citizen' | 'officer',
    byName?: string,
  ): Promise<TicketRemark> {
    const session = getSession();
    await pgrUpdate(storyId, { action: 'COMMENT', comments: text });
    return {
      id: generateLocalId(),
      by: byName || session?.user?.name || (byRole === 'citizen' ? 'Citizen' : 'County Officer'),
      byRole,
      text,
      timestamp: new Date().toISOString(),
    };
  },

  /**
   * Update status (officer-side; unused by the citizen UI). Best-effort mapping
   * of app status → PGR workflow action.
   */
  async updateStatus(storyId: string, status: TicketStatus, note?: string): Promise<Story | null> {
    const actionMap: Record<TicketStatus, string> = {
      new: 'COMMENT',
      assigned: 'ASSIGN',
      in_progress: 'ASSIGN',
      resolved: 'RESOLVE',
      escalated: 'ESCALATE',
    };
    return pgrUpdate(storyId, { action: actionMap[status] || 'COMMENT', comments: note });
  },

  /**
   * Escalate a complaint. Citizens cannot ESCALATE from most PGR states, so
   * this records the request as a COMMENT and returns the refreshed Story.
   */
  async escalateTicket(storyId: string, reason: string): Promise<Story | null> {
    return pgrUpdate(storyId, { action: 'COMMENT', comments: `Escalation requested: ${reason}` });
  },

  /** Rate a resolved complaint (DIGIT PGR /_update, action RATE, service.rating). */
  async rateSatisfaction(storyId: string, rating: number): Promise<Story | null> {
    return pgrUpdate(storyId, { action: 'RATE', comments: `Rated ${rating}/5` }, (service) => {
      service.rating = rating;
    });
  },

  /**
   * Bomet ADMIN wards (boundary-service) with display names from localization
   * (module rainmaker-common), falling back to a prettified code.
   */
  async getWards(): Promise<Ward[]> {
    const session = getSession();
    let codes: string[] = [];
    try {
      // boundary-service returns the entity array under the capitalised `Boundary`
      // key (lowercase `boundary` is the relationship-search shape) — accept both.
      const res = await digitPost<{ Boundary?: Array<{ code: string }>; boundary?: Array<{ code: string }> }>(
        BOUNDARY_SEARCH,
        {},
        { auth: session ?? undefined, query: { tenantId: CITY_TENANT_ID, hierarchyType: 'ADMIN', boundaryType: 'Ward' } },
      );
      codes = (res.Boundary ?? res.boundary ?? []).map((b) => b.code).filter(Boolean);
    } catch {
      return [];
    }
    const loc = await loadLocalization('rainmaker-common');
    return codes.map((code) => ({
      code,
      name: loc.get(code) || prettifyBoundaryCode(code),
      subcounty: '',
      center: { lat: MAP_CENTER.lat, lng: MAP_CENTER.lng },
    }));
  },

  /**
   * PGR ServiceDefs (MDMS RAINMAKER-PGR.ServiceDefs) with localized names,
   * grouped-friendly by menuPath — for the report category picker.
   */
  async getServiceDefs(): Promise<ServiceDef[]> {
    const [defs, loc] = await Promise.all([loadServiceDefs(), loadLocalization('rainmaker-pgr')]);
    return defs.map((d) => ({
      ...d,
      name: loc.get(`SERVICEDEFS.${d.serviceCode.toUpperCase()}`) || d.name || prettifyBoundaryCode(d.serviceCode),
    }));
  },
};

// ---------------------------------------------------------------------------
// Browser-only speech helpers (unchanged — no DIGIT dependency)
// ---------------------------------------------------------------------------

// Placeholder for future speech-to-text integration
export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  console.log('Audio transcription placeholder - audio size:', audioBlob.size);
  return '[Voice message - transcription coming soon]';
}

// Text-to-speech utility using Web Speech API
export function speakText(text: string, lang: string = 'en-US'): Promise<void> {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      console.warn('Text-to-speech not supported');
      resolve();
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.9;
    utterance.pitch = 1;

    utterance.onend = () => resolve();
    utterance.onerror = (e) => {
      console.error('Speech synthesis error:', e);
      resolve();
    };

    window.speechSynthesis.speak(utterance);
  });
}

export function stopSpeaking(): void {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

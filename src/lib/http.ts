// Thin fetch wrapper for all DIGIT calls.
//
// Every DIGIT request in the app funnels through this module so that URL
// building (BASE_URL prefix + query string), RequestInfo assembly, JSON/form
// encoding, auth-token injection and error typing live in exactly one place.

import { BASE_URL, BASIC_AUTH, DEFAULT_LOCALE, STATE_TENANT_ID } from './config';

/** A DIGIT role entry as carried in UserRequest / RequestInfo.userInfo. */
export interface DigitRole {
  code: string;
  name: string;
  tenantId: string;
}

/** The `userInfo` block attached to every RequestInfo. */
export interface UserInfo {
  id?: number | string;
  uuid?: string;
  userName?: string;
  name?: string;
  mobileNumber?: string;
  emailId?: string;
  type?: string;
  tenantId?: string;
  roles?: DigitRole[];
}

/** The RequestInfo envelope required by every DIGIT service. */
export interface RequestInfo {
  apiId: string;
  ver: string;
  ts: number;
  action: string;
  did: string;
  key: string;
  msgId: string;
  authToken: string | null;
  userInfo: UserInfo;
}

/** Minimal, structurally-typed view of an auth session used to build RequestInfo. */
export interface SessionLike {
  token?: string | null;
  user?: UserInfo | null;
}

/** Anonymous userInfo stub — DIGIT controllers NPE at loggedInUserId() when userInfo is null. */
const ANONYMOUS_USER: UserInfo = {
  id: 1,
  uuid: '1',
  userName: 'anonymous',
  name: 'Anonymous',
  type: 'CITIZEN',
  tenantId: STATE_TENANT_ID,
  roles: [],
};

/**
 * Build the RequestInfo envelope. When a session is supplied its token +
 * userInfo are attached; otherwise a safe anonymous stub is used so
 * unauthenticated calls (e.g. citizen registration) still parse server-side.
 */
export function buildRequestInfo(session?: SessionLike | null): RequestInfo {
  return {
    apiId: 'Rainmaker',
    ver: '1.0',
    ts: 0,
    action: '',
    did: '1',
    key: '',
    msgId: `${Date.now()}|${DEFAULT_LOCALE}`,
    authToken: session?.token ?? null,
    userInfo: session?.user ?? ANONYMOUS_USER,
  };
}

/** Typed error thrown for any non-2xx DIGIT response. */
export class DigitApiError extends Error {
  readonly status: number;
  readonly path: string;
  readonly body: unknown;

  constructor(message: string, status: number, path: string, body: unknown) {
    super(message);
    this.name = 'DigitApiError';
    this.status = status;
    this.path = path;
    this.body = body;
  }
}

type QueryValue = string | number | boolean | undefined | null;
type Query = Record<string, QueryValue>;

function buildUrl(path: string, query?: Query): string {
  const base = `${BASE_URL}${path}`;
  if (!query) return base;
  const parts: string[] = [];
  for (const [k, v] of Object.entries(query)) {
    if (v === undefined || v === null) continue;
    parts.push(`${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
  }
  if (parts.length === 0) return base;
  return `${base}${base.includes('?') ? '&' : '?'}${parts.join('&')}`;
}

async function parseBody(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function ensureOk(res: Response, path: string): Promise<unknown> {
  const body = await parseBody(res);
  if (!res.ok) {
    const detail =
      body && typeof body === 'object'
        ? // DIGIT error envelope: { Errors: [{ code, message }] } or { error_description }
          (body as Record<string, unknown>)['error_description'] ??
          (Array.isArray((body as Record<string, unknown>)['Errors'])
            ? JSON.stringify((body as Record<string, unknown>)['Errors'])
            : undefined)
        : undefined;
    throw new DigitApiError(
      `DIGIT ${res.status} on ${path}${detail ? `: ${String(detail)}` : ''}`,
      res.status,
      path,
      body,
    );
  }
  return body;
}

export interface DigitPostOptions {
  /** Session whose token + userInfo populate RequestInfo. */
  auth?: SessionLike | null;
  /** Query-string params appended to the path. */
  query?: Query;
  /** When false, RequestInfo is NOT merged into the body. Defaults to true. */
  withRequestInfo?: boolean;
  signal?: AbortSignal;
}

/**
 * JSON POST to a DIGIT service. By default a fresh RequestInfo (built from
 * `options.auth`) is merged into the request body — callers pass only the
 * domain payload (e.g. `{ service, workflow }`).
 */
export async function digitPost<T = unknown>(
  path: string,
  body: Record<string, unknown>,
  options: DigitPostOptions = {},
): Promise<T> {
  const withRi = options.withRequestInfo !== false;
  const payload: Record<string, unknown> = withRi
    ? { RequestInfo: buildRequestInfo(options.auth), ...body }
    : { ...body };

  const res = await fetch(buildUrl(path, options.query), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
    signal: options.signal,
  });
  return (await ensureOk(res, path)) as T;
}

export interface DigitFormOptions {
  /** Value for the `Authorization: Basic <...>` header. Defaults to the user-client secret. */
  basicAuth?: string;
  query?: Query;
  signal?: AbortSignal;
}

/**
 * x-www-form-urlencoded POST — used for the OAuth token endpoint, which does
 * NOT take a RequestInfo and requires HTTP Basic auth.
 */
export async function digitForm<T = unknown>(
  path: string,
  form: Record<string, string>,
  options: DigitFormOptions = {},
): Promise<T> {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(form)) params.append(k, v);

  const res = await fetch(buildUrl(path, options.query), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
      Authorization: `Basic ${options.basicAuth ?? BASIC_AUTH}`,
    },
    body: params.toString(),
    signal: options.signal,
  });
  return (await ensureOk(res, path)) as T;
}

export interface DigitUploadOptions {
  query?: Query;
  auth?: SessionLike | null;
  /** Form field name for each file. DIGIT filestore expects `file`. */
  fieldName?: string;
  signal?: AbortSignal;
}

/**
 * Multipart file upload (DIGIT filestore). Does NOT send a RequestInfo body;
 * the auth token, when present, is forwarded via the `auth-token` header.
 */
export async function digitUpload<T = unknown>(
  path: string,
  files: File[] | Blob[],
  options: DigitUploadOptions = {},
): Promise<T> {
  const field = options.fieldName ?? 'file';
  const fd = new FormData();
  files.forEach((f, i) => {
    const name = f instanceof File ? f.name : `upload-${i}`;
    fd.append(field, f, name);
  });

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (options.auth?.token) headers['auth-token'] = options.auth.token;

  const res = await fetch(buildUrl(path, options.query), {
    method: 'POST',
    headers,
    body: fd,
    signal: options.signal,
  });
  return (await ensureOk(res, path)) as T;
}

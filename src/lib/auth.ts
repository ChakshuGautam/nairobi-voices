// Citizen authentication for the Bomet DIGIT deployment.
//
// Flow (per BOMET_API_CONTRACT.md §Auth):
//   1. try  POST /user/oauth/token           (grant_type=password, mock OTP)
//   2. fail → POST /user/citizen/_create      (silent register, RequestInfo REQUIRED)
//   3. retry POST /user/oauth/token
//
// OTP is a fixed mock ("123456") that Kong request-termination always accepts,
// so `ensureSession` can silently log a citizen in from just their phone number
// during the report flow — no OTP screen required.

import { MOCK_OTP, SESSION_STORAGE_KEY, STATE_TENANT_ID } from './config';
import { digitForm, digitPost, DigitRole, UserInfo } from './http';

/** The authenticated user block returned by /user/oauth/token (UserRequest). */
export interface SessionUser extends UserInfo {
  id: number | string;
  uuid: string;
  userName: string;
  name: string;
  mobileNumber: string;
  type: string;
  tenantId: string;
  roles: DigitRole[];
}

/** A persisted citizen session. */
export interface Session {
  token: string;
  user: SessionUser;
  mobile: string;
}

interface OAuthTokenResponse {
  access_token: string;
  refresh_token?: string;
  UserRequest: SessionUser;
}

// ---------------------------------------------------------------------------
// Session persistence
// ---------------------------------------------------------------------------

let cached: Session | null | undefined;

export function getSession(): Session | null {
  if (cached !== undefined) return cached;
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(SESSION_STORAGE_KEY) : null;
    cached = raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    cached = null;
  }
  return cached;
}

export function setSession(session: Session): void {
  cached = session;
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch {
    /* storage unavailable — keep the in-memory copy only */
  }
}

export function logout(): void {
  cached = null;
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

// ---------------------------------------------------------------------------
// Phone normalization
// ---------------------------------------------------------------------------

/**
 * Normalize a Kenyan mobile number to the 9-digit form DIGIT expects
 * (`^[17][0-9]{8}$`). Handles spaces, a leading 0, and a +254 / 254 prefix.
 * Examples: "0712 345 678" → "712345678", "+254712345678" → "712345678".
 */
export function normalizeKeMobile(raw?: string): string {
  let digits = (raw ?? '').replace(/\D/g, '');
  if (digits.startsWith('254') && digits.length === 12) digits = digits.slice(3);
  if (digits.length === 10 && digits.startsWith('0')) digits = digits.slice(1);
  return digits;
}

/** True when the value is a valid 9-digit Kenyan mobile. */
export function isValidKeMobile(raw?: string): boolean {
  return /^[17][0-9]{8}$/.test(normalizeKeMobile(raw));
}

// ---------------------------------------------------------------------------
// OTP + login
// ---------------------------------------------------------------------------

/** Send an OTP for login/register (mock — always accepted server-side). */
export async function sendOtp(mobile: string, type: 'login' | 'register' = 'login'): Promise<void> {
  const normalized = normalizeKeMobile(mobile);
  await digitPost(
    '/user-otp/v1/_send',
    { otp: { mobileNumber: normalized, tenantId: STATE_TENANT_ID, type, userType: 'CITIZEN' } },
    { query: { tenantId: STATE_TENANT_ID } },
  );
}

async function authenticate(mobile: string, otp: string): Promise<OAuthTokenResponse | null> {
  try {
    return await digitForm<OAuthTokenResponse>('/user/oauth/token', {
      username: mobile,
      password: otp,
      tenantId: STATE_TENANT_ID,
      userType: 'CITIZEN',
      scope: 'read',
      grant_type: 'password',
    });
  } catch {
    return null;
  }
}

async function register(mobile: string, name?: string): Promise<void> {
  await digitPost(
    '/user/citizen/_create',
    {
      User: {
        name: name?.trim() || mobile,
        username: mobile,
        mobileNumber: mobile,
        type: 'CITIZEN',
        tenantId: STATE_TENANT_ID,
        otpReference: MOCK_OTP,
        roles: [{ code: 'CITIZEN', name: 'Citizen', tenantId: STATE_TENANT_ID }],
      },
    },
    { query: { tenantId: STATE_TENANT_ID } },
  );
}

/**
 * Verify an OTP and return a live session. Implements the standard digit-ui
 * citizen flow: authenticate → on failure register → retry authenticate.
 */
export async function verifyAndLogin(mobile: string, otp: string, name?: string): Promise<Session> {
  const normalized = normalizeKeMobile(mobile);
  if (!isValidKeMobile(normalized)) {
    throw new Error(`Invalid Kenyan mobile number: "${mobile}" (expected 9 digits starting 1 or 7).`);
  }

  let token = await authenticate(normalized, otp);
  if (!token) {
    await register(normalized, name);
    token = await authenticate(normalized, otp);
  }
  if (!token || !token.access_token) {
    throw new Error('Citizen authentication failed after register + retry.');
  }

  const session: Session = {
    token: token.access_token,
    user: token.UserRequest,
    mobile: normalized,
  };
  setSession(session);
  return session;
}

/**
 * Ensure a live citizen session exists for `mobile`, silently registering +
 * logging in with the mock OTP if needed. Reuses a cached session when it
 * already belongs to the same phone number.
 */
export async function ensureSession(mobile?: string, name?: string): Promise<Session> {
  const normalized = normalizeKeMobile(mobile);
  const existing = getSession();
  if (existing && existing.mobile === normalized && existing.token) return existing;
  return verifyAndLogin(normalized, MOCK_OTP, name);
}

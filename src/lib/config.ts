// Central DIGIT/Bomet configuration.
//
// The Nairobi Voices SPA is deployed FROM the Bomet DIGIT server
// (https://bometfeedbackhub.digit.org). Every API call is therefore
// SAME-ORIGIN, so the default BASE_URL is "" (relative paths that nginx
// forwards to Kong :18000). All values can be overridden at build time via
// Vite env vars for local development against a remote gateway.
//
// See /root/nairobi-voices/BOMET_API_CONTRACT.md for the authoritative,
// live-verified contract these constants are derived from.

const env = import.meta.env;

/** Same-origin by default. Override with VITE_DIGIT_BASE_URL (no trailing slash). */
export const BASE_URL: string = (env.VITE_DIGIT_BASE_URL ?? '').replace(/\/$/, '');

/** State / root tenant — used for auth, OTP and localization. */
export const STATE_TENANT_ID: string = env.VITE_STATE_TENANT ?? 'ke';

/** City tenant — used for PGR, MDMS and boundary calls. */
export const CITY_TENANT_ID: string = env.VITE_CITY_TENANT ?? 'ke.bomet';

/** PGR `service.source` value expected by the Bomet deployment. */
export const PGR_SOURCE = 'web';

/** Basic auth for the OAuth token endpoint — base64("egov-user-client:"). */
export const BASIC_AUTH = 'ZWdvdi11c2VyLWNsaWVudDo=';

/** Fixed mock OTP (Kong request-termination returns 200 for /user-otp + /otp). */
export const MOCK_OTP = '123456';

/** Default map / geo-location centre (Bomet). Used when a report has no coordinates. */
export const MAP_CENTER = { lat: -0.7817, lng: 35.3428 } as const;

/** Default locale for localization + msgId suffixes. */
export const DEFAULT_LOCALE = 'en_IN';

/** localStorage key holding the persisted citizen {@link import('./auth').Session}. */
export const SESSION_STORAGE_KEY = 'voices.session';

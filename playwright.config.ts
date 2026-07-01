import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config for the Nairobi Voices SPA (wired to live Bomet DIGIT APIs).
 *
 * Target is configurable so the suite runs anywhere:
 *   VOICES_BASE_URL   base URL under test (default: the live Bomet deployment)
 *   VOICES_RESOLVE    optional "host:ip" to map the domain to a VPC/private IP
 *                     (e.g. "bometfeedbackhub.digit.org:10.0.0.2") — needed when
 *                     the public DNS/route isn't reachable but the VPC is.
 *   VOICES_ALLOW_WRITE=1  opt in to tests that create real data (register a
 *                     citizen, file a complaint). Off by default so read-only
 *                     runs never pollute the live tenant.
 *
 * The app is served from the DIGIT origin (same-origin API calls), so tests hit
 * the deployed URL — there is no local webServer.
 */
// Ensure a trailing slash so relative goto('data') resolves under /voices/.
const BASE_URL =
  (process.env.VOICES_BASE_URL || 'https://bometfeedbackhub.digit.org/voices').replace(/\/$/, '') + '/';

const resolve = process.env.VOICES_RESOLVE; // "host:ip"
const launchArgs: string[] = [];
if (resolve) {
  const [host, ip] = resolve.split(':');
  launchArgs.push(`--host-resolver-rules=MAP ${host} ${ip}`, '--ignore-certificate-errors');
}

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  timeout: 60_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL: BASE_URL,
    ignoreHTTPSErrors: true,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 45_000,
    launchOptions: { args: launchArgs },
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});

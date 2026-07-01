import { Page, expect } from '@playwright/test';

export const ALLOW_WRITE = process.env.VOICES_ALLOW_WRITE === '1';

/** A valid Kenyan 9-digit mobile (^[17][0-9]{8}$), stable per run via timestamp. */
export function testMobile(): string {
  const tail = String(Date.now()).slice(-8); // 8 digits
  return `7${tail}`;
}

/** Collect DIGIT API responses observed during a block, filtered by regex. */
export function trackApi(page: Page, re: RegExp): string[] {
  const calls: string[] = [];
  page.on('response', (r) => {
    if (re.test(r.url())) calls.push(`${r.status()} ${new URL(r.url()).pathname}`);
  });
  return calls;
}

/** Fail the test on any uncaught page error (JS runtime error in the SPA). */
export function failOnPageError(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  return errors;
}

/** Normalised, whitespace-collapsed innerText of the page body. */
export async function bodyText(page: Page): Promise<string> {
  return (await page.locator('body').innerText()).replace(/\s+/g, ' ');
}

export async function gotoVoices(page: Page, path = '/') {
  // baseURL ends with "/voices/"; use a relative path (no leading slash) so it
  // resolves under /voices/ instead of the domain root.
  const rel = path.replace(/^\//, '');
  await page.goto(rel, { waitUntil: 'networkidle' });
}

export { expect };

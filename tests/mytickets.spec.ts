import { test, expect } from '@playwright/test';
import { gotoVoices, failOnPageError, ALLOW_WRITE, testMobile } from './helpers';

test.describe('My Tickets', () => {
  test('shows a phone login gate when signed out', async ({ page }) => {
    const errors = failOnPageError(page);
    await gotoVoices(page, '/my-tickets');
    await expect(page.getByRole('heading', { name: /Sign in to view your tickets/i })).toBeVisible();
    await expect(page.locator('#login-phone')).toBeVisible();
    await expect(page.getByRole('button', { name: /View my tickets/i })).toBeVisible();
    expect(errors, `page errors: ${errors.join(' | ')}`).toHaveLength(0);
  });

  // Opt-in: registers/authenticates a citizen (a write) and loads their tickets.
  test('phone + mock-OTP login loads the citizen\'s tickets', async ({ page }) => {
    test.skip(!ALLOW_WRITE, 'set VOICES_ALLOW_WRITE=1 to run auth/write tests');
    let searchStatus = 0;
    page.on('response', (r) => {
      if (/pgr-services\/v2\/request\/_search/.test(r.url())) searchStatus = r.status();
    });

    await gotoVoices(page, '/my-tickets');
    await page.locator('#login-phone').fill(`0${testMobile()}`);
    await page.getByRole('button', { name: /View my tickets/i }).click();

    // After login the ticket list (or an empty-state) renders — the search API must succeed.
    await page.waitForResponse((r) => /pgr-services\/v2\/request\/_search/.test(r.url()), { timeout: 30_000 });
    await page.waitForTimeout(1000);
    expect(searchStatus).toBe(200);
    await expect(page.getByRole('heading', { name: /Sign in to view your tickets/i })).toHaveCount(0);
  });
});

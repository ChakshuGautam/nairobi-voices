import { test, expect } from '@playwright/test';
import { gotoVoices, trackApi, failOnPageError, bodyText } from './helpers';

test.describe('Homepage', () => {
  test('loads with no JS errors and correct title', async ({ page }) => {
    const errors = failOnPageError(page);
    await gotoVoices(page, '/');
    await expect(page).toHaveTitle(/Citizen (Service )?Portal|Nairobi/i);
    await expect(page.getByRole('link', { name: /Report an Issue/i }).first()).toBeVisible();
    expect(errors, `page errors: ${errors.join(' | ')}`).toHaveLength(0);
  });

  test('headline stats are live numbers from the PGR MV / count APIs (not mock)', async ({ page }) => {
    const api = trackApi(page, /request\/_count|v2\/analytics\/_query/);
    await gotoVoices(page, '/');

    // The old mock figures must never appear.
    const body0 = await bodyText(page);
    expect(body0).not.toContain('6,250');
    expect(body0).not.toMatch(/Avg Resolution|wks/);

    // Real labels present.
    for (const label of ['Total Complaints', 'Open Complaints', 'Resolution Rate']) {
      await expect(page.getByText(label, { exact: false }).first()).toBeVisible();
    }

    // Values resolve from the API: the resolution-rate tile shows a percentage
    // (the tile renders the value above the label, so match either order).
    await expect
      .poll(
        async () =>
          (await bodyText(page)).match(/Resolution Rate\s*[\d.]+%|[\d.]+%\s*Resolution Rate/)?.[0] ?? null,
        { timeout: 20_000 },
      )
      .not.toBeNull();

    // At least one MV/count API call happened.
    expect(api.length, 'no MV/count API calls observed').toBeGreaterThan(0);
  });

  test('"What you can report" lists live complaint categories from MDMS', async ({ page }) => {
    const api = trackApi(page, /mdms-v2\/v2\/_search/);
    await gotoVoices(page, '/');
    await expect(page.getByRole('heading', { name: /What you can report/i })).toBeVisible();

    // "N complaint types" + at least one real Bomet health-sector group appears after MDMS loads.
    const realGroups = [
      'Service Scheduling', 'Staff Attitude', 'Medical Negligence', 'Illegal Charges',
      'SHA Service', 'Referral', 'Overcrowding', 'Equipment', 'Sanitation', 'Health Workers',
    ];
    await expect
      .poll(async () => {
        const b = await bodyText(page);
        return /\d+\s+complaint types/i.test(b) && realGroups.some((g) => b.includes(g));
      }, { timeout: 20_000 })
      .toBeTruthy();

    expect(api.length, 'no MDMS calls observed').toBeGreaterThan(0);

    // Category cards link into the report flow.
    await expect(page.locator('a[href$="/report"]').first()).toBeVisible();
  });
});

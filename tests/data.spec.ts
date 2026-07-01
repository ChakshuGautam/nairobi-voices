import { test, expect } from '@playwright/test';
import { gotoVoices, trackApi, failOnPageError, bodyText } from './helpers';

test.describe('Data & Analytics', () => {
  test('KPI tiles and charts are backed by the PGR MV analytics API', async ({ page }) => {
    const errors = failOnPageError(page);
    const api = trackApi(page, /v2\/analytics\/_query/);
    await gotoVoices(page, '/data');

    // Real tiles present; mock banner + mock figures gone.
    const body0 = await bodyText(page);
    expect(body0).not.toMatch(/Sample data/i);
    expect(body0).not.toContain('6,250');
    for (const label of ['New Complaints', 'Open Complaints', 'Resolved', 'Resolution Rate']) {
      await expect(page.getByText(label, { exact: false }).first()).toBeVisible();
    }

    // Resolution rate resolves to a percentage from the KPI query.
    await expect
      .poll(async () => (await bodyText(page)).match(/Resolution Rate\s*[\d.]+%/)?.[0] ?? null, { timeout: 20_000 })
      .not.toBeNull();

    // Chart / table sections backed by KPIs are rendered.
    const body = await bodyText(page);
    expect(body).toMatch(/Complaints over Time/i);
    expect(body).toMatch(/Complaint Status by Ward|Top Complaint Types/i);

    expect(api.length, 'no analytics _query calls').toBeGreaterThan(0);
    expect(errors, `page errors: ${errors.join(' | ')}`).toHaveLength(0);
  });
});

import { test, expect } from '@playwright/test';
import { gotoVoices, trackApi, failOnPageError, bodyText, ALLOW_WRITE, testMobile } from './helpers';

async function realWardValues(page: import('@playwright/test').Page): Promise<string[]> {
  const wardSelect = page.locator('select').first();
  await expect(wardSelect).toBeVisible();
  // Poll until the boundary-service response has populated the options.
  await expect.poll(async () => wardSelect.locator('option').count(), { timeout: 25_000 }).toBeGreaterThan(5);
  return wardSelect.locator('option').evaluateAll((os) =>
    (os as HTMLOptionElement[]).map((o) => o.value).filter(Boolean),
  );
}

test.describe('Report wizard', () => {
  test('category step lists LIVE Bomet ServiceDefs and wards come from boundary-service', async ({ page }) => {
    const errors = failOnPageError(page);
    const api = trackApi(page, /boundary-service\/boundary\/_search|mdms-v2\/v2\/_search/);
    await gotoVoices(page, '/report');

    // Step 1: intent
    await page.getByText('Report a Service Issue').first().click();
    await page.getByRole('button', { name: 'Next' }).click();

    // Step 2: LocationStep -> getWards() (boundary-service)
    const wardValues = await realWardValues(page);
    expect(wardValues.length, 'no live wards populated').toBeGreaterThan(5);
    expect(wardValues.some((v) => v.startsWith('BOMET_')), 'wards are not real Bomet boundary codes').toBeTruthy();
    await page.locator('select').first().selectOption(wardValues[0]);
    await page.getByRole('button', { name: 'Next' }).click();

    // Step 3: CategoryPicker -> getServiceDefs() (MDMS)
    const radios = page.locator('input[type="radio"]');
    await expect.poll(async () => radios.count(), { timeout: 25_000 }).toBeGreaterThan(10);

    const body = await bodyText(page);
    const liveMarkers = ['Service Scheduling', 'Staff Attitude', 'Medical Negligence', 'Ambulance', 'Postponed'];
    expect(liveMarkers.some((m) => body.includes(m)), 'no live category labels rendered').toBeTruthy();

    expect(api.length).toBeGreaterThan(0);
    expect(errors, `page errors: ${errors.join(' | ')}`).toHaveLength(0);
  });

  // Opt-in: actually files a real complaint (creates a citizen + PGR ticket).
  test('files a real complaint end-to-end', async ({ page }) => {
    test.skip(!ALLOW_WRITE, 'set VOICES_ALLOW_WRITE=1 to run write tests against the live tenant');
    const mobile = testMobile();
    let createStatus = 0;
    page.on('response', (r) => {
      if (r.url().includes('/pgr-services/v2/request/_create')) createStatus = r.status();
    });

    await gotoVoices(page, '/report');
    await page.getByText('Report a Service Issue').first().click();
    await page.getByRole('button', { name: 'Next' }).click();

    const wardValues = await realWardValues(page);
    await page.locator('select').first().selectOption(wardValues[0]);
    await page.getByRole('button', { name: 'Next' }).click();

    await expect.poll(async () => page.locator('input[type="radio"]').count(), { timeout: 25_000 }).toBeGreaterThan(10);
    await page.locator('input[type="radio"]').first().check({ force: true });
    await page.getByRole('button', { name: 'Next' }).click(); // -> photos

    await page.getByRole('button', { name: 'Next' }).click(); // -> details
    await page.locator('#title').fill('Playwright e2e — service postponed');
    const desc = page.getByPlaceholder('Describe the issue in detail...');
    if (await desc.count()) await desc.first().fill('Automated Playwright submission against live Bomet PGR.');
    const phone = page.locator('#reporter-phone');
    if (await phone.count()) { await phone.fill(''); await phone.fill(`0${mobile}`); }
    await page.getByRole('button', { name: 'Next' }).click(); // -> review

    await page.getByRole('button', { name: 'Submit Report' }).click();
    await page.waitForFunction(() => /Report Submitted|PG-PGR/i.test(document.body.innerText), null, { timeout: 30_000 });

    expect(createStatus).toBe(200);
    const body = await page.locator('body').innerText();
    expect(body).toMatch(/PG-PGR-\d{4}-\d{2}-\d{2}-\d+/);
  });
});

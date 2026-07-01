import { test, expect } from '@playwright/test';
import { gotoVoices, trackApi, failOnPageError } from './helpers';

test.describe('Preferences modal', () => {
  test('areas and topics are sourced from live boundary + MDMS APIs', async ({ page }) => {
    const errors = failOnPageError(page);
    const api = trackApi(page, /boundary-service\/boundary\/_search|mdms-v2\/v2\/_search/);
    await gotoVoices(page, '/');

    await page.getByRole('button', { name: 'Preferences' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    const dialogText = async () => (await dialog.innerText()).replace(/\s+/g, ' ');

    // Real Bomet ward names (boundary + localization) and real ServiceDef topic groups appear.
    const realWards = ['Chesoen', 'Silibwet', 'Mutarakwa', 'Nyangores', 'Kongasis', 'Chemaner'];
    const realTopics = ['Service Scheduling', 'Staff Attitude', 'Medical Negligence', 'Illegal Charges', 'Referral'];
    await expect
      .poll(async () => {
        const t = await dialogText();
        return realWards.some((w) => t.includes(w)) && realTopics.some((x) => t.includes(x));
      }, { timeout: 20_000 })
      .toBeTruthy();

    // Old mock Nairobi wards / topics are gone.
    const text = await dialogText();
    expect(text).not.toMatch(/Westlands|Karen|Kilimani/);
    expect(text).not.toMatch(/Roads & Potholes|Water & Sewage/);

    expect(api.length, 'no boundary/MDMS calls observed').toBeGreaterThan(0);
    expect(errors, `page errors: ${errors.join(' | ')}`).toHaveLength(0);
  });
});

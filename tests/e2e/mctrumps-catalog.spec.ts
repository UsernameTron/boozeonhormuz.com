import { test, expect } from '@playwright/test';

const clips = [
  ['welcome', '720 / 1280'],
  ['birthday', '960 / 960'],
  ['supervision', '960 / 734'],
  ['appreciation', '960 / 840'],
  ['tehran', '960 / 734'],
] as const;

test('all five McTrumps commercials are discoverable from Watch and Archive', async ({ page }) => {
  await page.goto('/watch/');
  await page.getByRole('button', { name: 'Sponsor Reads' }).click();
  await expect(page.locator('#watch-grid [data-type="sponsor-read"]:visible')).toHaveCount(5);
  await expect(page.locator('#watch-grid [data-type]:visible')).toHaveCount(5);
  await expect(page.locator('#watch-grid [data-type="sponsor-read"] a').first()).toHaveAttribute('href', '/watch/mctrumps-welcome');

  await page.goto('/archive/');
  await page.getByRole('button', { name: /Sponsor Reads \(5\)/ }).click();
  await expect(page.locator('#archive-grid [data-type="sponsor-read"]:visible')).toHaveCount(5);
  await expect(page.locator('#archive-grid [data-type="sponsor-read"] a').first()).toHaveAttribute('data-detail-href', '/watch/mctrumps-welcome');
  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  await page.getByLabel('Search the archive').fill('McTrumps');
  await expect(page.locator('#archive-grid [data-archive-item]:visible')).toHaveCount(5);
});

test('each McTrumps watch page uses its catalogued source and native frame and links to the full series', async ({ page }) => {
  for (const [slug, ratio] of clips) {
    const response = await page.goto(`/watch/mctrumps-${slug}/`);
    expect(response?.status()).toBe(200);
    const frame = page.locator('.video-frame');
    await expect(frame).toHaveAttribute('style', new RegExp(`--video-ratio: ${ratio.replace('/', '\\/')}`));
    await expect(frame.locator('video')).toHaveAttribute('src', `/mctrumps/${slug}.mp4`);
    await expect(page.locator('article > p').first()).toContainText('October 11, 2026');
    await expect(page.getByRole('link', { name: 'McTrumps Sponsor Reads' })).toHaveAttribute('href', `/sponsor-reads/#${slug}`);
    await expect(page.getByText('Fictional political satire — not a real statement, quote, recording, or event report.')).toBeVisible();
  }
});

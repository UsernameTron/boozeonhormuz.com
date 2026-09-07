import { test, expect } from '@playwright/test';

test('Studio reserves its real mobile library and closed project controls before module initialization', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  let releaseModule!: () => void;
  const heldModule = new Promise<void>((resolve) => { releaseModule = resolve; });
  await page.route('**/project-kit.js', async (route) => { await heldModule; await route.continue(); });
  await page.goto('/apps/evidence-lounge-studio.html', { waitUntil: 'commit' });
  await expect(page.locator('#templatesList')).toBeVisible();
  await expect(page.locator('.project-tools summary')).toHaveText('Project files & device storage');
  await page.evaluate(() => document.fonts.ready);
  const before = (await page.locator('.main-area').boundingBox())!.y;
  expect((await page.locator('#templatesList').boundingBox())!.height).toBe(220);
  releaseModule();
  await expect(page.locator('#templatesList .tpl-item')).toHaveCount(20);
  const after = (await page.locator('.main-area').boundingBox())!.y;
  expect(Math.abs(after - before)).toBeLessThan(2);
  await expect(page.locator('.project-tools')).toHaveCount(1);
  await page.locator('#searchInput').fill('no-matching-template-000');
  await expect(page.locator('#templatesList')).toContainText('No templates match your search.');
  expect((await page.locator('#templatesList').boundingBox())!.height).toBe(220);
  await page.locator('.project-tools summary').click();
  await expect(page.getByRole('button', { name: 'Export Project', exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('wrapper font preloads reuse the existing local brand assets', async ({ page }) => {
  for (const route of ['/tools/broadcast-room/', '/tools/evidence-lounge-studio/']) {
    await page.goto(route);
    const fonts = await page.locator('link[rel="preload"][as="font"]').evaluateAll((links) => links.map((link) => ({ href: (link as HTMLLinkElement).href, crossOrigin: (link as HTMLLinkElement).crossOrigin })));
    expect(fonts).toHaveLength(2);
    expect(fonts.every((font) => font.href.includes('/_astro/') && font.href.endsWith('.woff2') && font.crossOrigin === 'anonymous')).toBe(true);
  }
});

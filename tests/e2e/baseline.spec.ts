import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const routes = ['/', '/album/', '/watch/', '/watch/the-premiere/', '/listen/', '/archive/', '/play/', '/tools/broadcast-room/', '/tools/evidence-lounge-studio/', '/apps/broadcast-room.html', '/apps/evidence-lounge-studio.html', '/apps/exit-strategy.html'];

test.beforeEach(async ({ context }) => {
  // Exercise the facade and resulting iframe without depending on Google availability.
  await context.route(/https:\/\/[^/]*(?:youtube(?:-nocookie)?\.com|ytimg\.com|googlevideo\.com|google-analytics\.com|googletagmanager\.com)\//, async (route) => {
    const type = route.request().resourceType();
    if (type === 'image') return route.fulfill({ contentType: 'image/png', body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aZ1cAAAAASUVORK5CYII=', 'base64') });
    return route.fulfill({ contentType: 'text/html', body: '<!doctype html><html lang="en"><title>Test video</title><body>Video provider fixture</body></html>' });
  });
});

for (const width of [320, 390, 768, 1440]) {
  test(`critical routes fit ${width}px and retain screenshots`, async ({ page }, testInfo) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width, height: 900 });
    for (const route of routes) {
      const response = await page.goto(route);
      expect(response?.status(), route).toBe(200);
      await page.evaluate(() => document.fonts.ready);
      const overflow = await page.evaluate(() => ({ actual: document.documentElement.scrollWidth, viewport: innerWidth }));
      expect.soft(overflow.actual, `${route} overflows at ${width}px`).toBeLessThanOrEqual(overflow.viewport + 1);
      await expect(page.locator('h1').first()).toBeVisible();
      await page.screenshot({ path: testInfo.outputPath(`${route.replace(/[^a-z0-9]/gi, '_') || 'home'}-${width}.png`), fullPage: true, animations: 'disabled' });
    }
  });
}

test('primary navigation reaches album and exposes the active route', async ({ page }) => {
  await page.goto('/');
  const nav = page.getByRole('navigation', { name: 'Primary' });
  await nav.getByRole('link', { name: 'Album', exact: true }).click();
  await expect(page).toHaveURL(/\/album\/?$/);
  await expect(nav.getByRole('link', { name: 'Album', exact: true })).toHaveAttribute('aria-current', 'page');
});

test('archive filters expose an empty category and restore the catalog', async ({ page }) => {
  await page.goto('/archive/');
  const group = page.getByRole('group', { name: 'Filter the archive' });
  await group.getByRole('button', { name: 'Tracks', exact: true }).click();
  await expect(group.getByRole('button', { name: 'Tracks', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#archive-empty')).toBeVisible();
  await group.getByRole('button', { name: 'All', exact: true }).click();
  await expect(page.locator('#archive-empty')).toBeHidden();
  await expect(page.locator('#archive-grid [data-type]:visible')).not.toHaveCount(0);
});

test('premiere only creates a provider iframe after activation', async ({ page }) => {
  await page.goto('/watch/the-premiere/');
  const player = page.locator('lite-youtube').first();
  await expect(player).toBeVisible();
  await expect(player.locator('iframe')).toHaveCount(0);
  await player.click();
  await expect(player.locator('iframe')).toHaveAttribute('src', /youtube(?:-nocookie)?\.com\/embed\/Za2XII66eHQ/);
});

test('broadcast brief generates and survives a JSON export/import round trip', async ({ page }) => {
  await page.goto('/apps/broadcast-room.html');
  const title = 'Fixture café <safe & sound>';
  await page.locator('#title').fill(title);
  await page.locator('#concept').fill('A fictional ship with excellent catering and misplaced receipts.');
  await page.locator('#generateBtn').click();
  await expect(page.locator('#out-master')).toContainText(title);
  const downloading = page.waitForEvent('download');
  await page.locator('#exportBtn').click();
  const download = await downloading;
  const path = await download.path();
  const exported = await readFile(path!, 'utf8');
  expect(exported).toContain('Fixture café');
  await page.reload();
  await page.locator('#importFile').setInputFiles({ name: 'brief.json', mimeType: 'application/json', buffer: Buffer.from(exported) });
  await expect(page.locator('#title')).toHaveValue(title);
  await expect(page.locator('#out-master')).toContainText(title);
  await expect(page.locator('#out-master img')).toHaveCount(0);
  await page.locator('#importFile').setInputFiles({ name: 'broken.json', mimeType: 'application/json', buffer: Buffer.from('{invalid') });
  await expect(page.locator('#toast')).toContainText(/failed|parse|invalid/i);
  await expect(page.locator('#title')).toHaveValue(title);
});

test('evidence templates render safely and survive a JSON export/import round trip', async ({ page }) => {
  await page.goto('/apps/evidence-lounge-studio.html');
  const content = 'A fictional {{song_title}} with <img src=x onerror=alert(1)> receipts.';
  await page.locator('#editor1').fill(content);
  await page.locator('#varInputs textarea').first().fill('Café Gold');
  await page.locator('#renderBtn').click();
  await expect(page.locator('#previewBox')).toContainText('Café Gold');
  await expect(page.locator('#previewBox img')).toHaveCount(0);
  await page.locator('#saveBtn').click();
  await expect(page.locator('#saveName')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.locator('#saveBtn')).toBeFocused();
  await page.locator('#saveBtn').click();
  await page.locator('#saveName').fill('Fixture café template');
  await page.locator('#saveConfirmBtn').click();
  const downloading = page.waitForEvent('download');
  await page.locator('#exportBtn').click();
  const path = await (await downloading).path();
  const exported = await readFile(path!, 'utf8');
  await page.reload();
  await page.locator('#importFile').setInputFiles({ name: 'templates.json', mimeType: 'application/json', buffer: Buffer.from(exported) });
  await page.locator('#searchInput').fill('Fixture café template');
  await page.locator('#templatesList button').filter({ hasText: 'Fixture café template' }).click();
  await expect(page.locator('#editor1')).toHaveValue(content);
});

test('game supports Calm Seas, starts with keyboard and resets on a new visit', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/apps/exit-strategy.html');
  await expect(page.locator('#calmSeas')).toBeChecked();
  await page.locator('#btnStart').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#screen-level')).toBeVisible();
  await expect(page.getByRole('group', { name: 'Two doors' })).toBeVisible();
  await page.getByRole('button', { name: /Right door/ }).click();
  await expect(page.locator('#transcript')).toContainText('revenue');
  await page.reload();
  await expect(page.locator('#btnStart')).toBeVisible();
  await expect(page.locator('#screen-level')).toBeHidden();
});

import { test, expect } from '@playwright/test';

test('Deep Cuts stays separate from the album and is reached through its Watch collection', async ({ page, request }) => {
  await page.goto('/album/');
  await expect(page.getByText('27 of 27 song videos live.')).toBeVisible();
  await page.getByRole('link', { name: 'Watch Deep Cuts Live' }).click();
  await expect(page.locator('h1')).toHaveText('Deep Cuts Live');
  const links = page.locator('#deep-cuts-grid > [data-deep-cut] a');
  await expect(links).toHaveCount(32);
  const hrefs = await links.evaluateAll((anchors) => anchors.map((anchor) => anchor.getAttribute('href')!));
  expect(new Set(hrefs).size).toBe(32);
  for (const href of hrefs) {
    const response = await request.get(href);
    expect(response.ok(), href).toBeTruthy();
    const html = await response.text();
    expect(html).toContain('VideoObject');
    expect(html).toMatch(/(?:src|href)="\/video\/deep-cut-/);
    expect(html).toContain('824 / 1464');
    expect(html).toContain('href="/deep-cuts/"');
  }
  await page.goto('/watch/');
  await expect(page.locator('#watch-results')).toBeHidden();
  await page.locator('#watch-collections a[href="/deep-cuts/"]').click();
  await expect(page.locator('#deep-cuts-grid > [data-deep-cut]:visible')).toHaveCount(12);
  await expect(page.locator('#deep-cuts-count')).toContainText('32 live performances');
  await page.goto('/watch/');
  await page.locator('#watch-collections a[href="/album/"]').click();
  await expect(page.getByText('27 of 27 song videos live.')).toBeVisible();
});

test('the first and last Deep Cuts preserve native framing and access to their original performances', async ({ page, request }) => {
  test.setTimeout(90_000);
  await page.goto('/deep-cuts/');
  const hrefs = await page.locator('#deep-cuts-grid > [data-deep-cut] a').evaluateAll((anchors) => anchors.map((anchor) => anchor.getAttribute('href')!));
  for (const href of [hrefs[0], hrefs.at(-1)!]) {
    await page.goto(href);
    await expect(page.locator('.video-frame')).toHaveAttribute('style', /824 \/ 1464/);
    const player = page.locator('video');
    if (await page.locator('lite-youtube').count()) {
      const original = await page.getByRole('link', { name: 'Play the original file' }).getAttribute('href');
      expect(original).toMatch(/^\/video\/deep-cut-/);
      const response = await request.get(original!, { headers: { Range: 'bytes=0-1023' } });
      expect(response.ok()).toBeTruthy();
      expect(response.headers()['content-type']).toContain('video/mp4');
      continue;
    }
    await player.evaluate(async (video: HTMLVideoElement) => { video.muted = true; await video.play(); });
    await expect.poll(() => player.evaluate((video: HTMLVideoElement) => video.currentTime)).toBeGreaterThan(0.1);
    await player.evaluate((video: HTMLVideoElement) => video.pause());
  }
});

test('all 120 gallery and Evidence images load and the viewer supports next, previous, closing, and downloads', async ({ page, request }) => {
  await page.goto('/gallery/');
  const cards = page.locator('#gallery-grid > a');
  await expect(cards).toHaveCount(120);
  const items = await page.locator('#artwork-viewer-data').evaluate((data) => JSON.parse(data.textContent!));
  for (const item of items) {
    const response = await request.get(item.full);
    expect(response.ok(), item.full).toBeTruthy();
    expect(response.headers()['content-type']).toContain('image/webp');
  }
  await cards.first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.locator('[data-viewer-count]')).toHaveText('1 of 120');
  await expect.poll(() => page.locator('[data-viewer-image]').evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
  await page.getByRole('button', { name: 'Next artwork' }).click();
  await expect(page.locator('[data-viewer-count]')).toHaveText('2 of 120');
  await page.keyboard.press('ArrowLeft');
  await expect(page.locator('[data-viewer-count]')).toHaveText('1 of 120');
  await expect(page.locator('[data-viewer-download]')).toHaveAttribute('href', /\/stills\/gallery-/);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(cards.first()).toBeFocused();
  for (const width of [320, 390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ['/gallery/', '/deep-cuts/', '/watch/']) {
      await page.goto(route);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
  }
});

test('Gallery detail links work without JavaScript and return to the gallery', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
  const page = await context.newPage();
  await page.goto('/gallery/');
  const cards = page.locator('#gallery-grid > a');
  for (const link of [cards.first(), cards.last()]) {
    const href = await link.getAttribute('href');
    const detail = await context.newPage();
    expect((await detail.goto(href!))?.status()).toBe(200);
    await expect(detail.getByRole('link', { name: 'Back to the gallery' })).toHaveAttribute('href', '/gallery/');
    await expect.poll(() => detail.locator('figure img').evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
    await detail.close();
  }
  await context.close();
});

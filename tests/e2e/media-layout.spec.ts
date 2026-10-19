import { test, expect } from '@playwright/test';

test('phone navigation is compact, keyboard accessible and reflows with enlarged text', async ({ page }) => {
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/archive/');
    expect(await page.locator('body > header').evaluate((header) => header.getBoundingClientRect().height)).toBeLessThanOrEqual(88);
    const menu = page.getByRole('navigation', { name: 'Primary', exact: true }).getByRole('button', { name: 'Menu', exact: true });
    await menu.click(); await expect(menu).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('Escape'); await expect(menu).toHaveAttribute('aria-expanded', 'false'); await expect(menu).toBeFocused();
    await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  }
});

test('portrait and product art load without broken requests, and failed image responses preserve a readable fallback', async ({ page }) => {
  const missing: string[] = [];
  page.on('response', (response) => { if (response.status() === 404) missing.push(response.url()); });
  await page.goto('/about/');
  const portrait = page.locator('main img[src="/don-biggly-portrait.webp"]');
  await expect(portrait).toHaveCount(1);
  await expect.poll(() => portrait.evaluate((element) => (element as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  await expect(page.locator('main .media-fallback:visible')).toHaveCount(0);
  await page.goto('/products/');
  const productImages = page.locator('main img[src^="/products/"]');
  await expect(productImages).toHaveCount(5);
  for (const image of await productImages.all()) {
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate((element) => (element as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  }
  await expect(page.locator('main .media-fallback:visible')).toHaveCount(0);
  await page.goto('/mctrumps/');
  await expect(page.locator('.mctr video')).toHaveCount(1);
  await expect(page.locator('#welcome video')).toHaveAttribute('src', '/mctrumps/welcome.mp4');
  await expect(page.locator('#welcome video')).toBeVisible();
  await expect(page.locator('#welcome video')).toHaveAttribute('poster', '/mctrumps/welcome.webp');
  expect(missing).toEqual([]);
  await page.route('**/_media/**', (route) => route.abort());
  await page.goto('/archive/?type=image');
  await expect(page.locator('.media-fallback:visible').first()).toBeVisible();
  expect(await page.locator('.media-fallback:visible').first().evaluate((element) => getComputedStyle(element).color)).toBe('rgb(205, 191, 158)');
});

test('YouTube videos keep lazy posters and access to the original video file', async ({ page, context, request }) => {
  await context.route(/https:\/\/[^/]*youtube(?:-nocookie)?\.com\//, (route) => route.fulfill({ contentType: 'text/html', body: '<!doctype html><title>Provider test fixture</title>' }));
  for (const [slug, id, original] of [
    ['the-premiere', 'Za2XII66eHQ', null],
    ['hush-money-is-philanthropy', 'UayELXI0k-U', '/video/hush-money-is-philanthropy.mp4'],
    ['i-invented-cheap-meat', 'RTmza7-BNWM', 'https://github.com/UsernameTron/boozeonhormuz.com/releases/download/site-media-2026-10-19/i-invented-cheap-meat.mp4'],
  ] as const) {
    await page.goto(`/watch/${slug}/`);
    await expect(page.locator('lite-youtube iframe')).toHaveCount(0);
    await expect(page.locator('.video-poster')).toBeVisible();
    if (original) {
      await expect(page.getByRole('link', { name: original.startsWith('https://github.com/') ? 'Download the original video' : 'Play the original file' })).toHaveAttribute('href', original);
      const response = await request.get(original, { headers: { Range: 'bytes=0-1023' } });
      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(206);
      expect(response.headers()['content-type']).toMatch(/^(video\/mp4|application\/octet-stream)(;|$)/);
      const signature = await response.body();
      expect(signature.length).toBe(1024);
      expect(signature.subarray(4, 8).toString()).toBe('ftyp');
    }
    await page.locator('lite-youtube').click();
    await expect(page.locator('lite-youtube iframe')).toHaveAttribute('src', new RegExp(`youtube-nocookie\\.com/embed/${id}`));
    await expect(page.locator('.video-poster')).toBeHidden();
  }
  await page.goto('/watch/');
  await expect(page.getByRole('link', { name: 'Watch on YouTube' })).toHaveAttribute('href', 'https://www.youtube.com/@DonBiggly');
});

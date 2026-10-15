import { test, expect } from '@playwright/test';

test('phone navigation is compact, keyboard accessible and reflows with enlarged text', async ({ page }) => {
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/archive/');
    expect(await page.locator('body > header').evaluate((header) => header.getBoundingClientRect().height)).toBeLessThanOrEqual(88);
    const menu = page.getByRole('button', { name: 'Menu', exact: true });
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
  await page.goto('/sponsor-reads/');
  await expect(page.locator('.mctr video')).toHaveCount(5);
  await expect(page.locator('.mc-host img')).toBeVisible();
  expect(missing).toEqual([]);
  await page.route('**/_media/**', (route) => route.abort());
  await page.goto('/archive/?type=image');
  await expect(page.locator('.media-fallback:visible').first()).toBeVisible();
  expect(await page.locator('.media-fallback:visible').first().evaluate((element) => getComputedStyle(element).color)).toBe('rgb(205, 191, 158)');
});

test('YouTube facade remains lazy and hides its poster after activation', async ({ page, context }) => {
  await context.route(/https:\/\/[^/]*youtube(?:-nocookie)?\.com\//, (route) => route.fulfill({ contentType: 'text/html', body: '<!doctype html><title>Provider test fixture</title>' }));
  await page.goto('/watch/the-premiere/');
  await expect(page.locator('lite-youtube iframe')).toHaveCount(0);
  await expect(page.locator('.video-poster')).toBeVisible();
  await page.locator('lite-youtube').click();
  await expect(page.locator('lite-youtube iframe')).toHaveAttribute('src', /youtube-nocookie\.com\/embed\/Za2XII66eHQ/);
  await expect(page.locator('.video-poster')).toBeHidden();
});

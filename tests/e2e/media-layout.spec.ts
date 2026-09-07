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

test('missing local art never issues a broken request, and failed image responses preserve a readable fallback', async ({ page }) => {
  const missing: string[] = [];
  page.on('response', (response) => { if (response.status() === 404) missing.push(response.url()); });
  for (const route of ['/about/', '/products/', '/sponsor-reads/']) {
    await page.goto(route);
    await expect(page.locator('.media-fallback:visible').first()).toBeVisible();
  }
  expect(missing).toEqual([]);
  await page.route('**/_media/**', (route) => route.abort());
  await page.goto('/archive/');
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

import { test, expect } from '@playwright/test';

const visibleCards = '[data-archive-item]:visible';
const visibleArt = 'a[data-art-id]:visible';

test('archive search, populated filters, reset and browser history preserve discovery state', async ({ page }) => {
  await page.goto('/archive/?q=money&type=image');
  await expect(page.locator('#archive-query')).toHaveValue('money');
  await expect(page.locator(visibleCards)).toHaveCount(3);
  await page.locator('button[data-filter="music-video"]').click();
  await expect(page.locator('#archive-empty')).toBeVisible();
  await page.goBack();
  await expect(page.locator(visibleCards)).toHaveCount(3);
  await page.goForward();
  await expect(page.locator('#archive-empty')).toBeVisible();
  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  await expect(page.locator(visibleCards)).toHaveCount(8);
  await page.locator('#archive-query').fill('<script> & "');
  await expect(page.locator(visibleCards)).toHaveCount(0);
  expect(new URL(page.url()).searchParams.get('q')).toBe('<script> & "');
  await page.goto('/archive/?type=unknown');
  await expect(page.locator(visibleCards)).toHaveCount(8);
});

test('art viewer contains focus, navigates filtered art, closes and restores its invoking card', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/archive/?q=money&type=image');
  const first = page.locator(visibleArt).first();
  await expect(page.locator('[data-viewer-download]')).toHaveAttribute('href', /^\/[^#]/);
  await expect(page.locator('[data-viewer-image]')).not.toHaveAttribute('src', /.+/);
  const id = await first.getAttribute('data-art-id');
  await first.click();
  const dialog = page.getByRole('dialog', { name: 'Hush Money as Philanthropy' });
  await expect(dialog).toBeVisible();
  await expect(page.locator('[data-viewer-count]')).toHaveText('1 of 3');
  await expect.poll(() => page.locator('[data-viewer-image]').evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
  const firstDownload = await page.locator('[data-viewer-download]').getAttribute('href');
  expect(firstDownload).toBe(await page.locator('[data-viewer-image]').getAttribute('src'));
  await page.getByRole('button', { name: 'Next artwork', exact: true }).click();
  await expect(page.locator('[data-viewer-count]')).toHaveText('2 of 3');
  expect(await page.locator('[data-viewer-download]').getAttribute('href')).not.toBe(firstDownload);
  expect(await page.locator('[data-viewer-download]').getAttribute('href')).toBe(await page.locator('[data-viewer-image]').getAttribute('src'));
  await page.getByRole('button', { name: 'Previous artwork', exact: true }).click();
  await expect(page.locator('[data-viewer-count]')).toHaveText('1 of 3');
  for (let index = 0; index < 10; index++) await page.keyboard.press('Tab');
  expect(await page.evaluate(() => document.querySelector('#artwork-viewer')!.contains(document.activeElement))).toBe(true);
  await page.keyboard.press('Escape');
  await expect(page.locator('#artwork-viewer')).not.toBeVisible();
  await expect(page.locator(`a[data-art-id="${id}"]`)).toBeFocused();
  await expect(page).toHaveURL(/q=money&type=image$/);
  expect(await page.evaluate(() => document.body.style.overflow)).toBe('');
});

test('viewer Back/Forward and direct links work without history loops and retain detail context', async ({ page }) => {
  await page.goto('/archive/?q=money&type=image');
  await page.locator(visibleArt).first().click();
  await expect(page.locator('#artwork-viewer')).toBeVisible();
  await page.goBack(); await expect(page.locator('#artwork-viewer')).not.toBeVisible();
  await page.goForward(); await expect(page.locator('#artwork-viewer')).toBeVisible();
  await page.locator('[data-viewer-details]').click();
  await expect(page.locator('h1')).toHaveText('Hush Money as Philanthropy');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/art\/evidence--hush-money-as-philanthropy\/?$/);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /\/evidence\/hush-money-as-philanthropy.webp$/);
  await expect(page.locator('[data-archive-return]')).toHaveAttribute('href', '/archive?q=money&type=image');
  for (const href of await page.locator('[data-art-related]').evaluateAll((anchors) => anchors.map((anchor) => (anchor as HTMLAnchorElement).href))) {
    expect(new URL(href).searchParams.get('q')).toBe('money');
    expect(new URL(href).searchParams.get('type')).toBe('image');
  }
  await page.goto('/archive/?q=money&type=image&art=evidence--hush-money-as-philanthropy');
  await expect(page.locator('#artwork-viewer')).toBeVisible();
  await expect(page.locator('[data-viewer-count]')).toHaveText('1 of 3');
  await page.keyboard.press('Escape');
  await expect(page).toHaveURL(/q=money&type=image$/);
});

for (const width of [320, 390, 1440]) {
  test(`archive viewer fits ${width}px with explicit touch controls`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/archive/');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.locator(visibleArt).first().click();
    await expect(page.locator('#artwork-viewer')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const controls = await page.locator('#artwork-viewer button').evaluateAll((buttons) => buttons.map((button) => button.getBoundingClientRect().height));
    expect(controls.every((height) => height >= 44)).toBe(true);
  });
}

test('ordinary artwork links and all seven detail pages work without JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
  const page = await context.newPage();
  await page.goto('/archive/');
  const links = await page.locator('a[data-art-id]').evaluateAll((anchors) => anchors.map((anchor) => (anchor as HTMLAnchorElement).href));
  expect(links).toHaveLength(7);
  for (const href of links) {
    expect((await page.goto(href))?.status()).toBe(200);
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('figure img')).toBeVisible();
  }
  await context.close();
});

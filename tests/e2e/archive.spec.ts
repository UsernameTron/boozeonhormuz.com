import { test, expect } from '@playwright/test';
const cards = '[data-archive-item]';

test('Search catalog has 27 album songs, 70 other videos, and 120 artworks without duplicate destinations', async ({ page }) => {
  await page.goto('/archive/');
  const destinations = await page.locator('#archive-templates template').evaluateAll((templates) => templates.map((template) => (template as HTMLTemplateElement).content.querySelector('a')!.getAttribute('data-detail-href')!));
  expect(destinations).toHaveLength(217);
  expect(new Set(destinations).size).toBe(217);
  expect(destinations.filter((href) => href.startsWith('/album/'))).toHaveLength(27);
  expect(destinations.filter((href) => href.startsWith('/watch/'))).toHaveLength(70);
  expect(destinations.filter((href) => href.startsWith('/art/'))).toHaveLength(120);
});

test('Search starts with no results and exposes 217 unique items by type', async ({ page }) => {
  await page.goto('/archive/');
  await expect(page.locator('#archive-grid')).toBeEmpty();
  await expect(page.locator('#archive-count')).toHaveText('Search 217 items or choose a type.');
  await page.getByRole('button', { name: 'Album Songs (27)' }).click();
  await expect(page.locator(cards)).toHaveCount(12);
  await expect(page.locator('#archive-count')).toHaveText('27 results of 217');
  expect(await page.locator(cards).evaluateAll((elements) => elements.every((element) => (element as HTMLElement).dataset.type === 'album-song'))).toBe(true);
  await expect(page.locator(`${cards} a`).first()).toHaveAttribute('href', /\/album\//);
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.locator('#archive-page-status')).toHaveText('Page 2 of 3');
  await expect(page).toHaveURL(/type=album-song&page=2/);
  await page.reload();
  await expect(page.locator('#archive-page-status')).toHaveText('Page 2 of 3');
  await page.goBack();
  await expect(page.locator('#archive-page-status')).toHaveText('Page 1 of 3');
  await page.getByRole('button', { name: 'Deep Cuts Live (32)' }).click();
  await expect(page.locator('#archive-count')).toHaveText('32 results of 217');
  await page.getByRole('button', { name: 'McTrumps (7)' }).click();
  await expect(page.locator(cards)).toHaveCount(7);
});

test('query, legacy types, invalid input, and reset preserve search state', async ({ page }) => {
  await page.goto('/archive/?q=money&type=image');
  await expect(page.locator('#archive-query')).toHaveValue('money');
  expect(await page.locator(cards).count()).toBeGreaterThan(0);
  await expect(page.locator('#archive-count')).toHaveText(/results of 217/);
  await page.locator('#archive-query').fill('<script> & "');
  await expect(page.locator(cards)).toHaveCount(0);
  await expect(page.locator('#archive-empty')).toBeVisible();
  expect(new URL(page.url()).searchParams.get('q')).toBe('<script> & "');
  await page.goto('/archive/?type=sponsor-read');
  await expect(page.locator(cards)).toHaveCount(7);
  await page.goto('/archive/?type=unknown&page=999');
  await expect(page.locator('#archive-grid')).toBeEmpty();
  await page.goto('/archive/?type=image&page=999');
  await expect(page.locator('#archive-page-status')).toHaveText('Page 10 of 10');
  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  await expect(page.locator('#archive-grid')).toBeEmpty();
  await expect(page).toHaveURL(/\/archive\/$/);
});

test('artwork viewer follows the current results page and retains the detail context', async ({ page }) => {
  await page.goto('/archive/?type=image&page=2');
  const first = page.locator('a[data-art-id]').first();
  const id = await first.getAttribute('data-art-id');
  await first.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.locator('[data-viewer-count]')).toHaveText('1 of 12');
  await page.getByRole('button', { name: 'Next artwork' }).click();
  await expect(page.locator('[data-viewer-count]')).toHaveText('2 of 12');
  await page.keyboard.press('Escape');
  await expect(page.locator(`a[data-art-id="${id}"]`)).toBeFocused();
  await expect(page).toHaveURL(/type=image&page=2$/);
});

test('viewer traps focus, closes with Escape, and supports browser Back and Forward', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/archive/?type=image');
  const first = page.locator('a[data-art-id]').first();
  const id = await first.getAttribute('data-art-id');
  await first.click();
  await expect(page.locator('#artwork-viewer')).toBeVisible();
  await expect.poll(() => page.locator('[data-viewer-image]').evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
  const full = await page.locator('[data-viewer-image]').getAttribute('src');
  await expect(page.locator('[data-viewer-download]')).toHaveAttribute('href', full!);
  for (let index = 0; index < 10; index++) await page.keyboard.press('Tab');
  expect(await page.evaluate(() => document.querySelector('#artwork-viewer')!.contains(document.activeElement))).toBe(true);
  await page.goBack();
  await expect(page.locator('#artwork-viewer')).toBeHidden();
  await page.goForward();
  await expect(page.locator('#artwork-viewer')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#artwork-viewer')).toBeHidden();
  await expect(page.locator(`a[data-art-id="${id}"]`)).toBeFocused();
  expect(await page.evaluate(() => document.body.style.overflow)).toBe('');
});

test('art detail retains Search page context and direct viewer links resolve', async ({ page }) => {
  await page.goto('/archive/?type=image&page=2');
  const first = page.locator('a[data-art-id]').first();
  const id = await first.getAttribute('data-art-id');
  await first.click();
  await page.locator('[data-viewer-details]').click();
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('[data-archive-return]')).toHaveAttribute('href', '/archive?type=image&page=2');
  for (const href of await page.locator('[data-art-related]').evaluateAll((anchors) => anchors.map((anchor) => (anchor as HTMLAnchorElement).href))) {
    expect(new URL(href).searchParams.get('type')).toBe('image');
    expect(new URL(href).searchParams.get('page')).toBe('2');
  }
  await page.goto(`/archive/?type=image&page=2&art=${id}`);
  await expect(page.locator('#artwork-viewer')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page).toHaveURL(/type=image&page=2$/);
});

for (const width of [320, 390, 1440]) {
  test(`viewer fits ${width}px with touch controls`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/archive/?type=image');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.locator('a[data-art-id]').first().click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const controls = await page.locator('#artwork-viewer button').evaluateAll((buttons) => buttons.map((button) => button.getBoundingClientRect().height));
    expect(controls.every((height) => height >= 44)).toBe(true);
  });
}

test('all seven Evidence art detail pages remain available without JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
  const page = await context.newPage();
  await page.goto('/gallery/');
  const hrefs = await page.locator('a[data-art-id^="evidence--"]').evaluateAll((anchors) => anchors.map((anchor) => (anchor as HTMLAnchorElement).href));
  expect(hrefs).toHaveLength(7);
  for (const href of hrefs) {
    expect((await page.goto(href))?.status()).toBe(200);
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('figure img')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Back to the gallery' })).toHaveAttribute('href', '/gallery/');
  }
  await context.close();
});

test('Search offers working collection links when its JavaScript is blocked', async ({ page }) => {
  // Astro inlines the Search module in production, so blocking .js requests alone does not stop it.
  await page.route('**/archive/', async (route) => {
    const response = await route.fetch();
    await route.fulfill({ response, headers: { ...response.headers(), 'content-security-policy': "script-src 'none'" } });
  });
  await page.goto('/archive/');
  await expect(page.locator('#archive-recovery')).toBeVisible();
  await expect(page.locator('#archive-recovery').getByRole('link', { name: 'Album Songs' })).toHaveAttribute('href', '/album/');
  await expect(page.locator('#archive-recovery').getByRole('link', { name: 'Videos', exact: true })).toHaveAttribute('href', '/watch/');
  await expect(page.locator('#archive-recovery').getByRole('link', { name: 'Gallery', exact: true })).toHaveAttribute('href', '/gallery/');
  await page.locator('#archive-recovery').getByRole('link', { name: 'Gallery', exact: true }).click();
  await expect(page.locator('h1')).toHaveText('Gallery');
});

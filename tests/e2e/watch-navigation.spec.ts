import { test, expect } from '@playwright/test';

test('Watch opens on six illustrated collections and keeps the choices visible on a phone', async ({ page }) => {
  await page.goto('/watch/');
  const choices = page.locator('[aria-label="Watch collections"] > a');
  await expect(choices).toHaveCount(6);
  await expect(page.getByRole('button', { name: 'All', exact: true })).toHaveCount(0);
  await expect(page.locator('#watch-results')).toBeHidden();
  for (const card of await choices.all()) {
    await expect(card.locator('img')).toHaveCount(1);
    await expect(card.locator('p').last()).not.toBeEmpty();
  }
  await expect(choices.nth(0)).toHaveAttribute('href', '/watch/?collection=music-video');
  await expect(choices.nth(1)).toHaveAttribute('href', '/album/');
  await expect(choices.nth(2)).toHaveAttribute('href', '/deep-cuts/');
  await expect(choices.nth(5)).toHaveAttribute('href', '/mctrumps/');

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator('#watch-collections')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
  const mobileRects = await choices.evaluateAll((links) => links.map((link) => {
    const card = link.getBoundingClientRect();
    const art = link.querySelector('img')!.getBoundingClientRect();
    return { left: card.left, right: card.right, height: card.height, artWidth: art.width };
  }));
  expect(mobileRects).toHaveLength(6);
  for (const rect of mobileRects) {
    expect(rect.left).toBeGreaterThanOrEqual(0);
    expect(rect.right).toBeLessThanOrEqual(390);
    expect(rect.artWidth).toBeLessThanOrEqual(100);
    expect(rect.height).toBeLessThan(165);
  }
});

test('Watch choices still expose playable links when scripts are disabled', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/watch/');
  const fallback = page.locator('#watch-fallback');
  await expect(fallback.getByText('Choose a collection below')).toBeVisible();
  const sketches = fallback.getByText('Sketches (9)');
  await sketches.click();
  await expect(fallback.locator('details').nth(1).locator('a[href^="/watch/"]').first()).toBeVisible();
  await context.close();
});

test('Watch collection URLs keep selection and video return context', async ({ page }) => {
  await page.goto('/watch/?collection=music-video');
  await expect(page.locator('#watch-collections')).toBeHidden();
  await expect(page.getByRole('heading', { name: 'Music Videos', exact: true })).toBeVisible();
  await expect(page.locator('#watch-grid > [data-collection]:visible')).toHaveCount(7);
  await expect(page.locator('#watch-grid > [data-collection="sketch"]:visible')).toHaveCount(0);
  const card = page.locator('#watch-grid > [data-collection="music-video"] a').first();
  await expect(card).toHaveAttribute('href', /\?collection=music-video&page=1$/);
  await card.click();
  await expect(page.locator('#watch-back-link')).toHaveAttribute('href', /\/watch\/\?collection=music-video&page=1#video-/);
  const headingSize = await page.locator('article h1').evaluate((heading) => parseFloat(getComputedStyle(heading).fontSize));
  expect(headingSize).toBeLessThanOrEqual(49);
  const frame = await page.locator('.watch-detail-player .video-frame').evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const [width, height] = getComputedStyle(element).getPropertyValue('--video-ratio').split('/').map(Number);
    return { displayed: rect.width / rect.height, native: width / height, height: rect.height, cap: window.innerHeight * 0.72 };
  });
  expect(Math.abs(frame.displayed - frame.native)).toBeLessThan(0.02);
  expect(frame.height).toBeLessThanOrEqual(frame.cap + 2);
  await page.locator('#watch-back-link').click();
  await expect(page.getByRole('heading', { name: 'Music Videos', exact: true })).toBeVisible();
  await expect(page.locator('#watch-grid > [data-collection]:visible')).toHaveCount(7);
});

test('Deep Cuts shows twelve ordered performances per page and keeps the return page', async ({ page }) => {
  await page.goto('/deep-cuts/');
  await expect(page.locator('#deep-cuts-grid > [data-deep-cut]:visible')).toHaveCount(12);
  await expect(page.locator('#deep-cuts-count')).toContainText('32 live performances · Page 1 of 3');
  await page.getByRole('navigation', { name: 'Deep Cuts pages' }).getByRole('link', { name: '2', exact: true }).click();
  await expect(page.locator('#deep-cuts-grid > [data-deep-cut]:visible')).toHaveCount(12);
  await expect(page.locator('#deep-cuts-count')).toContainText('Page 2 of 3');
  const card = page.locator('#deep-cuts-grid > [data-deep-cut]:visible a').first();
  await expect(card).toHaveAttribute('href', /\?collection=deep-cuts&page=2$/);
  await card.click();
  await expect(page.locator('#watch-back-link')).toHaveAttribute('href', /\/deep-cuts\/\?page=2#video-/);
  await expect(page.locator('#watch-previous-link')).toBeVisible();
  await expect(page.locator('#watch-next-link')).toBeVisible();
  await page.locator('#watch-back-link').click();
  await expect(page.locator('#deep-cuts-count')).toContainText('Page 2 of 3');
  await expect(page.locator('#deep-cuts-grid > [data-deep-cut]:visible')).toHaveCount(12);
});

test('Deep Cuts keeps all performances reachable without scripts', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/deep-cuts/');
  await expect(page.locator('#deep-cuts-grid > [data-deep-cut]:visible')).toHaveCount(32);
  await context.close();
});

test('a video opened from Search returns to its results and page', async ({ page }) => {
  await page.goto('/archive/?type=deep-cuts&page=2');
  await expect(page.locator('#archive-page-status')).toHaveText('Page 2 of 3');
  await page.locator('#archive-grid a[data-detail-href]').first().click();
  await expect(page.locator('#watch-back-link')).toHaveAttribute('href', '/archive/?type=deep-cuts&page=2');
  await expect(page.locator('#watch-next-link')).toHaveAttribute('href', /from=search.*searchPage=2/);
  await page.locator('#watch-next-link').click();
  await expect(page.locator('#watch-back-link')).toHaveAttribute('href', '/archive/?type=deep-cuts&page=2');
  await page.locator('#watch-back-link').click();
  await expect(page.locator('#archive-page-status')).toHaveText('Page 2 of 3');
  await expect(page.locator('#archive-count')).toContainText('32 results');
});

test('Shorts uses numbered pages and restores its second page after a video', async ({ page }) => {
  await page.goto('/watch/?collection=short&page=2');
  await expect(page.locator('#watch-result-count')).toContainText('15 videos · Page 2 of 2');
  await expect(page.locator('#watch-grid > [data-collection]:visible')).toHaveCount(3);
  await expect(page.getByRole('navigation', { name: 'Watch pages' }).getByRole('link', { name: '2', exact: true })).toHaveAttribute('aria-current', 'page');
  await page.locator('#watch-grid > [data-collection]:visible a').first().click();
  await expect(page.locator('#watch-back-link')).toHaveAttribute('href', /\/watch\/\?collection=short&page=2#video-/);
  await page.goBack();
  await expect(page.locator('#watch-result-count')).toContainText('Page 2 of 2');
  await expect(page.locator('#watch-grid > [data-collection]:visible')).toHaveCount(3);
});

test('Unknown collection and hostile return parameters cannot redirect a video', async ({ page }) => {
  await page.goto('/watch/?collection=https%3A%2F%2Fevil.example&page=999');
  await expect(page.locator('#watch-collections')).toBeVisible();
  await page.goto('/watch/the-premiere/?collection=https%3A%2F%2Fevil.example&page=999');
  const href = await page.locator('#watch-back-link').getAttribute('href');
  expect(href).toMatch(/^\/watch\/\?collection=music-video&page=1#video-/);
});

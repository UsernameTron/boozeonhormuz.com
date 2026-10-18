import { test, expect } from '@playwright/test';

test('Home leads with one music video and routes into the three collections', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Hush Money Is Philanthropy' })).toHaveCount(1);
  await expect(page.getByRole('link', { name: 'Watch the music video' })).toHaveAttribute('href', '/watch/hush-money-is-philanthropy');
  await expect(page.getByText('2:34', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'The Premiere' })).toHaveCount(0);
  const collections = page.getByRole('region', { name: 'Explore the collections' });
  await expect(collections.getByRole('link')).toHaveCount(3);
  await expect(collections.getByRole('link').nth(0)).toHaveAttribute('href', '/watch/');
  await expect(collections.getByRole('link').nth(1)).toHaveAttribute('href', '/album/');
  await expect(collections.getByRole('link').nth(2)).toHaveAttribute('href', '/gallery/');
  await expect(page.getByRole('link', { name: 'Open the Gallery' })).toHaveAttribute('href', '/gallery/');
  await expect(page.locator('[data-art-id]')).toHaveCount(6);
  await expect(page.locator('main').getByRole('link', { name: 'Explore →', exact: true })).toHaveAttribute('href', '/explore/');
  const thumbnail = page.getByRole('link', { name: 'Watch Hush Money Is Philanthropy' }).locator('.media-thumb');
  const size = await thumbnail.boundingBox();
  expect(size).not.toBeNull();
  expect(size!.height).toBeLessThanOrEqual(425);
  await expect(thumbnail.locator('img')).toHaveCSS('object-fit', 'contain');
});

test('Album puts all 27 ordered songs before Deep Cuts and starts at the setlist', async ({ page }) => {
  await page.goto('/album/');
  await expect(page.getByRole('link', { name: 'Start the setlist' })).toHaveAttribute('href', '#setlist');
  const songs = page.locator('#setlist + div > a[href^="/album/"]');
  await expect(songs).toHaveCount(27);
  await expect(songs.first()).toHaveAttribute('href', '/album/booze-on-hormuz-feat-the-5th-naval-fleet');
  await expect(songs.last()).toHaveAttribute('href', '/album/zero-votes-flipped-instrumental');
  const numbers = await songs.locator('span:first-child').allTextContents();
  expect(numbers.map((number) => number.trim())).toEqual(Array.from({ length: 27 }, (_, index) => String(index + 1).padStart(2, '0')));
  const order = await page.locator('#setlist, aside').evaluateAll((elements) => elements.map((element) => element.tagName));
  expect(order).toEqual(['H3', 'ASIDE']);
});

test('Song player preserves its portrait frame and navigates in album order', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/album/booze-on-hormuz-feat-the-5th-naval-fleet/');
  const frame = page.locator('.song-player .video-frame');
  await expect(frame).toHaveAttribute('style', /824 \/ 1464/);
  await expect(page.locator('.song-player .video-poster')).toHaveCSS('object-fit', 'contain');
  const size = await frame.boundingBox();
  expect(size).not.toBeNull();
  expect(size!.height).toBeLessThanOrEqual(844 * 0.6);
  expect(size!.width / size!.height).toBeCloseTo(824 / 1464, 2);
  await expect(page.locator('article img[alt^="Cover art"]')).toHaveCount(0);
  const nav = page.getByRole('navigation', { name: 'Album song navigation' });
  await expect(nav.getByRole('link', { name: /Previous:/ })).toHaveCount(0);
  await expect(nav.getByRole('link', { name: /Next:/ })).toHaveAttribute('href', '/album/bad-ass-gold-boy-beautiful-doom');
  await expect(nav.getByRole('link', { name: 'Back to Album' })).toHaveAttribute('href', '/album/');
  await nav.getByRole('link', { name: /Next:/ }).click();
  await expect(page.locator('h1')).toHaveText('Bad Ass Gold Boy (Beautiful Doom)');
  await expect(page.getByRole('navigation', { name: 'Album song navigation' }).getByRole('link', { name: /Previous:/ })).toHaveAttribute('href', '/album/booze-on-hormuz-feat-the-5th-naval-fleet');
});

test('An album song returns to its Search query and results page', async ({ page }) => {
  await page.goto('/archive/?q=video&type=album-song&page=2');
  await expect(page.locator('#archive-page-status')).toHaveText('Page 2 of 3');
  const result = page.locator('#archive-grid a[href^="/album/"]').first();
  await expect(result).toHaveAttribute('href', /from=search/);
  await result.click();
  const nav = page.getByRole('navigation', { name: 'Album song navigation' });
  await expect(nav.getByRole('link', { name: 'Back to Album' })).toHaveAttribute('href', '/album/');
  const back = nav.getByRole('link', { name: 'Back to Search' });
  await expect(back).toBeVisible();
  const destination = new URL((await back.getAttribute('href'))!, page.url());
  expect(destination.pathname).toBe('/archive/');
  expect(destination.searchParams.get('q')).toBe('video');
  expect(destination.searchParams.get('type')).toBe('album-song');
  expect(destination.searchParams.get('page')).toBe('2');
  await back.click();
  await expect(page.locator('#archive-query')).toHaveValue('video');
  await expect(page.locator('#archive-page-status')).toHaveText('Page 2 of 3');
  await expect(page.getByRole('button', { name: 'Album Songs (27)' })).toHaveAttribute('aria-pressed', 'true');
});

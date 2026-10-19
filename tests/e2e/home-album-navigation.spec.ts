import { test, expect } from '@playwright/test';

test('Home leads with one music video and routes into the three collections', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'The Evidence Is With Me' })).toHaveCount(1);
  await expect(page.getByRole('heading', { name: 'Hush Money Is Philanthropy' })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Watch the music video' })).toHaveAttribute('href', '/watch/the-evidence-is-with-me-official-video');
  await expect(page.getByText('4:24', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'The Premiere' })).toHaveCount(0);
  const collections = page.getByRole('region', { name: 'Explore the collections' });
  await expect(collections.getByRole('link')).toHaveCount(3);
  await expect(collections.getByRole('link').nth(0)).toHaveAttribute('href', '/watch/');
  await expect(collections.getByRole('link').nth(1)).toHaveAttribute('href', '/album/');
  await expect(collections.getByRole('link').nth(2)).toHaveAttribute('href', '/gallery/');
  await expect(page.getByRole('link', { name: 'Open the Gallery' })).toHaveAttribute('href', '/gallery/');
  await expect(page.locator('[data-art-id]')).toHaveCount(6);
  await expect(page.locator('main').getByRole('link', { name: 'Explore →', exact: true })).toHaveAttribute('href', '/explore/');
  const thumbnail = page.getByRole('link', { name: 'Watch The Evidence Is With Me' }).locator('.media-thumb');
  const size = await thumbnail.boundingBox();
  expect(size).not.toBeNull();
  expect(size!.height).toBeLessThanOrEqual(443);
  expect(size!.width).toBeLessThanOrEqual(635);
  expect(size!.width).toBeGreaterThan(236);
  expect(size!.width / size!.height).toBeCloseTo(635 / 443, 2);
  await expect(thumbnail.locator('img')).toHaveAttribute('src', '/thumbs/the-evidence-is-with-me-champagne.webp');
  await expect(thumbnail.locator('img')).toHaveCSS('object-fit', 'contain');
});

test('the official Evidence music video streams in its landscape frame', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Watch the music video' }).click();
  await expect(page.locator('h1')).toHaveText('The Evidence Is With Me');
  const player = page.locator('.watch-detail-player video');
  await expect(player).toHaveAttribute('src', 'https://github.com/UsernameTron/boozeonhormuz.com/releases/download/site-media-2026-10-19/the-evidence-is-with-me-official-video.mp4');
  await expect(page.locator('lite-youtube')).toHaveCount(0);
  await player.evaluate(async (video: HTMLVideoElement) => { video.muted = true; await video.play(); });
  await expect.poll(() => player.evaluate((video: HTMLVideoElement) => video.currentTime)).toBeGreaterThan(0.2);
  const metadata = await player.evaluate((video: HTMLVideoElement) => ({ width: video.videoWidth, height: video.videoHeight, duration: video.duration, error: video.error?.message }));
  expect(metadata.width).toBe(1920);
  expect(metadata.height).toBe(1080);
  expect(metadata.duration).toBeCloseTo(264.4, 0);
  expect(metadata.error).toBeUndefined();
  await player.evaluate((video: HTMLVideoElement) => video.pause());
  for (const width of [320, 390, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const box = await player.boundingBox();
    expect(box!.width / box!.height).toBeCloseTo(16 / 9, 2);
  }
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

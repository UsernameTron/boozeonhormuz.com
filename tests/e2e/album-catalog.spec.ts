import { test, expect } from '@playwright/test';

test('the complete video album connects its setlist, performance player, and Watch category', async ({ page, request }) => {
  await page.goto('/album/');
  await expect(page.getByRole('heading', { name: 'The Setlist', exact: true })).toBeVisible();
  await expect(page.getByText('27 of 27 song videos live.')).toBeVisible();
  const songLinks = await page.locator('a[href^="/album/"]').evaluateAll((links) =>
    links.map((link) => link.getAttribute('href')).filter((href) => href && href !== '/album/'),
  );
  expect(songLinks).toHaveLength(27);
  expect(new Set(songLinks).size).toBe(27);
  expect(songLinks[0]).toBe('/album/booze-on-hormuz-feat-the-5th-naval-fleet');
  expect(songLinks.at(-1)).toBe('/album/zero-votes-flipped-instrumental');

  await page.goto('/album/booze-on-hormuz-feat-the-5th-naval-fleet/');
  await expect(page.locator('lite-youtube')).toHaveAttribute('videoid', 'Vpgcs7WACqE');
  await expect(page.locator('.video-poster')).toHaveAttribute('src', /album-01-booze-on-hormuz-feat-the-5th-naval-fleet\.webp$/);
  await expect(page.getByRole('link', { name: 'Play the original file' })).toHaveAttribute('href', /album-01-booze-on-hormuz-feat-the-5th-naval-fleet\.mp4$/);
  const media = await request.get('/video/album-01-booze-on-hormuz-feat-the-5th-naval-fleet.mp4', {
    headers: { Range: 'bytes=0-1023' },
  });
  expect(media.ok()).toBeTruthy();
  expect(media.headers()['content-type']).toContain('video/mp4');
  await page.goto('/watch/booze-on-hormuz-feat-the-5th-naval-fleet-live/');
  await expect(page.getByRole('heading', { name: 'Booze on Hormuz (feat. The 5th Naval Fleet) | Lyric Video' })).toBeVisible();

  await page.goto('/watch/');
  await expect(page.getByRole('link', { name: /Album: Song Videos with Lyrics/ })).toHaveAttribute('href', '/album/');
  await expect(page.locator('#watch-grid > [data-collection="album"]')).toHaveCount(0);
  await page.getByRole('link', { name: /Music Videos/ }).click();
  await expect(page).toHaveURL(/\/watch\/\?collection=music-video$/);
  await expect(page.locator('#watch-grid > [data-collection="music-video"]:visible')).toHaveCount(7);
  await expect(page.locator('#watch-grid > [data-collection="album"]:visible')).toHaveCount(0);

  await page.goto('/listen/');
  await expect(page.locator('audio')).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Explore the album and its video setlist' })).toHaveAttribute('href', '/album');
});

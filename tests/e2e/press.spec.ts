import { test, expect } from '@playwright/test';

test('Press shows only the broadcast and plays it in its native frame', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/press/');

  await expect(page.locator('main h1')).toHaveText('Press');
  const video = page.locator('main video');
  await expect(video).toHaveCount(1);
  await expect(video).toHaveAttribute('src', '/press/don-biggly-broadcast.mp4');
  await expect(page.getByRole('heading', { name: 'Press assets' })).toHaveCount(0);
  await expect(page.locator('main a[download]')).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);

  await video.evaluate(async (element) => {
    const player = element as HTMLVideoElement;
    player.muted = true;
    await player.play();
  });
  await expect.poll(() => video.evaluate((element) => (element as HTMLVideoElement).currentTime)).toBeGreaterThan(0);
  expect(await video.evaluate((element) => {
    const player = element as HTMLVideoElement;
    return [player.videoWidth, player.videoHeight];
  })).toEqual([480, 720]);
});

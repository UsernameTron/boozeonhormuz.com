import { test, expect } from '@playwright/test';

test('Gallery unifies 113 uploaded images and seven Evidence artworks with 24 per page', async ({ page }) => {
  await page.goto('/gallery/');
  await expect(page.locator('#gallery-count')).toHaveText('120 images');
  await expect(page.locator('#gallery-grid a[data-art-id="images--gallery-24-the-red-tie"]')).toHaveCount(0);
  await expect(page.locator('#gallery-grid > a:visible')).toHaveCount(24);
  await expect(page.locator('#gallery-page-status')).toHaveText('Page 1 of 5');
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.locator('#gallery-grid > a:visible')).toHaveCount(24);
  await expect(page).toHaveURL(/page=2/);
  await page.reload();
  await expect(page.locator('#gallery-page-status')).toHaveText('Page 2 of 5');
  await page.getByRole('button', { name: 'Evidence Lounge (7)' }).click();
  await expect(page.locator('#gallery-grid > a:visible')).toHaveCount(7);
  await expect(page).toHaveURL(/type=evidence/);
  await page.locator('#gallery-grid > a:visible').first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.locator('[data-viewer-count]')).toHaveText('1 of 7');
  await page.getByRole('button', { name: 'Next artwork' }).click();
  await expect(page.locator('[data-viewer-count]')).toHaveText('2 of 7');
  await page.keyboard.press('Escape');
  await page.goBack();
  await expect(page.locator('#gallery-page-status')).toHaveText('Page 2 of 5');
});

test('Gallery viewer moves across pagination within the selected collection', async ({ page }) => {
  await page.goto('/gallery/?type=gallery&page=2');
  await expect(page.locator('#gallery-grid > a:visible')).toHaveCount(24);
  await page.locator('#gallery-grid > a:visible').first().click();
  await expect(page.locator('[data-viewer-count]')).toHaveText('25 of 113');
  await page.getByRole('button', { name: 'Previous artwork' }).click();
  await expect(page.locator('[data-viewer-count]')).toHaveText('24 of 113');
  await page.keyboard.press('Escape');
});

test('Evidence Lounge keeps its legacy collection and links to Gallery', async ({ page }) => {
  await page.goto('/evidence-lounge/');
  await expect(page.getByRole('link', { name: /View all 7 artworks in Gallery/ })).toHaveAttribute('href', '/gallery/?type=evidence');
  await expect(page.locator('a[data-art-id^="evidence--"]')).toHaveCount(7);
});

test('Gallery viewer details return to the page containing the selected artwork', async ({ page }) => {
  await page.goto('/gallery/');
  await page.locator('#gallery-grid > a:visible').last().click();
  await expect(page.locator('[data-viewer-count]')).toHaveText('24 of 120');
  await page.getByRole('button', { name: 'Next artwork' }).click();
  await expect(page.locator('[data-viewer-count]')).toHaveText('25 of 120');
  const selectedId = new URL(page.url()).searchParams.get('art');
  await page.locator('[data-viewer-details]').click();
  expect(new URL(page.url()).searchParams.get('from')).toBe('gallery');
  expect(new URL(page.url()).searchParams.get('page')).toBe('2');
  await expect(page.locator('[data-archive-return]')).toHaveAttribute('href', '/gallery/?page=2');
  await page.locator('[data-archive-return]').click();
  await expect(page.locator('#gallery-page-status')).toHaveText('Page 2 of 5');
  await expect(page.locator(`#gallery-grid a[data-art-id="${selectedId}"]`)).toBeVisible();
});

test('Evidence Lounge artwork details return to the curated collection', async ({ page }) => {
  await page.goto('/evidence-lounge/');
  await page.locator('a[data-art-id^="evidence--"]').first().click();
  await page.locator('[data-viewer-details]').click();
  await expect(page.locator('[data-archive-return]')).toHaveAttribute('href', '/evidence-lounge/');
});

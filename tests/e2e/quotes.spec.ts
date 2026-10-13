import { test, expect } from '@playwright/test';

test('twelve supplied quotes are readable without added labels', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/quotes/');

  const cards = page.locator('main figure');
  await expect(cards).toHaveCount(12);
  await expect(cards.first()).toContainText('Access Hollywood tape, 2005.');
  await expect(cards.first()).toContainText('sexual-harassment portion of the workout');
  await expect(cards.last()).toContainText('I send an invoice.');
  expect((await page.locator('main').innerText()).toLowerCase()).not.toContain('fictional satire');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
});

import { test, expect } from '@playwright/test';

test('five main destinations and Search replace competing library links', async ({ page }) => {
  await page.goto('/');
  const nav = page.getByRole('navigation', { name: 'Primary' });
  await expect(nav.locator('#primary-links > li:not(.nav-utility) a')).toHaveText(['Watch', 'Album', 'Gallery', 'Explore', 'Studio']);
  await expect(nav.getByRole('link', { name: 'Search', exact: true })).toHaveAttribute('href', '/archive/');
  for (const label of ['Listen', 'Archive', 'Press', 'Experience']) {
    await expect(nav.getByRole('link', { name: label, exact: true })).toHaveCount(0);
  }
  await nav.getByRole('link', { name: 'Explore', exact: true }).click();
  const destinations = page.getByRole('region', { name: 'Explore destinations' }).locator('a');
  await expect(destinations).toHaveCount(5);
  expect(await destinations.evaluateAll((links) => links.map((a) => a.getAttribute('href')))).toEqual(['/products/', '/experience/', '/play/', '/quotes/', '/about/']);
  await expect(nav.getByRole('link', { name: 'Explore', exact: true })).toHaveAttribute('aria-current', 'page');
});

test('subpages retain section orientation and legacy content remains reachable', async ({ page }) => {
  for (const [route, section] of [['/deep-cuts/', 'Watch'], ['/sponsor-reads/', 'Watch'], ['/press/', 'Watch'], ['/evidence-lounge/', 'Gallery'], ['/about/', 'Explore'], ['/tools/', 'Studio'], ['/listen/', 'Album']]) {
    expect((await page.goto(route))?.status()).toBe(200);
    await expect(page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: section, exact: true })).toHaveAttribute('aria-current', 'page');
  }
  await page.goto('/studio/');
  await expect(page.getByRole('link', { name: 'Open the Creative Arsenal' })).toHaveAttribute('href', '/tools/');
});

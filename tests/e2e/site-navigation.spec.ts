import { test, expect } from '@playwright/test';

test('five main destinations include McTrumps and keep Search separate', async ({ page }) => {
  await page.goto('/');
  const nav = page.getByRole('navigation', { name: 'Primary' });
  await expect(nav.locator('#primary-links > li:not(.nav-utility) a')).toHaveText(['Watch', 'McTrumps', 'Gallery', 'Explore', 'Studio']);
  await expect(nav.getByRole('link', { name: 'McTrumps', exact: true })).toHaveAttribute('href', '/mctrumps/');
  await expect(nav.getByRole('link', { name: 'Search', exact: true })).toHaveAttribute('href', '/archive/');
  for (const label of ['Album', 'Listen', 'Archive', 'Press', 'Experience']) {
    await expect(nav.getByRole('link', { name: label, exact: true })).toHaveCount(0);
  }
  await nav.getByRole('link', { name: 'Explore', exact: true }).click();
  const destinations = page.getByRole('region', { name: 'Explore destinations' }).locator('a');
  await expect(destinations).toHaveCount(5);
  expect(await destinations.evaluateAll((links) => links.map((a) => a.getAttribute('href')))).toEqual(['/products/', '/experience/', '/play/', '/quotes/', '/about/']);
  await expect(nav.getByRole('link', { name: 'Explore', exact: true })).toHaveAttribute('aria-current', 'page');
});

test('subpages retain section orientation and legacy content remains reachable', async ({ page }) => {
  for (const [route, section] of [['/watch/', 'Watch'], ['/watch/the-premiere/', 'Watch'], ['/album/', 'Watch'], ['/album/booze-on-hormuz-feat-the-5th-naval-fleet/', 'Watch'], ['/deep-cuts/', 'Watch'], ['/mctrumps/', 'McTrumps'], ['/sponsor-reads/', 'McTrumps'], ['/watch/mctrumps-welcome/', 'McTrumps'], ['/watch/mctrumps-premium-costs/', 'McTrumps'], ['/watch/mctrumps-chief-accountability-officer/', 'McTrumps'], ['/press/', 'Watch'], ['/evidence-lounge/', 'Gallery'], ['/about/', 'Explore'], ['/tools/', 'Studio'], ['/listen/', 'Watch']]) {
    expect((await page.goto(route))?.status()).toBe(200);
    const nav = page.getByRole('navigation', { name: 'Primary' });
    await expect(nav.getByRole('link', { name: section, exact: true })).toHaveAttribute('aria-current', 'page');
    await expect(nav.locator('[aria-current="page"]')).toHaveCount(1);
  }
  await page.goto('/studio/');
  await expect(page.getByRole('link', { name: 'Open the Creative Arsenal' })).toHaveAttribute('href', '/tools/');
});

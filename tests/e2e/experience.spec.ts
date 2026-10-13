import { test, expect, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { QUESTIONS, AMENITIES, ENDINGS, FICTION_LABEL } from '../../public/apps/experience-story.js';

async function qualify(page: Page, route: keyof typeof ENDINGS) {
  for (const [index, question] of QUESTIONS.entries()) {
    const choice = question.options.find(option => option.route === route)!;
    await page.locator('#quiz-options').getByRole('button', { name: choice.label, exact: true }).click();
    await expect(page.locator('#quiz-don')).toHaveText(choice.don);
    await page.locator('#quiz-note summary').click();
    await expect(page.locator('#quiz-note-copy')).toBeVisible();
    await page.locator('#quiz-next').click();
    await expect(page.locator('#quiz-progress')).toContainText(index === 4 ? '5 of 5' : `Question ${index + 2}`);
  }
}

test.beforeEach(async ({ page, context }) => {
  await context.route(/https:\/\/[^/]*(?:youtube(?:-nocookie)?\.com|ytimg\.com|googlevideo\.com)\//, route => route.fulfill({ contentType: 'text/html', body: '<!doctype html><title>Video provider fixture</title><p>Video player</p>' }));
  await page.goto('/experience/');
  await expect(page.locator('html')).toHaveClass(/experience-ready/);
});

for (const route of ['status', 'legacy', 'scrutiny'] as const) test(`${route} route connects quiz, selected package, amenity and an honest final record`, async ({ page }) => {
  await qualify(page, route);
  await page.locator('[data-tier-id="admiral"]').click();
  await page.locator('#amenity-map [data-amenity-id="terrace"]').click();
  await page.locator('#amenity-select').click();
  await expect(page.locator('#stake')).toHaveValue('780000');
  await page.locator('#build-record').click();
  await expect(page.locator('#record-route')).toHaveText(ENDINGS[route].title);
  await expect(page.locator('#record-facts')).toContainText('Admiral’s Circle — selected');
  await expect(page.locator('#record-facts')).toContainText('Subpoena View Terrace');
  await expect(page.locator('#record-facts')).toContainText('$0.00 — no refund requested');
  await expect(page.locator('#record-selections li')).toHaveCount(5);
  await expect(page.locator('#refund-response')).toBeHidden();
  await page.reload();
  await expect(page.locator('#record-route')).toHaveText(ENDINGS[route].title);
  await expect(page.locator('[data-tier-id="admiral"]')).toHaveAttribute('aria-pressed', 'true');
});

test('back edits replace the reaction and final record; Skip and direct entry do not invent answers', async ({ page }) => {
  await page.locator('#build-record').click();
  await expect(page.locator('#record-route')).toHaveText('An open folder. No obligation.');
  await expect(page.locator('#record-selections')).toContainText('No answers assumed');
  const first = QUESTIONS[0];
  await page.locator('#quiz-options').getByRole('button', { name: first.options[0].label, exact: true }).click();
  await page.locator('#quiz-next').click();
  await page.locator('#quiz-back').click();
  await expect(page.locator('#quiz-title')).toBeFocused();
  await page.locator('#quiz-options').getByRole('button', { name: first.options[2].label, exact: true }).click();
  await expect(page.locator('#record-selections')).toContainText(first.options[2].record);
  await expect(page.locator('#record-selections')).not.toContainText(first.options[0].record);
  await page.locator('#quiz-skip').click();
  await expect(page.locator('#quiz-title')).toHaveText('Browse on your own terms.');
  await expect(page.locator('#record-selections li')).toHaveCount(1);
  await page.locator('#quiz-restart').click();
  await page.locator('#restart-cancel').click();
  await expect(page.locator('#ownership-record')).toBeVisible();
  await page.locator('#quiz-restart').click();
  await page.locator('#restart-confirm').click();
  await expect(page.locator('#ownership-record')).toBeHidden();
  await expect(page.locator('#quiz-title')).toHaveText(QUESTIONS[0].title);
  await expect(page.locator('#quiz-next')).toBeDisabled();
});

test('finance changes update both speech and totals; only a deliberate refund adds the fee', async ({ page }) => {
  await expect(page.locator('#finance-don')).toContainText('Ninety-nine');
  await page.locator('#term').focus(); await page.keyboard.press('Home');
  await expect(page.locator('#term')).toHaveValue('10');
  await expect(page.locator('#finance-don')).toContainText('10 years');
  await expect(page.locator('#finance-don')).not.toContainText('Ninety-nine');
  await page.locator('#stake').focus(); await page.keyboard.press('End');
  await page.locator('#apr').focus(); await page.keyboard.press('End');
  await page.locator('#build-record').click();
  const before = Number((await page.locator('#record-total').innerText()).replace(/[^\d.]/g, ''));
  await page.locator('#record-refund').click();
  await expect(page.locator('#refund-response')).toBeVisible();
  const after = Number((await page.locator('#record-total').innerText()).replace(/[^\d.]/g, ''));
  expect(after - before).toBe(250);
  await expect(page.locator('#record-refund')).toBeDisabled();
  await page.locator('[data-tier-id="bronze"]').click();
  await expect(page.locator('#refund-response')).toBeHidden();
  await expect(page.locator('#record-facts')).toContainText('Bronze Bunker — selected');
  await expect(page.locator('#record-facts')).toContainText('$0.00 — no refund requested');
  await expect(page.locator('#term')).toHaveValue('10');
});

test('record and quote copying carry the fiction label; PNG download contains a real image', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.locator('#build-record').click();
  await page.locator('#record-copy').click();
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toContain(FICTION_LABEL);
  expect(copied).toContain('No answers assumed');
  expect(copied).toContain(await page.locator('#record-total').innerText());
  const downloadPending = page.waitForEvent('download');
  await page.locator('#record-download').click();
  const download = await downloadPending;
  const png = await readFile((await download.path())!);
  expect(png.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
  expect(png.readUInt32BE(16)).toBe(1200);
  expect(png.readUInt32BE(20)).toBeGreaterThan(1000);
  const quote = await page.locator('#quote-text').innerText();
  await page.locator('#quote-next').click();
  await expect(page.locator('#quote-text')).not.toHaveText(quote);
  await page.locator('#quote-prev').click();
  await expect(page.locator('#quote-text')).toHaveText(quote);
  await page.locator('#quote-copy').click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(FICTION_LABEL);
});

test('unavailable storage, clipboard and canvas retain usable selections and readable export fallback', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'sessionStorage', { get() { throw new Error('blocked'); } });
    Object.defineProperty(navigator, 'clipboard', { value: { writeText() { return Promise.reject(new Error('blocked')); } } });
    HTMLCanvasElement.prototype.getContext = () => null;
  });
  await page.reload();
  await expect(page.locator('#quiz-status')).toContainText('could not save');
  await page.locator('[data-tier-id="bronze"]').click();
  await page.locator('#build-record').click();
  await page.locator('#record-copy').click();
  await expect(page.locator('#export-fallback')).toBeVisible();
  await expect(page.locator('#export-fallback')).toHaveValue(/Bronze Bunker/);
  await page.locator('#record-download').click();
  await expect(page.locator('#export-status')).toContainText('image could not be created');
  await expect(page.locator('#export-fallback')).toHaveValue(new RegExp(FICTION_LABEL));
});

test('Experience has no episode teasers and the premiere loads only on request', async ({ page }) => {
  await expect(page.locator('#scenes')).toHaveCount(0);
  await expect(page.getByText('Scenes from the presentation')).toHaveCount(0);
  await expect(page.locator('#premiere-player iframe')).toHaveCount(0);
  await page.locator('#premiere-play').click();
  await expect(page.locator('#premiere-player iframe')).toHaveAttribute('src', /Za2XII66eHQ/);
  await expect(page.getByRole('link', { name: /Watch on YouTube/ })).toBeVisible();
});

for (const width of [320, 390, 768, 1440]) test(`Experience fits ${width}px, keeps controls reachable and respects reduced motion`, async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width, height: 844 });
  await page.goto('/experience/');
  await expect(page.locator('html')).toHaveClass(/experience-ready/);
  await page.evaluate(() => document.fonts.ready);
  const geometry = await page.evaluate(() => ({ page: document.documentElement.scrollWidth, screen: innerWidth }));
  expect(geometry.page).toBeLessThanOrEqual(geometry.screen + 1);
  if (width < 900) {
    const menu = page.locator('#mobile-menu summary');
    await menu.click();
    await expect(page.locator('#mobile-menu')).toHaveAttribute('open', '');
    await page.keyboard.press('Escape');
    await expect(menu).toBeFocused();
    await expect(page.locator('#mobile-menu')).not.toHaveAttribute('open', '');
  }
  if (width <= 700) {
    for (const amenity of AMENITIES) {
      await page.locator(`#amenity-list [data-amenity-id="${amenity.id}"]`).click();
      await expect(page.locator('#amenity-title')).toHaveText(amenity.name);
    }
  }
  if (width === 390) {
    await page.goto('/experience/');
    const action = await page.getByRole('link', { name: 'Begin the presentation', exact: true }).boundingBox();
    expect(action!.y + action!.height).toBeLessThanOrEqual(844);
  }
  await page.screenshot({ path: testInfo.outputPath(`experience-${width}.png`), fullPage: true, animations: 'disabled' });
});


test('phone progression keeps the new question and selected offer replies in view', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('link', { name: 'Begin the presentation', exact: true }).click();
  await page.locator('#quiz-options button').first().click();
  await page.locator('#quiz-note summary').click();
  await page.locator('#quiz-next').click();
  const question = await page.locator('#quiz-title').boundingBox();
  expect(question!.y).toBeGreaterThanOrEqual(65);
  expect(question!.y + question!.height).toBeLessThan(844);
  await page.locator('[data-tier-id="bronze"]').click();
  await expect(page.locator('#tier-reaction')).toBeFocused();
  const pitch = await page.locator('#tier-reaction').boundingBox();
  expect(pitch!.y).toBeGreaterThanOrEqual(65);
  expect(pitch!.y).toBeLessThan(300);
  await page.locator('#amenity-list [data-amenity-id="marina"]').click();
  await expect(page.locator('#amenity-title')).toBeFocused();
  const amenity = await page.locator('#amenity-title').boundingBox();
  expect(amenity!.y).toBeGreaterThanOrEqual(65);
  expect(amenity!.y).toBeLessThan(400);
  await page.getByRole('link', { name: 'View another amenity', exact: true }).click();
  await expect(page.locator('#amenity-list [data-amenity-id="marina"]')).toBeInViewport();
});

test('static content and real exits remain available without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:' + (process.env.BOH_TEST_PORT ?? '4321') + '/experience/');
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('.noscript-note')).toBeVisible();
  await expect(page.locator('.noscript-note')).toContainText('JavaScript');
  await expect(page.getByRole('link', { name: /main site/i }).first()).toBeVisible();
  const noOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1);
  expect(noOverflow).toBe(true);
  await context.close();
});

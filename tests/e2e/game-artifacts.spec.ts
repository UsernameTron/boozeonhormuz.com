import { test, expect, type Page, type Frame } from '@playwright/test';
import { readFile } from 'node:fs/promises';

type Surface = Page | Frame;
async function playVoyage(game: Surface, options: { stopAt?: number; refuseFree?: boolean; rejectedPitch?: boolean } = {}) {
  const levels = new Set<number>();
  let refused = false;
  let rejected = false;
  for (let turn = 0; turn < 100; turn++) {
    if (await game.locator('#screen-score').isVisible()) return levels;
    const number = Number((await game.locator('#levelKicker').textContent())?.match(/Level (\d+)/)?.[1]);
    levels.add(number);
    if (options.stopAt === number) return levels;
    if (await game.locator('.doors button.right').isVisible()) {
      if (options.refuseFree && !refused) {
        await game.locator('.doors button.left').click(); refused = true;
      }
      await game.locator('.doors button.right').click();
    } else if (await game.locator('.setpiece').isVisible()) {
      for (const bank of await game.locator('.bank').all()) await bank.locator('button').first().click();
      await game.getByRole('button', { name: 'Pitch It To Him' }).click();
    } else if (await game.locator('.options').isVisible()) {
      if (options.rejectedPitch && !rejected) {
        await game.locator('.option').nth(1).click(); rejected = true;
      } else await game.locator('.option').first().click();
    } else if (await game.locator('#controls button').count()) {
      await game.locator('#controls button').first().click();
    } else throw new Error(`No playable action on level ${number}`);
  }
  throw new Error('Voyage failed to complete within its expected steps');
}
async function downloadContents(page: Page, trigger: () => Promise<unknown>) {
  const pending = page.waitForEvent('download');
  await trigger();
  const download = await pending;
  return { download, buffer: await readFile((await download.path())!) };
}

test('ten-level voyage exports actual choices and a frozen PNG, text, and JSON report', async ({ page }, testInfo) => {
  test.setTimeout(90000);
  const errors: string[] = [];
  const external: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('request', (request) => { if (new URL(request.url()).hostname !== '127.0.0.1') external.push(request.url()); });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.clock.setFixedTime(new Date('2026-09-06T12:00:00Z'));
  await page.goto('/apps/exit-strategy.html');
  await expect(page.locator('#calmSeas')).toBeChecked();
  await page.locator('#btnStart').focus(); await page.keyboard.press('Enter');
  const levels = await playVoyage(page, { refuseFree: true, rejectedPitch: true });
  expect([...levels]).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  await expect(page.locator('#scoreHeading')).toBeFocused();
  const frozen = await page.locator('#scoreRows').innerText();
  expect(frozen).toContain('0 min');
  await page.clock.setFixedTime(new Date('2026-09-06T12:12:00Z'));
  const json = await downloadContents(page, () => page.locator('#btnRecapJSON').click());
  const report = JSON.parse(json.buffer.toString());
  expect(report.rows.find(([label]: string[]) => label === 'Voyage duration')[1]).toBe('0 min');
  expect(report.counters.wrongPicks).toBe(1);
  expect(report.counters.leftDoorClicks).toBe(1);
  expect(report.recap.decisions.filter((decision: { kind: string }) => decision.kind === 'free-exit')).toHaveLength(1);
  expect(report.recap.decisions.some((decision: { label: string; outcome: string }) => decision.label === 'A VERY SAFE RESCUE BOAT' && decision.outcome.includes('Rescue is a poverty word'))).toBe(true);
  expect(report.recap.decisions.some((decision: { kind: string; label: string }) => decision.kind === 'pitch-accepted' && decision.label === 'THE EXECUTIVE VERTICAL DEPARTURE EXPERIENCE')).toBe(true);
  const text = await downloadContents(page, () => page.locator('#btnText').click());
  expect(text.buffer.toString()).toContain('VOYAGE DURATION: 0 min');
  const recap = await downloadContents(page, () => page.locator('#btnRecapText').click());
  expect(recap.buffer.toString()).toContain('Selected: A VERY SAFE RESCUE BOAT');
  const png = await downloadContents(page, () => page.locator('#btnPNG').click());
  expect(png.buffer.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
  expect(png.buffer.readUInt32BE(16)).toBe(1200);
  expect(png.buffer.readUInt32BE(20)).toBe(1600);
  await png.download.saveAs(testInfo.outputPath('scorecard.png'));
  expect(await page.locator('#scoreRows').innerText()).toBe(frozen);
  expect(await page.evaluate(() => localStorage.length)).toBe(0);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: testInfo.outputPath('completed-report.png'), fullPage: true });
  await page.locator('#btnSaveReport').click();
  await expect(page.locator('#saveStatus')).toContainText('Completed report saved');
  await page.locator('#btnReplay').click();
  await expect(page.locator('#screen-level')).toBeVisible();
  await expect(page.locator('#recapRows li')).toHaveCount(0);
  await expect(page.locator('#scoreRows .row')).toHaveCount(0);
  const savedBefore = await page.evaluate(() => localStorage.getItem('boh.exit-strategy.completed.v1'));
  await playVoyage(page);
  const replay = await downloadContents(page, () => page.locator('#btnRecapJSON').click());
  expect(JSON.parse(replay.buffer.toString()).counters.leftDoorClicks).toBe(0);
  expect(JSON.parse(replay.buffer.toString()).counters.wrongPicks).toBe(0);
  expect(await page.evaluate(() => localStorage.getItem('boh.exit-strategy.completed.v1'))).toBe(savedBefore);
  await page.reload();
  await expect(page.locator('#btnStart')).toBeVisible();
  await expect(page.locator('#savedPanel')).toBeVisible();
  const saved = await downloadContents(page, () => page.locator('#btnSavedJSON').click());
  expect(JSON.parse(saved.buffer.toString())).toEqual(report);
  await page.locator('#btnClearSaved').click();
  await expect(page.locator('#savedPanel')).toBeHidden();
  await expect(page.locator('#btnStart')).toBeFocused();
  expect(await page.evaluate(() => localStorage.length)).toBe(0);
  expect(errors).toEqual([]); expect(external).toEqual([]);
});

test('blocked storage and failed PNG leave the voyage and text fallback usable', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('Storage blocked', 'SecurityError'); } });
    HTMLCanvasElement.prototype.toBlob = function(callback) { callback(null); };
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/apps/exit-strategy.html');
  await page.locator('#btnStart').click();
  await playVoyage(page);
  await page.locator('#btnSaveReport').click();
  await expect(page.locator('#saveStatus')).toContainText('Device storage is unavailable');
  await page.locator('#btnPNG').click();
  await expect(page.locator('#exportStatus')).toContainText('PNG export unavailable');
  const text = await downloadContents(page, () => page.locator('#btnText').click());
  expect(text.buffer.toString()).toContain('TOTAL VICTORY');
  await page.locator('#btnReplay').click();
  await expect(page.locator('#levelKicker')).toHaveText('Level 1 of 10');
});

test('timed staircase still drains and rescues, while Calm Seas waits indefinitely', async ({ page }) => {
  await page.clock.install();
  await page.goto('/apps/exit-strategy.html');
  await page.locator('#calmSeas').uncheck();
  await page.locator('#btnStart').click();
  await playVoyage(page, { stopAt: 6 });
  await page.locator('#controls button').click();
  await expect(page.locator('#spTimer')).toHaveText('EGO DRAINING');
  await page.clock.runFor(65000);
  await expect(page.locator('.setpiece')).toHaveCount(0);
  await expect(page.locator('#transcript')).toContainText('He agrees to climb');
  await playVoyage(page);
  await expect(page.locator('#scoreRows')).toContainText('RESOLVED BY FLATTERY');
  await page.reload();
  await page.locator('#calmSeas').check();
  await page.locator('#btnStart').click();
  await playVoyage(page, { stopAt: 6 });
  await page.locator('#controls button').click();
  await expect(page.locator('#spTimer')).toHaveText('TURN-BASED');
  const ego = await page.locator('#egoVal').textContent();
  await page.clock.runFor(65000);
  await expect(page.locator('#egoVal')).toHaveText(ego!);
  await expect(page.locator('.setpiece')).toBeVisible();
});

for (const width of [320, 390, 768, 1440]) {
  test(`wrapper expands reversibly and game controls fit at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/play/');
    const frame = page.frame({ url: /exit-strategy\.html/ })!;
    await expect(frame.locator('#btnStart')).toBeVisible();
    const box = await page.locator('#gameFrame').boundingBox();
    expect(box!.y).toBeLessThan(500);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width + 1);
    await frame.locator('#btnStart').focus();
    await page.keyboard.press('Enter');
    await frame.getByRole('button', { name: /Right door/ }).click();
    const transcript = await frame.locator('#transcript').innerText();
    await page.locator('#expandPlay').focus(); await page.keyboard.press('Enter');
    await expect(page.locator('#expandPlay')).toHaveAttribute('aria-expanded', 'true');
    expect(await page.locator('#playStage').evaluate((element) => element.matches(':modal'))).toBe(true);
    expect((await page.locator('#gameFrame').boundingBox())!.y).toBeLessThan(100);
    expect(await frame.locator('#transcript').innerText()).toBe(transcript);
    await frame.locator('#controls button').focus(); await page.keyboard.press('Escape');
    await expect(page.locator('#expandPlay')).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('#expandPlay')).toBeFocused();
    expect(await frame.locator('#transcript').innerText()).toBe(transcript);
    expect(await frame.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    await frame.evaluate(() => window.scrollTo(0, 0));
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: testInfo.outputPath(`play-wrapper-${width}.png`), fullPage: true });
    await page.goto('/apps/exit-strategy.html');
    await page.locator('#btnStart').focus(); await page.keyboard.press('Enter');
    await expect(page.getByRole('button', { name: /Left door/ })).toBeFocused();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width + 1);
    await page.getByRole('button', { name: /Right door/ }).click();
    await page.locator('#controls button').scrollIntoViewIfNeeded();
    const meterBox = await page.locator('#hud').boundingBox();
    const brandBox = await page.locator('header.site').boundingBox();
    expect(brandBox!.y + brandBox!.height).toBeLessThanOrEqual(meterBox!.y + 1);
    await playVoyage(page);
    await page.locator('#btnPNG').focus();
    await expect(page.locator('#btnPNG')).toBeFocused();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width + 1);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: testInfo.outputPath(`game-results-${width}.png`), fullPage: true });
  });
}

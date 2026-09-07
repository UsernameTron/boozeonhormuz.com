import { test, expect, type Page } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { createServer, type Server } from 'node:http';
import { readFileSync, statSync } from 'node:fs';
import { extname, resolve, sep } from 'node:path';

// Keep this fixture site on one worker, but let independent checks run after a failure.
test.describe.configure({ mode: 'default' });
let fixtureURL: string;
let fixtureServer: Server;
const key = 'boh.listening.resume.v1';
const audio = (page: Page, index: number) => page.locator('[data-listening-room] audio').nth(index);
const paused = async (page: Page) => page.locator('[data-listening-room] audio').evaluateAll((elements) => elements.map((element) => (element as HTMLAudioElement).paused));

test.beforeAll(async () => {
  test.setTimeout(120000);
  const result = JSON.parse(execFileSync(process.execPath, ['tests/fixtures/listening-site.mjs'], { encoding: 'utf8', timeout: 100000 }));
  const folder = resolve(result.dist);
  fixtureServer = createServer((request, response) => {
    try {
      const path = decodeURIComponent(new URL(request.url!, 'http://localhost').pathname);
      let file = resolve(folder, '.' + path);
      if (!file.startsWith(folder + sep)) { response.writeHead(404).end(); return; }
      if (statSync(file).isDirectory()) file = resolve(file, 'index.html');
      const bytes = readFileSync(file);
      const types: Record<string, string> = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.woff2': 'font/woff2', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.wav': 'audio/wav' };
      const headers = { 'Content-Type': types[extname(file)] || 'application/octet-stream', 'Accept-Ranges': 'bytes' };
      const range = request.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
      if (range) {
        const start = Number(range[1]); const end = range[2] ? Math.min(Number(range[2]), bytes.length - 1) : bytes.length - 1;
        if (start > end) { response.writeHead(416).end(); return; }
        response.writeHead(206, { ...headers, 'Content-Range': `bytes ${start}-${end}/${bytes.length}`, 'Content-Length': end - start + 1 });
        response.end(bytes.subarray(start, end + 1));
      } else { response.writeHead(200, { ...headers, 'Content-Length': bytes.length }); response.end(bytes); }
    } catch { response.writeHead(404).end(); }
  });
  await new Promise<void>((done) => fixtureServer.listen(0, '127.0.0.1', done));
  const address = fixtureServer.address();
  fixtureURL = `http://127.0.0.1:${typeof address === 'object' && address ? address.port : 0}`;
});

test.afterAll(async () => { if (fixtureServer) await new Promise<void>((done) => fixtureServer.close(() => done())); });

async function openFixture(page: Page) {
  await page.goto(`${fixtureURL}/listen/`);
  await expect(page.locator('[data-listening-room]')).toHaveAttribute('data-listening-ready', 'true');
}
async function chooseNative(page: Page, index: number, browserName: string) {
  // WebKit puts a rewind control before Play; Chromium puts Play first.
  await audio(page, index).click({ position: { x: browserName === 'webkit' ? 50 : 20, y: 20 } });
  await expect.poll(async () => audio(page, index).evaluate((element) => !(element as HTMLAudioElement).paused)).toBe(true);
}

test('production stays honest when no audio exists', async ({ page }) => {
  await page.goto('/listen/');
  await expect(page.locator('[data-mini-player]')).toHaveCount(0);
  await expect(page.locator('main')).toContainText('mastering suite');
  await expect(page.locator('audio')).toHaveCount(0);
});

test('native fallback, queue order, exclusivity, real ended advancement, and boundaries', async ({ page, browserName }) => {
  const errors: string[] = []; page.on('pageerror', (error) => errors.push(error.message));
  await openFixture(page);
  await expect(page.locator('[data-listening-room] audio')).toHaveCount(2);
  await expect(page.locator('[data-listening-room]')).toContainText('Fixture Preview Without Audio');
  await expect(page.locator('[data-listening-room]')).not.toContainText('Fixture Hidden Audio');
  expect(await paused(page)).toEqual([true, true]);
  expect(await page.evaluate(() => localStorage.length)).toBe(0);
  await expect(page.locator('[data-previous]')).toBeDisabled();
  await page.locator('[data-play-all]').focus(); await page.keyboard.press('Enter');
  await expect.poll(() => paused(page)).toEqual([false, true]);
  await expect(page.locator('[data-now-link]')).toHaveText('Fixture First Track');
  await expect.poll(() => audio(page, 0).evaluate((element) => Number.isFinite((element as HTMLAudioElement).duration) && (element as HTMLAudioElement).duration > 0)).toBe(true);
  await audio(page, 0).evaluate((element) => { const audio = element as HTMLAudioElement; audio.currentTime = audio.duration - .15; });
  await expect.poll(() => paused(page)).toEqual([true, false]);
  await expect(page.locator('[data-now-link]')).toHaveText('Fixture Second Track');
  await expect(page.locator('[data-next]')).toBeDisabled();
  await page.locator('[data-previous]').click();
  await expect.poll(() => paused(page)).toEqual([false, true]);
  await chooseNative(page, 1, browserName);
  await expect.poll(() => paused(page)).toEqual([true, false]);
  await page.locator('[data-toggle]').click();
  expect(await paused(page)).toEqual([true, true]);
  expect(errors).toEqual([]);
});

test('a one-track queue plays once and keeps both queue boundaries disabled', async ({ page }) => {
  await page.goto(`${fixtureURL}/listening-fixture-one/`);
  await expect(page.locator('[data-play-all]')).toHaveText('Play all 1 track');
  await expect(page.locator('[data-previous]')).toBeDisabled();
  await expect(page.locator('[data-next]')).toBeDisabled();
  await page.locator('[data-play-all]').click();
  await expect.poll(() => paused(page)).toEqual([false]);
  await expect.poll(() => audio(page, 0).evaluate((element) => Number.isFinite((element as HTMLAudioElement).duration))).toBe(true);
  await audio(page, 0).evaluate((element) => { const audio = element as HTMLAudioElement; audio.currentTime = audio.duration - .15; });
  await expect(page.locator('[data-playback-status]')).toContainText('Track finished');
  expect(await paused(page)).toEqual([true]);
});

test('no JavaScript preserves usable native audio', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(`${fixtureURL}/listen/`);
  await expect(page.locator('[data-mini-player]')).toBeHidden();
  await expect(audio(page, 0)).toHaveAttribute('controls', '');
  await expect(audio(page, 0)).toHaveAttribute('preload', 'none');
  await expect(audio(page, 1)).toBeVisible();
  await context.close();
});

test('resume is opt-in, throttled, source-bound, restored only on request, and clearable', async ({ page }) => {
  await page.addInitScript(() => {
    const original = Storage.prototype.setItem;
    (window as unknown as { listeningWrites: number }).listeningWrites = 0;
    Storage.prototype.setItem = function(key, value) {
      if (key === 'boh.listening.resume.v1') (window as unknown as { listeningWrites: number }).listeningWrites++;
      return original.call(this, key, value);
    };
  });
  await openFixture(page);
  await page.locator('summary').filter({ hasText: 'Playback & device settings' }).click();
  await page.locator('[data-resume-opt-in]').check();
  await page.locator('[data-play-all]').click();
  await expect.poll(() => audio(page, 0).evaluate((element) => (element as HTMLAudioElement).readyState >= 2)).toBe(true);
  const writes = await page.evaluate(() => (window as unknown as { listeningWrites: number }).listeningWrites);
  await audio(page, 0).evaluate((element) => {
    (element as HTMLAudioElement).currentTime = 3;
    for (let i = 0; i < 20; i++) element.dispatchEvent(new Event('timeupdate'));
  });
  expect(await page.evaluate(() => (window as unknown as { listeningWrites: number }).listeningWrites)).toBe(writes);
  await page.locator('[data-toggle]').click();
  const raw = await page.evaluate((key) => localStorage.getItem(key), key);
  const snapshot = JSON.parse(raw!);
  expect(snapshot.trackId).toBe('fixture-a'); expect(snapshot.source).toBe('/audio/listening-first.wav');
  expect(snapshot.position).toBeGreaterThanOrEqual(3);
  await page.reload();
  await page.locator('summary').filter({ hasText: 'Playback & device settings' }).click();
  expect(await paused(page)).toEqual([true, true]);
  expect(await audio(page, 0).evaluate((element) => (element as HTMLAudioElement).currentTime)).toBe(0);
  // Merely revisiting must not replace a saved position with zero.
  await page.reload();
  expect(await page.evaluate((key) => localStorage.getItem(key), key)).toBe(raw);
  await page.locator('summary').filter({ hasText: 'Playback & device settings' }).click();
  await page.locator('[data-restore]').click();
  await expect(page.locator('[data-storage-status]')).toContainText('Restored Fixture First Track');
  expect(await paused(page)).toEqual([true, true]);
  expect(await audio(page, 0).evaluate((element) => (element as HTMLAudioElement).currentTime)).toBeCloseTo(snapshot.position, 1);
  await page.locator('[data-clear-resume]').click();
  await expect(page.locator('[data-resume-opt-in]')).not.toBeChecked();
  expect(await page.evaluate((key) => localStorage.getItem(key), key)).toBeNull();
  const invalid = { ...snapshot, source: '/audio/changed.wav' };
  await page.evaluate(({ key, invalid }) => localStorage.setItem(key, JSON.stringify(invalid)), { key, invalid });
  await page.reload();
  await page.locator('summary').filter({ hasText: 'Playback & device settings' }).click();
  await expect(page.locator('[data-restore]')).toBeHidden();
  await expect(page.locator('[data-storage-status]')).toContainText('no longer available');
});

test('out-of-range saved positions reset an already-used track to zero without playing', async ({ page }) => {
  await openFixture(page);
  await page.evaluate((key) => {
    const track = JSON.parse(document.querySelector<HTMLElement>('[data-listening-room]')!.dataset.queue!)[0];
    localStorage.setItem(key, JSON.stringify({ version: 1, enabled: true, trackId: track.id, source: track.source, sourceVersion: track.sourceVersion, position: 99, savedAt: Date.now() }));
  }, key);
  await page.reload();
  await page.locator('summary').filter({ hasText: 'Playback & device settings' }).click();
  await page.locator('[data-play-all]').click();
  await expect.poll(() => audio(page, 0).evaluate((element) => (element as HTMLAudioElement).readyState >= 2)).toBe(true);
  await audio(page, 0).evaluate((element) => { (element as HTMLAudioElement).currentTime = 3; });
  await page.locator('[data-toggle]').click();
  await page.locator('[data-restore]').click();
  await expect(page.locator('[data-storage-status]')).toContainText('ready from the start');
  expect(await audio(page, 0).evaluate((element) => (element as HTMLAudioElement).currentTime)).toBe(0);
  expect(await paused(page)).toEqual([true, true]);
});

test('storage denial, unsupported Media Session, play rejection, and missing source are recoverable', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('blocked', 'SecurityError'); } });
    Object.defineProperty(navigator, 'mediaSession', { value: { setActionHandler() { throw new Error('unsupported'); } } });
    const original = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function() {
      if (this.getAttribute('src')?.includes('first')) return Promise.reject(new DOMException('User gesture required', 'NotAllowedError'));
      return original.call(this);
    };
  });
  await openFixture(page);
  await page.locator('summary').filter({ hasText: 'Playback & device settings' }).click();
  await page.locator('[data-resume-opt-in]').click();
  await expect(page.locator('[data-resume-opt-in]')).not.toBeChecked();
  await expect(page.locator('[data-storage-status]')).toContainText('storage is unavailable');
  await page.locator('[data-play-all]').click();
  await expect(page.locator('[data-playback-status]')).toContainText('Could not start');
  await page.locator('[data-next]').click();
  await expect.poll(() => paused(page)).toEqual([true, false]);
  await page.route('**/audio/listening-second.wav', (route) => route.fulfill({ status: 404, body: 'Unavailable' }));
  await page.reload();
  await page.locator('[data-next]').click();
  await expect(page.locator('[data-playback-status]')).toContainText(/unavailable|Could not start/i);
  await expect(page.locator('[data-previous]')).toBeEnabled();
});

for (const width of [320, 390, 768, 1440]) {
  test(`compact cards and mini-player remain reachable at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await openFixture(page);
    await page.locator('[data-play-all]').click();
    await page.locator('[data-toggle]').click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width + 1);
    const cover = await page.locator('.audio-cover').first().boundingBox();
    expect(cover!.width).toBe(80); expect(cover!.height).toBe(80);
    await audio(page, 1).focus();
    await expect(audio(page, 1)).toBeFocused();
    await expect.poll(async () => {
      const native = await audio(page, 1).boundingBox();
      const mini = await page.locator('[data-mini-player]').boundingBox();
      return native!.y + native!.height <= mini!.y || native!.x + native!.width <= mini!.x;
    }).toBe(true);
    await page.locator('[data-next]').focus(); await page.keyboard.press('Enter');
    await expect(page.locator('[data-now-link]')).toHaveText('Fixture Second Track');
    await page.locator('[data-toggle]').click();
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: testInfo.outputPath(`listening-${width}.png`), fullPage: true });
    await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
    const overflow = await page.evaluate(() => ({
      width: document.documentElement.scrollWidth,
      items: Array.from(document.querySelectorAll('body *')).filter((element) => element.getBoundingClientRect().right > innerWidth + 1).map((element) => ({ tag: element.tagName, class: element.className, right: element.getBoundingClientRect().right })).slice(0, 20),
    }));
    expect(overflow.width, JSON.stringify(overflow.items)).toBeLessThanOrEqual(width + 1);
    await page.locator('footer a').last().focus();
    const footer = await page.locator('footer a').last().boundingBox();
    const player = await page.locator('[data-mini-player]').boundingBox();
    expect(player!.y + player!.height).toBeLessThanOrEqual(footer!.y);
  });
}

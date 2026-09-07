import assert from 'node:assert/strict';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, extname, sep } from 'node:path';
import { spawnSync } from 'node:child_process';
import { createServer } from 'node:http';
import { chromium } from '@playwright/test';

// All fixtures are written to a disposable clone, never src/content in the working tree.
// Retain the path/log after a failure for debugging. The OS temp policy cleans it later.
const source = resolve('.');
const fixture = mkdtempSync(join(tmpdir(), 'boh-fixtures-'));
for (const item of ['src', 'public', 'astro.config.mjs', 'tsconfig.json', 'package.json', 'package-lock.json', 'scripts']) {
  if (existsSync(join(source, item))) cpSync(join(source, item), join(fixture, item), { recursive: true });
}
// A lockfile install also avoids Astro virtual-module path issues across symlinked roots.
const install = spawnSync('npm', ['ci', '--no-audit', '--no-fund'], { cwd: fixture, encoding: 'utf8', maxBuffer: 10_000_000 });
writeFileSync(join(fixture, 'install.log'), install.stdout + install.stderr);
assert.equal(install.status, 0, `Fixture install failed: ${fixture}/install.log`);
const configPath = join(fixture, 'astro.config.mjs');
const config = readFileSync(configPath, 'utf8');
assert.match(config, /defineConfig\(\{/);
writeFileSync(configPath, config.replace('defineConfig({', "defineConfig({\n  cacheDir: './.astro-cache/',"));
const content = (collection, id, data) => {
  const folder = join(fixture, 'src/content', collection);
  mkdirSync(folder, { recursive: true });
  writeFileSync(join(folder, id + '.md'), `---\n${Object.entries(data).map(([key, value]) => `${key}: ${JSON.stringify(value)}`).join('\n')}\n---\n\nFixture creative note.\n`);
};
for (const [index, status] of ['unreleased', 'preview', 'released', 'hidden', 'draft'].entries()) {
  content('tracks', `fixture-${status}`, {
    title: `Fixture ${status} track`, slug: `fixture-${status}`, album: 'booze-on-hormuz',
    trackNumber: index + 1, status: status === 'draft' ? 'released' : status,
    ...(status === 'released' ? { audio: '/audio/fixture.wav', duration: '0:01' } : {}), draft: status === 'draft',
  });
}
mkdirSync(join(fixture, 'public/audio'), { recursive: true });
const wav = Buffer.alloc(44 + 16000);
wav.write('RIFF'); wav.writeUInt32LE(wav.length - 8, 4); wav.write('WAVEfmt ', 8);
wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20); wav.writeUInt16LE(1, 22); wav.writeUInt32LE(8000, 24);
wav.writeUInt32LE(16000, 28); wav.writeUInt16LE(2, 32); wav.writeUInt16LE(16, 34); wav.write('data', 36); wav.writeUInt32LE(16000, 40);
writeFileSync(join(fixture, 'public/audio/fixture.wav'), wav);
for (const [index, orientation] of ['16:9', '9:16', '1:1'].entries()) {
  content('videos', `fixture-video-${index}`, {
    title: `Fixture video ${orientation}`, slug: `fixture-video-${index}`, type: 'short', track: 'fixture-released',
    youtubeId: 'Za2XII66eHQ',
    orientation, description: `Fixture ${orientation} video`, publishDate: '2026-01-01', draft: false,
  });
}
content('videos', 'fixture-video-draft', { title: 'Fixture secret video', slug: 'fixture-video-draft', type: 'sketch', youtubeId: 'Za2XII66eHQ', description: 'Never visible', publishDate: '2026-02-01', draft: true });
for (const draft of [false, true]) content('images', `fixture-image-${draft}`, { title: draft ? 'Fixture secret image' : 'Fixture public image', type: 'poster', image: '/don-biggly-poster.webp', alt: 'Fixture complete poster', caption: 'Fixture caption', track: 'fixture-released', draft });
mkdirSync(join(fixture, 'public/video'), { recursive: true });
cpSync(join(source, 'tests/fixtures/media/captions.vtt'), join(fixture, 'public/video/fixture-captions.vtt'));
const localMedia = [['landscape', '16:9', 160, 90], ['portrait', '9:16', 90, 160], ['square', '1:1', 100, 100]];
for (const [name, orientation] of localMedia) {
  cpSync(join(source, `tests/fixtures/media/${name}.mp4`), join(fixture, `public/video/fixture-${name}.mp4`));
  content('videos', `fixture-local-${name}`, { title: `Fixture local ${name}`, slug: `fixture-local-${name}`, type: 'short', src: `/video/fixture-${name}.mp4`, orientation, description: `Fixture ${orientation} local playback`, publishDate: '2026-01-01', draft: false, captions: [{ src: '/video/fixture-captions.vtt', srclang: 'en', label: 'English', default: true }] });
}
const run = spawnSync('npm', ['run', 'build'], { cwd: fixture, encoding: 'utf8', maxBuffer: 10_000_000 });
writeFileSync(join(fixture, 'build.log'), run.stdout + run.stderr);
assert.equal(run.status, 0, `Fixture build failed: ${fixture}/build.log\n${run.stderr}\n${run.stdout.slice(-5000)}`);
assert.ok(existsSync(join(fixture, '.astro-cache/data-store.json')), 'Fixture content cache must remain isolated');
const html = (route) => readFileSync(join(fixture, 'dist', route, 'index.html'), 'utf8');
for (const status of ['preview', 'released']) assert.ok(existsSync(join(fixture, 'dist/album', `fixture-${status}/index.html`)));
for (const status of ['unreleased', 'hidden', 'draft']) assert.ok(!existsSync(join(fixture, 'dist/album', `fixture-${status}/index.html`)));
assert.match(html('album'), /Fixture unreleased track/);
assert.doesNotMatch(html('album/fixture-preview'), /<audio\b/);
assert.match(html('album/fixture-released'), /<audio\b[^>]*src="\/audio\/fixture.wav"/);
assert.match(html('watch/fixture-local-portrait'), /<video\b[^>]*src="\/video\/fixture-portrait.mp4"/);
assert.match(html('watch/fixture-video-0'), /lite-youtube/);
assert.match(html('watch/fixture-video-2'), /lite-youtube/);
assert.match(html('archive'), /Fixture public image/);
for (const route of ['', 'album', 'listen', 'archive', 'watch']) {
  assert.doesNotMatch(html(route), /Fixture (?:hidden track|draft track|secret video|secret image)/, `${route} leaked nonpublic content`);
}
// Decode real, tiny synthetic MP4s in Chromium against the disposable production build.
const dist = resolve(fixture, 'dist');
const server = createServer((request, response) => {
  try {
    let file = resolve(dist, '.' + decodeURIComponent(new URL(request.url, 'http://localhost').pathname));
    if (!file.startsWith(dist + sep)) { response.writeHead(404).end(); return; }
    if (statSync(file).isDirectory()) file = join(file, 'index.html');
    const bytes = readFileSync(file);
    const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.woff2': 'font/woff2', '.vtt': 'text/vtt', '.mp4': 'video/mp4' };
    const headers = { 'Content-Type': types[extname(file)] ?? 'application/octet-stream', 'Accept-Ranges': 'bytes' };
    const range = request.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
    if (range) {
      const start = Number(range[1]), end = range[2] ? Math.min(Number(range[2]), bytes.length - 1) : bytes.length - 1;
      if (start > end) { response.writeHead(416).end(); return; }
      response.writeHead(206, { ...headers, 'Content-Range': `bytes ${start}-${end}/${bytes.length}`, 'Content-Length': end - start + 1 }); response.end(bytes.subarray(start, end + 1));
    } else { response.writeHead(200, { ...headers, 'Content-Length': bytes.length }); response.end(bytes); }
  } catch { response.writeHead(404).end(); }
});
await new Promise((done) => server.listen(0, '127.0.0.1', done));
let browser;
try {
  browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.route('https://**', (route) => route.abort());
  for (const [name, orientation, width, height] of localMedia) {
    await page.goto(`http://127.0.0.1:${server.address().port}/watch/fixture-local-${name}/`);
    await page.waitForFunction(() => document.querySelector('video')?.readyState >= 1);
    const metadata = await page.locator('video').evaluate((video) => ({ width: video.videoWidth, height: video.videoHeight, paused: video.paused, inline: video.playsInline, duration: video.duration }));
    assert.equal(metadata.width, width); assert.equal(metadata.height, height); assert.equal(metadata.paused, true); assert.equal(metadata.inline, true); assert.ok(metadata.duration > 0);
    assert.equal(await page.locator('.video-frame').first().getAttribute('data-orientation'), orientation);
    await page.waitForFunction(() => document.querySelector('video').textTracks[0]?.cues?.length > 0);
    assert.equal(await page.locator('video').evaluate((video) => video.textTracks[0].cues[0].text), 'Synthetic media fixture caption.');
    await page.locator('video').evaluate((video) => video.play());
    await page.waitForFunction(() => document.querySelector('video').ended);
    await page.screenshot({ path: join(fixture, `${name}-playback.png`), fullPage: true });
  }
} finally {
  if (browser) await browser.close();
  await new Promise((done) => server.close(done));
}
console.log(`Fixtures OK: lifecycle, missing artwork/audio, real local/YouTube video markup, three decoded orientations, WebVTT cues and image visibility. Isolated output: ${fixture}`);
const rejectedBuild = (name, message) => {
  const result = spawnSync('npm', ['run', 'build'], { cwd: fixture, encoding: 'utf8', maxBuffer: 10_000_000 });
  const log = result.stdout + result.stderr;
  writeFileSync(join(fixture, `${name}.log`), log);
  assert.notEqual(result.status, 0, `${name} must fail the build`);
  assert.match(log, message, `${name} failed for an unrelated reason: ${fixture}/${name}.log`);
};
const invalidVideo = { title: 'Fixture invalid source', slug: 'fixture-invalid-source', type: 'short', description: 'Invalid public fixture', publishDate: '2026-01-01', draft: false };
content('videos', 'fixture-invalid-source', invalidVideo);
rejectedBuild('source-less-video', /A public video needs a YouTube ID or playable source/);
content('videos', 'fixture-invalid-source', { ...invalidVideo, draft: true });
content('episodes', 'fixture-duplicate-watch', { title: 'Fixture duplicate episode', slug: 'fixture-video-0', summary: 'Duplicate route must be rejected', publishDate: '2026-01-01', draft: false });
rejectedBuild('duplicate-watch-slug', /Duplicate public watch slug: fixture-video-0/);
console.log('Invalid fixtures correctly rejected: source-less public video and duplicate episode/video watch slugs.');

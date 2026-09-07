import assert from 'node:assert/strict';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

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
    ...(index === 1 ? { src: '/video/fixture.mp4' } : { youtubeId: 'Za2XII66eHQ' }),
    orientation, description: `Fixture ${orientation} video`, publishDate: '2026-01-01', draft: false,
  });
}
content('videos', 'fixture-video-draft', { title: 'Fixture secret video', slug: 'fixture-video-draft', type: 'sketch', youtubeId: 'Za2XII66eHQ', description: 'Never visible', publishDate: '2026-02-01', draft: true });
for (const draft of [false, true]) content('images', `fixture-image-${draft}`, { title: draft ? 'Fixture secret image' : 'Fixture public image', type: 'poster', image: '/don-biggly-poster.webp', alt: 'Fixture complete poster', caption: 'Fixture caption', track: 'fixture-released', draft });
mkdirSync(join(fixture, 'public/video'), { recursive: true });
writeFileSync(join(fixture, 'public/video/fixture.mp4'), Buffer.alloc(0)); // markup/source test; deliberately no playback claim
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
assert.match(html('watch/fixture-video-1'), /<video\b[^>]*src="\/video\/fixture.mp4"/);
assert.match(html('watch/fixture-video-0'), /lite-youtube/);
assert.match(html('watch/fixture-video-2'), /lite-youtube/);
assert.match(html('archive'), /Fixture public image/);
for (const route of ['', 'album', 'listen', 'archive', 'watch']) {
  assert.doesNotMatch(html(route), /Fixture (?:hidden track|draft track|secret video|secret image)/, `${route} leaked nonpublic content`);
}
console.log(`Fixtures OK: lifecycle, missing artwork/audio, local/YouTube videos, orientation metadata, image visibility. Isolated output: ${fixture}`);
console.log('Contract gaps awaiting source validation: source-less public video; duplicate episode/video watch slugs. These invalid cases are not blessed as expected behavior.');

import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

// A disposable site exercises real compiled components without publishing sample music.
const source = resolve('.');
const fixture = mkdtempSync(join(tmpdir(), 'boh-listening-'));
for (const item of ['src', 'public', 'astro.config.mjs', 'tsconfig.json', 'package.json', 'package-lock.json', 'scripts']) {
  if (existsSync(join(source, item))) cpSync(join(source, item), join(fixture, item), { recursive: true });
}
const configPath = join(fixture, 'astro.config.mjs');
writeFileSync(configPath, readFileSync(configPath, 'utf8').replace('defineConfig({', "defineConfig({\n  cacheDir: './.astro-cache/',"));
const content = (id, data) => {
  const folder = join(fixture, 'src/content/tracks'); mkdirSync(folder, { recursive: true });
  writeFileSync(join(folder, id + '.md'), `---\n${Object.entries(data).map(([key, value]) => `${key}: ${JSON.stringify(value)}`).join('\n')}\n---\n\nIsolated listening fixture.\n`);
};
const track = { album: 'booze-on-hormuz', draft: false, status: 'released', cover: '/don-biggly.webp' };
content('fixture-a', { ...track, title: 'Fixture First Track', slug: 'fixture-a', trackNumber: 2, featured: true, audio: '/audio/listening-first.wav', duration: '0:08' });
content('fixture-b', { ...track, title: 'Fixture Second Track', slug: 'fixture-b', trackNumber: 1, audio: '/audio/listening-second.wav', duration: '0:08' });
content('fixture-preview', { ...track, title: 'Fixture Preview Without Audio', slug: 'fixture-preview', trackNumber: 3, status: 'preview' });
content('fixture-hidden', { ...track, title: 'Fixture Hidden Audio', slug: 'fixture-hidden', trackNumber: 4, status: 'hidden', audio: '/audio/listening-first.wav' });
content('fixture-draft', { ...track, title: 'Fixture Draft Audio', slug: 'fixture-draft', trackNumber: 5, draft: true, audio: '/audio/listening-first.wav' });
mkdirSync(join(fixture, 'public/audio'), { recursive: true });
for (const name of ['first', 'second']) {
  const sampleBytes = 8000 * 2 * 8;
  const wav = Buffer.alloc(44 + sampleBytes);
  wav.write('RIFF'); wav.writeUInt32LE(wav.length - 8, 4); wav.write('WAVEfmt ', 8);
  wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20); wav.writeUInt16LE(1, 22); wav.writeUInt32LE(8000, 24);
  wav.writeUInt32LE(16000, 28); wav.writeUInt16LE(2, 32); wav.writeUInt16LE(16, 34); wav.write('data', 36); wav.writeUInt32LE(sampleBytes, 40);
  writeFileSync(join(fixture, 'public/audio', `listening-${name}.wav`), wav);
}
writeFileSync(join(fixture, 'src/pages/listening-fixture-one.astro'), `---
import BaseLayout from '../layouts/BaseLayout.astro';
import AudioTrack from '../components/AudioTrack.astro';
import ListeningController from '../components/ListeningController.astro';
const queue = [{ id: 'fixture-a', title: 'Fixture First Track', slug: 'fixture-a', source: '/audio/listening-first.wav' }];
---
<BaseLayout title="One-track fixture"><h1>One-track fixture</h1><ListeningController queue={queue}><AudioTrack id="fixture-a" title="Fixture First Track" slug="fixture-a" audio="/audio/listening-first.wav" /></ListeningController></BaseLayout>
`);
for (const [name, args] of [['install', ['ci', '--no-audit', '--no-fund']], ['build', ['run', 'build']]]) {
  const result = spawnSync('npm', args, { cwd: fixture, encoding: 'utf8', maxBuffer: 10000000 });
  writeFileSync(join(fixture, `${name}.log`), result.stdout + result.stderr);
  if (result.status !== 0) throw new Error(`Listening fixture ${name} failed: ${fixture}/${name}.log`);
}
console.log(JSON.stringify({ fixture, dist: join(fixture, 'dist') }));

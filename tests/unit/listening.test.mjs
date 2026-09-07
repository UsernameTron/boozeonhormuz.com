import test from 'node:test';
import assert from 'node:assert/strict';
import { listeningQueue, orderedListeningTracks, formatTime, validateResume, readResume, writeResume, clearResume, RESUME_KEY } from '../../src/lib/listening.ts';
import { listeningSourceVersion } from '../../src/lib/listening-source.ts';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { playableTracks } from '../../src/lib/media.ts';
const track = (id, number, data = {}) => ({ id, data: { title: id, slug: id, trackNumber: number, status: 'released', draft: false, featured: false, ...data } });
const publicTrack = track('audio', 1, { audio: '/audio/one.wav' });
const queue = listeningQueue([publicTrack]);
const stamp = 1788732000000;
const saved = { version: 1, enabled: true, trackId: 'audio', source: '/audio/one.wav', sourceVersion: '/audio/one.wav', position: 12.5, savedAt: stamp };
const memory = () => { const values = new Map(); return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: (key) => values.delete(key) }; };

test('queue is empty or source-only without changing preview page eligibility', () => {
  assert.deepEqual(listeningQueue([]), []);
  const preview = track('preview', 2, { status: 'preview' });
  const values = [preview, publicTrack, track('draft', 3, { draft: true, audio: '/draft.wav' }), track('hidden', 4, { status: 'hidden', audio: '/hidden.wav' }), track('locked', 5, { status: 'unreleased', audio: '/locked.wav' }), track('empty', 6, { audio: '   ' })];
  assert.deepEqual(listeningQueue(values).map((item) => item.id), ['audio']);
  assert.ok(playableTracks(values).some((item) => item.id === 'preview'));
  assert.ok(orderedListeningTracks(values).some((item) => item.id === 'empty'));
});

test('multiple-track queue is featured first then numbered with deterministic ties', () => {
  const values = [track('z', 1, { audio: '/z.wav' }), track('featured', 8, { audio: '/f.wav', featured: true }), track('a', 1, { audio: '/a.wav' }), track('preview', 2, { status: 'preview', audio: '/p.wav' })];
  const before = structuredClone(values);
  assert.deepEqual(listeningQueue(values).map((item) => item.id), ['featured', 'a', 'z', 'preview']);
  assert.deepEqual(values, before);
});

test('resume validates stable track identity, source version, and finite timestamps', () => {
  assert.deepEqual(validateResume(saved, queue, stamp), saved);
  for (const invalid of [null, {}, { ...saved, enabled: false }, { ...saved, version: 2 }, { ...saved, trackId: 'removed' }, { ...saved, source: '/new-version.wav' }, { ...saved, sourceVersion: 'changed-file-content' }, { ...saved, position: -1 }, { ...saved, position: Infinity }, { ...saved, position: 90000 }, { ...saved, savedAt: stamp + 120000 }, { ...saved, savedAt: NaN }]) assert.equal(validateResume(invalid, queue, stamp), null);
});

test('resume round trips only through explicit writes, clears one key, and recovers from corruption', () => {
  const storage = memory();
  storage.setItem('other-app', 'keep');
  assert.equal(readResume(storage, queue).position, null);
  assert.equal(writeResume(storage, queue[0], 12.5, stamp).ok, true);
  assert.deepEqual(readResume(storage, queue).position, saved);
  assert.equal(clearResume(storage).ok, true);
  assert.equal(readResume(storage, queue).position, null);
  assert.equal(storage.getItem('other-app'), 'keep');
  for (const raw of ['{', 'x'.repeat(12001), JSON.stringify({ ...saved, source: '/removed.wav' })]) {
    storage.setItem(RESUME_KEY, raw);
    assert.equal(readResume(storage, queue).position, null);
    assert.ok(readResume(storage, queue).error);
  }
});

test('denied reads, quota writes, and rejected clears do not throw', () => {
  const denied = { getItem() { throw Error(); }, setItem() { throw Error(); }, removeItem() { throw Error(); } };
  assert.equal(readResume(denied, queue).position, null);
  assert.equal(writeResume(denied, queue[0], 10, stamp).ok, false);
  assert.equal(clearResume(denied).ok, false);
});

test('time formatting handles loading, long tracks, and invalid durations', () => {
  assert.equal(formatTime(0), '0:00'); assert.equal(formatTime(65.9), '1:05'); assert.equal(formatTime(3600), '60:00');
  assert.equal(formatTime(NaN), '0:00'); assert.equal(formatTime(-8), '0:00');
});


test('a local audio replacement invalidates resume even when its URL is unchanged', () => {
  const root = mkdtempSync(join(tmpdir(), 'boh-audio-version-'));
  const file = join(root, 'track.wav');
  writeFileSync(file, 'first audio version');
  const first = listeningSourceVersion('/track.wav', root);
  writeFileSync(file, 'second audio version');
  const second = listeningSourceVersion('/track.wav', root);
  assert.notEqual(first, second);
  assert.match(first, /^[a-f0-9]{64}$/);
  assert.equal(listeningSourceVersion('/missing.wav', root), '/missing.wav');
  assert.equal(listeningSourceVersion('/../outside.wav', root), '/../outside.wav');
  assert.equal(listeningSourceVersion('https://example.com/audio.wav?v=2', root), 'https://example.com/audio.wav?v=2');
});

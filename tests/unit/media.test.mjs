import test from 'node:test';
import assert from 'node:assert/strict';
import { listedTracks, playableTracks, liveVideos, liveImages, toISODuration, featuredFirst, validateWatchSlugs } from '../../src/lib/media.ts';

const track = (id, status, trackNumber, draft = false) => ({ id, data: { status, trackNumber, draft } });
test('track lifecycle controls visibility, ordering and page eligibility without mutating input', () => {
  const catalog = [track('release', 'released', 3), track('secret', 'hidden', 1), track('preview', 'preview', 2), track('locked', 'unreleased', 1), track('draft', 'released', 4, true)];
  const before = structuredClone(catalog);
  assert.deepEqual(listedTracks(catalog).map((t) => t.id), ['locked', 'preview', 'release']);
  assert.deepEqual(playableTracks(catalog).map((t) => t.id), ['preview', 'release']);
  assert.deepEqual(catalog, before);
  assert.deepEqual(playableTracks([]), []);
});
test('videos exclude drafts and sort newest first; images exclude drafts', () => {
  const video = (id, date, draft = false) => ({ id, data: { publishDate: new Date(date), draft } });
  assert.deepEqual(liveVideos([video('old', '2026-01-01'), video('draft', '2026-09-01', true), video('new', '2026-06-01')]).map((v) => v.id), ['new', 'old']);
  assert.deepEqual(liveImages([{ id: 'public', data: { draft: false } }, { id: 'draft', data: { draft: true } }]).map((i) => i.id), ['public']);
});
test('duration conversion supports missing and valid metadata', () => {
  assert.equal(toISODuration(), undefined);
  assert.equal(toISODuration('invalid'), undefined);
  assert.equal(toISODuration('3:14'), 'PT3M14S');
  assert.equal(toISODuration('0:09'), 'PT0M9S');
});
test('an older featured performance precedes newer unfeatured entries without losing recency order', () => {
  const items = [
    { id: 'new', data: { publishDate: new Date('2026-09-01'), featured: false, draft: false } },
    { id: 'old-feature', data: { publishDate: new Date('2026-01-01'), featured: true, draft: false } },
    { id: 'middle', data: { publishDate: new Date('2026-06-01'), featured: false, draft: false } },
  ];
  assert.deepEqual(featuredFirst(liveVideos(items)).map((v) => v.id), ['old-feature', 'new', 'middle']);
  assert.deepEqual(items.map((v) => v.id), ['new', 'old-feature', 'middle']);
});
test('public episode/video watch slugs cannot collide', () => {
  assert.throws(() => validateWatchSlugs([{ id: 'episode', data: { slug: 'same' } }, { id: 'video', data: { slug: 'same' } }]), /Duplicate public watch slug/);
});

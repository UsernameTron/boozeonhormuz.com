import test from 'node:test';
import assert from 'node:assert/strict';
import { buildArchive, filterArchive, qualifiedId, artHref } from '../../src/lib/archive.ts';

const entry = (id, data) => ({ id, data: { draft: false, ...data } });
const catalog = () => ({
  tracks: [entry('released', { title: 'Public track', slug: 'public-track', status: 'released', trackNumber: 2 }), entry('hidden', { title: 'Private track', slug: 'secret', status: 'hidden', trackNumber: 1 })],
  videos: [entry('film', { title: 'Film', slug: 'film', type: 'music-video', publishDate: new Date('2026-01-01'), description: 'Public description', youtubeId: 'Za2XII66eHQ' })],
  images: [entry('shared', { title: '<script> & "art"', type: 'poster', image: '/poster.webp', alt: 'Full poster', caption: 'A searchable caption', track: { id: 'released' } }), entry('private-parent', { title: 'Standalone', type: 'still', image: '/still.webp', alt: 'Still', track: { id: 'hidden' } }), entry('draft', { draft: true, title: 'Never public', type: 'poster', image: '/secret.webp' })],
  evidence: [entry('shared', { kind: 'titlecard', title: 'Evidence art', image: '/evidence.webp' }), entry('draft', { draft: true, kind: 'gallery', title: 'Never public evidence', image: '/private.webp' }), entry('prompt', { kind: 'prompt', title: 'Prompt', body: 'Separate content surface' })],
});
test('public archive adapts each type and excludes draft/hidden/non-art evidence without mutating inputs', () => {
  const input = catalog(); const before = structuredClone(input); const output = buildArchive(input);
  assert.deepEqual(input, before);
  assert.deepEqual(output.map((item) => item.kind), ['track', 'video', 'art', 'art', 'art']);
  assert.equal(output[2].track.href, '/album/public-track');
  assert.equal(output[3].track, undefined);
  assert.ok(!JSON.stringify(output).includes('Never public'));
  assert.equal(output[2].title, '<script> & "art"'); // Renderers escape data; adapters preserve the actual title.
  assert.equal(output[2].href, '/art/images--shared');
  assert.equal(output[4].href, '/art/evidence--shared');
});
test('qualified art IDs cannot collide across collections or encoded path characters', () => {
  assert.notEqual(qualifiedId('images', 'a/b'), qualifiedId('images', 'a~2Fb'));
  assert.notEqual(qualifiedId('images', 'same'), qualifiedId('evidence', 'same'));
  assert.match(artHref('images', 'folder/a b'), /^\/art\/images--[A-Za-z0-9~_-]+$/);
  assert.equal(artHref('evidence', 'same'), artHref('evidence', 'same'));
});
test('search combines caption/title/description and category, with safe unknown types', () => {
  const items = buildArchive(catalog());
  assert.equal(filterArchive(items, 'SEARCHABLE caption', 'poster').length, 1);
  assert.equal(filterArchive(items, 'Public description', 'all')[0].kind, 'video');
  assert.equal(filterArchive(items, 'no match', 'all').length, 0);
  assert.equal(filterArchive(items, '', 'unknown').length, items.length);
  assert.equal(filterArchive(items, '<script> &', 'poster')[0].id, 'images--shared');
});

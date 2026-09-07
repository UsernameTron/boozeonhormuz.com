import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { BRIEF_OPTIONS, PROJECT_FORMAT, parseCreativeFile, validateProject, literalSubstitute, mergeTemplates, mapBriefToVariables, makeShorts, snapshotIsCurrent, studioHandoff } from '../../public/apps/project-kit.js';

const brief = { title: 'Café $&', concept: 'A fictional ship', setting: '', prop: 'Gold receipts', motifs: ['Quiet money'], format: 'Shorts/Reels pack', intensity: '9', includeLyrics: false, includeVideo: true, includeImage: true, includeSocial: true, phrase: '', reaction: BRIEF_OPTIONS.reaction[0], music: BRIEF_OPTIONS.music[0], visual: BRIEF_OPTIONS.visual[0] };
const broadcast = () => ({ format: PROJECT_FORMAT, version: 1, generatorVersion: 2, tool: 'broadcast', title: brief.title, updatedAt: '2026-09-06', brief: { ...brief, motifs: [...brief.motifs] }, shots: makeShorts(brief), generation: { revision: 4, generatedRevision: 3 } });
test('legacy brief and library files remain readable without importing built-in overrides', () => {
  assert.equal(parseCreativeFile(JSON.stringify({ version: 1, app: 'Biggly Broadcast Pack Generator', ...brief }), 'broadcast').brief.setting, '');
  const library = parseCreativeFile(JSON.stringify({ version: 2, builtIn: [{ name: 'Malicious replacement' }], custom: [{ name: 'Saved', content: '{{song_title}}', category: 'lyrics' }] }), 'studio');
  assert.equal(library.templates.length, 1); assert.equal(library.templates[0].builtIn, false);
  const legacyBrief = parseCreativeFile(readFileSync(new URL('../fixtures/creative/broadcast-v1.json', import.meta.url), 'utf8'), 'broadcast');
  assert.equal(legacyBrief.brief.title, 'Legacy café brief'); assert.equal(legacyBrief.brief.setting, '');
  const legacyLibrary = parseCreativeFile(readFileSync(new URL('../fixtures/creative/studio-v2.json', import.meta.url), 'utf8'), 'studio');
  assert.equal(legacyLibrary.templates[0].name, 'Legacy receipt'); assert.equal(legacyLibrary.templates.length, 1);
});
test('portable projects retain meaningful state and reject invalid revisions or versions', () => {
  const project = broadcast();
  assert.deepEqual(parseCreativeFile(JSON.stringify(project), 'broadcast').project, project);
  assert.throws(() => validateProject({ ...project, version: 99 }), /version/);
  assert.throws(() => validateProject({ ...project, generation: { revision: NaN, generatedRevision: 0 } }), /revision/);
  assert.throws(() => parseCreativeFile(JSON.stringify(project), 'studio'), /handoff/);
});
test('malformed, oversized and invalid enum files fail before mutation', () => {
  assert.throws(() => parseCreativeFile('{', 'broadcast'), /parse/);
  assert.throws(() => parseCreativeFile(' '.repeat(2_000_001), 'broadcast'), /large/);
  assert.throws(() => validateProject({ ...broadcast(), brief: { ...brief, reaction: 'unknown' } }), /reaction/);
  for (const [key, choices] of Object.entries(BRIEF_OPTIONS)) for (const value of choices) assert.equal(validateProject({ ...broadcast(), brief: { ...brief, [key]: value } }).brief[key], value);
});
test('merge preserves existing templates, skips exact duplicates and renames collisions', () => {
  const existing = [{ id: 1, name: 'Hook', content: 'Original', category: 'custom', heat: 'custom', builtIn: false }];
  const merged = mergeTemplates(existing, [existing[0], { ...existing[0], content: 'New content' }]);
  assert.equal(merged.length, 2); assert.equal(merged[0].content, 'Original'); assert.equal(merged[1].name, 'Hook (imported 2)');
  assert.deepEqual(existing.map((t) => t.content), ['Original']);
  assert.equal(mergeTemplates(existing, [], true).length, 0);
});
test('variable substitution preserves currency, punctuation, empty strings and unknown fields', () => {
  assert.equal(literalSubstitute('{{price}}|{{empty}}|{{missing}}', { price: '$& $$ $` $\' <safe>', empty: '' }), "$& $$ $` $' <safe>||{{missing}}");
});
test('handoff maps only recognized present fields and keeps explicit empty values', () => {
  assert.deepEqual(mapBriefToVariables({ title: brief.title, setting: '' }, ['song_title', 'luxury_setting', 'unknown', 'must_use_phrase']), { song_title: brief.title, luxury_setting: '' });
  const handoff = studioHandoff(broadcast());
  assert.equal(validateProject(handoff).studio.variables.song_title, brief.title);
  assert.equal(handoff.studio.model, 'sora'); assert.equal(handoff.shots.length, 5);
});
test('Shorts planning uses five stable vertical shots totaling30seconds with short captions and retained review state', () => {
  const plan = makeShorts({ ...brief, title: 'Very long title '.repeat(30) });
  assert.equal(plan.length, 5); assert.equal(plan.reduce((sum, shot) => sum + shot.duration, 0), 30);
  assert.ok(plan.every((s) => s.aspectRatio === '9:16' && s.caption.length <= 80 && s.prompt.includes('Fictional Don Biggly')));
  plan[0].image = 'my-frame.webp'; plan[0].review = 'approved';
  assert.equal(makeShorts(brief, plan)[0].image, 'my-frame.webp'); assert.equal(makeShorts(brief, plan)[0].review, 'review');
  assert.equal(makeShorts({ ...brief, title: 'Very long title '.repeat(30) }, plan)[0].review, 'approved');
});

test('imported output freshness requires both matching briefs and generator semantics', () => {
  assert.equal(snapshotIsCurrent(brief, { brief }, 2), true);
  assert.equal(snapshotIsCurrent({ ...brief, title: 'Changed' }, { brief }, 2), false);
  assert.equal(snapshotIsCurrent(brief, { brief }, 1), false);
});

test('complete project briefs reject missing fields instead of inheriting another session', () => {
  const project = broadcast(); delete project.brief.setting;
  assert.throws(() => validateProject(project), /every brief field/);
});

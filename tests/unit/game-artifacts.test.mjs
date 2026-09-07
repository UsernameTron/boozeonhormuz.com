import assert from 'node:assert/strict';
import test from 'node:test';
import { buildScoreRows, createRecap, recordDecision, completeVoyage, replayMilestones, scoreText, recapText, readSavedReport, saveReport, clearSavedReport, MAX_DECISIONS, REPORT_KEY } from '../../public/apps/exit-strategy-artifacts.js';

const counters = { wrongPicks: 2, rebrands: 8, waiversRenamed: 1, giftShops: 2, emergenciesMonetized: 4, goldStarsUsed: 1, leftDoorClicks: 3, l6Result: 'clean', startedAt: 100000 };
const choice = { level: 6, title: 'The Staircase', kind: 'pitch-accepted', label: 'THE PRESIDENTIAL ASCENSION EXPERIENCE', outcome: 'Staircase rebrand accepted. He climbs.' };
function memoryStorage() {
  const values = new Map();
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: (key) => values.delete(key) };
}

test('fixed clock preserves every original score calculation, floor, and staircase outcome', () => {
  assert.deepEqual(buildScoreRows(counters, 250000), [
    ['Biggly brand value', '97,000,000'], ['Actual distance from exit', '3 FEET'], ['Ego', 'MAXIMUM'], ['Reality', 'MUTED'], ['Lawyers remaining', '1'],
    ['Waivers renamed', '14'], ['Gift shops opened', '7'], ['Emergencies monetized', '11'], ['Rebrands accepted', '8'], ['Free exits refused', '3'], ['Gold stars spent', '1 / 3'], ['Voyage duration', '3 min'], ['Staircase incident', 'REBRANDED ON MERIT'], ['Problems solved', '0'],
  ]);
  const alternate = Object.fromEntries(buildScoreRows({ ...counters, wrongPicks: 100, giftShops: 0, l6Result: 'bailed' }, 40000));
  assert.equal(alternate['Biggly brand value'], '88,000,000');
  assert.equal(alternate['Voyage duration'], '0 min');
  assert.equal(alternate['Staircase incident'], 'RESOLVED BY FLATTERY');
});

test('completed results are immutable copies and all exports retain the same elapsed time', () => {
  const recap = createRecap(); recordDecision(recap, choice);
  const source = { ...counters };
  const report = completeVoyage(source, recap, true, 250000);
  source.wrongPicks = 500;
  recap.decisions[0].label = 'Changed later';
  assert.equal(report.counters.wrongPicks, 2);
  assert.equal(report.recap.decisions[0].label, choice.label);
  assert.throws(() => { report.rows[0][1] = 'Changed'; }, TypeError);
  assert.throws(() => { report.recap.decisions.push(choice); }, TypeError);
  assert.match(scoreText(report), /VOYAGE DURATION: 3 min/);
  assert.match(recapText(report), /VOYAGE DURATION: 3 min/);
  assert.match(JSON.stringify(report), /250000/);
});

test('recap is bounded, ordered, and explicitly discloses omissions without inventing earlier choices', () => {
  const recap = createRecap();
  for (let i = 0; i < MAX_DECISIONS + 5; i++) recordDecision(recap, { ...choice, label: `Actual pitch ${i}` });
  assert.equal(recap.decisions.length, MAX_DECISIONS);
  assert.equal(recap.omitted, 5);
  assert.equal(recap.total, MAX_DECISIONS + 5);
  assert.equal(recap.decisions[0].sequence, 6);
  assert.equal(recap.decisions[0].label, 'Actual pitch 5');
  assert.match(recapText(completeVoyage(counters, recap, false, 250000)), /5 earlier decisions omitted/);
  assert.deepEqual(createRecap(), { decisions: [], total: 0, omitted: 0 });
});

test('milestones derive from recorded choices rather than invented achievements', () => {
  const recap = createRecap();
  recordDecision(recap, choice);
  recordDecision(recap, { ...choice, kind: 'pitch-rejected', label: 'EMERGENCY STAIRS', outcome: 'Rejected.' });
  const milestones = replayMilestones(completeVoyage(counters, recap, true, 250000)).join('\n');
  assert.match(milestones, /1 accepted pitches/);
  assert.match(milestones, /1 rejected pitches/);
  assert.match(milestones, /0 Gold Stars chosen by you/);
  assert.match(milestones, /THE PRESIDENTIAL ASCENSION EXPERIENCE/);
});

test('optional save round-trips a completed report and clear touches only its own key', () => {
  const storage = memoryStorage(); storage.setItem('other-app', 'preserve');
  const recap = createRecap(); recordDecision(recap, choice);
  const report = completeVoyage(counters, recap, true, 250000);
  assert.equal(readSavedReport(storage).report, null);
  assert.equal(saveReport(storage, report).ok, true);
  assert.deepEqual(readSavedReport(storage).report, report);
  assert.equal(clearSavedReport(storage).ok, true);
  assert.equal(readSavedReport(storage).report, null);
  assert.equal(storage.getItem('other-app'), 'preserve');
});

test('malformed, oversized, inconsistent, and future-version saved reports are recoverable', () => {
  const storage = memoryStorage();
  const report = completeVoyage(counters, createRecap(), true, 250000);
  for (const raw of ['{', ' '.repeat(250001), JSON.stringify({ ...report, version: 99 }), JSON.stringify({ ...report, recap: { total: 1, omitted: 0, decisions: [] } })]) {
    storage.setItem(REPORT_KEY, raw);
    assert.equal(readSavedReport(storage).report, null);
    assert.match(readSavedReport(storage).error, /unavailable or unreadable/);
  }
  // Saved derived strings are ignored; the original score formula remains authoritative.
  storage.setItem(REPORT_KEY, JSON.stringify({ ...report, rows: [['Fake score', 'infinite']] }));
  assert.deepEqual(readSavedReport(storage).report.rows, report.rows);
});

test('blocked storage never throws or loses the in-memory report', () => {
  const storage = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('quota'); }, removeItem() { throw new Error('blocked'); } };
  const report = completeVoyage(counters, createRecap(), false, 250000);
  assert.equal(readSavedReport(storage).report, null);
  assert.equal(saveReport(storage, report).ok, false);
  assert.equal(clearSavedReport(storage).ok, false);
  assert.match(scoreText(report), /TOTAL VICTORY/);
});

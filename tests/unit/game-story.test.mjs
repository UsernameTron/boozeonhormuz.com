import test from 'node:test';
import assert from 'node:assert/strict';
import { LEVELS, ROUTE_LEVELS, orderedOptions, textFor, finaleLine, routeVerdict } from '../../public/apps/exit-strategy-story.js';
import { completeVoyage, createRecap, readSavedReport, saveReport, scoreText } from '../../public/apps/exit-strategy-artifacts.js';

const choices = Object.fromEntries(ROUTE_LEVELS.map(id => [id, 'revenue']));
const counters = { wrongPicks: 0, rebrands: 9, waiversRenamed: 1, giftShops: 2, emergenciesMonetized: 10, feesAttempted: 8, goldStarsUsed: 1, leftDoorClicks: 2, l6Result: 'clean', startedAt: 100000, pausedMs: 60000 };

test('all 256 strategies retain an advancing choice in every decision and produce a coherent finale', () => {
  for (let bits = 0; bits < 256; bits++) {
    const route = Object.fromEntries(ROUTE_LEVELS.map((id, index) => [id, bits & (1 << index) ? 'status' : 'revenue']));
    for (const level of LEVELS) {
      for (const step of level.script) {
        if (step.t === 'choice') {
          const advancing = step.options.filter(option => option.kind === 'advance');
          assert.deepEqual(new Set(advancing.map(option => option.route)), new Set(['revenue', 'status']));
          assert.ok(advancing.some(option => option.route === route[step.id]));
        }
        if (step.t === 'beat') assert.equal(typeof textFor(step.text, route), 'string');
      }
    }
    assert.ok(routeVerdict(route).length > 10);
    assert.match(finaleLine(route), route.l5 === 'status' ? /only one with a bill/ : /memorial surcharge/);
  }
  assert.ok(LEVELS[1].script.some(step => step.t === 'choice'), 'Level 2 must have a decision');
});

test('ordering is stable for a voyage, varies by seed, and never mutates option identity', () => {
  const options = LEVELS[0].script.find(step => step.t === 'choice').options;
  const before = JSON.stringify(options);
  assert.deepEqual(orderedOptions(options, 314), orderedOptions(options, 314));
  const orders = new Set(Array.from({ length: 50 }, (_, seed) => orderedOptions(options, seed + 1).map(option => option.id).join('')));
  assert.ok(orders.size >= 12);
  for (let seed = 1; seed < 25; seed++) assert.deepEqual(orderedOptions(options, seed).map(option => option.id).sort(), ['0', '1', '2', '3']);
  assert.equal(JSON.stringify(options), before);
});

test('v2 report separates claims from actual counts, excludes pause time, and freezes route choices', () => {
  const source = { ...choices };
  const report = completeVoyage(counters, createRecap(), 'Mixed', 280000, source);
  source.l5 = 'status';
  assert.equal(report.version, 2);
  assert.equal(report.choices.l5, 'revenue');
  const actual = Object.fromEntries(report.rows);
  assert.equal(actual['Voyage duration'], '2 min');
  assert.equal(actual['Gift shops opened'], '2');
  assert.equal(actual['Lawyers still aboard'], '0');
  assert.equal(actual['Memorial charge assigned to'], 'PASSENGERS');
  assert.equal(actual['Extra charges attempted'], '8');
  assert.match(report.claims[2][1], /disputed/);
  assert.match(scoreText(report), /CREW RECORD:/);
  assert.throws(() => { report.choices.l5 = 'status'; }, TypeError);
  const patron = completeVoyage(counters, createRecap(), true, 280000, { ...choices, l5: 'status' });
  assert.match(patron.claims[2][1], /Don’s own tab/);
});

test('v2 saved reports round-trip; derived claims are recomputed and invalid routes are rejected', () => {
  let raw = null;
  const storage = { setItem(key, value) { raw = value; }, getItem() { return raw; } };
  const report = completeVoyage(counters, createRecap(), true, 280000, choices);
  assert.equal(saveReport(storage, report).ok, true);
  assert.deepEqual(readSavedReport(storage).report, report);
  raw = JSON.stringify({ ...report, verdict: 'Tampered', claims: [['False', 'False']], rows: [['Infinite', '0']] });
  assert.deepEqual(readSavedReport(storage).report, report);
  for (const bad of [
    { ...report, choices: { ...choices, l5: 'unknown' } },
    { ...report, choices: {} },
    { ...report, counters: { ...counters, pausedMs: 999999999 } },
    { ...report, counters: { ...counters, feesAttempted: -1 } },
  ]) {
    raw = JSON.stringify(bad);
    assert.equal(readSavedReport(storage).report, null);
  }
});

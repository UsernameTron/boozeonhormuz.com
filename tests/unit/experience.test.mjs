import test from 'node:test';
import assert from 'node:assert/strict';
import { QUESTIONS, TIERS, AMENITIES, QUOTES, TESTIMONIALS, CONCIERGE, financeDialogue, FICTION_LABEL } from '../../public/apps/experience-story.js';
import { createState, normalizeState, routeFor, chooseAnswer, chooseTier, calculateFinance, buildRecord, recordText, FEES } from '../../public/apps/experience-model.js';

test('all 243 complete presentations resolve by the recorded choices, with deterministic ties', () => {
  assert.equal(QUESTIONS.length, 5);
  for (let routeCode = 0; routeCode < 243; routeCode++) {
    let state = createState(); let code = routeCode;
    const routes = [];
    for (const question of QUESTIONS) {
      assert.deepEqual(question.options.map(option => option.route).sort(), ['legacy', 'scrutiny', 'status']);
      const option = question.options[code % 3]; code = Math.floor(code / 3);
      routes.push(option.route); state = chooseAnswer(state, question.id, option.id);
    }
    const counts = Object.fromEntries(['status', 'legacy', 'scrutiny'].map(route => [route, routes.filter(value => value === route).length]));
    const maximum = Math.max(...Object.values(counts));
    const expected = routes.reverse().find(route => counts[route] === maximum);
    assert.equal(routeFor(state), expected);
    const record = buildRecord(state);
    assert.equal(record.answers.length, 5);
    assert.equal(record.finance.dispute, 0, 'Questioning the offer never requests a refund.');
    assert.ok(record.ending.don && record.ending.note);
  }
});

test('skipped qualification and unselected defaults remain honest in the ownership record', () => {
  const record = buildRecord(createState());
  assert.equal(record.route, 'discovery');
  assert.equal(record.answers.length, 0);
  assert.equal(record.amenity, undefined);
  assert.match(record.rows[0][1], /preview preset/);
  const exported = recordText({ ...createState(), quizSkipped: true });
  assert.match(exported, /No answers assumed/);
  assert.match(exported, /None selected/);
  assert.ok(exported.includes(FICTION_LABEL));
  assert.match(exported, /selected 99-year term pass to next of kin/);
  assert.match(recordText({ ...createState(), term: 10 }), /selected 10-year term pass to next of kin/);
});

test('tier changes apply their real presets, preserve answers and clear an old refund request', () => {
  const question = QUESTIONS[0];
  let state = chooseAnswer(createState(), question.id, question.options[0].id);
  state = { ...state, recordOpen: true, refundRequested: true, amenityId: AMENITIES[0].id };
  for (const tier of TIERS) {
    const next = chooseTier(state, tier.id);
    assert.deepEqual([next.principal, next.apr, next.term], [tier.principal, tier.apr, tier.term]);
    assert.deepEqual(next.answers, state.answers);
    assert.equal(next.amenityId, state.amenityId);
    assert.equal(next.refundRequested, false);
    assert.equal(buildRecord(next).tier.id, tier.id);
    assert.equal(calculateFinance(next).membershipMonthly, tier.membershipMonthly);
  }
});

test('the fictional total reconciles rounded installments, separate membership, and disclosed fees', () => {
  const state = createState();
  const finance = calculateFinance(state);
  assert.equal(finance.loanMonthly, 2990);
  assert.equal(finance.loanTotal, 3552120);
  assert.equal(finance.membershipTotal, 1780812);
  assert.equal(finance.upfront, 374);
  assert.equal(finance.total, 5333306);
  assert.equal(calculateFinance({ ...state, refundRequested: true }).dispute, 0, 'A closed record cannot contain a refund request.');
  const requested = calculateFinance({ ...state, recordOpen: true, refundRequested: true });
  assert.equal(requested.total - finance.total, FEES.dispute);
  assert.equal(requested.dispute, 250);
  for (const principal of [20000, 780000]) for (const apr of [9.9, 49.9]) for (const term of [10, 99]) {
    const value = calculateFinance({ ...state, principal, apr, term });
    assert.ok(Number.isFinite(value.total) && value.total > principal);
    assert.ok(Math.abs(value.total - (value.loanMonthly + value.membershipMonthly) * term * 12 - value.upfront) < .01);
  }
});

test('changed answers replace the record and clear an old dispute without inventing choices', () => {
  const question = QUESTIONS[0];
  let state = chooseAnswer(createState(), question.id, question.options[0].id);
  state = { ...state, recordOpen: true, refundRequested: true };
  state = chooseAnswer(state, question.id, question.options[2].id);
  const record = buildRecord(state);
  assert.equal(record.answers.length, 1);
  assert.equal(record.answers[0].option.id, question.options[2].id);
  assert.equal(record.finance.dispute, 0);
  assert.equal(chooseAnswer(state, 'invented', 'invented'), state);
});

test('invalid saved state cannot inject content, invalid selections, hidden fees or runaway totals', () => {
  const invalid = normalizeState({ version: 1, tierId: '<img>', answers: { invented: '<script>' }, principal: Infinity, apr: -500, term: 9999, questionIndex: 5, amenityId: 'unknown', refundRequested: true, recordOpen: false });
  assert.deepEqual(invalid.answers, {});
  assert.equal(invalid.questionIndex, 0);
  assert.equal(invalid.apr, 9.9);
  assert.equal(invalid.term, 99);
  assert.equal(invalid.refundRequested, false);
  assert.equal(invalid.amenityId, null);
  assert.doesNotMatch(recordText(invalid), /<script>|<img>/);
  assert.deepEqual(normalizeState({ version: 99 }), createState());
});

test('the full content inventory is present and term-specific speech does not retain the 99-year anecdote', () => {
  assert.equal(TIERS.length, 3); assert.equal(AMENITIES.length, 8);
  assert.equal(QUOTES.length, 8); assert.equal(TESTIMONIALS.length, 4);
  assert.equal(CONCIERGE.length, 3);
  assert.match(financeDialogue(99).don, /ninety-nine|99/i);
  for (const term of [10, 40, 98]) {
    assert.doesNotMatch(financeDialogue(term).don, /ninety-nine|99|I'm seventy/i);
    assert.ok(financeDialogue(term).don.includes(String(term)));
  }
  for (const question of QUESTIONS) for (const option of question.options) {
    assert.ok(option.don && option.note && option.record, `${question.id}/${option.id} has a reaction and a record.`);
  }
});

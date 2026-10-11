import { QUESTIONS, TIERS, AMENITIES, ENDINGS, DEFAULT_ENDING, REFUND, FICTION_LABEL } from './experience-story.js';

export const STORAGE_KEY = 'boh.experience.v1';
export const FEES = Object.freeze({ preview: 249, folder: 125, dispute: 250 });
const money = value => Math.round((value + Number.EPSILON) * 100) / 100;
export const dollars = value => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2, minimumFractionDigits: 2 }).format(value);
const bounded = (value, low, high, step, fallback) => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.round((low + Math.round((Math.min(high, Math.max(low, value)) - low) / step) * step) * 10) / 10;
};

export function createState() {
  const tier = TIERS.find(item => item.id === 'gold');
  return { version: 1, answers: {}, questionIndex: 0, quizSkipped: false, tierId: tier.id, tierChosen: false, amenityId: null, principal: tier.principal, apr: tier.apr, term: tier.term, recordOpen: false, refundRequested: false };
}

export function normalizeState(raw) {
  const state = createState();
  if (!raw || typeof raw !== 'object' || raw.version !== 1) return state;
  if (TIERS.some(item => item.id === raw.tierId)) state.tierId = raw.tierId;
  state.tierChosen = raw.tierChosen === true;
  const preset = TIERS.find(item => item.id === state.tierId);
  state.principal = bounded(raw.principal, 20000, 780000, 5000, preset.principal);
  state.apr = bounded(raw.apr, 9.9, 49.9, .5, preset.apr);
  state.term = bounded(raw.term, 10, 99, 1, preset.term);
  state.amenityId = AMENITIES.some(item => item.id === raw.amenityId) ? raw.amenityId : null;
  for (const question of QUESTIONS) {
    const answer = raw.answers?.[question.id];
    if (question.options.some(option => option.id === answer)) state.answers[question.id] = answer;
  }
  const firstUnanswered = QUESTIONS.findIndex(question => !state.answers[question.id]);
  const available = firstUnanswered < 0 ? QUESTIONS.length : firstUnanswered;
  state.questionIndex = Math.min(available, bounded(raw.questionIndex, 0, QUESTIONS.length, 1, 0));
  state.quizSkipped = raw.quizSkipped === true;
  state.recordOpen = raw.recordOpen === true;
  state.refundRequested = state.recordOpen && raw.refundRequested === true;
  return state;
}

export function selectedAnswers(state) {
  return QUESTIONS.flatMap(question => {
    const option = question.options.find(item => item.id === state.answers[question.id]);
    return option ? [{ question, option }] : [];
  });
}

export function routeFor(state) {
  const choices = selectedAnswers(state);
  if (!choices.length) return 'discovery';
  const counts = { status: 0, legacy: 0, scrutiny: 0 };
  choices.forEach(({ option }) => counts[option.route]++);
  const max = Math.max(...Object.values(counts));
  return [...choices].reverse().find(({ option }) => counts[option.route] === max).option.route;
}

export function chooseAnswer(state, questionId, answerId) {
  const question = QUESTIONS.find(item => item.id === questionId);
  if (!question?.options.some(item => item.id === answerId)) return state;
  return { ...state, quizSkipped: false, refundRequested: false, answers: { ...state.answers, [questionId]: answerId } };
}

export function chooseTier(state, id) {
  const tier = TIERS.find(item => item.id === id);
  if (!tier) return state;
  return { ...state, tierId: id, tierChosen: true, principal: tier.principal, apr: tier.apr, term: tier.term, refundRequested: false };
}

export function calculateFinance(state) {
  const safe = normalizeState(state);
  const tier = TIERS.find(item => item.id === safe.tierId);
  const months = safe.term * 12;
  const rate = safe.apr / 1200;
  const loanMonthly = money(safe.principal * rate / (1 - (1 + rate) ** -months));
  const loanTotal = money(loanMonthly * months);
  const membershipTotal = money(tier.membershipMonthly * months);
  const upfront = FEES.preview + FEES.folder;
  const dispute = safe.refundRequested ? FEES.dispute : 0;
  return { months, loanMonthly, loanTotal, membershipMonthly: tier.membershipMonthly, membershipTotal, upfront, dispute, total: money(loanTotal + membershipTotal + upfront + dispute) };
}

export function buildRecord(state) {
  const safe = normalizeState(state);
  const tier = TIERS.find(item => item.id === safe.tierId);
  const amenity = AMENITIES.find(item => item.id === safe.amenityId);
  const route = routeFor(safe);
  const ending = route === 'discovery' ? DEFAULT_ENDING : ENDINGS[route];
  const finance = calculateFinance(safe);
  const answers = selectedAnswers(safe);
  const rows = [
    ['Package', `${tier.name}${safe.tierChosen ? ' — selected' : ' — preview preset'}`],
    ['Amenity', amenity?.name ?? 'None selected'],
    ['Financed amount', dollars(safe.principal)],
    ['APR / term', `${safe.apr.toFixed(1)}% / ${safe.term} years`],
    ['Monthly loan payment', dollars(finance.loanMonthly)],
    ['Monthly membership fee', dollars(finance.membershipMonthly)],
    ['Loan payments over the term', dollars(finance.loanTotal)],
    ['Membership fees over the term', dollars(finance.membershipTotal)],
    ['Preview + folder fees', `${dollars(FEES.preview)} + ${dollars(FEES.folder)}`],
    ['Dispute fee', safe.refundRequested ? `${dollars(FEES.dispute)} — fictional refund requested` : '$0.00 — no refund requested'],
    ['Fictional family provision', `Any remaining payments within the selected ${safe.term}-year term pass to next of kin. No property transfers.`],
    ['Ownership acquired', '0%. No deed supplied.'],
  ];
  return { state: safe, route, ending, tier, amenity, finance, answers, rows, fictionLabel: FICTION_LABEL };
}

export function recordText(state) {
  const record = buildRecord(state);
  return [
    'BOOZE ON HORMUZ — OWNERSHIP RECORD',
    'A fictional souvenir. No purchase, payment or contract.',
    FICTION_LABEL, '',
    record.ending.title, '',
    'DON PROMISED', record.tier.promise,
    ...(record.amenity ? [record.amenity.promise] : []), '',
    'THE PAPERWORK SAYS', ...record.rows.map(([label, value]) => `${label}: ${value}`), '',
    'YOUR FICTIONAL TOTAL', dollars(record.finance.total),
    'Includes rounded loan payments, fixed membership fees for the selected term, and the fees listed above.', '',
    'YOUR SELECTIONS',
    ...(record.answers.length ? record.answers.map(({ question, option }) => `${question.title}\nYour answer: ${option.label}\nRecord: ${option.record}`) : ['Qualification skipped or not started. No answers assumed.']), '',
    `DON: ${record.ending.don}`,
    `ACCOUNTANT: ${record.ending.note}`,
    ...(record.state.refundRequested ? ['', 'FICTIONAL REFUND REQUEST', `DON: ${REFUND.don}`, `ACCOUNTANT: ${REFUND.note}`] : []), '',
    'The holiday ends. The payments don’t.',
    'boozeonhormuz.com/experience/',
  ].join('\n');
}

import { INTRO, QUESTIONS, TIERS, AMENITIES, QUOTES, TESTIMONIALS, CONCIERGE, REFUND, financeDialogue, FICTION_LABEL } from './experience-story.js';
import { STORAGE_KEY, createState, normalizeState, selectedAnswers, chooseAnswer, chooseTier, calculateFinance, buildRecord, recordText, dollars } from './experience-model.js';

const $ = id => document.getElementById(id);
const node = (tag, text, className) => {
  const element = document.createElement(tag);
  if (text !== undefined) element.textContent = text;
  if (className) element.className = className;
  return element;
};
const text = (id, value) => { $(id).textContent = value; };
const focus = element => { element.tabIndex = -1; element.focus({ preventScroll: true }); };
const visit = id => {
  const element = $(id);
  element.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
  focus(element.querySelector('h2,h3') ?? element);
};

let state = createState();
let storageAvailable = true;
try {
  const stored = sessionStorage.getItem(STORAGE_KEY);
  if (stored) state = normalizeState(JSON.parse(stored));
} catch {
  storageAvailable = false;
}
let inspectedAmenity = state.amenityId ?? AMENITIES[0].id;
let quoteIndex = 0;

function persist() {
  try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  catch { storageAvailable = false; }
}

function stateChanged() {
  persist();
  render();
}

function buildStaticContent() {
  text('intro-don', INTRO.don);
  $('tiers').replaceChildren(...TIERS.map(tier => {
    const article = node('article', undefined, 'tier');
    article.dataset.tier = tier.id;
    article.append(node('p', tier.id === 'gold' ? 'Don’s preferred folder' : 'Membership', 'eyebrow'));
    article.append(node('h3', tier.name));
    article.append(node('p', tier.tagline, 'tier-tagline'));
    const price = node('p', undefined, 'tier-price');
    price.append(node('strong', dollars(tier.membershipMonthly)), node('span', ' / month membership'));
    article.append(price, node('p', `Plus financing from ${dollars(tier.principal)}. Fictional offer.`, 'tier-fine'));
    const list = node('ul');
    list.append(...tier.features.map(feature => node('li', feature)));
    article.append(list);
    const button = node('button', `Choose ${tier.name}`, 'tier-select button button-outline');
    button.type = 'button'; button.dataset.tierId = tier.id;
    article.append(button);
    return article;
  }));
  const makeAmenityButton = (amenity, index, isMap) => {
    const button = node('button', undefined, isMap ? 'map-pin' : 'amenity-option');
    button.type = 'button'; button.dataset.amenityId = amenity.id;
    button.setAttribute('aria-controls', 'amenity-detail');
    button.setAttribute('aria-label', `View ${amenity.name}`);
    button.style.setProperty('--x', amenity.x + '%');
    button.style.setProperty('--y', amenity.y + '%');
    button.append(node('span', String(index + 1).padStart(2, '0'), 'pin-number'));
    if (!isMap) button.append(node('span', amenity.name, 'pin-label'));
    return button;
  };
  $('amenity-map').querySelectorAll('[data-amenity-id]').forEach(button => button.remove());
  $('amenity-map').append(...AMENITIES.map((amenity, index) => makeAmenityButton(amenity, index, true)));
  $('amenity-list').replaceChildren(...AMENITIES.map((amenity, index) => makeAmenityButton(amenity, index, false)));
  $('testimonials').replaceChildren(...TESTIMONIALS.map(item => {
    const card = node('figure', undefined, 'testimonial');
    card.append(node('blockquote', item.quote), node('figcaption', item.credit), node('p', item.note, 'paper-note'));
    return card;
  }));
  $('concierge').replaceChildren(...CONCIERGE.map(item => {
    const details = node('details', undefined, 'concierge-item');
    details.append(node('summary', item.question));
    const reply = node('p'); reply.append(node('strong', 'Don: '), document.createTextNode(item.don));
    details.append(reply, node('p', `Reception: ${item.note}`, 'paper-note'));
    return details;
  }));
}

function renderHistory(container, answers) {
  container.replaceChildren(...answers.map(({ question, option }, index) => {
    const article = node('article', undefined, 'record-answer');
    article.append(node('h4', `${index + 1}. ${question.title}`));
    const choice = node('p'); choice.append(node('strong', 'You chose: '), document.createTextNode(option.label));
    const don = node('p'); don.append(node('strong', 'Don: '), document.createTextNode(option.don));
    article.append(choice, don, node('p', `Accountant: ${option.note}`, 'paper-note'));
    return article;
  }));
  if (!answers.length) container.append(node('p', 'No qualification answers recorded. You can browse without answering.'));
}

function renderQuiz() {
  const complete = state.questionIndex >= QUESTIONS.length;
  const done = complete || state.quizSkipped;
  const question = QUESTIONS[state.questionIndex];
  const selected = question?.options.find(option => option.id === state.answers[question.id]);
  text('quiz-progress', done ? `${selectedAnswers(state).length} of 5 answers recorded` : `Question ${state.questionIndex + 1} of 5`);
  text('quiz-title', done ? (state.quizSkipped ? 'Browse on your own terms.' : 'Your briefing is ready.') : question.title);
  $('quiz-options').hidden = done;
  $('quiz-response').hidden = done || !selected;
  $('quiz-back').disabled = !done && state.questionIndex === 0;
  $('quiz-next').disabled = !done && !selected;
  text('quiz-next', done ? 'Choose a package' : state.questionIndex === QUESTIONS.length - 1 ? 'Finish qualification' : 'Continue');
  $('quiz-skip').hidden = done;
  $('quiz-options').replaceChildren(...(done ? [] : question.options.map(option => {
    const button = node('button', option.label, 'choice');
    button.type = 'button'; button.dataset.answerId = option.id;
    button.setAttribute('aria-pressed', String(option.id === selected?.id));
    button.classList.toggle('is-selected', option.id === selected?.id);
    return button;
  })));
  if (selected && !done) {
    text('quiz-don', selected.don);
    text('quiz-note-copy', selected.note);
  }
  text('quiz-status', !storageAvailable ? 'Your selections work for this visit. This browser could not save them for a reload.' : done ? 'Nothing signed. Nothing purchased. Your choices only shape this fictional presentation.' : selected ? 'Answer recorded. Read the note or continue when you’re ready.' : 'Choose an answer. No personal information is requested.');
  renderHistory($('quiz-history-list'), selectedAnswers(state));
}

function renderTiers() {
  document.querySelectorAll('[data-tier-id]').forEach(button => {
    const selected = state.tierChosen && button.dataset.tierId === state.tierId;
    button.setAttribute('aria-pressed', String(selected));
    button.closest('.tier').classList.toggle('is-selected', selected);
    const tier = TIERS.find(item => item.id === button.dataset.tierId);
    button.textContent = selected ? `${tier.name} selected` : `Choose ${tier.name}`;
  });
  const tier = TIERS.find(item => item.id === state.tierId);
  $('tier-reaction').hidden = !state.tierChosen;
  text('tier-don', tier.don); text('tier-note', tier.note);
}

function renderAmenities() {
  const amenity = AMENITIES.find(item => item.id === inspectedAmenity);
  document.querySelectorAll('[data-amenity-id]').forEach(button => {
    const selected = button.dataset.amenityId === inspectedAmenity;
    button.setAttribute('aria-pressed', String(selected));
    button.classList.toggle('is-selected', selected);
  });
  text('amenity-title', amenity.name);
  text('amenity-don', amenity.don);
  text('amenity-note', amenity.note);
  text('amenity-select', state.amenityId === amenity.id ? 'Included in your fictional package' : 'Choose this amenity');
  $('amenity-select').setAttribute('aria-pressed', String(state.amenityId === amenity.id));
  text('amenity-selected', state.amenityId ? `Your selection: ${AMENITIES.find(item => item.id === state.amenityId).name}` : 'No amenity selected. Inspect the property, then choose one if you like.');
}

function renderFinance() {
  const finance = calculateFinance(state);
  $('stake').value = String(state.principal); $('apr').value = String(state.apr); $('term').value = String(state.term);
  text('stake-value', dollars(state.principal)); text('apr-value', state.apr.toFixed(1) + '%'); text('term-value', state.term + ' years');
  $('stake').setAttribute('aria-valuetext', dollars(state.principal));
  $('apr').setAttribute('aria-valuetext', state.apr.toFixed(1) + ' percent');
  $('term').setAttribute('aria-valuetext', state.term + ' years');
  text('finance-monthly', dollars(finance.loanMonthly));
  text('finance-membership', dollars(finance.membershipMonthly));
  text('finance-total', dollars(finance.total));
  text('finance-fees', `${dollars(finance.upfront)} upfront${finance.dispute ? ` + ${dollars(finance.dispute)} fictional dispute fee` : ''}`);
  const dialogue = financeDialogue(state.term);
  text('finance-don', dialogue.don); text('finance-note', dialogue.note);
}

function renderRecord() {
  $('ownership-record').hidden = !state.recordOpen;
  if (!state.recordOpen) return;
  const record = buildRecord(state);
  text('record-route', record.ending.title);
  text('record-promise', [record.tier.promise, record.amenity?.promise].filter(Boolean).join(' '));
  $('record-facts').replaceChildren(...record.rows.flatMap(([label, value]) => {
    const row = node('div', undefined, 'receipt-row');
    row.append(node('dt', label), node('dd', value)); return [row];
  }));
  text('record-total', dollars(record.finance.total));
  text('record-don', record.ending.don); text('record-note', record.ending.note);
  $('record-selections').replaceChildren(...(record.answers.length ? record.answers.map(({ option }) => node('li', option.record)) : [node('li', 'Qualification skipped or not started. No answers assumed.')]));
  renderHistory($('record-history-list'), record.answers);
  $('refund-response').hidden = !state.refundRequested;
  $('record-refund').disabled = state.refundRequested;
  text('record-refund', state.refundRequested ? 'Fictional refund requested' : 'Request a fictional refund');
  text('refund-don', REFUND.don); text('refund-note', REFUND.note);
  if (!$('export-fallback').hidden) $('export-fallback').value = recordText(state);
}

function renderQuote() {
  text('quote-text', QUOTES[quoteIndex]);
  text('quote-index', `${quoteIndex + 1} / ${QUOTES.length}`);
}

function render() { renderQuiz(); renderTiers(); renderAmenities(); renderFinance(); renderRecord(); }

function showCopyFallback(value, message) {
  $('export-fallback').hidden = false;
  $('export-fallback').value = value;
  text('export-status', message);
  $('export-fallback').focus(); $('export-fallback').select();
}

async function copy(value, statusId, fallback) {
  try {
    await navigator.clipboard.writeText(value);
    text(statusId, 'Copied.');
  } catch {
    if (fallback) showCopyFallback(value, 'Copy was unavailable. Your text is selected below; copy it manually.');
    else text(statusId, 'Copy is unavailable in this browser. You can select the displayed quote and copy it.');
  }
}

function wrapLines(context, source, width) {
  return source.split('\n').flatMap(paragraph => {
    if (!paragraph) return [''];
    const lines = []; let current = '';
    for (const word of paragraph.split(/\s+/)) {
      const candidate = current ? `${current} ${word}` : word;
      if (current && context.measureText(candidate).width > width) { lines.push(current); current = word; }
      else current = candidate;
    }
    lines.push(current); return lines;
  });
}

async function downloadRecord() {
  const source = recordText(state);
  text('export-status', 'Preparing your fictional ownership record…');
  try {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas unavailable');
    context.font = '24px sans-serif';
    const lines = wrapLines(context, source, 1032);
    canvas.width = 1200; canvas.height = 170 + lines.length * 34;
    context.fillStyle = '#f3ecdc'; context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = '#9b7725'; context.lineWidth = 3; context.strokeRect(35, 35, 1130, canvas.height - 70);
    context.fillStyle = '#172137'; context.font = '24px sans-serif'; context.textBaseline = 'top';
    lines.forEach((line, index) => context.fillText(line, 84, 80 + index * 34));
    const blob = await new Promise((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error('Image unavailable')), 'image/png'));
    const url = URL.createObjectURL(blob);
    const link = node('a'); link.href = url; link.download = 'booze-on-hormuz-ownership-record.png';
    document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
    text('export-status', 'Your PNG is ready. If the browser blocked the download, use Copy record.');
  } catch { showCopyFallback(source, 'The image could not be created. Your complete text record is available below.'); }
}

buildStaticContent();
document.querySelectorAll('[data-requires-js]').forEach(control => { control.disabled = false; });
document.documentElement.classList.add('experience-ready');
render(); renderQuote();

$('quiz-options').addEventListener('click', event => {
  const button = event.target.closest('[data-answer-id]'); if (!button) return;
  const question = QUESTIONS[state.questionIndex];
  state = chooseAnswer(state, question.id, button.dataset.answerId);
  $('quiz-note').open = false;
  stateChanged();
  const selected = [...$('quiz-options').querySelectorAll('button')].find(item => item.dataset.answerId === button.dataset.answerId);
  selected?.focus({ preventScroll: true });
});
$('quiz-next').addEventListener('click', () => {
  if (state.quizSkipped || state.questionIndex >= QUESTIONS.length) { visit('offer'); return; }
  if (!state.answers[QUESTIONS[state.questionIndex].id]) return;
  state = { ...state, questionIndex: state.questionIndex + 1 };
  $('quiz-note').open = false; stateChanged(); visit('quiz-title');
});
$('quiz-back').addEventListener('click', () => {
  state = { ...state, quizSkipped: false, questionIndex: Math.max(0, Math.min(4, state.questionIndex - (state.quizSkipped ? 0 : 1))) };
  $('quiz-note').open = false; stateChanged(); visit('quiz-title');
});
$('quiz-skip').addEventListener('click', () => {
  state = { ...state, quizSkipped: true }; stateChanged(); visit('offer');
});
$('quiz-restart').addEventListener('click', () => { $('restart-dialog').showModal(); $('restart-cancel').focus(); });
$('restart-cancel').addEventListener('click', event => { event.preventDefault(); $('restart-dialog').close(); $('quiz-restart').focus(); });
$('restart-dialog').addEventListener('cancel', () => { $('quiz-restart').focus(); });
$('restart-confirm').addEventListener('click', event => {
  event.preventDefault();
  state = createState(); inspectedAmenity = AMENITIES[0].id;
  $('restart-dialog').close(); $('quiz-note').open = false;
  $('export-fallback').hidden = true; text('export-status', '');
  stateChanged(); visit('qualify');
});
$('tiers').addEventListener('click', event => {
  const button = event.target.closest('[data-tier-id]'); if (!button) return;
  state = chooseTier(state, button.dataset.tierId); stateChanged(); visit('tier-reaction');
});
for (const id of ['amenity-map', 'amenity-list']) $(id).addEventListener('click', event => {
  const button = event.target.closest('[data-amenity-id]'); if (!button) return;
  inspectedAmenity = button.dataset.amenityId; renderAmenities();
  if (matchMedia('(max-width: 700px)').matches) visit('amenity-detail');
});
$('amenity-select').addEventListener('click', () => {
  state = { ...state, amenityId: inspectedAmenity, refundRequested: false }; stateChanged();
});
for (const [id, property] of [['stake', 'principal'], ['apr', 'apr'], ['term', 'term']]) $(id).addEventListener('input', () => {
  state = normalizeState({ ...state, [property]: Number($(id).value), refundRequested: false });
  stateChanged();
});
$('build-record').addEventListener('click', () => {
  state = { ...state, recordOpen: true }; stateChanged(); visit('ownership-record');
});
$('record-refund').addEventListener('click', () => {
  if (!state.recordOpen || state.refundRequested) return;
  state = { ...state, refundRequested: true }; stateChanged(); focus($('refund-response'));
});
$('record-copy').addEventListener('click', () => copy(recordText(state), 'export-status', true));
$('record-download').addEventListener('click', downloadRecord);
$('quote-prev').addEventListener('click', () => { quoteIndex = (quoteIndex + QUOTES.length - 1) % QUOTES.length; renderQuote(); text('quote-status', ''); });
$('quote-next').addEventListener('click', () => { quoteIndex = (quoteIndex + 1) % QUOTES.length; renderQuote(); text('quote-status', ''); });
$('quote-copy').addEventListener('click', () => copy(`${FICTION_LABEL}\n\nDon Biggly: ${QUOTES[quoteIndex]}\nboozeonhormuz.com/experience/`, 'quote-status', false));
$('premiere-play').addEventListener('click', () => {
  const iframe = node('iframe');
  iframe.src = 'https://www.youtube-nocookie.com/embed/Za2XII66eHQ?autoplay=1';
  iframe.title = 'Who the Hell Is Don Biggly? — fictional satire';
  iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
  iframe.referrerPolicy = 'strict-origin-when-cross-origin'; iframe.allowFullscreen = true;
  $('premiere-play').replaceWith(iframe); iframe.focus();
});
const menu = $('mobile-menu');
menu.addEventListener('click', event => { if (event.target.closest('a')) menu.open = false; });
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu.open) { menu.open = false; menu.querySelector('summary').focus(); }
});

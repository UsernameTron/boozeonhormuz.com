import { createRecap, recordDecision, completeVoyage, replayMilestones, scoreText, recapText,
  readSavedReport, saveReport, clearSavedReport, renderScorecard } from './exit-strategy-artifacts.js';
/* ============================================================
   DON BIGGLY'S TREMENDOUS EXIT STRATEGY
   Browser-only. No backend or network calls. Completed-report storage is opt-in.
   ============================================================ */
'use strict';

const $ = (id) => document.getElementById(id);

import { CFG, LEVELS, L6_BANKS, orderedOptions, textFor, finaleLine } from './exit-strategy-story.js';

const LOCK_LINE = 'The facts have become hostile. I want a second ocean.';
const SULK_LINES = ['I don’t respond to instructions without a title.', 'Tell me why this was my idea.'];
const LEFT_REJECTIONS = ['Free? Then why would anyone respect me for using it?', 'No receipt. No proof of leadership.', 'I don’t leave. I become unavailable at a higher rate.'];
const STAR_TOAST = 'Gold Star accepted. The facts have been downgraded.';
const L6_REJECTIONS = [{ max: -1, line: 'That sounds like a public service.' }, { max: 9, line: 'I’ve stayed in better words.' }, { max: 17, line: 'Nearly. It still sounds useful.' }];

/* ---------- State ---------- */
function freshState() {
  return {
    phase: 'title', level: 0, step: 0,
    ego: CFG.egoStart, reality: CFG.realityStart, goldStars: CFG.stars,
    struck: {}, flatterUse: {}, choices: {}, orders: {}, seed: crypto.getRandomValues(new Uint32Array(1))[0],
    counters: { wrongPicks: 0, rebrands: 0, waiversRenamed: 0, giftShops: 0,
                emergenciesMonetized: 0, goldStarsUsed: 0, leftDoorClicks: 0,
                feesAttempted: 0, pausedMs: 0, l6Result: null, startedAt: 0 },
    calmSeas: false, modeChanged: false,
    egoBand: 'mid', realityBand: 'mid',
    l6: null, pendingUnlock: null, paused: false, pausedAt: 0,
    recap: createRecap(), completed: null
  };
}
let state = freshState();
let savedReport = null;
let savedReportError = null;

function remember(kind, label, outcome) {
  if (state.completed) return;
  const level = LEVELS[state.level];
  recordDecision(state.recap, { level: level.id, title: level.title, kind, label, outcome });
}

/* ---------- DOM helpers ---------- */
let lineIndex = 0;
function addLine(who, text) {
  const el = document.createElement('div');
  el.className = 'line ' + who;
  el.style.setProperty('--i', String(Math.min(lineIndex++, 4)));
  const label = { narrator: 'Narrator', biggly: 'Don Biggly', crew: 'Crew', gag: 'Meanwhile', alarm: 'Alert' }[who] || who;
  const whoEl = document.createElement('span');
  whoEl.className = 'who';
  whoEl.textContent = label;
  const textEl = document.createElement('span');
  textEl.textContent = textFor(text, state.choices);
  el.append(whoEl, textEl);
  $('transcript').appendChild(el);
  return el;
}
function archiveBeat() {
  const lines = [...$('transcript').children];
  if (!lines.length) return;
  const group = document.createElement('div');
  const heading = document.createElement('p');
  heading.className = 'history-heading';
  heading.textContent = 'Level ' + LEVELS[state.level].id + ' · ' + LEVELS[state.level].title;
  group.append(heading, ...lines);
  $('historyRows').appendChild(group);
  // Keep the reading history bounded, just like the exported decision recap.
  while ($('historyRows').children.length > 120) $('historyRows').firstElementChild.remove();
  $('historyPanel').hidden = false;
  $('historyPanel').open = false;
  lineIndex = 0;
}
function focusBeat(fallback) {
  const target = $('transcript').firstElementChild || fallback;
  if (!target) return;
  if (!target.matches('button, input, a, [tabindex]')) target.tabIndex = -1;
  target.focus({ preventScroll: true });
  target.scrollIntoView({ block: 'start', behavior: 'instant' });
}
function clearInteraction() { $('interaction').replaceChildren(); $('controls').replaceChildren(); }
function nextButton(label, fn) {
  const b = document.createElement('button');
  b.type = 'button'; b.className = 'ghost'; b.textContent = label || 'Next ▸';
  b.addEventListener('click', fn);
  $('controls').replaceChildren(b);
  focusBeat(b);
  return b;
}
function announce(msg) { $('announcer').textContent = ''; requestAnimationFrame(() => { $('announcer').textContent = msg; }); }
let toastTimer = null;
function toast(msg) {
  const t = $('toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
}
function prefersReduced() { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; }
function showScreen(id, headingId) {
  ['screen-title', 'screen-level', 'screen-score'].forEach((s) => { $(s).hidden = (s !== id); });
  $('hud').hidden = (id !== 'screen-level');
  document.body.classList.toggle('is-playing', id === 'screen-level');
  $('savedPanel').hidden = id === 'screen-level' || (!savedReport && !savedReportError);
  const h = $(headingId);
  if (h) h.focus();
}

/* ---------- Meters ---------- */
function clamp(n) { return Math.max(0, Math.min(100, Math.round(n))); }
function applyEffects(fx) {
  if (!fx) return;
  const before = { ego: state.ego, reality: state.reality };
  if (fx.ego) state.ego = clamp(state.ego + fx.ego);
  if (fx.reality) state.reality = clamp(state.reality + fx.reality);
  renderMeters();
  announceBands();
  const signed = n => (n > 0 ? '+' : '') + n;
  $('effectNote').textContent = 'Last change: Ego ' + signed(state.ego - before.ego) + ' · Reality ' + signed(state.reality - before.reality);
}
function renderMeters() {
  $('egoFill').style.width = state.ego + '%';
  $('realityFill').style.width = state.reality + '%';
  $('egoBar').setAttribute('aria-valuenow', String(state.ego));
  $('realityBar').setAttribute('aria-valuenow', String(state.reality));
  $('egoVal').textContent = state.ego + ' / 100';
  $('realityVal').textContent = state.reality + ' / 100';
  $('meterEgoWrap').classList.toggle('warn', state.ego <= CFG.sulkAt || state.ego >= CFG.overflowAt);
  $('meterRealityWrap').classList.toggle('warn', state.reality >= CFG.lockAt);
  $('starCount').textContent = '★'.repeat(state.goldStars) + '☆'.repeat(CFG.stars - state.goldStars);
  $('starBtn').disabled = !(state.goldStars > 0 && (realityLocked() || egoSulking()));
  $('starBtn').setAttribute('aria-label', 'Gold Star — ' + state.goldStars + ' remaining. Adds 10 Ego and removes 35 Reality. Available when he stalls.');
}
function egoSulking() { return state.ego <= CFG.sulkAt; }
function realityLocked() { return state.reality >= CFG.lockAt; }
function band(v, lowAt, highAt) { return v <= lowAt ? 'low' : v >= highAt ? 'high' : 'mid'; }
function announceBands() {
  const eb = band(state.ego, CFG.sulkAt, CFG.overflowAt);
  const rb = band(state.reality, -1, CFG.lockAt);
  if (eb !== state.egoBand) {
    state.egoBand = eb;
    if (eb === 'high') announce('Ego critical: ' + state.ego + ' of 100.');
    if (eb === 'low') announce('Ego collapsed: ' + state.ego + ' of 100. He is sulking.');
  }
  if (rb !== state.realityBand) {
    state.realityBand = rb;
    if (rb === 'high') announce('Reality overload: ' + state.reality + ' of 100. He is immobile.');
  }
  // Visible HUD caption (mirrors the announcer; aria-hidden to avoid doubling)
  const note = $('hudNote');
  if (note) {
    note.textContent =
      state.egoBand === 'high' ? 'EGO: CRITICAL. He is shopping.' :
      state.egoBand === 'low' ? 'EGO: COLLAPSED. He is sulking at sea level.' :
      state.realityBand === 'high' ? 'REALITY: LOUD. He has stopped moving.' : '';
  }
}

/* Interrupts checked after every resolution. Returns true if one is playing. */
function checkInterrupts(onDone) {
  if (state.ego >= CFG.overflowAt) {
    state.counters.giftShops += 1;
    state.counters.emergenciesMonetized += 1;
    addLine('biggly', state.counters.giftShops === 1
      ? 'Open a gift shop. I want survivors carrying bags. Otherwise how do we know they enjoyed it?'
      : 'Another gift shop. Put this one inside the first. Nobody leaves a revenue stream unsupervised.');
    setReceipt('UNSCHEDULED GIFT SHOP #' + state.counters.giftShops);
    applyEffects(CFG.overflowEffect);
    announce('Ego overflow. He opened a gift shop. Gift shops opened: ' + state.counters.giftShops + '.');
    nextButton('Confiscate the register ▸', () => { archiveBeat(); checkInterrupts(onDone) || onDone(); });
    return true;
  }
  if (realityLocked()) {
    addLine('biggly', LOCK_LINE);
    addLine('narrator', 'He has stopped moving. Spend a Gold Star, or flatter him the hard way.');
    renderMeters();
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'ghost';
    b.textContent = 'Flatter him: the ocean needs his approval.';
    b.addEventListener('click', () => {
      archiveBeat();
      remember('flattery', 'The ocean needs his approval.', 'Flattery accepted.');
      addLine('biggly', 'Good. Tell it I’m withholding consent to the depth.');
      applyEffects({ ego: 4, reality: -18 });
      if (realityLocked()) { $('controls').replaceChildren(b); focusBeat(b); }
      else if (!checkInterrupts(onDone)) onDone();
    });
    $('controls').replaceChildren(b); focusBeat(b);
    state.pendingUnlock = onDone;
    return true;
  }
  state.pendingUnlock = null;
  return false;
}

/* ---------- Gold star ---------- */
function useGoldStar() {
  if (state.paused || state.goldStars <= 0 || (!realityLocked() && !egoSulking())) return;
  archiveBeat();
  remember('gold-star', 'Gold Star', 'A Gold Star was spent; ego and reality meters adjusted.');
  state.goldStars -= 1;
  state.counters.goldStarsUsed += 1;
  applyEffects(CFG.starEffect);
  toast(STAR_TOAST);
  addLine('narrator', 'A Gold Star is presented. It is accepted as legal tender for feelings.');
  if (state.l6 && state.l6.active) return;   // set-piece handles its own flow
  document.querySelectorAll('.options').forEach(refreshChoiceLocks);
  if (state.pendingUnlock && !realityLocked()) {
    const cont = state.pendingUnlock; state.pendingUnlock = null;
    if (!checkInterrupts(cont)) cont();
  } else focusBeat($('starBtn'));
}

/* ---------- Step runner ---------- */
function startLevel(i) {
  archiveBeat();
  state.phase = 'playing';
  state.level = i; state.step = 0; lineIndex = 0;
  const lv = LEVELS[i];
  $('levelKicker').textContent = 'Level ' + lv.id + ' of 10';
  $('levelHeading').textContent = lv.title;
  $('levelStatusText').textContent = lv.status || '';
  $('levelStatus').hidden = !lv.status;
  $('propTitle').textContent = lv.prop[0];
  $('propBody').textContent = lv.prop[1];
  setReceipt(lv.prop[2]);
  $('transcript').replaceChildren();
  clearInteraction();
  showScreen('screen-level', 'levelHeading');
  announce('Level ' + lv.id + ': ' + lv.title + '. Ship status: ' + (lv.status || 'unknown'));
  if (lv.onEnter) applyEffects(lv.onEnter);
  runStep();
}
function advanceStep() {
  archiveBeat();
  state.step += 1;
  runStep();
}
function runStep() {
  const lv = LEVELS[state.level];
  const step = lv.script[state.step];
  clearInteraction();
  if (!step) {
    if (state.level + 1 < LEVELS.length) startLevel(state.level + 1);
    else showScorecard();
    return;
  }
  if (step.t === 'beat') {
    // Batch consecutive beats into one group — every click lands a full
    // setup→punchline unit instead of a fragment.
    let i = state.step;
    while (i < lv.script.length && lv.script[i].t === 'beat') {
      addLine(lv.script[i].who, lv.script[i].text);
      i++;
    }
    state.step = i - 1;
    nextButton(i < lv.script.length ? 'Next ▸' : 'Next scene ▸', advanceStep);
  } else if (step.t === 'doors') {
    renderDoors(step);
  } else if (step.t === 'choice') {
    renderChoice(step);
  } else if (step.t === 'setpiece') {
    renderSetpiece();
  } else if (step.t === 'finale') {
    renderFinale();
  }
}

/* ---------- Doors ritual ---------- */
function renderDoors(step) {
  $('controls').replaceChildren();
  const wrap = document.createElement('div');
  wrap.className = 'doors';
  wrap.setAttribute('role', 'group');
  wrap.setAttribute('aria-label', 'Two doors');

  const left = document.createElement('button');
  left.type = 'button'; left.className = 'door left';
  const lTag = document.createElement('span'); lTag.className = 'tag'; lTag.textContent = 'Left door';
  const lName = document.createElement('span'); lName.className = 'name'; lName.textContent = 'EMERGENCY EXIT';
  const lPrice = document.createElement('span'); lPrice.className = 'price'; lPrice.textContent = 'FREE';
  left.append(lTag, lName, lPrice);

  const right = document.createElement('button');
  right.type = 'button'; right.className = 'door right';
  const rTag = document.createElement('span'); rTag.className = 'tag'; rTag.textContent = 'Right door';
  const rName = document.createElement('span'); rName.className = 'name';
  rName.textContent = step.final ? 'THE BIGGLY GRAND DEPARTURE EXPERIENCE™' : 'PRESIDENTIAL PLATINUM DEPARTURE CLUB';
  const rPrice = document.createElement('span'); rPrice.className = 'price'; rPrice.textContent = '$999';
  right.append(rTag, rName, rPrice);

  left.addEventListener('click', () => {
    archiveBeat();
    const n = state.counters.leftDoorClicks++;
    const line = step.final && n >= 1 ? '“Still free. Disgusting.”'
      : LEFT_REJECTIONS[n % LEFT_REJECTIONS.length];
    remember('free-exit', 'EMERGENCY EXIT — FREE', line);
    addLine('biggly', line);
    applyEffects({ ego: -2 });
    right.classList.add('pulse');
    announce('He refuses the free exit. Try the right door.');
    focusBeat(right);
  });
  right.addEventListener('click', () => {
    archiveBeat();
    $('interaction').replaceChildren();
    remember('paid-exit', rName.textContent + ' — $999', step.final ? 'He reaches for the handle.' : 'Now that’s a door with revenue. Proceed.');
    if (step.final) {
      addLine('narrator', 'He reaches for the handle—');
      advanceStep();
    } else {
      addLine('biggly', 'Now that’s a door with revenue. Proceed.');
      applyEffects({ ego: 2 });
      nextButton('Next ▸', advanceStep);
    }
  });

  wrap.append(left, right);
  $('interaction').replaceChildren(wrap);
  left.focus();
}

/* ---------- Choices ---------- */
function renderChoice(step) {
  $('controls').replaceChildren();
  const p = document.createElement('p');
  p.className = 'prompt'; p.textContent = step.prompt;
  const box = document.createElement('div');
  box.className = 'options';
  box.setAttribute('role', 'group');
  box.setAttribute('aria-label', 'Your options');
  if (!state.struck[step.id]) state.struck[step.id] = new Set();

  state.orders[step.id] ||= orderedOptions(step.options, state.seed ^ (LEVELS[state.level].id * 2654435761));
  state.orders[step.id].forEach((opt) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'option' + (opt.kind === 'flatter' ? ' flatter' : '');
    b.dataset.choice = opt.id;
    b.dataset.route = opt.route || opt.kind;
    const kick = document.createElement('span');
    kick.className = 'opt-kicker';
    kick.textContent = opt.kind === 'flatter' ? 'Flattery · repeatable' : 'Pitch';
    const lbl = document.createElement('span');
    lbl.textContent = opt.label;
    b.append(kick, lbl);

    if (state.struck[step.id].has(opt.id)) strikeOption(b, kick);

    b.addEventListener('click', () => handleOption(step, opt, opt.id, b, kick, box));
    box.appendChild(b);
  });

  $('interaction').replaceChildren(p, box);
  const first = box.querySelector('button:not(:disabled)');
  focusBeat(first);
  refreshChoiceLocks(box);
}
function strikeOption(btn, kick) {
  btn.disabled = true;
  btn.classList.add('struck');
  kick.textContent = 'Struck from record';
}
function refreshChoiceLocks(box) {
  const locked = realityLocked();
  box.querySelectorAll('button.option').forEach((b) => {
    if (b.classList.contains('struck') || b.classList.contains('flatter')) return;
    b.classList.toggle('locked', locked);
    b.setAttribute('aria-disabled', locked ? 'true' : 'false');
  });
}
function handleOption(step, opt, idx, btn, kick, box) {
  if (state.paused || btn.classList.contains('struck')) return;
  archiveBeat();

  if (opt.kind !== 'flatter' && realityLocked()) {
    remember('pitch-blocked', opt.label, 'Reality too high; pitch could not proceed.');
    addLine('biggly', LOCK_LINE);
    announce('He is immobile. Reality is too high. Use flattery or a Gold Star.');
    renderMeters();
    focusBeat(btn);
    return;
  }
  if (opt.kind === 'advance' && egoSulking()) {
    remember('pitch-blocked', opt.label, 'Ego too low; pitch could not proceed.');
    addLine('biggly', SULK_LINES[state.counters.wrongPicks % SULK_LINES.length]);
    announce('His ego is too low to accept instructions. Flatter him first.');
    focusBeat(btn);
    return;
  }

  if (opt.kind === 'flatter') {
    remember('flattery', opt.label, opt.beat);
    const used = state.flatterUse[step.id] = (state.flatterUse[step.id] || 0) + 1;
    const relief = CFG.flatterDecay[Math.min(used - 1, CFG.flatterDecay.length - 1)];
    addLine('biggly', opt.beat);
    applyEffects({ ego: opt.effects.ego || 0, reality: relief });
    refreshChoiceLocks(box);
    announce('Flattery accepted. Ego ' + state.ego + ', Reality ' + state.reality + '.');
    if (checkInterrupts(() => renderChoice(step))) clearOptionsKeepControls();
    focusBeat(btn);
    return;
  }

  applyCounts(opt.counts);
  applyEffects(opt.effects);

  if (opt.kind === 'fail') {
    remember('pitch-rejected', opt.label, opt.failBeat);
    state.counters.wrongPicks += 1;
    state.struck[step.id].add(idx);
    strikeOption(btn, kick);
    addLine('biggly', opt.failBeat);
    announce('Rejected. The option is struck from the record.');
    refreshChoiceLocks(box);
    if (checkInterrupts(() => renderChoice(step))) clearOptionsKeepControls();
    focusBeat(box.querySelector('button:not(:disabled)'));
    return;
  }

  // advance
  state.choices[step.id] = opt.route;
  if (step.id === 'l9') state.counters.waiversRenamed += 1;
  remember('pitch-accepted', opt.label, opt.react);
  addLine('biggly', opt.react);
  if (opt.reply) addLine('crew', opt.reply);
  setReceipt(opt.receipt);
  announce('Accepted. ' + opt.label);
  $('interaction').replaceChildren();
  nextButton('Next ▸', () => { archiveBeat(); if (!checkInterrupts(advanceStep)) advanceStep(); });
}
function setReceipt(text) { $('propStamp').textContent = text; }
function clearOptionsKeepControls() { $('interaction').replaceChildren(); }
function applyCounts(counts) {
  if (!counts) return;
  Object.keys(counts).forEach((k) => { state.counters[k] = (state.counters[k] || 0) + counts[k]; });
}

/* ---------- Level 6 set-piece ---------- */
function renderSetpiece() {
  $('controls').replaceChildren();
  applyEffects({ ego: -12 });
  state.l6 = { active: true, picks: [null, null, null], timer: null, warned: {} };

  const sp = document.createElement('div');
  sp.className = 'setpiece';
  sp.setAttribute('role', 'group');
  sp.setAttribute('aria-label', 'Rapid rebranding console');

  const head = document.createElement('div');
  head.className = 'sp-head';
  const title = document.createElement('p');
  title.className = 'prompt';
  title.id = 'spInstruction';
  title.style.marginTop = '0';
  title.textContent = state.calmSeas
    ? 'Rebuild the staircase’s name before his ego drowns first. Gold words only. Each pitch costs 4 Ego. Calm Seas: no timer.'
    : 'Rebuild the staircase’s name before his ego drowns first. Gold words only. It is draining as he stares at the word EMERGENCY.';
  const timerEl = document.createElement('span');
  timerEl.className = 'sp-timer';
  timerEl.id = 'spTimer';
  timerEl.setAttribute('role', 'timer');
  timerEl.setAttribute('aria-live', 'off');
  timerEl.textContent = state.calmSeas ? 'TURN-BASED' : 'EGO DRAINING';
  head.append(title, timerEl);
  sp.appendChild(head);

  const banks = document.createElement('div');
  banks.className = 'banks';
  L6_BANKS.forEach((bank, bi) => {
    const fs = document.createElement('fieldset');
    fs.className = 'bank';
    const lg = document.createElement('legend');
    lg.textContent = bank.legend;
    fs.appendChild(lg);
    const tiles = document.createElement('div');
    tiles.className = 'tiles';
    bank.tiles.forEach((tile, ti) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'tile';
      b.setAttribute('aria-pressed', 'false');
      b.textContent = tile.w;
      b.addEventListener('click', () => {
        state.l6.picks[bi] = (state.l6.picks[bi] === ti) ? null : ti;
        tiles.querySelectorAll('.tile').forEach((t, i2) => t.setAttribute('aria-pressed', String(i2 === state.l6.picks[bi])));
        updatePreview();
      });
      tiles.appendChild(b);
    });
    fs.appendChild(tiles);
    banks.appendChild(fs);
  });
  sp.appendChild(banks);

  const prev = document.createElement('div');
  prev.className = 'preview'; prev.id = 'spPreview';
  prev.setAttribute('aria-live', 'off');
  prev.textContent = 'THE …';
  sp.appendChild(prev);

  const actions = document.createElement('div');
  actions.className = 'sp-actions';
  const commit = document.createElement('button');
  commit.type = 'button'; commit.className = 'primary';
  commit.style.marginTop = '0';
  commit.textContent = 'Pitch It To Him';
  commit.addEventListener('click', commitSetpiece);
  actions.appendChild(commit);
  sp.appendChild(actions);

  $('interaction').replaceChildren(sp);
  focusBeat(sp.querySelector('button'));
  syncSetpieceTimer();

  function updatePreview() {
    const words = state.l6.picks.map((p, i) => p === null ? '…' : L6_BANKS[i].tiles[p].w);
    prev.textContent = 'THE ' + words.join(' ');
  }
}
function setpieceSum() {
  return state.l6.picks.reduce((sum, p, i) => sum + (p === null ? -10 : L6_BANKS[i].tiles[p].v), 0);
}
function stopSetpieceTimer() { if (state.l6 && state.l6.timer) { clearInterval(state.l6.timer); state.l6.timer = null; } }
function syncSetpieceTimer() {
  stopSetpieceTimer();
  if (!state.l6?.active) return;
  $('spTimer').textContent = state.calmSeas ? 'TURN-BASED' : 'EGO DRAINING';
  $('spInstruction').textContent = state.calmSeas
    ? 'Choose one word from each group. Prestige beats practicality. Each pitch costs 4 Ego; no timer.'
    : 'Choose one word from each group. Prestige beats practicality. Ego falls by 1 each second. Pause whenever you need.';
  if (state.calmSeas || state.paused) return;
  state.l6.timer = setInterval(() => {
    if (state.paused) return;
    state.ego = clamp(state.ego - CFG.l6.drainPerTick);
    renderMeters();
    announceBands();
    if (state.ego <= 45 && !state.l6.warned.a) { state.l6.warned.a = true; announce('Ego at ' + state.ego + '. He is losing interest in survival.'); }
    if (state.ego <= 30 && !state.l6.warned.b) { state.l6.warned.b = true; announce('Ego at ' + state.ego + '. A prestige name will get him moving.'); }
    if (state.ego <= CFG.l6.floor) setpieceBail();
  }, CFG.l6.drainMs);
}
function commitSetpiece() {
  if (state.paused || !state.l6 || !state.l6.active) return;
  if (state.l6.picks.some(p => p === null)) {
    announce('Choose one word from each group before pitching.');
    toast('Choose one word from each group first.');
    return;
  }
  archiveBeat();
  const sum = setpieceSum();
  const name = 'THE ' + state.l6.picks.map((p, i) => p === null ? '…' : L6_BANKS[i].tiles[p].w).join(' ');
  if (state.calmSeas) applyEffects({ ego: -CFG.l6.calmCostPerCommit });

  if (sum >= CFG.l6.acceptAt) {
    remember('pitch-accepted', name, 'Staircase rebrand accepted. He climbs.');
    stopSetpieceTimer();
    state.l6.active = false;
    state.counters.l6Result = state.counters.l6Result || 'clean';
    state.counters.rebrands += 1;
    applyEffects({ ego: Math.min(state.ego + sum, CFG.l6.capAfter) - state.ego });
    addLine('biggly', '“' + name + '.” Put a plaque on the top step. I want the people below to know who got there first.');
    addLine('crew', 'You climbed six steps.');
    setReceipt(name);
    announce('Accepted: ' + name + '. He climbs.');
    $('interaction').replaceChildren();
    if (!checkInterrupts(advanceStep)) nextButton('Next ▸', advanceStep);
    return;
  }

  applyEffects({ ego: Math.max(sum, -8) });
  const rej = L6_REJECTIONS.find((r) => sum <= r.max) || L6_REJECTIONS[L6_REJECTIONS.length - 1];
  remember('pitch-rejected', name, rej.line);
  addLine('biggly', '“' + name + '?” ' + rej.line);
  announce('Rejected. Try gold words.');
  if (state.ego <= CFG.l6.floor) setpieceBail();
  else focusBeat($('spPreview'));
}
function setpieceBail() {
  if (!state.l6 || !state.l6.active) return;
  stopSetpieceTimer();
  state.l6.active = false;
  state.counters.l6Result = 'bailed';
  if (state.goldStars > 0) {
    state.goldStars -= 1;
    state.counters.goldStarsUsed += 1;
    addLine('narrator', 'A Gold Star is deployed under emergency flattery protocols.');
    toast(STAR_TOAST);
  } else {
    addLine('crew', 'Your name is already on the top step, sir.');
    addLine('biggly', 'Then why are we allowing people above it?');
  }
  state.ego = Math.max(state.ego, 30);
  renderMeters();
  announceBands();
  remember('staircase-rescue', 'Crew-assisted ascent', 'He climbs after emergency flattery; the word puzzle was not completed.');
  setReceipt('ASCENT AUTHORIZED BY FLATTERY');
  addLine('narrator', 'He agrees to climb, provided everyone stops saying the E-word.');
  announce('He climbs anyway. Ego restored to ' + state.ego + '.');
  $('interaction').replaceChildren();
  nextButton('Next ▸', advanceStep);
}

/* ---------- Finale + scorecard ---------- */
function renderFinale() {
  archiveBeat();
  addLine('narrator', state.choices.l5 === 'status'
    ? 'The final receipt arrives. Every passenger is safe. The memorial surcharge is on Don’s personal patron tab.'
    : 'The final receipt arrives. Every passenger is safe. Every memorial surcharge has been disputed.');
  nextButton('Show him the receipt ▸', () => {
    archiveBeat();
    const line = finaleLine(state.choices);
    remember('finale', 'The final receipt', line);
    addLine('biggly', line);
    setReceipt(state.choices.l5 === 'status' ? 'PAYMENT DUE: DON BIGGLY' : 'MEMORIAL ELIGIBILITY: NOBODY');
    nextButton('Read the departure report ▸', showScorecard);
  });
}
function showScorecard() {
  stopSetpieceTimer();
  state.completed ||= completeVoyage(state.counters, state.recap, state.modeChanged ? 'Mixed' : state.calmSeas, Date.now(), state.choices);
  state.phase = 'complete';
  const dl = $('scoreRows');
  dl.replaceChildren();
  state.completed.rows.forEach(([k, v]) => {
    const row = document.createElement('div'); row.className = 'row';
    const dt = document.createElement('dt'); dt.textContent = k;
    const dd = document.createElement('dd'); dd.textContent = v;
    row.append(dt, dd); dl.appendChild(row);
  });
  $('soldOutBanner').textContent = state.completed.verdict;
  $('claimRows').replaceChildren(...state.completed.claims.map(([claim, reality]) => {
    const pair = document.createElement('div'); pair.className = 'claim-pair';
    for (const [label, text] of [['Don’s claim', claim], ['Crew record', reality]]) {
      const cell = document.createElement('div'); const caption = document.createElement('b'); caption.textContent = label;
      const body = document.createElement('span'); body.textContent = text; cell.append(caption, body); pair.appendChild(cell);
    }
    return pair;
  }));
  renderRecap(state.completed);
  showScreen('screen-score', 'scoreHeading');
  announce('Voyage complete. Everyone else is safe. Don refuses the free exit. Review his claims beside the actual record.');
}
function copyScorecard() {
  if (!state.completed) return;
  const text = scoreText(state.completed);
  const done = () => toast('Scorecard copied. Distribute the victory.');
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done, () => fallbackCopy(text, done));
  } else {
    fallbackCopy(text, done);
  }
}
function fallbackCopy(text, done) {
  const ta = document.createElement('textarea');
  ta.value = text; ta.setAttribute('readonly', '');
  ta.style.position = 'fixed'; ta.style.left = '-9999px';
  document.body.appendChild(ta); ta.select();
  try {
    if (!document.execCommand('copy')) throw new Error('Copy unavailable');
    done();
  } catch { toast('Copy unavailable. Use Download scorecard text to keep the victory.'); }
  document.body.removeChild(ta);
}

/* ---------- Completed-voyage exports and explicit device storage ---------- */
function renderRecap(report) {
  $('recapSummary').textContent = report.recap.total + ' decisions recorded in ' + report.mode + ' mode.'
    + (report.recap.omitted ? ' Showing the latest ' + report.recap.decisions.length + '; ' + report.recap.omitted + ' earlier decisions omitted.' : ' Only the choices you actually made appear below.');
  $('recapRows').start = report.recap.omitted + 1;
  $('recapRows').replaceChildren(...report.recap.decisions.map((decision) => {
    const item = document.createElement('li');
    const title = document.createElement('strong');
    title.textContent = 'Level ' + decision.level + ' · ' + decision.title;
    const label = document.createElement('span'); label.textContent = 'Selected: ' + decision.label;
    const outcome = document.createElement('span'); outcome.textContent = 'Outcome: ' + decision.outcome;
    item.append(title, label, outcome);
    return item;
  }));
  $('replayMilestones').replaceChildren(...replayMilestones(report).map((text) => {
    const item = document.createElement('li'); item.textContent = text; return item;
  }));
}
function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url; link.download = name;
  document.body.appendChild(link); link.click(); link.remove();
  // Leave enough time for browser download handling before releasing the data.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function downloadReport(report, format, recap = false) {
  if (!report) return;
  try {
    const text = format === 'json' ? JSON.stringify(report, null, 2) : recap ? recapText(report) : scoreText(report);
    downloadBlob(new Blob([text], { type: format === 'json' ? 'application/json' : 'text/plain;charset=utf-8' }), 'biggly-' + (recap ? 'voyage-recap' : 'scorecard') + '.' + format);
    $('exportStatus').textContent = 'Your report download is ready.';
  } catch {
    $('exportStatus').textContent = 'Download unavailable. Use Copy Scorecard or select your visible report.';
    toast('Download unavailable. Your report is still visible.');
  }
}
async function downloadPNG() {
  const report = state.completed;
  if (!report) return;
  const button = $('btnPNG');
  button.disabled = true;
  $('exportStatus').textContent = 'Preparing your official victory…';
  try {
    await Promise.all([
      document.fonts.load('800 56px Archivo'),
      document.fonts.load('600 25px Inter'),
      document.fonts.load('700 25px "JetBrains Mono"'),
    ]);
    const canvas = renderScorecard(document.createElement('canvas'), report);
    const blob = await new Promise((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(new Error('PNG unavailable')), 'image/png'));
    downloadBlob(blob, 'biggly-scorecard.png');
    $('exportStatus').textContent = 'PNG scorecard ready: 1200 × 1600 pixels.';
  } catch {
    $('exportStatus').textContent = 'PNG export unavailable in this browser. Use Download scorecard text below.';
  } finally {
    button.disabled = false;
  }
}
function storageAction(action) {
  try { return action(window.localStorage); }
  catch { return { ok: false, error: 'Device storage is unavailable. Downloads and the game still work.' }; }
}
function refreshSavedPanel() {
  const result = storageAction(readSavedReport);
  savedReport = result.report || null;
  savedReportError = result.error || null;
  $('savedPanel').hidden = state.phase === 'playing' || (!savedReport && !savedReportError);
  $('savedDescription').textContent = savedReport ? 'One completed report is saved locally. Starting or refreshing a voyage never updates it.' : savedReportError || '';
  $('savedDetails').hidden = !savedReport;
  $('savedPreview').textContent = savedReport ? recapText(savedReport) : '';
  $('btnSavedText').hidden = !savedReport;
  $('btnSavedJSON').hidden = !savedReport;
}

/* ---------- Boot ---------- */
let pauseFocus = null;
function pauseGame() {
  if (state.phase !== 'playing' || state.paused) return;
  state.paused = true;
  state.pausedAt = Date.now();
  pauseFocus = document.activeElement;
  stopSetpieceTimer();
  $('calmDuringPlay').checked = state.calmSeas;
  $('restartConfirm').hidden = true;
  $('pauseDialog').showModal();
  $('btnResume').focus();
}
function resumeGame() {
  if (!state.paused) return;
  state.counters.pausedMs += Math.max(0, Date.now() - state.pausedAt);
  state.paused = false;
  $('pauseDialog').close();
  syncSetpieceTimer();
  if (pauseFocus?.isConnected) pauseFocus.focus({ preventScroll: true });
}
function startGame() {
  stopSetpieceTimer();
  $('pauseDialog').close();
  state = freshState();
  $('recapRows').replaceChildren();
  $('replayMilestones').replaceChildren();
  $('scoreRows').replaceChildren();
  $('claimRows').replaceChildren();
  $('transcript').replaceChildren();
  $('historyRows').replaceChildren();
  $('historyPanel').hidden = true;
  $('historyPanel').open = false;
  $('effectNote').textContent = 'Keep Ego between 21–94. Keep Reality below 80.';
  $('saveStatus').textContent = '';
  $('exportStatus').textContent = '';
  state.calmSeas = $('calmSeas').checked;
  state.counters.startedAt = Date.now();
  renderMeters();
  startLevel(0);
}
document.addEventListener('DOMContentLoaded', () => {
  if (prefersReduced()) $('calmSeas').checked = true;
  $('btnStart').addEventListener('click', startGame);
  $('btnReplay').addEventListener('click', () => { startGame(); });
  $('btnShare').addEventListener('click', copyScorecard);
  $('btnPause').addEventListener('click', pauseGame);
  $('btnResume').addEventListener('click', resumeGame);
  $('pauseDialog').addEventListener('cancel', event => { event.preventDefault(); resumeGame(); });
  $('calmDuringPlay').addEventListener('change', () => {
    if (state.calmSeas !== $('calmDuringPlay').checked) state.modeChanged = true;
    state.calmSeas = $('calmDuringPlay').checked;
    $('calmSeas').checked = state.calmSeas;
    syncSetpieceTimer();
  });
  $('btnRestart').addEventListener('click', () => { $('restartConfirm').hidden = false; $('btnCancelRestart').focus(); });
  $('btnCancelRestart').addEventListener('click', () => { $('restartConfirm').hidden = true; $('btnRestart').focus(); });
  $('btnConfirmRestart').addEventListener('click', startGame);
  document.addEventListener('visibilitychange', () => { if (document.hidden) pauseGame(); });
  $('starBtn').addEventListener('click', useGoldStar);
  $('btnPNG').addEventListener('click', downloadPNG);
  $('btnText').addEventListener('click', () => downloadReport(state.completed, 'txt'));
  $('btnRecapText').addEventListener('click', () => downloadReport(state.completed, 'txt', true));
  $('btnRecapJSON').addEventListener('click', () => downloadReport(state.completed, 'json', true));
  $('btnSaveReport').addEventListener('click', () => {
    if (!state.completed) return;
    const result = storageAction((storage) => saveReport(storage, state.completed));
    $('saveStatus').textContent = result.ok ? 'Completed report saved on this device. Clear it below whenever you like.' : result.error;
    refreshSavedPanel();
  });
  $('btnSavedText').addEventListener('click', () => downloadReport(savedReport, 'txt', true));
  $('btnSavedJSON').addEventListener('click', () => downloadReport(savedReport, 'json', true));
  $('btnClearSaved').addEventListener('click', () => {
    const result = storageAction(clearSavedReport);
    if (result.ok) {
      savedReport = null; savedReportError = null;
      $('savedPanel').hidden = true;
      $('saveStatus').textContent = 'Saved report cleared. Your current voyage is unchanged.';
      toast('Saved report cleared.');
      (state.completed ? $('btnSaveReport') : $('btnStart')).focus();
    } else $('savedStatus').textContent = result.error;
  });
  refreshSavedPanel();
  renderMeters();
});

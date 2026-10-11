/* Completed-voyage artifacts. No network, ongoing-game persistence, or game rules. */
import { ROUTE_LEVELS, routeVerdict } from './exit-strategy-story.js';
export const MAX_DECISIONS = 240;
export const REPORT_KEY = 'boh.exit-strategy.completed.v1';
export const SCORECARD_SIZE = Object.freeze({ width: 1200, height: 1600 });

export function createRecap() {
  return { decisions: [], total: 0, omitted: 0 };
}

export function recordDecision(recap, decision) {
  recap.total += 1;
  recap.decisions.push({
    sequence: recap.total,
    level: decision.level,
    title: decision.title,
    kind: decision.kind,
    label: decision.label,
    outcome: decision.outcome,
  });
  if (recap.decisions.length > MAX_DECISIONS) {
    recap.decisions.shift();
    recap.omitted += 1;
  }
}

// These are the original score calculations. The clock is captured only once.
export function buildScoreRows(c, completedAt, stars = 3) {
  const brand = Math.max(88000000, 94000000 - 1000000 * c.wrongPicks + 2500000 * c.giftShops);
  const mins = Math.max(0, Math.round((completedAt - c.startedAt) / 60000));
  return [
    ['Biggly brand value', brand.toLocaleString('en-US')],
    ['Actual distance from exit', '3 FEET'],
    ['Ego', 'MAXIMUM'], ['Reality', 'MUTED'], ['Lawyers remaining', '1'],
    ['Waivers renamed', String(13 + c.waiversRenamed)],
    ['Gift shops opened', String(5 + c.giftShops)],
    ['Emergencies monetized', String(7 + c.emergenciesMonetized)],
    ['Rebrands accepted', String(c.rebrands)],
    ['Free exits refused', String(c.leftDoorClicks)],
    ['Gold stars spent', c.goldStarsUsed + ' / ' + stars],
    ['Voyage duration', mins + ' min'],
    ['Staircase incident', c.l6Result === 'bailed' ? 'RESOLVED BY FLATTERY' : 'REBRANDED ON MERIT'],
    ['Problems solved', '0'],
  ];
}

export function buildActualRows(c, completedAt, choices) {
  const mins = Math.max(0, Math.round((completedAt - c.startedAt - c.pausedMs) / 60000));
  return [
    ['Passengers and crew', 'SAFE ASHORE'],
    ['Don’s evacuation', 'REFUSED'],
    ['Actual distance from exit', '3 FEET'],
    ['Lawyers still aboard', '0'],
    ['Extra charges attempted', String(c.feesAttempted)],
    ['Gift shops opened', String(c.giftShops)],
    ['Pitches accepted', String(c.rebrands)],
    ['Free exits refused', String(c.leftDoorClicks)],
    ['Gold stars spent', c.goldStarsUsed + ' / 3'],
    ['Voyage duration', mins + ' min'],
    ['Staircase incident', c.l6Result === 'bailed' ? 'RESOLVED BY FLATTERY' : 'REBRANDED ON MERIT'],
    ['Memorial charge assigned to', choices.l5 === 'status' ? 'DON BIGGLY' : 'PASSENGERS'],
  ];
}

export function buildClaims(c, choices) {
  const revenue = Object.values(choices).filter(value => value === 'revenue').length;
  return [
    ['“Total victory.”', 'Everyone else is safe. Don has refused the exit.'],
    [revenue >= 4 ? '“An extraordinary new revenue stream.”' : '“An unprecedented mandate to lead.”',
      revenue + ' revenue pitches; ' + (ROUTE_LEVELS.length - revenue) + ' status pitches. No authority conferred.'],
    ['“A memorial worthy of my name.”', choices.l5 === 'status'
      ? 'All passengers survived. The surcharge is on Don’s own tab.'
      : 'All passengers survived. The attempted surcharge is disputed.'],
    ['“All liability resolved.”', choices.l9 === 'revenue'
      ? 'The claims opt-out has no legal effect. The last lawyer left.'
      : 'His honorary appointment changes no rights. The last lawyer left.'],
  ];
}

function freezeReport(report) {
  Object.values(report).forEach((value) => {
    if (value && typeof value === 'object') freezeReport(value);
  });
  return Object.freeze(report);
}

export function completeVoyage(counters, recap, calmSeas, completedAt, choices = null) {
  return freezeReport({
    version: choices ? 2 : 1,
    completedAt,
    mode: typeof calmSeas === 'string' ? calmSeas : calmSeas ? 'Calm Seas' : 'Timed',
    counters: { ...counters },
    rows: choices ? buildActualRows(counters, completedAt, choices) : buildScoreRows(counters, completedAt),
    ...(choices ? { choices: { ...choices }, claims: buildClaims(counters, choices), verdict: routeVerdict(choices) } : {}),
    recap: { total: recap.total, omitted: recap.omitted, decisions: recap.decisions.map((d) => ({ ...d })) },
  });
}

export function replayMilestones(report) {
  const decisions = report.recap.decisions;
  const accepted = decisions.filter((d) => d.kind === 'pitch-accepted');
  const rejected = decisions.filter((d) => d.kind === 'pitch-rejected');
  const doors = decisions.filter((d) => d.kind === 'free-exit');
  const stars = decisions.filter((d) => d.kind === 'gold-star');
  const stairs = accepted.find((d) => d.level === 6);
  const items = [
    `${accepted.length} accepted pitches recorded. Replay to compare your route.`,
    `${rejected.length} rejected pitches recorded. Try a different pitch next voyage.`,
    `${doors.length} free-door refusals recorded. Prestige remains expensive.`,
    `${stars.length} Gold Stars chosen by you. Automatic staircase rescues appear in the score above.`,
  ];
  if (stairs) items.push(`Your staircase: ${stairs.label}. Try another name next voyage.`);
  if (report.version === 2) {
    const revenue = Object.values(report.choices).filter(value => value === 'revenue').length;
    items.unshift(`${revenue} revenue pitches and ${ROUTE_LEVELS.length - revenue} status pitches. Change who pays in The Route to discover the other finale.`);
  }
  if (report.recap.omitted) items.unshift(`Milestones use the latest ${decisions.length} decisions; ${report.recap.omitted} earlier decisions are omitted.`);
  return items;
}

export function scoreText(report) {
  return 'DON BIGGLY’S TREMENDOUS EXIT STRATEGY — FINAL SCORE\n' + (report.verdict || 'SOLD OUT — ZERO DISSENT') + '\n\n'
    + (report.claims ? report.claims.map(([claim, actual]) => 'DON’S CLAIM: ' + claim + '\nCREW RECORD: ' + actual).join('\n\n') + '\n\nYOUR ACTUAL VOYAGE\n' : '')
    + report.rows.map(([key, value]) => key.toUpperCase() + ': ' + value).join('\n')
    + '\n\nTOTAL VICTORY' + (report.version === 2 ? ' — ACCORDING TO DON' : '') + '\nFictional satire. No maritime safety value.\nPlay it: https://boozeonhormuz.com/play';
}

export function recapText(report) {
  const note = report.recap.omitted ? `\n${report.recap.omitted} earlier decisions omitted; latest ${MAX_DECISIONS} retained.\n` : '\n';
  return scoreText(report) + '\n\nYOUR VOYAGE — ' + report.mode.toUpperCase() + note
    + report.recap.decisions.map((d) => `\n${d.sequence}. Level ${d.level}: ${d.title}\nSelected: ${d.label}\nOutcome: ${d.outcome}`).join('\n')
    + '\n\nREPLAY MILESTONES\n' + replayMilestones(report).join('\n');
}

// Saved data is untrusted. Validate before displaying or exporting a stored report.
export function readSavedReport(storage) {
  try {
    const raw = storage.getItem(REPORT_KEY);
    if (raw === null) return { report: null, error: null };
    if (raw.length > 250000) throw new Error('Report too large');
    const report = JSON.parse(raw);
    if (![1, 2].includes(report?.version) || !Number.isFinite(report.completedAt) || !['Calm Seas', 'Timed', ...(report.version === 2 ? ['Mixed'] : [])].includes(report.mode)) throw new Error('Invalid report');
    const c = report.counters;
    const names = ['wrongPicks', 'rebrands', 'waiversRenamed', 'giftShops', 'emergenciesMonetized', 'goldStarsUsed', 'leftDoorClicks', 'startedAt'];
    if (!c || names.some((key) => !Number.isSafeInteger(c[key]) || c[key] < 0) || !['clean', 'bailed'].includes(c.l6Result)) throw new Error('Invalid counters');
    if (report.completedAt < c.startedAt || c.goldStarsUsed > 3) throw new Error('Invalid completion');
    if (report.version === 2) {
      if (!Number.isSafeInteger(c.feesAttempted) || c.feesAttempted < 0 || !Number.isSafeInteger(c.pausedMs) || c.pausedMs < 0 || c.pausedMs > report.completedAt - c.startedAt) throw new Error('Invalid voyage counters');
      if (!report.choices || Object.keys(report.choices).length !== ROUTE_LEVELS.length || ROUTE_LEVELS.some(id => !['revenue', 'status'].includes(report.choices[id]))) throw new Error('Invalid route');
    }
    const recap = report.recap;
    if (!recap || !Array.isArray(recap.decisions) || recap.decisions.length > MAX_DECISIONS || !Number.isSafeInteger(recap.total) || !Number.isSafeInteger(recap.omitted) || recap.omitted < 0 || recap.total !== recap.omitted + recap.decisions.length) throw new Error('Invalid recap');
    recap.decisions.forEach((d, index) => {
      if (!d || d.sequence !== recap.omitted + index + 1 || !Number.isInteger(d.level) || d.level < 1 || d.level > 10 || ['title', 'kind', 'label', 'outcome'].some((key) => typeof d[key] !== 'string' || d[key].length > 1000)) throw new Error('Invalid decision');
    });
    // Recompute derived rows instead of trusting saved presentation data.
    return { report: completeVoyage(c, recap, report.mode, report.completedAt, report.version === 2 ? report.choices : null), error: null };
  } catch {
    return { report: null, error: 'Saved reports are unavailable or unreadable. Play and downloads still work. You can clear the saved report below.' };
  }
}

export function saveReport(storage, report) {
  try {
    storage.setItem(REPORT_KEY, JSON.stringify(report));
    return { ok: true };
  } catch {
    return { ok: false, error: 'This browser could not save the report. Download a copy instead; your completed voyage is still here.' };
  }
}

export function clearSavedReport(storage) {
  try {
    storage.removeItem(REPORT_KEY);
    return { ok: true };
  } catch {
    return { ok: false, error: 'This browser could not clear storage. Use its site-data settings to remove a saved report.' };
  }
}

export function renderScorecard(canvas, report) {
  canvas.width = SCORECARD_SIZE.width;
  canvas.height = SCORECARD_SIZE.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas unavailable');
  ctx.fillStyle = '#040810';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#b8792d';
  ctx.lineWidth = 3;
  ctx.strokeRect(40, 40, 1120, 1520);
  ctx.fillStyle = '#f7ce73';
  ctx.font = '800 32px Archivo, sans-serif';
  ctx.fillText('BOOZE ON HORMUZ™', 88, 108);
  ctx.fillStyle = '#fff1bd';
  ctx.font = '800 56px Archivo, sans-serif';
  ctx.fillText('DON BIGGLY’S', 88, 190);
  ctx.fillText('TREMENDOUS EXIT STRATEGY', 88, 255);
  ctx.fillStyle = '#ff6b6b';
  ctx.font = '800 30px Archivo, sans-serif';
  ctx.fillText(report.verdict || 'SOLD OUT — ZERO DISSENT', 88, 320, 1024);
  if (report.version === 2) {
    ctx.fillStyle = '#b9c2d0'; ctx.font = '600 22px Inter, sans-serif';
    ctx.fillText('THE CREW’S RECORD · ALL PASSENGERS SAFE · DON REFUSES TO LEAVE', 88, 362, 1024);
  }
  ctx.textBaseline = 'middle';
  report.rows.forEach(([key, value], index) => {
    const y = 393 + index * 65;
    ctx.strokeStyle = '#263044';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(88, y + 31); ctx.lineTo(1112, y + 31); ctx.stroke();
    ctx.fillStyle = '#b9c2d0';
    ctx.textAlign = 'left';
    ctx.font = '600 25px Inter, sans-serif';
    ctx.fillText(key, 88, y, 530);
    ctx.fillStyle = '#f7ce73';
    ctx.textAlign = 'right';
    ctx.font = '700 25px "JetBrains Mono", monospace';
    ctx.fillText(value, 1112, y, 440);
  });
  ctx.textAlign = 'left';
  ctx.fillStyle = '#f7ce73';
  ctx.font = '900 46px Archivo, sans-serif';
  ctx.fillText('TOTAL VICTORY', 88, 1360);
  if (report.version === 2) {
    ctx.font = '600 22px Inter, sans-serif';
    ctx.fillText('— ACCORDING TO DON', 650, 1360);
  }
  ctx.fillStyle = '#b9c2d0';
  ctx.font = '500 23px Inter, sans-serif';
  ctx.fillText('Fictional satire. No maritime safety value.', 88, 1433);
  ctx.fillText('boozeonhormuz.com/play', 88, 1480);
  return canvas;
}

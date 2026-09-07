// Portable, browser-only creative files. No provider APIs or network persistence.
export const PROJECT_FORMAT = 'boh-creative-project';
export const PROJECT_VERSION = 1;
export const GENERATOR_VERSION = 2;
export const MAX_FILE_BYTES = 2_000_000;
const object = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const fail = (message) => { throw new Error(message); };
const string = (v, max, name) => typeof v === 'string' && v.length <= max ? v : fail(`${name} must be text of at most ${max} characters.`);
const integer = (v, name) => Number.isSafeInteger(v) && v >= -1 && v <= 1_000_000_000 ? v : fail(`Invalid ${name}.`);
export const BRIEF_OPTIONS = {
  intensity: ['7', '9', '11'],
  format: ['Music video pack', 'Shorts/Reels pack', 'Site content pack', 'Full campaign pack'],
  reaction: ['lawyer sweating through a linen suit', 'accountant coughing into spreadsheets', 'donor staring into shrimp cocktail', 'reporter freezing mid-question', 'the First Lady of the Lounge moving her chair six inches away', 'aide silently measuring the nearest exit'],
  music: ['minimalist boom-bap / spoken-word comedy', 'sleazy yacht-rock parody', 'brassy infomercial funk', 'VHS casino rap', 'luxury lounge trap'],
  visual: ['photorealistic editorial satire, luxury press conference', 'cinematic fake cruise commercial', 'VHS sponsor-read chaos', 'black marble courtroom gala', 'high-gloss product-launch disaster'],
};
export const BRIEF_FIELDS = ['title', 'concept', 'setting', 'prop', 'phrase', ...Object.keys(BRIEF_OPTIONS), 'motifs', 'includeLyrics', 'includeVideo', 'includeImage', 'includeSocial'];
const enumValue = (value, allowed, name) => allowed.includes(value) ? value : fail(`Unrecognized ${name}.`);

export function sanitizeBrief(value) {
  if (!object(value)) fail('The brief must be an object.');
  const result = {};
  for (const key of ['title', 'concept', 'setting', 'prop', 'phrase', ...Object.keys(BRIEF_OPTIONS)]) {
    if (!Object.hasOwn(value, key)) continue;
    result[key] = string(value[key], 4000, key);
    if (BRIEF_OPTIONS[key]) enumValue(result[key], BRIEF_OPTIONS[key], key);
  }
  if (Object.hasOwn(value, 'motifs')) {
    const motifs = typeof value.motifs === 'string' ? value.motifs.split(',').map((s) => s.trim()).filter(Boolean) : value.motifs;
    if (!Array.isArray(motifs) || motifs.length > 100) fail('Use at most 100 motifs.');
    result.motifs = motifs.map((v) => string(v, 4000, 'motif'));
  }
  for (const key of ['includeLyrics', 'includeVideo', 'includeImage', 'includeSocial']) {
    if (!Object.hasOwn(value, key)) continue;
    if (typeof value[key] !== 'boolean') fail(`${key} must be true or false.`);
    result[key] = value[key];
  }
  return result;
}

const categories = ['lyrics', 'video', 'image', 'site', 'sponsor', 'product', 'safety', 'custom'];
export function sanitizeTemplates(value) {
  if (!Array.isArray(value) || value.length > 300) fail('Use at most 300 custom templates.');
  return value.map((t, i) => {
    if (!object(t)) fail('Invalid custom template.');
    return {
      id: Number.isSafeInteger(t.id) ? t.id : i + 1,
      name: string(t.name ?? `Imported ${i + 1}`, 140, 'Template name'),
      category: categories.includes(t.category) ? t.category : 'custom',
      heat: string(t.heat ?? 'imported', 24, 'Template label'),
      content: string(t.content ?? '', 20_000, 'Template content'), builtIn: false,
    };
  }).filter((t) => t.content.trim());
}

export function mergeTemplates(existing, incoming, replace = false) {
  const result = replace ? [] : existing.map((t) => ({ ...t }));
  let nextId = Math.max(Date.now(), ...result.map((t) => t.id + 1));
  for (const template of incoming) {
    if (result.some((t) => t.name === template.name && t.content === template.content)) continue;
    let name = template.name;
    let index = 2;
    while (result.some((t) => t.name === name)) name = `${template.name.slice(0, 120)} (imported ${index++})`;
    result.push({ ...template, id: nextId++, name, builtIn: false });
  }
  if (result.length > 300) fail('The merged library exceeds 300 templates. Export a backup and choose Replace or reduce the file.');
  return result;
}

export function literalSubstitute(text, variables) {
  return text.replace(/\{\{([a-zA-Z0-9_]+)\}\}/g, (match, key) => Object.hasOwn(variables, key) ? variables[key] : match);
}

export function mapBriefToVariables(brief, keys) {
  const source = sanitizeBrief(brief);
  const mapped = {
    song_title: source.title, episode_title: source.title, title: source.title,
    core_concept: source.concept, concept: source.concept, luxury_setting: source.setting,
    setting: source.setting, evidence_prop: source.prop, reaction_character: source.reaction,
    must_use_phrase: source.phrase, music_style: source.music, visual_style: source.visual,
    motifs: source.motifs?.join(', '), must_use_motifs: source.motifs?.join(', '),
  };
  return Object.fromEntries(keys.filter((key) => mapped[key] !== undefined).map((key) => [key, mapped[key]]));
}

export function makeShorts(brief, previous = []) {
  const beats = ['Hook: the luxury promise', 'Reveal the very legal evidence', 'The reaction that says everything', 'Rebrand the disaster', 'Payoff and fictional-satire end card'];
  return beats.map((beat, index) => {
    const id = `short-${String(index + 1).padStart(2, '0')}`;
    const saved = previous.find((shot) => shot.id === id);
    const prompt = `${beat}. ${brief.concept ?? ''} Setting: ${brief.setting ?? ''}. Evidence: ${brief.prop ?? ''}. Reaction: ${brief.reaction ?? ''}. Visual style: ${brief.visual ?? ''}. Motifs: ${(brief.motifs ?? []).join(', ')}. Vertical 9:16 composition; keep faces, the prop and captions clear of interface overlays. Fictional Don Biggly satire.`;
    const caption = [`${brief.title || 'Booze on Hormuz'}`, 'Very legal. Very visible.', 'The lawyer has concerns.', 'Premium disaster. Same receipts.', 'Fictional satire. Discovery is coming.'][index].slice(0, 80);
    const changed = saved && (saved.prompt !== prompt || saved.caption !== caption);
    return { id, start: index * 6, end: (index + 1) * 6, duration: 6, aspectRatio: '9:16',
      prompt, caption,
      image: saved?.image ?? '', clip: saved?.clip ?? '', review: changed && (saved.image || saved.clip || saved.review !== 'planned') ? 'review' : saved?.review ?? 'planned',
    };
  });
}

export function snapshotIsCurrent(brief, snapshot, generatorVersion) {
  if (!snapshot || generatorVersion !== GENERATOR_VERSION) return false;
  const current = sanitizeBrief(brief), generated = sanitizeBrief(snapshot.brief);
  return [...new Set([...Object.keys(current), ...Object.keys(generated)])].every((key) => JSON.stringify(current[key]) === JSON.stringify(generated[key]));
}

function cleanShots(value = []) {
  if (!Array.isArray(value) || value.length > 100) fail('Invalid shot manifest.');
  return value.map((s) => {
    if (!object(s) || !Number.isFinite(s.start) || !Number.isFinite(s.end) || s.start < 0 || s.end <= s.start || s.end > 3600) fail('Invalid shot timing.');
    return { id: string(s.id, 80, 'Shot ID'), start: s.start, end: s.end, duration: s.end - s.start,
      aspectRatio: enumValue(s.aspectRatio, ['9:16', '16:9', '1:1'], 'framing'), prompt: string(s.prompt, 20_000, 'Shot prompt'),
      caption: string(s.caption ?? '', 1000, 'Caption'), image: string(s.image ?? '', 2000, 'Image reference'), clip: string(s.clip ?? '', 2000, 'Clip reference'),
      review: enumValue(s.review ?? 'planned', ['planned', 'in-progress', 'review', 'approved'], 'shot status') };
  });
}

function cleanStudio(value) {
  if (!object(value)) fail('Missing Studio session.');
  if (!object(value.variables) || Object.keys(value.variables).length > 100) fail('Use at most 100 variables.');
  const variables = {};
  for (const [key, val] of Object.entries(value.variables)) {
    if (!/^[a-zA-Z0-9_]{1,100}$/.test(key) || ['__proto__', 'constructor', 'prototype'].includes(key)) fail('Invalid variable name.');
    variables[key] = string(val, 4000, 'Variable');
  }
  return { editor: string(value.editor, 20_000, 'Editor'), variables,
    selectedTemplate: value.selectedTemplate == null ? null : string(value.selectedTemplate, 140, 'Selected template'),
    selectedTemplateSource: value.selectedTemplate == null ? null : enumValue(value.selectedTemplateSource ?? ((value.customTemplates ?? []).some((t) => t.name === value.selectedTemplate) ? 'custom' : 'builtin'), ['builtin', 'custom'], 'template source'),
    model: enumValue(value.model, ['suno', 'sora', 'veo', 'banana', 'copy', 'safety'], 'workflow'),
    polish: enumValue(value.polish, ['visitor', 'max', 'clean'], 'polish'),
    customTemplates: sanitizeTemplates(value.customTemplates ?? []),
  };
}

export function validateProject(value) {
  if (!object(value) || value.format !== PROJECT_FORMAT || value.version !== PROJECT_VERSION) fail('Unsupported creative-project format or version.');
  const tool = enumValue(value.tool, ['broadcast', 'studio'], 'tool');
  const generation = value.generation ?? { revision: 0, generatedRevision: -1 };
  if (!object(generation)) fail('Invalid generation state.');
  const result = { format: PROJECT_FORMAT, version: PROJECT_VERSION, generatorVersion: integer(value.generatorVersion ?? 1, 'generator version'), tool,
    title: string(value.title ?? '', 4000, 'Project title'), updatedAt: string(value.updatedAt ?? '', 100, 'Updated date'),
    generation: { revision: integer(generation.revision, 'revision'), generatedRevision: integer(generation.generatedRevision, 'generated revision') },
    shots: cleanShots(value.shots),
  };
  if (tool === 'broadcast') {
    result.brief = sanitizeBrief(value.brief);
    if (BRIEF_FIELDS.some((key) => !Object.hasOwn(result.brief, key))) fail('A complete project must include every brief field. Use a legacy v1 brief file for a partial brief.');
    if (generation.snapshot != null) {
      if (!object(generation.snapshot) || !object(generation.snapshot.pieces)) fail('Invalid output snapshot.');
      const pieces = {};
      for (const key of ['master', 'lyrics', 'storyboard', 'video', 'image', 'launch']) pieces[key] = string(generation.snapshot.pieces[key] ?? '', 100_000, `Output ${key}`);
      result.generation.snapshot = { brief: sanitizeBrief(generation.snapshot.brief), pieces, generated: string(generation.snapshot.generated ?? '', 100, 'Generation date') };
    }
  } else result.studio = cleanStudio(value.studio);
  return result;
}

export function parseCreativeFile(text, targetTool) {
  if (new TextEncoder().encode(text).length > MAX_FILE_BYTES) fail('File too large. Maximum 2 MB.');
  let value;
  try { value = JSON.parse(text); } catch { fail('Could not parse JSON. Your current work has not changed.'); }
  if (object(value) && value.format === PROJECT_FORMAT) {
    const project = validateProject(value);
    if (project.tool !== targetTool) fail(`This is a ${project.tool} project. Export a Studio handoff from Broadcast to use it in Studio.`);
    return { kind: 'project', project, title: project.title, templates: project.studio?.customTemplates ?? [] };
  }
  if (targetTool === 'broadcast' && object(value) && value.version === 1 && value.app === 'Biggly Broadcast Pack Generator') {
    return { kind: 'brief', brief: sanitizeBrief(value), title: value.title ?? 'Legacy brief', templates: [] };
  }
  if (targetTool === 'studio' && ((object(value) && value.version === 2 && Array.isArray(value.custom)) || Array.isArray(value))) {
    return { kind: 'library', templates: sanitizeTemplates(Array.isArray(value) ? value : value.custom), title: 'Template library' };
  }
  fail('Unrecognized file or unsupported version. Your current work has not changed.');
}

export function studioHandoff(project) {
  const source = validateProject(project);
  const editor = 'Develop a fictional Don Biggly production prompt.\nTitle: {{song_title}}\nConcept: {{core_concept}}\nSetting: {{luxury_setting}}\nEvidence: {{evidence_prop}}\nReaction: {{reaction_character}}\nPhrase: {{must_use_phrase}}\nMotifs: {{motifs}}\nKeep the satire explicit and treat every generated-media step as a proposed production task.';
  const keys = [...editor.matchAll(/\{\{(\w+)\}\}/g)].map((m) => m[1]);
  return { format: PROJECT_FORMAT, version: PROJECT_VERSION, generatorVersion: GENERATOR_VERSION, tool: 'studio', title: source.title, updatedAt: new Date().toISOString(),
    generation: { revision: 0, generatedRevision: 0 }, shots: source.shots,
    studio: { editor, variables: mapBriefToVariables(source.brief, keys), selectedTemplate: null, selectedTemplateSource: null, model: 'sora', polish: 'visitor', customTemplates: [] } };
}

export function downloadJSON(value, filename) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' }));
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function mountProjectTools({ tool, container, getProject, applyImport, notify }) {
  const bar = document.createElement('details');
  bar.className = 'project-tools';
  bar.innerHTML = `<summary>Project files &amp; device storage</summary><div class="project-actions"><button type="button" data-action="export">Export Project</button><button type="button" data-action="import">Import Project / legacy file</button>${tool === 'broadcast' ? '<button type="button" data-action="handoff">Export for Studio</button><a href="/apps/evidence-lounge-studio.html" target="_blank" rel="noopener">Open Studio ↗</a>' : ''}<button type="button" data-action="undo" hidden>Undo import</button></div><label class="device-choice"><input type="checkbox" data-action="save"> Save on this device</label><div class="project-actions"><button type="button" data-action="restore">Restore device save</button><button type="button" data-action="clear">Delete device save</button></div><p class="storage-status" role="status">Session only. Export a project to keep your work. Device saving is optional and stays in this browser.</p>`;
  container.append(bar);
  const input = document.createElement('input'); input.type = 'file'; input.accept = '.json'; input.hidden = true; bar.append(input);
  const dialog = document.createElement('dialog'); dialog.className = 'project-dialog';
  dialog.innerHTML = '<h2>Review import</h2><p data-preview></p><p>The current brief or editor changes only after you choose Apply import. Download a backup first if you want a permanent copy.</p><label data-merge-label>Custom templates <select data-merge><option value="merge">Merge — keep existing work</option><option value="replace">Replace — undo available</option></select></label><div class="project-actions"><button type="button" data-backup>Download current project backup</button><button type="button" data-cancel>Cancel</button><button type="button" data-apply>Apply import</button></div>';
  document.body.append(dialog);
  dialog.querySelector('h2').id = `project-import-heading-${tool}`;
  dialog.setAttribute('aria-labelledby', `project-import-heading-${tool}`);
  const checkbox = bar.querySelector('[data-action="save"]');
  const status = bar.querySelector('.storage-status');
  const storageKey = `boh-project-${tool}-v1`;
  let pending = null, undo = null, saving = false, returnFocus = null;
  const exportCurrent = () => downloadJSON(validateProject(getProject()), `boh-${tool}-project.json`);
  const reportError = (error) => { notify(error.message); status.textContent = error.message; };
  const save = () => {
    if (!saving) return;
    try { localStorage.setItem(storageKey, JSON.stringify(validateProject(getProject()))); status.textContent = 'Saved on this device. Export a Project for a portable backup.'; }
    catch { saving = false; checkbox.checked = false; status.textContent = 'Device storage unavailable or full. Your work is still here; use Export Project.'; }
  };
  const preview = (parsed) => {
    returnFocus = document.activeElement;
    pending = parsed;
    dialog.querySelector('[data-preview]').textContent = `${parsed.kind === 'project' ? 'Complete project' : parsed.kind === 'brief' ? 'Legacy brief' : 'Template library'}: ${parsed.title || 'Untitled'}${tool === 'studio' ? ` · ${parsed.templates.length} custom templates. Built-in templates stay unchanged. Exact name/content duplicates are skipped; name collisions are renamed.` : ''}`;
    dialog.querySelector('[data-merge-label]').hidden = tool !== 'studio';
    dialog.querySelector('[data-merge]').value = 'merge';
    dialog.showModal(); dialog.querySelector('[data-cancel]').focus();
  };
  dialog.addEventListener('close', () => { if (returnFocus instanceof HTMLElement && returnFocus.isConnected) returnFocus.focus(); });
  dialog.addEventListener('keydown', (event) => {
    if (event.key !== 'Tab') return;
    const fields = [...dialog.querySelectorAll('button, select')].filter((el) => el.getClientRects().length);
    const first = fields[0], last = fields.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  const previewFile = async (file) => {
    if (!file) return;
    try { if (file.size > MAX_FILE_BYTES) fail('File too large. Maximum 2 MB.'); preview(parseCreativeFile(await file.text(), tool)); } catch (error) { reportError(error); }
  };
  input.addEventListener('change', () => { previewFile(input.files[0]); input.value = ''; });
  dialog.querySelector('[data-backup]').addEventListener('click', exportCurrent);
  dialog.querySelector('[data-cancel]').addEventListener('click', () => dialog.close());
  dialog.querySelector('[data-apply]').addEventListener('click', () => {
    try {
      const before = validateProject(getProject());
      applyImport(pending, dialog.querySelector('[data-merge]').value);
      undo = before; bar.querySelector('[data-action="undo"]').hidden = false; dialog.close(); save(); notify('Import applied. Undo import is available.');
    } catch (error) { reportError(error); }
  });
  bar.addEventListener('click', (event) => {
    const action = event.target.closest('[data-action]')?.dataset.action;
    try {
      if (action === 'export') exportCurrent();
      if (action === 'import') input.click();
      if (action === 'handoff') { downloadJSON(studioHandoff(getProject()), 'boh-studio-handoff.json'); notify('Studio handoff exported. Open Studio and import this file.'); }
      if (action === 'undo' && undo) { applyImport({ kind: 'project', project: undo, templates: undo.studio?.customTemplates ?? [] }, 'replace'); undo = null; bar.querySelector('[data-action="undo"]').hidden = true; save(); notify('Previous session restored.'); }
      if (action === 'restore') {
        let saved; try { saved = localStorage.getItem(storageKey); } catch { fail('Device storage unavailable. Your current work is unchanged.'); }
        if (!saved) { notify('No project saved on this device.'); return; }
        preview(parseCreativeFile(saved, tool));
      }
      if (action === 'clear') {
        try { localStorage.removeItem(storageKey); } catch { fail('Could not delete the device save. Storage is unavailable.'); }
        saving = false; checkbox.checked = false; status.textContent = 'Device save deleted. Current in-memory work remains available to export.';
      }
    } catch (error) { reportError(error); }
  });
  checkbox.addEventListener('change', () => { saving = checkbox.checked; if (saving) save(); else status.textContent = 'Automatic device saving is off. Use Delete device save to remove the existing copy.'; });
  return { changed: save, previewFile, preview };
}

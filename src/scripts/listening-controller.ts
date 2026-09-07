import { formatTime, readResume, writeResume, clearResume, RESUME_WRITE_INTERVAL, type QueueTrack, type ResumePosition } from '../lib/listening';

export function initializeListeningRoom(root: HTMLElement) {
  if (root.dataset.listeningReady) return;
  let queue: QueueTrack[];
  try {
    const value: unknown = JSON.parse(root.dataset.queue || '[]');
    if (!Array.isArray(value) || !value.length) return;
    queue = value.filter((track) => track && ['id', 'source', 'title', 'slug'].every((key) => typeof track[key] === 'string'));
    if (queue.length !== value.length) return;
  } catch { return; }

  const audioById = new Map(Array.from(root.querySelectorAll<HTMLElement>('[data-listen-track-id]')).map((row) => [row.dataset.listenTrackId, row.querySelector('audio')]));
  const entries = queue.map((track) => ({ track, audio: audioById.get(track.id) }));
  if (entries.some(({ audio }) => !(audio instanceof HTMLAudioElement))) return;
  const audioElements = entries.map(({ audio }) => audio!);
  const find = <T extends HTMLElement>(name: string) => root.querySelector<T>(`[data-${name}]`)!;
  const tools = find<HTMLElement>('queue-tools');
  const player = find<HTMLElement>('mini-player');
  const playAll = find<HTMLButtonElement>('play-all');
  const toggle = find<HTMLButtonElement>('toggle');
  const previous = find<HTMLButtonElement>('previous');
  const next = find<HTMLButtonElement>('next');
  const seek = find<HTMLInputElement>('seek');
  const title = find<HTMLAnchorElement>('now-link');
  const artwork = find<HTMLImageElement>('now-art');
  const progress = find<HTMLElement>('time');
  const status = find<HTMLElement>('playback-status');
  const optIn = find<HTMLInputElement>('resume-opt-in');
  const restore = find<HTMLButtonElement>('restore');
  const clear = find<HTMLButtonElement>('clear-resume');
  const storageStatus = find<HTMLElement>('storage-status');
  if ([tools, player, playAll, toggle, previous, next, seek, title, artwork, progress, status, optIn, restore, clear, storageStatus].some((element) => !element)) return;

  let active = 0;
  let queueing = false;
  let playRequest = 0;
  let failedIndex: number | null = null;
  let lastSaved = -Infinity;
  let lastSavedSignature: string | null = null;
  let saved: ResumePosition | null = null;
  let pendingRestore: ResumePosition | null = null;
  let remembering = false;
  let hasInteracted = false;
  const current = () => audioElements[active];
  const message = (text: string) => { status.textContent = text; };
  function storage<T>(action: (store: Storage) => T): T | { ok: false; error: string } {
    try { return action(window.localStorage); }
    catch { return { ok: false, error: 'Device storage is unavailable. Playback still works.' }; }
  }

  function persist(force = false) {
    if (!remembering || !hasInteracted || pendingRestore || (!force && Date.now() - lastSaved < RESUME_WRITE_INTERVAL)) return;
    const audio = current();
    if (!Number.isFinite(audio.currentTime)) return;
    const signature = JSON.stringify([queue[active].id, queue[active].source, audio.currentTime]);
    if (signature === lastSavedSignature) return;
    lastSaved = Date.now();
    const result = storage((store) => writeResume(store, queue[active], audio.currentTime));
    if (!result.ok) {
      remembering = false; optIn.checked = false;
      storageStatus.textContent = result.error;
    } else lastSavedSignature = signature;
  }

  function mediaSession() {
    if (!hasInteracted || !('mediaSession' in navigator)) return;
    try {
      navigator.mediaSession.playbackState = current().paused ? 'paused' : 'playing';
      const duration = current().duration;
      if (Number.isFinite(duration) && duration > 0 && typeof navigator.mediaSession.setPositionState === 'function') {
        navigator.mediaSession.setPositionState({ duration, playbackRate: current().playbackRate, position: Math.min(duration, Math.max(0, current().currentTime)) });
      }
    } catch { /* Device controls are optional; native and on-page controls remain usable. */ }
  }

  function updateMetadata() {
    const track = queue[active];
    title.textContent = track.title; title.href = `/album/${encodeURIComponent(track.slug)}`;
    if (track.cover) { artwork.hidden = false; artwork.src = track.cover; }
    else { artwork.hidden = true; artwork.removeAttribute('src'); }
    if (hasInteracted && 'mediaSession' in navigator && 'MediaMetadata' in window) {
      try {
        navigator.mediaSession.metadata = new MediaMetadata({ title: track.title, artist: 'Booze on Hormuz™', album: 'Booze on Hormuz', artwork: track.cover ? [{ src: new URL(track.cover, location.href).href }] : [] });
      } catch { /* Unsupported metadata must not block playback. */ }
    }
    updateControls();
  }

  function updateControls() {
    const audio = current();
    previous.disabled = active <= 0;
    next.disabled = active >= queue.length - 1;
    toggle.textContent = audio.paused ? 'Play' : 'Pause';
    toggle.setAttribute('aria-label', `${audio.paused ? 'Play' : 'Pause'} ${queue[active].title}`);
    const duration = Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : 0;
    seek.disabled = !duration;
    seek.max = String(duration || 100);
    seek.value = String(Math.min(duration || 0, audio.currentTime));
    seek.setAttribute('aria-valuetext', `${formatTime(audio.currentTime)} of ${formatTime(duration)}`);
    progress.textContent = `${formatTime(audio.currentTime)} / ${formatTime(duration)}`;
    mediaSession();
  }

  function pauseOthers(index: number) {
    audioElements.forEach((audio, other) => { if (other !== index) audio.pause(); });
  }

  async function playAt(index: number, continuous = queueing, fromStart = false) {
    if (index < 0 || index >= queue.length) return;
    const request = ++playRequest;
    hasInteracted = true;
    pendingRestore = null;
    pauseOthers(index);
    active = index; queueing = continuous; failedIndex = null;
    const audio = current();
    updateMetadata();
    if (fromStart) { try { audio.currentTime = 0; } catch { /* Metadata may not be ready yet. */ } }
    try {
      await audio.play();
      if (request !== playRequest || active !== index) {
        if (audio !== current()) audio.pause();
        return;
      }
      message(`Playing ${queue[active].title}.${queueing ? ' The queue continues when this track ends.' : ''}`);
    } catch {
      if (request !== playRequest || active !== index) return;
      queueing = false; failedIndex = index;
      message(`Could not start ${queue[active].title}. Try Play again, another track, or its native audio controls.`);
    }
    updateControls();
  }

  function stopPlayback() {
    playRequest += 1;
    current().pause();
    persist(true);
    updateControls();
  }

  function applySavedPosition() {
    if (!pendingRestore) return;
    const audio = current();
    if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;
    const position = pendingRestore.position;
    pendingRestore = null;
    if (position >= audio.duration) {
      storageStatus.textContent = 'That position is beyond this track’s duration. Playback is ready from the start.';
      return;
    }
    try {
      audio.currentTime = position;
      storageStatus.textContent = `Restored ${queue[active].title} at ${formatTime(position)}. Press Play when you’re ready.`;
      updateControls();
    } catch { storageStatus.textContent = 'This browser could not restore the position. You can still play the track from the start.'; }
  }

  audioElements.forEach((audio, index) => {
    audio.addEventListener('play', () => {
      hasInteracted = true;
      failedIndex = null;
      pendingRestore = null;
      pauseOthers(index);
      const changed = active !== index;
      active = index;
      updateMetadata();
      if (changed || !queueing) message(`Playing ${queue[index].title}.`);
    });
    audio.addEventListener('pause', () => {
      if (index === active) {
        persist(true); updateControls();
        if (!audio.ended && !audio.error && failedIndex !== index) message(`Paused ${queue[index].title}.${queueing ? ' Press Play to continue the queue.' : ''}`);
      }
    });
    audio.addEventListener('timeupdate', () => { if (index === active) { updateControls(); persist(); } });
    audio.addEventListener('loadedmetadata', () => { if (index === active) { applySavedPosition(); updateControls(); } });
    audio.addEventListener('durationchange', () => { if (index === active) updateControls(); });
    audio.addEventListener('error', () => {
      if (index !== active) return;
      queueing = false; pendingRestore = null; failedIndex = index;
      message(`Audio unavailable for ${queue[index].title}. Try another track or open its track page.`);
      updateControls();
    });
    audio.addEventListener('ended', () => {
      if (index !== active) return;
      if (queueing && index + 1 < queue.length) void playAt(index + 1, true, true);
      else { queueing = false; message('Track finished. Choose another track or play again.'); updateControls(); }
    });
  });

  playAll.addEventListener('click', () => { void playAt(0, true, true); });
  toggle.addEventListener('click', () => { if (current().paused) void playAt(active); else stopPlayback(); });
  previous.addEventListener('click', () => { void playAt(active - 1, queueing, true); });
  next.addEventListener('click', () => { void playAt(active + 1, queueing, true); });
  seek.addEventListener('input', () => {
    const value = Number(seek.value);
    if (Number.isFinite(current().duration) && Number.isFinite(value)) current().currentTime = Math.max(0, Math.min(value, current().duration));
    updateControls();
  });
  seek.addEventListener('change', () => persist(true));
  artwork.addEventListener('error', () => { artwork.hidden = true; });

  optIn.addEventListener('change', () => {
    remembering = optIn.checked;
    if (remembering) {
      lastSavedSignature = null;
      hasInteracted = true;
      pendingRestore = null;
      persist(true);
      if (remembering) storageStatus.textContent = 'Remembering is on for this device. Your position is saved as you listen.';
    } else {
      const result = storage(clearResume);
      saved = null; restore.hidden = true;
      storageStatus.textContent = result.ok ? 'Remembering is off. Saved position cleared.' : result.error;
    }
  });
  clear.addEventListener('click', () => {
    remembering = false; optIn.checked = false; pendingRestore = null;
    lastSavedSignature = null;
    const result = storage(clearResume);
    if (result.ok) { saved = null; restore.hidden = true; }
    storageStatus.textContent = result.ok ? 'Saved position cleared. Remembering is off; current playback is unchanged.' : result.error;
  });
  restore.addEventListener('click', () => {
    if (!saved) return;
    const index = queue.findIndex((track) => track.id === saved!.trackId && track.source === saved!.source);
    if (index < 0) return;
    playRequest += 1; queueing = false;
    audioElements.forEach((audio) => audio.pause());
    active = index; pendingRestore = saved; hasInteracted = true;
    updateMetadata();
    if (current().readyState >= 1) applySavedPosition();
    else { current().preload = 'metadata'; current().load(); }
    restore.hidden = true;
    toggle.focus({ preventScroll: true });
  });

  const stored = storage((store) => readResume(store, queue));
  if ('position' in stored && stored.position) {
    saved = stored.position;
    remembering = true; optIn.checked = true;
    restore.hidden = false;
    const track = queue.find((item) => item.id === saved!.trackId)!;
    restore.textContent = `Restore ${track.title} at ${formatTime(saved.position)}`;
    storageStatus.textContent = 'A position is saved. Restore it when you choose; audio stays paused.';
  } else if (stored.error) storageStatus.textContent = stored.error;

  if ('mediaSession' in navigator) {
    const actions: Partial<Record<MediaSessionAction, MediaSessionActionHandler>> = {
      play: () => { void playAt(active); }, pause: stopPlayback,
      previoustrack: () => { void playAt(active - 1, queueing, true); },
      nexttrack: () => { void playAt(active + 1, queueing, true); },
      seekto: (details) => {
        if (details.seekTime !== undefined && Number.isFinite(current().duration)) {
          current().currentTime = Math.max(0, Math.min(details.seekTime, current().duration));
          updateControls(); persist(true);
        }
      },
    };
    Object.entries(actions).forEach(([action, handler]) => {
      try { navigator.mediaSession.setActionHandler(action as MediaSessionAction, handler!); } catch { /* Per-action support varies. */ }
    });
  }
  // Keep keyboard focus clear of the sticky controls without moving the panel
  // between pointer-down and click (which would cancel button activation).
  root.addEventListener('focusin', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement) || !target.closest('[data-listen-track-id]')) return;
    requestAnimationFrame(() => {
      const focused = target.getBoundingClientRect();
      const controls = player.getBoundingClientRect();
      if (focused.right > controls.left && focused.left < controls.right && focused.bottom > controls.top && focused.top < controls.bottom) {
        window.scrollBy({ top: focused.bottom - controls.top + 24, behavior: 'instant' });
      }
    });
  });
  window.addEventListener('pagehide', () => persist(true));
  updateMetadata();
  root.dataset.listeningReady = 'true';
  tools.hidden = false; player.hidden = false;
}

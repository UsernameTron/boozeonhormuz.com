import type { Track } from './media';
import { playableTracks } from './media.ts';

export interface QueueTrack {
  id: string;
  title: string;
  slug: string;
  source: string;
  sourceVersion?: string;
  cover?: string;
}
export const RESUME_KEY = 'boh.listening.resume.v1';
export const RESUME_WRITE_INTERVAL = 5000;
export interface ResumePosition {
  version: 1;
  enabled: true;
  trackId: string;
  source: string;
  sourceVersion: string;
  position: number;
  savedAt: number;
}

export function orderedListeningTracks(tracks: Track[]) {
  return playableTracks(tracks).sort((a, b) => Number(Boolean(b.data.featured)) - Number(Boolean(a.data.featured))
    || a.data.trackNumber - b.data.trackNumber || a.id.localeCompare(b.id));
}

// Page eligibility deliberately remains broader: previews may have no audio yet.
export function listeningQueue(tracks: Track[]): QueueTrack[] {
  return orderedListeningTracks(tracks)
    .filter((track) => typeof track.data.audio === 'string' && track.data.audio.trim().length > 0)
    .map((track) => ({ id: track.id, title: track.data.title, slug: track.data.slug, source: track.data.audio!.trim(), cover: track.data.cover }));
}

export function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const whole = Math.floor(seconds);
  return Math.floor(whole / 60) + ':' + String(whole % 60).padStart(2, '0');
}

export function validateResume(value: unknown, queue: QueueTrack[], now = Date.now()): ResumePosition | null {
  if (!value || typeof value !== 'object') return null;
  const candidate = value as Partial<ResumePosition>;
  if (candidate.version !== 1 || candidate.enabled !== true || typeof candidate.trackId !== 'string' || typeof candidate.source !== 'string') return null;
  if (typeof candidate.position !== 'number' || !Number.isFinite(candidate.position) || candidate.position < 0 || candidate.position > 86400) return null;
  if (typeof candidate.savedAt !== 'number' || !Number.isSafeInteger(candidate.savedAt) || candidate.savedAt <= 0 || candidate.savedAt > now + 60000) return null;
  if (!queue.some((track) => track.id === candidate.trackId && track.source === candidate.source && (track.sourceVersion || track.source) === candidate.sourceVersion)) return null;
  return { version: 1, enabled: true, trackId: candidate.trackId, source: candidate.source, sourceVersion: candidate.sourceVersion!, position: candidate.position, savedAt: candidate.savedAt };
}

export function readResume(storage: Storage, queue: QueueTrack[]) {
  try {
    const raw = storage.getItem(RESUME_KEY);
    if (raw === null) return { position: null, error: null };
    if (raw.length > 12000) throw new Error('Saved position too large');
    const position = validateResume(JSON.parse(raw), queue);
    return { position, error: position ? null : 'That saved position is no longer available. Choose a track to start again, or clear the saved position.' };
  } catch {
    return { position: null, error: 'Device storage is unavailable or unreadable. Playback still works; you can clear the saved position below.' };
  }
}

export function writeResume(storage: Storage, track: QueueTrack, position: number, now = Date.now()) {
  try {
    const value: ResumePosition = { version: 1, enabled: true, trackId: track.id, source: track.source, sourceVersion: track.sourceVersion || track.source, position, savedAt: now };
    if (!validateResume(value, [track], now)) return { ok: false, error: 'This playback position could not be saved.' };
    storage.setItem(RESUME_KEY, JSON.stringify(value));
    return { ok: true, error: null };
  } catch {
    return { ok: false, error: 'This browser could not save your position. Playback still works.' };
  }
}

export function clearResume(storage: Storage) {
  try { storage.removeItem(RESUME_KEY); return { ok: true, error: null }; }
  catch { return { ok: false, error: 'This browser could not clear storage. Use its site-data settings to remove saved positions.' }; }
}

// Shared media-library helpers — status rules live here, not in pages.
import type { CollectionEntry } from 'astro:content';

export type Track = CollectionEntry<'tracks'>;
export type Video = CollectionEntry<'videos'>;
export type MediaImage = CollectionEntry<'images'>;

// Tracklist order. `hidden` renders nowhere; `unreleased` renders as a locked row.
export const listedTracks = (tracks: Track[]) =>
  tracks
    .filter((t) => !t.data.draft && t.data.status !== 'hidden')
    .sort((a, b) => a.data.trackNumber - b.data.trackNumber);

// Tracks that get their own /album/<slug> page (and audio surfaces).
export const playableTracks = (tracks: Track[]) =>
  listedTracks(tracks).filter((t) => t.data.status === 'preview' || t.data.status === 'released');

export const liveVideos = (videos: Video[]) =>
  videos
    .filter((v) => !v.data.draft)
    .sort((a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf());

export const featuredFirst = <T extends { data: { featured: boolean } }>(entries: T[]) =>
  [...entries].sort((a, b) => Number(b.data.featured) - Number(a.data.featured));

export type VideoOrientation = '16:9' | '9:16' | '1:1';
export const videoAspect: Record<VideoOrientation, string> = {
  '16:9': 'aspect-video', '9:16': 'aspect-[9/16]', '1:1': 'aspect-square',
};
export const videoThumbnail = (video: { thumbnail?: string; youtubeId?: string }) =>
  video.thumbnail ?? (video.youtubeId ? `https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg` : undefined);

// Both collections own /watch/<slug>; fail before a collision silently replaces a page.
export function validateWatchSlugs(entries: { id: string; data: { slug: string } }[]) {
  const slugs = new Set<string>();
  for (const entry of entries) {
    if (slugs.has(entry.data.slug)) throw new Error(`Duplicate public watch slug: ${entry.data.slug}`);
    slugs.add(entry.data.slug);
  }
}

export const liveImages = (images: MediaImage[]) => images.filter((i) => !i.data.draft);

export const videoTypeLabel: Record<Video['data']['type'], string> = {
  'music-video': 'Music Video',
  performance: 'Performance',
  sketch: 'Sketch',
  short: 'Short',
};

export const imageTypeLabel: Record<MediaImage['data']['type'], string> = {
  still: 'Still',
  poster: 'Poster',
  'fake-ad': 'Fake Ad',
  artwork: 'Artwork',
  production: 'Production',
  frame: 'Frame',
  bts: 'Behind the Scenes',
};

// "3:14" → "PT3M14S" for schema.org VideoObject; undefined stays undefined.
export const toISODuration = (duration?: string) => {
  if (!duration) return undefined;
  const [m, s] = duration.split(':').map(Number);
  if (Number.isNaN(m) || Number.isNaN(s)) return undefined;
  return `PT${m}M${s}S`;
};

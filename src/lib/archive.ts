import type { CollectionEntry } from 'astro:content';
import { playableTracks, liveVideos, liveImages, videoTypeLabel, imageTypeLabel, videoThumbnail, type VideoOrientation } from './media.ts';

export interface ArchiveItem {
  id: string;
  kind: 'art' | 'track' | 'video';
  category: string;
  label: string;
  title: string;
  description: string;
  href: string;
  thumbnail?: string;
  full?: string;
  alt: string;
  caption?: string;
  orientation?: VideoOrientation;
  track?: { title: string; href: string };
}
export type Artwork = ArchiveItem & { kind: 'art'; full: string };
export interface Catalog {
  tracks: CollectionEntry<'tracks'>[];
  videos: CollectionEntry<'videos'>[];
  images: CollectionEntry<'images'>[];
  evidence: CollectionEntry<'evidence'>[];
}

// Preserve the collection ID, including nested paths, with a URL-safe reversible
// encoding. Literal ~ is encoded too, so "a/b" and "a~2Fb" never collide.
export function qualifiedId(collection: string, id: string) {
  const encoded = encodeURIComponent(id).replace(/[!'()*~]/g, (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`).replaceAll('%', '~');
  return `${collection}--${encoded}`;
}
export const artHref = (collection: 'images' | 'evidence', id: string) => `/art/${qualifiedId(collection, id)}`;
export const isArtwork = (item: ArchiveItem): item is Artwork => item.kind === 'art' && typeof item.full === 'string';

export function buildArchive(catalog: Catalog): ArchiveItem[] {
  const tracks = playableTracks(catalog.tracks);
  const relatedTrack = (id?: string) => {
    const track = tracks.find((candidate) => candidate.id === id);
    return track ? { title: track.data.title, href: `/album/${track.data.slug}` } : undefined;
  };
  return [
    ...tracks.map((track): ArchiveItem => ({
      id: qualifiedId('tracks', track.id), kind: 'track', category: 'track', label: 'Track', title: track.data.title,
      description: track.data.description ?? '', href: `/album/${track.data.slug}`, thumbnail: track.data.cover, alt: `Cover art for ${track.data.title}`,
    })),
    ...liveVideos(catalog.videos).map((video): ArchiveItem => ({
      id: qualifiedId('videos', video.id), kind: 'video', category: video.data.type, label: videoTypeLabel[video.data.type], title: video.data.title,
      description: video.data.description, href: `/watch/${video.data.slug}`, thumbnail: videoThumbnail(video.data), alt: video.data.title,
      orientation: video.data.orientation, track: relatedTrack(video.data.track?.id),
    })),
    ...liveImages(catalog.images).map((image): Artwork => ({
      id: qualifiedId('images', image.id), kind: 'art', category: image.data.type === 'poster' || image.data.type === 'fake-ad' ? 'poster' : image.data.type === 'bts' ? 'bts' : 'image',
      label: imageTypeLabel[image.data.type], title: image.data.title, description: image.data.caption ?? '', href: artHref('images', image.id),
      thumbnail: image.data.thumb ?? image.data.image, full: image.data.image, alt: image.data.alt, caption: image.data.caption, track: relatedTrack(image.data.track?.id),
    })),
    ...catalog.evidence.flatMap((evidence): Artwork[] => {
      const data = evidence.data;
      if (data.draft || (data.kind !== 'titlecard' && data.kind !== 'gallery')) return [];
      return [{ id: qualifiedId('evidence', evidence.id), kind: 'art', category: 'image', label: data.kind === 'titlecard' ? 'Title Card' : 'Exhibit',
        title: data.title, description: '', href: artHref('evidence', evidence.id), thumbnail: data.image, full: data.image, alt: data.title }];
    }),
  ];
}

export function filterArchive<T extends Pick<ArchiveItem, 'category' | 'title' | 'description' | 'caption'> & { track?: { title: string } }>(items: T[], query: string, category: string) {
  const terms = query.trim().toLocaleLowerCase('en-US').split(/\s+/).filter(Boolean);
  const knownCategory = items.some((item) => item.category === category) ? category : 'all';
  return items.filter((item) => {
    const text = `${item.title} ${item.description} ${item.caption ?? ''} ${item.track?.title ?? ''}`.toLocaleLowerCase('en-US');
    return (knownCategory === 'all' || item.category === knownCategory) && terms.every((term) => text.includes(term));
  });
}

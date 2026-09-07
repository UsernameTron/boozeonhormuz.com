import { defineCollection, reference } from 'astro:content';
import { z } from 'astro:schema';
import { glob, file } from 'astro/loaders';
import { statSync } from 'node:fs';
import path from 'node:path';

const publicAssetExists = (src: string) => {
  if (/^https:\/\//.test(src)) return URL.canParse(src);
  if (!src.startsWith('/') || src.startsWith('//') || src.includes('\\')) return false;
  const publicDir = path.resolve('public');
  const asset = path.resolve(publicDir, `.${src}`);
  if (!asset.startsWith(publicDir + path.sep)) return false;
  try { return statSync(asset).isFile(); } catch { return false; }
};

// Schemas map to RENDERING TEMPLATES, not taxonomy.
// `evidence` is a discriminated union on `kind` so a new artifact type is a new
// branch, not a new collection. Everything is content-free at launch.

const episodes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/episodes' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    publishDate: z.coerce.date(),
    youtubeId: z.string().optional(),
    summary: z.string(),
    draft: z.boolean().default(true),
  }),
});

const products = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/products' }),
  schema: z.object({
    name: z.string(),
    slug: z.string(),
    tagline: z.string(),
    disclaimer: z
      .string()
      .default('Not available for purchase because it would be insane. Watch the sketch instead.'),
    draft: z.boolean().default(true),
  }),
});

const sponsors = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/sponsors' }),
  schema: z.object({
    name: z.string(),
    read: z.string(),
    episode: reference('episodes').optional(),
    draft: z.boolean().default(true),
  }),
});

// Polymorphic Evidence Lounge — one collection absorbs every artifact type.
const evidence = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/evidence' }),
  schema: z.discriminatedUnion('kind', [
    z.object({ kind: z.literal('clip'), title: z.string(), youtubeId: z.string(), draft: z.boolean().default(true) }),
    z.object({ kind: z.literal('titlecard'), title: z.string(), image: z.string(), draft: z.boolean().default(true) }),
    z.object({ kind: z.literal('prompt'), title: z.string(), body: z.string(), draft: z.boolean().default(true) }),
    z.object({ kind: z.literal('commercial'), title: z.string(), youtubeId: z.string(), draft: z.boolean().default(true) }),
    z.object({ kind: z.literal('lowerthird'), title: z.string(), text: z.string(), draft: z.boolean().default(true) }),
    z.object({ kind: z.literal('gallery'), title: z.string(), image: z.string(), draft: z.boolean().default(true) }),
    z.object({ kind: z.literal('song'), title: z.string(), audioUrl: z.string().optional(), lyrics: z.string().optional(), draft: z.boolean().default(true) }),
  ]),
});

// Quotes are data, not pages — YAML file loader.
const quotes = defineCollection({
  loader: file('./src/data/quotes.yaml'),
  schema: z.object({
    id: z.string(),
    text: z.string().max(120),
    episode: z.string().optional(),
  }),
});

// ── Media library (the makeover's center of gravity) ─────────────────────────
// Four collections model the whole catalog: albums ← tracks ← videos/images.
// Nothing is hard-coded into pages: adding one track file (plus its optional
// videos/images) makes it appear on /album, /listen, /archive, the homepage,
// and its own /album/<slug> page. Web-delivery assets ship under `public/`
// (audio/, video/, covers/, stills/); production masters NEVER enter the repo.

// Track lifecycle — the album is expected to be UNFINISHED while live:
//   unreleased → listed on the tracklist as a locked row (no page, no audio)
//   preview    → full track page, audio may be partial/demo
//   released   → full track page
//   hidden     → exists in the repo, rendered nowhere
const trackStatus = z.enum(['unreleased', 'preview', 'released', 'hidden']);

const albums = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/albums' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    artwork: z.string().optional(), // absent ⇒ square placeholder, layout never breaks
    tagline: z.string(), // the one-sentence premise
    status: z.enum(['in-progress', 'preview', 'released']).default('in-progress'),
    releaseDate: z.coerce.date().optional(),
    credits: z.array(z.string()).default([]),
    draft: z.boolean().default(true),
  }),
});

const tracks = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/tracks' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    trackNumber: z.number().int().positive(),
    album: reference('albums'),
    status: trackStatus.default('unreleased'),
    featured: z.boolean().default(false), // surfaces on homepage + /listen top slots
    description: z.string().optional(),
    cover: z.string().optional(), // /covers/<file>.webp — absent ⇒ placeholder
    audio: z.string().optional(), // /audio/<file>.mp3 — web delivery, never the master
    duration: z.string().regex(/^\d+:\d{2}$/).optional(), // m:ss
    releaseDate: z.coerce.date().optional(),
    credits: z.array(z.string()).default([]),
    streamingLinks: z.array(z.object({ label: z.string(), url: z.url() })).default([]),
    draft: z.boolean().default(true),
  }),
});

const videos = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/videos' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    type: z.enum(['music-video', 'performance', 'sketch', 'short']),
    track: reference('tracks').optional(), // a video knows its song
    youtubeId: z.string().optional(), // preferred delivery
    src: z.string().optional(), // self-hosted fallback (/video/<file>.mp4)
    thumbnail: z.string().optional(), // unique per video (video-SEO) — absent ⇒ placeholder
    duration: z.string().regex(/^\d+:\d{2}$/).optional(), // m:ss
    description: z.string(), // unique per video (video-SEO)
    transcript: z.string().optional(),
    captions: z.array(z.object({
      src: z.string(), // WebVTT, separate from the plain-text transcript
      srclang: z.string().min(2),
      label: z.string().min(1),
      default: z.boolean().default(false),
    })).default([]),
    orientation: z.enum(['16:9', '9:16', '1:1']).default('16:9'),
    featured: z.boolean().default(false), // homepage Featured Film / Performance slots
    hero: z.boolean().default(false), // THE homepage hero video — flag exactly one
    publishDate: z.coerce.date(),
    draft: z.boolean().default(true),
  }).superRefine((video, context) => {
    if (video.draft) return;
    if (!video.youtubeId && !video.src) context.addIssue({ code: 'custom', path: ['src'], message: 'A public video needs a YouTube ID or playable source.' });
    if (video.youtubeId && !/^[A-Za-z0-9_-]{11}$/.test(video.youtubeId)) context.addIssue({ code: 'custom', path: ['youtubeId'], message: 'Use the 11-character YouTube video ID.' });
    if (video.src && !publicAssetExists(video.src)) context.addIssue({ code: 'custom', path: ['src'], message: 'Video source must be an existing public file or HTTPS URL.' });
    video.captions.forEach((caption, index) => {
      if (!publicAssetExists(caption.src) || !/\.vtt(?:[?#].*)?$/i.test(caption.src)) context.addIssue({ code: 'custom', path: ['captions', index, 'src'], message: 'Captions must reference an existing public or HTTPS WebVTT file.' });
    });
    if (video.captions.filter((caption) => caption.default).length > 1) context.addIssue({ code: 'custom', path: ['captions'], message: 'Choose at most one default caption track.' });
  }),
});

const images = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/images' }),
  schema: z.object({
    title: z.string(),
    type: z.enum(['still', 'poster', 'fake-ad', 'artwork', 'production', 'frame', 'bts']),
    track: reference('tracks').optional(), // an image knows its song
    image: z.string(), // /stills/<file>.webp — web delivery size
    thumb: z.string().optional(), // grid-size variant; absent ⇒ `image` is used
    alt: z.string(),
    caption: z.string().optional(),
    featured: z.boolean().default(false), // homepage Visual Evidence grid
    draft: z.boolean().default(true),
  }),
});

export const collections = { episodes, products, sponsors, evidence, quotes, albums, tracks, videos, images };

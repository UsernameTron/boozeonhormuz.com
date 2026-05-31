import { defineCollection, reference } from 'astro:content';
import { z } from 'astro:schema';
import { glob, file } from 'astro/loaders';

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

export const collections = { episodes, products, sponsors, evidence, quotes };

# Booze on Hormuz

A static Astro 6 site at [boozeonhormuz.com](https://boozeonhormuz.com) — a satirical luxury brand on the surface, the content archive for the *Who the Hell Is Don Biggly?* sketch series underneath.

> **Parody.** Booze on Hormuz and "Don Biggly" are works of satire and fiction. No affiliation with or statement of fact about any real person is intended or implied.

## Status

**Foundation live, content-free.** Phase-01 stood up the build-and-deploy pipe; real content arrives in a later phase. Push to `main` → GitHub Actions builds → GitHub Pages serves the apex domain over HTTPS.

## Stack

- **Astro 6.4.2** (static, no adapter)
- **Tailwind 4.2.0** via `@tailwindcss/vite`
- **Fraunces + Inter** variable fonts, self-hosted (Fontsource)
- **GitHub Pages** + GitHub Actions (`withastro/action@v6`)

## Install & run

```bash
npm ci            # install from the committed lockfile
npm run dev       # dev server at http://localhost:4321
npm run build     # static build → dist/
npm run preview   # preview the production build
npx astro check   # typecheck
```

Requires Node 22+ (Node 24 in CI; see `.nvmrc`).

## Structure

```
src/content.config.ts   content schema — 5 collections (evidence is polymorphic)
src/layouts/            BaseLayout (global shell + parody disclaimer)
src/components/         Nav, Footer, PageHeader, YouTubeEmbed, EvidenceCard, + typed cards
src/pages/              / · /evidence-lounge · /watch[/slug] · /products[/slug] ·
                        /sponsor-reads · /quotes · /about
src/styles/global.css   Tailwind entry + brand design tokens
public/                 static assets + CNAME (custom domain)
.github/workflows/      deploy pipeline
.planning/              project planning (GSD)
```

The site is content-free: every route renders a deadpan empty state until content is added.

## Deploy

Every push to `main` deploys automatically. No manual steps.

## Author

C. Pete Connor.

# Booze on Hormuz

A static Astro 6 site at [boozeonhormuz.com](https://boozeonhormuz.com) — a satirical luxury brand on the surface, the content archive for the *Who the Hell Is Don Biggly?* sketch series underneath.

> **Parody.** Booze on Hormuz and "Don Biggly" are works of satire and fiction. No affiliation with or statement of fact about any real person is intended or implied.

## Status

**Live and shipped (M01).** Foundation, full page-shell IA, production polish (OG/sitemap/robots/analytics, `/legal`, Lighthouse CI), and the Creative Tools suite are all merged and deployed. The Evidence Lounge holds its first title-card exhibits; remaining collections render deadpan empty states until content is dropped in (owner-paced). Push to `main` → GitHub Actions builds → GitHub Pages serves the apex domain over HTTPS.

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
                        /sponsor-reads · /quotes · /about · /legal ·
                        /tools (hub) + /tools/broadcast-room + /tools/evidence-lounge-studio + /tools/safety
src/styles/global.css   Tailwind entry + brand design tokens
public/apps/            standalone visitor prompt-generator tools (iframe-embedded by /tools)
public/fonts/           self-hosted tool fonts (Archivo/Inter/JetBrains Mono, vendored woff2)
public/                 static assets + CNAME (custom domain)
.github/workflows/      deploy pipeline + Lighthouse CI
.planning/              project planning (GSD)
```

Most routes render a deadpan empty state until content is added; the Evidence Lounge has its first exhibits.

## Creative Tools

`/tools` hosts two browser-only prompt generators for the *Don Biggly* satire — the **Biggly Broadcast Pack Generator** (one brief → a full content kit) and the **Evidence Lounge Prompt Generator** (a 20-template workbench). They produce copy-ready prompts for Suno / Sora / Veo / Gemini / ChatGPT / Claude — no login, no API key, no backend, nothing stored on a server. Both score 1.0 on Lighthouse accessibility.

## Deploy

Every push to `main` deploys automatically. No manual steps.

## Author

C. Pete Connor.

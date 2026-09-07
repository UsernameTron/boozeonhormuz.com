# RUNBOOK — boozeonhormuz.com Foundation

> Historical foundation reference, not an executable deployment runbook. Its Astro 5, hosting alternatives, DNS, first-push and phase instructions are superseded by the Astro 6 repository and [docs/DEVOPS-HANDOFF.md](docs/DEVOPS-HANDOFF.md). These documents describe the current repository revision; confirm the deployed SHA in Actions. Publishing requires explicit owner approval, and no live settings change is implied. Do not rerun the scaffold or historical deployment commands against the existing site.

| Field | Value |
|---|---|
| **Goal** | Live, correctly-architected Astro 5 foundation on a custom domain, content-free, ready for content |
| **Surface** | Claude Code terminal, working dir `~/projects/boozeonhormuz-com/` |
| **Estimated** | Phase 0–2: ~2 hours. Phase 3 deferred. |
| **Source of truth** | This file. Every step names where, what, and what you should see. |

---

## DECISIONS LOCKED (read before executing)

### Decision 1 — Framework: Astro 5 (static)

**Why Astro over 11ty / Hugo / Zola:** The Evidence Lounge is a heterogeneous archive — clips, title cards, prompts, commercials, lower-thirds, gallery images, songs — all rendered in one unified surface. That demands component composition with type-aware rendering, which Astro does natively and the others fake awkwardly. Astro also gives typed content collections (Zod schemas catch bad content at build) and the best static image pipeline in the ecosystem. **Trade-off accepted:** slightly slower builds and a Node/npm dependency vs Hugo's single binary. For a site that updates weekly with rich media, composition wins over raw build speed.

**No SSR adapter.** Pure static. `output: 'static'` (the default). Do **not** install `@astrojs/cloudflare` — that's for server rendering and will route you into the Workers trap (see Decision 2).

### Decision 2 — Host: Cloudflare Pages (primary)

**Why Cloudflare Pages over GitHub Pages for this site:**
- **Unlimited bandwidth** on free tier (GitHub Pages soft-caps at ~100 GB/mo). A video/image archive will blow past GitHub's soft cap.
- **Free, cookieless, privacy-preserving analytics** built in — no third-party snippet, no cookie banner obligation.
- **R2 object storage** with zero egress fees for hosting large media (vs cramming video into the repo).
- **Per-branch preview deploys** — every PR gets a live URL to review before merge.
- **Global edge CDN** — lower TTFB worldwide than GitHub's CDN.

**Trade-offs accepted:**
- Requires moving the domain's **nameservers to Cloudflare** (one-time, free, ~24–48h propagation). This replaces the GitHub Pages A records. For boozeonhormuz.com there's no email forwarding or other Namecheap-level DNS config to break, so the migration is clean.
- **The Pages-vs-Workers UI trap (documented Nov 2025):** Cloudflare is merging Pages into Workers, and the dashboard can silently route a static site to `*.workers.dev` instead of `*.pages.dev`. Phase 2 documents the exact path that avoids this.

**GitHub Pages remains a valid fallback** if you want zero DNS rework and to ship today. The entire build (Phase 0–1) is host-agnostic; only Phase 2 branches. The GitHub Pages path is in **Appendix A**.

### Decision 3 — Content model: 5 collections, one polymorphic

The brief implies ~11 content types. Four parallel collections (the original mistake) leaves five types homeless. The correct model maps collections to **rendering templates**, not to content taxonomy:

| Collection | Loader | Renders as | Absorbs |
|---|---|---|---|
| `episodes` | glob markdown | Episode pages (`/watch/[slug]`) | the show spine |
| `products` | glob markdown | Product pages (`/products/[slug]`) | fake products |
| `sponsors` | glob markdown | Sponsor-reads list | sponsor reads |
| `evidence` | glob markdown, **discriminated union on `kind`** | Unified Evidence Lounge archive | clips, title cards, AI prompts, commercials, lower-thirds, gallery images, songs |
| `quotes` | **YAML file loader** | Quote-card grid | one-line quotes (data, not pages) |

The `evidence` discriminated union is the key fix: new artifact types become a new branch in one Zod union, not a new collection + migration.

### Decision 4 — Styling: Tailwind v4, pinned exactly

Tailwind v4 ships breaking changes in **minor** releases (maintainers say so explicitly). On a site that gets sporadic attention, an unpinned `npm install` six months from now could break your theme. **Mandatory:** install at an exact patch with `--save-exact`, commit `package-lock.json`, use `npm ci` (not `npm install`) in CI. **Conservative alternative:** Tailwind v3 (mature, no breaking minors) with the legacy `@astrojs/tailwind` integration — documented in Appendix B if you want maximum stability over v4 features.

### Decision 5 — Fonts, images, video, legal: decided now

- **Fonts (self-hosted, no Google third-party load):** Display = **Fraunces Variable** (a high-contrast "old-style" serif with optical-size + SOFT + WONK axes — reads either elegant or absurd-luxury, perfect for satire-luxury). Body = **Inter Variable**. Via Fontsource. `font-display: swap`, preload the display face.
- **Images:** stored in `src/assets/`, rendered through Astro `<Image>`/`<Picture>` → AVIF + WebP with width descriptors. Hero/promo imagery generated via GPT-4o (per your standing preference). Aspect ratios defined in the design tokens.
- **Video:** lite-embed pattern via `astro-embed` (`<YouTube>`), which renders a thumbnail + click-to-load. Avoids loading YouTube's tracking JS on page load and protects Lighthouse. Never raw `<iframe>`.
- **OG social cards:** generated at build time via `astro-og-canvas` so every episode/product/evidence item gets a branded share card automatically.
- **Legal pre-flight (Phase 0):** trademark search on "Booze on Hormuz", a documented DMCA agent + counter-notice posture, a right-of-publicity sanity check on the "Don Biggly" character, and the parody disclaimer rendered on **every** page via the base layout — not per-page.

---

## ARCHITECTURE (load-bearing — this is how you'll debug "why isn't my episode showing up")

```
BUILD TIME (npm run build / CI)                          REQUEST TIME (visitor)
─────────────────────────────────                       ──────────────────────────
src/content/episodes/*.md  ─┐
src/content/products/*.md   ├─► Astro content layer ─┐
src/content/sponsors/*.md   │   (Zod-validates each)  │
src/content/evidence/*.md   │   draft:true → excluded │
src/data/quotes.yaml       ─┘   from production build │
                                                       ▼
src/assets/*.{jpg,png}  ──► Astro Image pipeline ──► /_astro/*.{avif,webp}   ──► edge CDN
                                                       │                          (Cloudflare)
.astro page templates   ──► render per collection  ───┤                              │
  /watch, /watch/[slug]                                ▼                              ▼
  /products, /products/[slug]              dist/ (static HTML+CSS+JS+assets)    boozeonhormuz.com
  /evidence-lounge (reads `kind`)                      │                         (HTTPS, auto-SSL)
  /sponsor-reads, /quotes, /about                      │
                                          git push ──► Cloudflare Pages build ──► deploy
```

**Debug rule:** content not appearing in production almost always means `draft: true` is still set, or the Zod schema rejected the file (check the build log). Content not appearing locally means the dev server needs a restart after a schema change.

---

## PHASE 0 — Pre-flight (~20 min, do not skip)

### 0a. Environment checks (Claude Code terminal)

```bash
node --version          # expect v22.x+
gh auth status          # expect: logged in as UsernameTron, with 'repo' scope
git --version
npm --version
```

### 0b. Legal pre-flight (do in parallel, non-blocking for scaffold but must clear before content goes public)

- [ ] **Trademark sweep:** USPTO TESS search + plain Google for "Booze on Hormuz" — confirm no active mark / confusingly similar brand.
- [ ] **Right-of-publicity gut check on "Don Biggly":** the name is satirically adjacent to real public figures. US parody is protected but fact-specific. If it's *too* close to one identifiable person, consider distancing the character. A 15-minute call with a media-savvy attorney is cheap insurance before wide linking.
- [ ] **DMCA posture:** decide the designated agent + counter-notice process now. Satire gets hit with bad-faith takedowns; you want the response ready, not improvised.
- [ ] **Confirm the parody disclaimer text** (from the brief) and that it will render in the global footer.

**Where:** browser + notes. **Expected:** four boxes checked or consciously deferred with a date.

---

## PHASE 1 — Scaffold (host-agnostic, ~75 min)

### Step 1 — Clone + init Astro without the CNAME conflict

The existing root `CNAME` makes `npm create astro . ` unreliable in a non-empty dir. Sidestep it: init in a temp dir, then merge.

```bash
cd ~/projects
gh repo clone UsernameTron/boozeonhormuz.com boozeonhormuz-com

# Init Astro in a clean temp sibling
npm create astro@latest boozeonhormuz-tmp -- --template minimal --install --git --typescript strict

# Merge Astro files into the repo (preserve the repo's .git)
rsync -a --exclude='.git' boozeonhormuz-tmp/ boozeonhormuz-com/
rm -rf boozeonhormuz-tmp
cd boozeonhormuz-com

# Remove the GitHub-Pages-specific root CNAME (host handling moves to Phase 2)
git rm --cached CNAME 2>/dev/null; rm -f CNAME
```

**Expected:** `boozeonhormuz-com/` contains `package.json`, `astro.config.mjs`, `src/`, `public/`, `node_modules/`, and the original `.git/`. No root `CNAME`.

### Step 2 — Pin Tailwind v4 + lock config

```bash
# Find and pin the exact current patch
TW_VER=$(npm view tailwindcss version)
npm install tailwindcss@$TW_VER @tailwindcss/vite@$TW_VER --save-exact

# Verify lockfile updated, will be committed
git add package.json package-lock.json
```

Overwrite `astro.config.mjs`:

```bash
cat > astro.config.mjs << 'EOF'
// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://boozeonhormuz.com',
  output: 'static',
  vite: { plugins: [tailwindcss()] },
  build: { inlineStylesheets: 'auto' },
  image: { responsiveStyles: true },
});
EOF
```

**Expected:** `tailwindcss` + `@tailwindcss/vite` pinned to identical exact versions in `package.json` (no `^`/`~`). `astro.config.mjs` has `output: 'static'`, no adapter.

### Step 3 — Self-hosted fonts

```bash
npm install @fontsource-variable/fraunces @fontsource-variable/inter --save-exact
```

(Imported in the base layout in Step 5.)

**Expected:** both Fontsource packages in `package.json`.

### Step 4 — Content collections (the corrected model)

```bash
cat > src/content.config.ts << 'EOF'
import { defineCollection, reference, z } from 'astro:content';
import { glob, file } from 'astro/loaders';

const episodes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/episodes' }),
  schema: z.object({
    title: z.string(),
    episode_number: z.number(),
    publish_date: z.coerce.date(),
    youtube_id: z.string().optional(),
    summary: z.string(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(true),
  }),
});

const products = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/products' }),
  schema: ({ image }) => z.object({
    name: z.string(),
    tagline: z.string(),
    description: z.string(),
    hero: image().optional(),
    disclaimer: z.string().default('Not available for purchase because it would be insane. Watch the sketch instead.'),
    draft: z.boolean().default(true),
  }),
});

const sponsors = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/sponsors' }),
  schema: z.object({
    sponsor_name: z.string(),
    ad_copy: z.string(),
    episode_ref: reference('episodes').optional(),
    draft: z.boolean().default(true),
  }),
});

// Polymorphic Evidence Lounge — discriminated union on `kind`.
// New artifact types = a new branch here, NOT a new collection.
const evidence = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/evidence' }),
  schema: ({ image }) => z.discriminatedUnion('kind', [
    z.object({ kind: z.literal('clip'),        title: z.string(), youtube_id: z.string(), episode_ref: reference('episodes').optional(), draft: z.boolean().default(true) }),
    z.object({ kind: z.literal('title_card'),  title: z.string(), img: image(),           caption: z.string().optional(), draft: z.boolean().default(true) }),
    z.object({ kind: z.literal('prompt'),      title: z.string(), prompt_text: z.string(), tool: z.string().optional(), draft: z.boolean().default(true) }),
    z.object({ kind: z.literal('commercial'),  title: z.string(), youtube_id: z.string().optional(), copy: z.string(), draft: z.boolean().default(true) }),
    z.object({ kind: z.literal('lower_third'), title: z.string(), img: image(),           draft: z.boolean().default(true) }),
    z.object({ kind: z.literal('gallery'),     title: z.string(), img: image(),           alt: z.string(), draft: z.boolean().default(true) }),
    z.object({ kind: z.literal('song'),        title: z.string(), lyrics: z.string(),     suno_url: z.string().url().optional(), draft: z.boolean().default(true) }),
  ]),
});

// Quotes as data, not pages — one YAML file, many entries.
const quotes = defineCollection({
  loader: file('./src/data/quotes.yaml'),
  schema: z.object({
    id: z.string(),
    text: z.string(),
    speaker: z.string().default('Don Biggly'),
  }),
});

export const collections = { episodes, products, sponsors, evidence, quotes };
EOF

# Create content dirs + a starter quotes file so the loaders don't error
mkdir -p src/content/episodes src/content/products src/content/sponsors src/content/evidence src/data
cat > src/data/quotes.yaml << 'EOF'
- id: shrimp
  text: "Shrimp. Very important."
- id: evidence
  text: "The evidence is with me."
- id: minibar
  text: "Many people are saying the minibar stopped the war."
EOF
for d in episodes products sponsors evidence; do touch "src/content/$d/.gitkeep"; done
```

**Expected:** `src/content.config.ts` defines 5 collections. `src/data/quotes.yaml` has 3 starter quotes. `npx astro check` (run in Step 6) will validate the schema.

### Step 5 — Design tokens + base layout + placeholder homepage

```bash
cat > src/styles/global.css << 'EOF'
@import "tailwindcss";
@import "@fontsource-variable/fraunces";
@import "@fontsource-variable/inter";

/* PLACEHOLDER luxury-satire tokens — finalize at Checkpoint B. */
@theme {
  --color-night:   #0b1320;   /* deep navy */
  --color-ink:     #f5f1e6;   /* warm cream */
  --color-gold:    #c9a227;   /* champagne gold */
  --color-gold-lt: #e6c759;
  --font-display: "Fraunces Variable", ui-serif, Georgia, serif;
  --font-body:    "Inter Variable", ui-sans-serif, system-ui, sans-serif;
}

html, body { background: var(--color-night); color: var(--color-ink); }
body { font-family: var(--font-body); }
EOF

mkdir -p src/layouts src/components
cat > src/components/Disclaimer.astro << 'EOF'
---
// Renders on EVERY page via BaseLayout — legal requirement, not optional.
---
<footer class="border-t border-white/10 mt-24 py-8 px-6 text-center text-xs opacity-50">
  BoozeOnHormuz.com is fictional satire and a comedy archive. No alcohol, cruises,
  geopolitical services, shrimp diplomacy, or legal defense are sold here. Any
  resemblance to real confidence is purely accidental and probably billable.
</footer>
EOF

cat > src/layouts/BaseLayout.astro << 'EOF'
---
import '../styles/global.css';
import Disclaimer from '../components/Disclaimer.astro';
const {
  title = 'Booze on Hormuz',
  description = 'Warships on the horizon. Champagne on ice.',
} = Astro.props;
const canonical = new URL(Astro.url.pathname, Astro.site);
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={canonical} />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
  </head>
  <body>
    <a href="#main" class="sr-only focus:not-sr-only">Skip to content</a>
    <main id="main"><slot /></main>
    <Disclaimer />
  </body>
</html>
EOF

cat > src/pages/index.astro << 'EOF'
---
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout>
  <section class="min-h-[80vh] flex items-center justify-center px-6">
    <div class="max-w-2xl text-center">
      <h1 class="text-6xl md:text-8xl tracking-tight" style="font-family: var(--font-display); color: var(--color-gold)">
        Booze on Hormuz
      </h1>
      <p class="mt-6 text-xl opacity-80">Warships on the horizon. Champagne on ice.</p>
      <p class="mt-12 text-sm opacity-50">Under construction. The shrimp are chilled. The lawyers are sweating.</p>
    </div>
  </section>
</BaseLayout>
EOF

cat > public/favicon.svg << 'EOF'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#0b1320"/><text x="16" y="23" font-family="Georgia,serif" font-size="22" fill="#c9a227" text-anchor="middle">B</text></svg>
EOF
```

**Expected:** layout imports fonts + disclaimer; homepage renders gold serif headline on navy; skip-link present for accessibility.

### Step 6 — Local verify (do not skip)

```bash
npx astro check        # expect: 0 errors, 0 warnings (validates content schema)
npm run dev            # open http://localhost:4321
# Confirm: navy bg, gold "Booze on Hormuz" in Fraunces serif, subhead, footer disclaimer visible
# Check contrast: gold #c9a227 on navy #0b1320 — verify ≥ 4.5:1 in browser devtools or a contrast checker
# Ctrl+C to stop

npm run build          # expect: exits 0, produces dist/
npm run preview        # final production-preview check, then Ctrl+C
```

**Expected:** all four commands clean. **If contrast fails 4.5:1, lighten the gold to `--color-gold-lt` for body-size text** (large display text only needs 3:1, so the headline is fine).

### Step 7 — Commit the foundation

```bash
# Confirm .gitignore excludes node_modules and dist
grep -qx "node_modules" .gitignore || echo "node_modules" >> .gitignore
grep -qx "dist" .gitignore || echo "dist" >> .gitignore

git add .
git commit -m "foundation: astro5 static + tailwind v4 (pinned) + 5-collection model + fonts + a11y baseline"
git push origin main
```

**Expected:** clean push to `main`. (Deploy happens in Phase 2 — Cloudflare watches the repo.)

---

## PHASE 2 — Deploy on Cloudflare Pages (~30 min + DNS propagation)

> **The trap:** when connecting, Cloudflare may try to route a static Astro site to **Workers** (`*.workers.dev`). You want **Pages** (`*.pages.dev`). Follow this exact path.

### Step 8 — Move nameservers to Cloudflare

1. **Where:** Cloudflare dashboard → Add a site → enter `boozeonhormuz.com` → Free plan.
2. Cloudflare scans existing DNS. **Delete the 4 GitHub A records** it imports (`185.199.108–111.153`) — they're being replaced. Keep nothing pointing at GitHub.
3. Cloudflare gives you two nameservers (e.g. `xxx.ns.cloudflare.com`).
4. **Where:** Namecheap → Domain List → boozeonhormuz.com → Nameservers → Custom DNS → paste Cloudflare's two nameservers → save.
5. Back in Cloudflare, click **Check nameservers**.

**Expected:** Namecheap shows Custom DNS with Cloudflare's nameservers. Cloudflare status will flip to "active" within minutes–48h.

### Step 9 — Create the Pages project (avoid the Workers trap)

1. **Where:** Cloudflare dashboard → **Workers & Pages** → **Create application** → **Pages** tab → **Import an existing Git repository**.
2. Authorize GitHub, select `UsernameTron/boozeonhormuz.com` → **Begin setup**.
3. Build settings:
   - **Framework preset:** Astro
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Environment variable:** `NODE_VERSION` = `22`
4. **Save and Deploy.**
5. Confirm the result URL is `*.pages.dev` (NOT `*.workers.dev`). If it's `workers.dev`, you went through the wrong creation flow — delete and redo via the **Pages tab** explicitly.

**Expected:** first build succeeds, site live at `https://boozeonhormuz.pages.dev`.

### Step 10 — Attach the custom domain

1. **Where:** the Pages project → **Custom domains** → **Set up a custom domain** → enter `boozeonhormuz.com`.
2. Because the nameservers are now on Cloudflare, it **auto-creates the DNS records** (proxied). Repeat for `www.boozeonhormuz.com` and set a redirect to apex (Cloudflare → Rules → Redirect Rules, or the Pages domain handles it).
3. SSL provisions automatically.

**Verify:**

```bash
curl -sSI https://boozeonhormuz.com | head -3
# expect: HTTP/2 200, with cf-ray and strict-transport-security headers
```

**Expected:** apex serves the placeholder over HTTPS via Cloudflare. `www` redirects to apex.

---

## PHASE 3 — Production polish (deferred, outline only)

Flesh out after Phase 2 + Checkpoint A/B. Scope:
1. `npx astro add sitemap` → `sitemap-index.xml`; author `public/robots.txt`
2. `astro-og-canvas` → build-time branded OG cards per route
3. Cloudflare Web Analytics → enable in dashboard (one toggle, no snippet, no cookie banner)
4. `searchfit-seo:schema-markup` → `VideoObject` / `CreativeWork` JSON-LD on episodes
5. Branch protection on `main` + Dependabot
6. Lighthouse CI in a GitHub Action → fail builds under 90 on any score
7. CC BY-NC `LICENSE` for parody content

---

## QUALITY GATES (Phase 0–2 complete when all true)

| Gate | Check |
|---|---|
| Schema valid | `npx astro check` exits 0 |
| Builds clean | `npm run build` exits 0, `dist/` produced |
| Fonts self-hosted | No `fonts.googleapis.com` request in browser network tab |
| Contrast | Gold-on-navy body text ≥ 4.5:1 (display ≥ 3:1) |
| Lockfile committed | `package-lock.json` in the commit, Tailwind pinned exact |
| Live on Pages | `*.pages.dev` URL returns 200 |
| Custom domain | `curl -sSI https://boozeonhormuz.com` → 200 + `cf-ray` header |
| Disclaimer global | Footer disclaimer renders on every page |
| a11y baseline | Skip-link present, single `<h1>`, semantic `<main>` |

---

## RISKS & MITIGATIONS

| Risk | Prob | Impact | Mitigation |
|---|---|---|---|
| Cloudflare routes static site to Workers | Med | Med | Step 9 uses explicit Pages-tab flow; verify `*.pages.dev` |
| Nameserver propagation slow | High | Low | `*.pages.dev` URL works immediately; custom domain catches up |
| Tailwind v4 minor breaks theme later | Med | Med | Pinned exact + lockfile + `npm ci`; Appendix B = v3 escape hatch |
| `npm create astro` prompts despite flags | Med | Low | Temp-dir init (Step 1) is robust; run interactively if needed |
| Gold-on-navy fails contrast | Med | Low | Pre-defined `--color-gold-lt` fallback for small text |
| "Don Biggly" right-of-publicity exposure | Low | High | Phase 0 legal gut check before wide linking |
| Discriminated-union schema rejects content | Med | Low | `astro check` surfaces it at build; error names the bad file |

## COMMON FAILURE MODES & FIXES

| Symptom | Cause | Fix |
|---|---|---|
| Build: `Cannot find module 'astro:content'` | schema syntax error | `npx astro check`, fix the named file, rebuild |
| Live URL is `*.workers.dev` | wrong Cloudflare flow | delete app, redo via Workers & Pages → **Pages tab** → Import repo |
| CSS missing on live site | (GitHub Pages path only) Jekyll | n/a on Cloudflare; on GH Pages the official action handles it |
| Fonts not loading | `@import` order wrong in global.css | Fontsource imports must follow `@import "tailwindcss"` |
| Content not in production | `draft: true` still set | flip to `false` in frontmatter |
| Custom domain stuck "pending" | nameservers not active yet | wait; check Cloudflare site status = active |

## ROLLBACK

Cloudflare Pages keeps every deployment. **Where:** Pages project → Deployments → pick the last good one → **Rollback to this deployment**. Instant, no rebuild. For code: `git revert HEAD && git push` re-triggers a clean build.

---

## APPENDIX A — GitHub Pages path (if you skip Cloudflare)

Keep the existing DNS. After Phase 1:
1. `echo "boozeonhormuz.com" > public/CNAME`
2. Add `.github/workflows/deploy.yml` using `withastro/action@v3` + `actions/deploy-pages@v4` (see prior plan).
3. Settings → Pages → Source = **GitHub Actions** (set manually, once).
4. After DNS check passes, enable **Enforce HTTPS**.
5. Add CAA records (`0 issue "letsencrypt.org"`, `0 issue "pki.goog"`).

You lose: free built-in analytics, unlimited bandwidth, per-branch previews, edge CDN. You gain: zero DNS rework.

## APPENDIX B — Tailwind v3 conservative path

If v4's active-development risk outweighs its features:
```bash
npm install tailwindcss@3 @astrojs/tailwind --save-exact
npx astro add tailwind   # wires the v3 integration
```
Use `tailwind.config.mjs` (v3 style) for tokens instead of `@theme`. More stable, fewer new features.

---

**v2.0 | 2026-05-30 | Revised per adversarial critique: corrected content model, Cloudflare primary, pinned deps, locked fonts/media/legal, collapsed GSD ceremony.**

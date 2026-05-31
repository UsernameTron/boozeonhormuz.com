# Phase 01 — PLAN: Foundation Setup

| Field | Value |
|---|---|
| **Solution** | Astro 5 + Tailwind v4 static site deployed to GitHub Pages |
| **Target** | `https://boozeonhormuz.com` serves a working homepage placeholder |
| **Owner** | C. Pete Connor |
| **Estimated build** | 75 minutes |
| **Phase state** | PHASE_PLANNED → ready for execution |
| **Where you execute** | Claude Code terminal, working dir `~/projects/boozeonhormuz-com/` |

---

## What you're building

A static Astro site with a working CI/CD pipeline. Push to `main` → GitHub Action builds → deploys to GitHub Pages → live on custom domain. **No content yet — just the pipe.**

## Why it matters

Every additional minute spent on infra is a minute not spent on jokes. After this phase, content drops are a single `git push`. **The pipe is the product right now.**

## Architecture

```
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│  Local Astro 5  │      │  GitHub Actions  │      │  GitHub Pages   │
│   (npm run dev) │─────▶│  withastro/      │─────▶│  + custom       │
│   localhost:4321│ push │  action@v3       │      │  domain         │
└─────────────────┘      └──────────────────┘      └────────┬────────┘
        │                                                    │
        │ src/                                               │ HTTPS
        │   content.config.ts  ← Zod-typed schemas           ▼
        │   layouts/BaseLayout.astro                  boozeonhormuz.com
        │   pages/index.astro                         (Namecheap DNS
        │   styles/global.css  ← Tailwind v4           → GitHub IPs)
        │ public/
        │   CNAME              ← custom domain marker
        │ astro.config.mjs     ← site = custom domain, NO base
        │ .github/workflows/deploy.yml
```

---

## Phase 0 — Prerequisites (verify before Step 1)

Run these checks. Stop and remediate if any fail.

```bash
# Node 22+ installed
node --version    # expect v22.x or higher

# GitHub CLI authenticated
gh auth status    # expect "Logged in to github.com as UsernameTron"

# Working directory empty / not yet created
ls -la ~/projects/boozeonhormuz-com 2>/dev/null && echo "EXISTS — back up or remove before proceeding"

# DNS resolving (optional — deploy still works without this, but final verify lags)
dig boozeonhormuz.com +short   # expect: 185.199.108.153 / 109.153 / 110.153 / 111.153
```

**Where:** Claude Code terminal.
**Expected:** All four checks return cleanly. If DNS hasn't propagated yet, proceed anyway — verify in Step 6.

---

## Step 1 — Clone repo and initialize Astro

**Where:** Claude Code terminal, in `~/projects/`.

```bash
cd ~/projects
gh repo clone UsernameTron/boozeonhormuz.com boozeonhormuz-com
cd boozeonhormuz-com

# Confirm only CNAME exists
ls -la
# expect: .git/, CNAME, possibly README.md

# Initialize Astro 5 in current directory (NOT a subfolder)
npm create astro@latest -- . --template minimal --install --git no --typescript strict --yes
```

**Flags explained:**
- `.` — install in current directory (not subfolder)
- `--template minimal` — no demo content; we'll structure it ourselves
- `--install` — runs `npm install` automatically
- `--git no` — don't reinit git, we already have a repo
- `--typescript strict` — Zod schemas + content collections want strict TS
- `--yes` — accept all defaults

**Expected output:** Astro CLI completes. `package.json`, `astro.config.mjs`, `tsconfig.json`, `src/pages/index.astro`, `public/`, `node_modules/` all exist. The existing `CNAME` file may have been moved or untouched — verify in next step.

---

## Step 2 — Add Tailwind v4 + lock custom domain config

**Where:** Claude Code terminal, in `~/projects/boozeonhormuz-com/`.

```bash
# Add Tailwind v4 via Astro CLI (installs @tailwindcss/vite, configures astro.config)
npx astro add tailwind --yes
```

**Expected:** `@tailwindcss/vite` and `tailwindcss` added to `package.json`. `astro.config.mjs` now imports and uses `@tailwindcss/vite` as a Vite plugin.

Now overwrite `astro.config.mjs` to lock in custom-domain settings:

```bash
cat > astro.config.mjs << 'EOF'
// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://boozeonhormuz.com',
  // NO `base` — custom domain serves from root
  vite: {
    plugins: [tailwindcss()],
  },
  build: {
    inlineStylesheets: 'auto',
  },
});
EOF
```

Ensure `public/CNAME` exists with the custom domain (overwrites if Astro's init removed it):

```bash
mkdir -p public
echo "boozeonhormuz.com" > public/CNAME
```

**Expected:** `astro.config.mjs` has `site` set, no `base`. `public/CNAME` contains `boozeonhormuz.com` on a single line.

---

## Step 3 — Define content collection schemas

**Where:** Claude Code, file editor.

Create `src/content.config.ts` with typed schemas for the four content types the brief implies. Content arrives later — schemas come first.

```bash
cat > src/content.config.ts << 'EOF'
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const episodes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/episodes' }),
  schema: z.object({
    title: z.string(),
    episode_number: z.number(),
    publish_date: z.date(),
    video_url: z.string().url().optional(),
    summary: z.string(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(true),
  }),
});

const products = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/products' }),
  schema: z.object({
    name: z.string(),
    tagline: z.string(),
    description: z.string(),
    disclaimer: z.string().default('This is not available for purchase because it would be insane.'),
    image: z.string().optional(),
  }),
});

const quotes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/quotes' }),
  schema: z.object({
    text: z.string(),
    speaker: z.string().default('Don Biggly'),
    episode_ref: z.string().optional(),
  }),
});

const sponsors = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/sponsors' }),
  schema: z.object({
    sponsor_name: z.string(),
    ad_copy: z.string(),
    associated_episode: z.string().optional(),
  }),
});

export const collections = { episodes, products, quotes, sponsors };
EOF

# Create empty content directories so the loader doesn't error on first build
mkdir -p src/content/episodes src/content/products src/content/quotes src/content/sponsors
touch src/content/episodes/.gitkeep src/content/products/.gitkeep src/content/quotes/.gitkeep src/content/sponsors/.gitkeep
```

**Expected:** `src/content.config.ts` exists. Four empty directories under `src/content/` with `.gitkeep` files. TypeScript will recognize the collections on next `npm run dev`.

---

## Step 4 — Base layout + placeholder homepage + Tailwind entrypoint

**Where:** Claude Code, file editor.

Create the global stylesheet with a placeholder `@theme` block (real design tokens come in design-system checkpoint):

```bash
cat > src/styles/global.css << 'EOF'
@import "tailwindcss";

/* Placeholder tokens — overwritten at design-system checkpoint. */
@theme {
  --color-bg: #0a0a0a;
  --color-ink: #fafafa;
  --color-accent: #c9a961;
  --font-display: ui-serif, Georgia, serif;
  --font-body: ui-sans-serif, system-ui, sans-serif;
}

html, body { background: var(--color-bg); color: var(--color-ink); }
EOF
```

Create the base layout:

```bash
mkdir -p src/layouts
cat > src/layouts/BaseLayout.astro << 'EOF'
---
import '../styles/global.css';
const { title = 'Booze on Hormuz', description = 'Warships on the horizon. Champagne on ice.' } = Astro.props;
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  </head>
  <body class="font-[var(--font-body)]">
    <slot />
  </body>
</html>
EOF
```

Overwrite the default homepage with a minimal placeholder:

```bash
cat > src/pages/index.astro << 'EOF'
---
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout>
  <main class="min-h-screen flex items-center justify-center px-6">
    <div class="max-w-2xl text-center">
      <h1 class="text-5xl md:text-7xl font-[var(--font-display)] tracking-tight" style="color: var(--color-accent)">
        Booze on Hormuz
      </h1>
      <p class="mt-6 text-lg md:text-xl opacity-80">
        Warships on the horizon. Champagne on ice.
      </p>
      <p class="mt-12 text-sm opacity-50">
        Site under construction. The shrimp are chilled. The lawyers are sweating.
      </p>
    </div>
  </main>
</BaseLayout>
EOF
```

Create a minimal favicon placeholder:

```bash
cat > public/favicon.svg << 'EOF'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#0a0a0a"/><text x="16" y="22" font-family="serif" font-size="20" fill="#c9a961" text-anchor="middle">B</text></svg>
EOF
```

**Local verify:**

```bash
npm run dev
# expect: Astro starts on http://localhost:4321 with no errors
# Open browser, confirm: dark bg, gold "Booze on Hormuz" headline, subhead, construction note
# Stop dev server with Ctrl+C
```

**Expected:** Local dev renders the placeholder cleanly. If errors, fix before committing.

---

## Step 5 — GitHub Actions deploy workflow

**Where:** Claude Code, file editor.

```bash
mkdir -p .github/workflows
cat > .github/workflows/deploy.yml << 'EOF'
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v5
      - name: Install, build, and upload
        uses: withastro/action@v3

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
EOF
```

**Expected:** `.github/workflows/deploy.yml` exists. Two jobs: `build` (runs Astro action) → `deploy` (publishes to Pages environment).

---

## Step 6 — Commit, push, verify

**Where:** Claude Code terminal.

Confirm the GitHub Pages source is set to **GitHub Actions** (not Branch):

```bash
gh api repos/UsernameTron/boozeonhormuz.com/pages \
  --method PUT \
  --field build_type=workflow \
  2>/dev/null || echo "Pages already set to workflow build, or check Settings → Pages → Source = GitHub Actions"
```

Commit and push:

```bash
git add .
git commit -m "phase-01: foundation scaffold (astro5 + tailwind v4 + collections + ci/cd)"
git push origin main
```

Watch the deploy in real time:

```bash
gh run watch
# expect: build job completes, deploy job completes, total ~2-3 min
```

Once green, verify live URL:

```bash
# Primary check
curl -sSI https://boozeonhormuz.com | head -1
# expect: HTTP/2 200 (may be HTTP/2 301 if HTTPS not yet provisioned — that's OK for phase-01)

# If DNS hasn't fully propagated, fallback URL works immediately:
curl -sSI https://usernametron.github.io/boozeonhormuz.com/ | head -1
```

**Where you should see it work:** Open `https://boozeonhormuz.com` in a browser. Expect dark background, gold "Booze on Hormuz" headline, the subhead, and the construction note.

---

## Quality / validation gates

| Gate | Pass criteria | How to check |
|---|---|---|
| **Astro builds** | `npm run build` exits 0, produces `dist/` | Local terminal |
| **No type errors** | `npx astro check` exits 0 | Local terminal |
| **GH Action succeeds** | Both `build` and `deploy` jobs green | `gh run list --limit 1` |
| **Custom domain resolves** | `curl -sSI https://boozeonhormuz.com` returns 200 or 301 | Terminal (after DNS propagation) |
| **CNAME persists across builds** | After build, `dist/CNAME` contains `boozeonhormuz.com` | Local check on `dist/` |
| **No Jekyll interference** | `dist/` contains `_astro/` directory and assets load in browser | Live URL inspection |

**Phase-01 ships when all six gates pass.**

---

## Cost projection

| Item | Cost |
|---|---|
| Domain registration | $13.06/yr (already paid through 2027-05-30) |
| GitHub Pages hosting | $0 (public repo, free tier) |
| GitHub Actions minutes | $0 (public repo = unlimited free minutes) |
| Custom domain SSL | $0 (auto-provisioned via Let's Encrypt by GitHub) |
| **Phase 01 total** | **$0 incremental** |

---

## Risks & mitigations

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| DNS not fully propagated when verifying | High | Low | Fallback to `usernametron.github.io/boozeonhormuz.com/` for visual verify; primary URL catches up within hours |
| `npm create astro` prompts despite `--yes` flag | Medium | Low | Run interactively if needed, accept all defaults |
| Tailwind v4 minor version breaks setup | Low | Medium | Pin version: `npm install tailwindcss@4.0.x @tailwindcss/vite@4.0.x` if breakage observed |
| Existing `CNAME` file conflicts with Astro init | Medium | Low | Step 2 explicitly recreates `public/CNAME` after init |
| GitHub Pages source still set to "branch" not "workflow" | Medium | High | Step 6 sets it via API; if fails, manual fix in Settings → Pages |

---

## Common failure modes & fixes

| Symptom | Cause | Fix |
|---|---|---|
| GH Action build fails: `Cannot find module 'astro:content'` | `src/content.config.ts` has syntax error or missing import | Run `npx astro check` locally, fix errors, re-push |
| Deploy succeeds but site shows GitHub Pages 404 | Pages source is still "branch", not "GitHub Actions" | Settings → Pages → Source = GitHub Actions, save, re-trigger workflow with `gh workflow run deploy.yml` |
| Site loads but CSS missing | Jekyll processing `_astro/` directory | `withastro/action@v3` handles this automatically; verify by checking `dist/_astro/` exists in build artifact |
| Custom domain shows "Domain's DNS record could not be retrieved" | DNS still propagating | Wait 1-24h; verify with `dig boozeonhormuz.com +short` |
| Tailwind classes not applying | `global.css` not imported in `BaseLayout.astro` | Confirm `import '../styles/global.css';` is in the frontmatter |
| `withastro/action@v3` errors on Node version | Node version mismatch | Add `node-version: 22` under action `with:` block |

---

## Where each step lives

| Step | Surface | Why there |
|---|---|---|
| 0 (prereqs) | Claude Code terminal | CLI checks |
| 1 (clone + init) | Claude Code terminal | `gh` + `npm create astro` |
| 2 (tailwind + config) | Claude Code terminal + file editor | CLI add + config edit |
| 3 (content schemas) | Claude Code file editor | Pure file authoring |
| 4 (layout + homepage) | Claude Code file editor + local browser | Author + visual verify |
| 5 (CI workflow) | Claude Code file editor | YAML authoring |
| 6 (push + verify) | Claude Code terminal + browser | `git push` + `gh run watch` + live URL check |

---

## Single-session execution checklist

Block 75 minutes. Run in order, no skipping.

- [ ] **00:00–00:05** Phase 0 prereq checks
- [ ] **00:05–00:15** Step 1 — clone, `npm create astro`
- [ ] **00:15–00:25** Step 2 — add Tailwind, lock astro.config, CNAME
- [ ] **00:25–00:35** Step 3 — content collection schemas
- [ ] **00:35–00:50** Step 4 — base layout, homepage, favicon, local verify
- [ ] **00:50–01:00** Step 5 — write `deploy.yml`
- [ ] **01:00–01:15** Step 6 — commit, push, watch deploy, verify URL
- [ ] **01:15** Update `STATE.md`: phase-01 → PHASE_AWAITING_SHIP

---

## Rollback plan

If anything ships broken to `main` and the live site goes down or shows errors:

```bash
# Find the last working commit (likely the initial repo state)
git log --oneline | head -10

# Revert to last working state
git revert HEAD --no-edit
git push origin main

# OR if you need a hard reset (only safe because this is a fresh project)
git reset --hard <last-good-sha>
git push origin main --force
```

GitHub Actions re-runs on push, redeploys the reverted state within 2-3 minutes. **Worst case:** Disable GitHub Pages temporarily (Settings → Pages → Source: None), fix locally, re-enable.

---

## GSD commands referenced

- `/gsd:prime-patterns` — run once on project open in Claude Code to load GSD context
- `/gsd:verify-work` — run after Step 6 verifies, before marking phase complete
- `/gsd:ship` — run when phase-01 + phase-02 + phase-03 all PHASE_AWAITING_SHIP
- `/gsd:health` — run if anything feels off mid-execution

## Definition of "phase-01 complete"

All six quality gates green. `STATE.md` updated. Phase-02-PLAN can be fleshed out.

---

**v1.0 | 2026-05-30 | Initial author: Claude (gsd-planner via Connor)**

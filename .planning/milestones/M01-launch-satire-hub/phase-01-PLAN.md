# Phase 01 — PLAN: Foundation Setup (rev 2, post-review)

| Field | Value |
|---|---|
| **Solution** | Astro 6 static site + Tailwind 4, deployed to GitHub Pages via GitHub Actions |
| **Target** | `https://boozeonhormuz.com` serves a working content-free homepage; push-to-deploy live |
| **Owner** | C. Pete Connor |
| **Where you execute** | Claude Code terminal, working dir `~/projects/boozeonhormuz-com/` |
| **Estimated build** | ~75 min |
| **Phase state** | PHASE_PLANNED (rev 2) → ready for `/gsd:execute-phase` |
| **Execution method** | `booze on hormuz/` skill suite: `content-model-architect` → `astro-static-scaffold` → `domain-infra-provisioner` (GitHub Pages) → `deploy-verify` |
| **Revision** | rev 2 — incorporates Codex review (phase-01-REVIEWS.md) + directory/repo-collision fix |

---

## Changes in rev 2 (why this differs from rev 1)

| # | Source | Change |
|---|---|---|
| 1 | Codex HIGH | Workflow uses `actions/checkout@v6` (was `@v4`) to match canonical `withastro/action@v6` example |
| 2 | Codex HIGH | `quotes.yaml` stub is now a **valid ≥1-object** file, not empty — empty YAML fails Zod and breaks the build |
| 3 | Codex MED | `astro@6.4.2` is pinned **at scaffold time**, not resolve-then-pin — removes nondeterminism |
| 4 | Codex MED | Step 6 adds a concrete `gh` auth-remediation block for the Pages API call |
| 5 | Codex MED | Legal checklist **moved out** of the foundation critical path → phase-02 pre-content gate |
| 6 | Codex LOW | CNAME semantics made explicit: `public/CNAME` is the artifact that ships in `dist/` |
| 7 | Codex LOW | Add `.nvmrc` = `24` for local/CI Node parity (`withastro/action@v6` runs Node 24) |
| 8 | Orchestrator | **Step 1 rewritten** — repo is established by `git init` in place + remote wiring + CNAME reconcile, NOT `gh repo clone` into the already-populated dir |
| 9 | Owner decision | Public-repo scope = **everything** in this directory. Added a **secrets scan gate** before first push (published is permanent) |

---

## What you're building

A static Astro 6 site with a working CI/CD pipe. Push to `main` → GitHub Action builds → deploys to GitHub Pages → live on the custom domain. **No content — just the pipe.** After this phase, every content drop is one `git push`.

## Architecture

```
LOCAL (npm run dev)            GITHUB ACTIONS                 GITHUB PAGES
──────────────────             ───────────────                ────────────
src/content.config.ts ─┐       on push to main:               boozeonhormuz.com
src/layouts/           │       1. actions/checkout@v6         (Namecheap DNS → GH IPs,
src/pages/index.astro  ├─push─▶ 2. withastro/action@v6  ─────▶ public/CNAME marker,
src/styles/global.css  │          (npm ci → astro build)       HTTPS via GH-managed cert)
src/assets/ (fonts)    │       3. actions/deploy-pages@v4
public/CNAME          ─┘          (uploads dist/ artifact)     source = "GitHub Actions"
astro.config.mjs  (site set, NO base — apex domain)
.github/workflows/deploy.yml
.nvmrc  (24 — matches withastro/action@v6 CI runtime)
```

**Debug rule:** content missing in production = almost always `draft: true` left set, or a Zod schema rejection (read the build log). Missing locally after a schema edit = restart the dev server.

---

## Phase 0 — Prerequisites (verify before Step 1)

**Where:** Claude Code terminal. Stop and remediate if any check fails.

```bash
node --version      # expect v22.x+ (v24 ideal — matches CI; see .nvmrc in Step 2)
gh auth status      # expect: Logged in to github.com as UsernameTron, scopes incl. 'repo' + 'workflow'
git --version
npm --version
dig boozeonhormuz.com +short   # expect: 185.199.108.153 / .109.153 / .110.153 / .111.153
```

> **Note on `workflow` scope:** pushing `.github/workflows/deploy.yml` requires the token to carry the `workflow` scope. If `gh auth status` shows only `repo`, run `gh auth refresh -h github.com -s workflow` before Step 6.

**Success:** all shell checks return clean. (Legal pre-flight has moved to the phase-02 pre-content gate — see "Deferred" below. It does NOT block this content-free scaffold.)

---

## Step 1 — Establish the local git repo in place + reconcile remote CNAME

**Where:** Claude Code terminal, in `~/projects/boozeonhormuz-com/`. **Skill:** `astro-static-scaffold` (adapted).

**Why this replaces rev-1's clone:** this directory already exists, is gitignored by the parent `~/projects` workspace repo, is **not** yet its own git repo, and already holds `.planning/`, the `booze on hormuz/` skill suite, the knowledge-files dir, and root docs. `gh repo clone … boozeonhormuz-com` cannot run into a populated dir. The remote `UsernameTron/boozeonhormuz.com` is effectively empty (CNAME + maybe README). So: init here, wire the remote, fetch + merge the remote's history, keep everything local.

```bash
cd ~/projects/boozeonhormuz-com
test -d .git && echo "ALREADY A REPO — skip init" || git init -b main

git remote get-url origin 2>/dev/null \
  || git remote add origin https://github.com/UsernameTron/boozeonhormuz.com.git

# pull the remote's existing history (CNAME/README) WITHOUT clobbering local files
git fetch origin
git merge --allow-unrelated-histories origin/main -m "chore: reconcile local workspace with remote repo" \
  || echo "NOTE: resolve any merge conflict (likely CNAME) by keeping the apex domain value, then continue"

ls -la   # expect: .git/, .planning/, 'booze on hormuz/', knowledge dir, root docs, and CNAME from remote
```

**Success:** `~/projects/boozeonhormuz-com/` is a git repo with `origin` → `UsernameTron/boozeonhormuz.com`, remote history merged, all pre-existing local files intact.

---

## Step 2 — Scaffold Astro 6 (pinned) + Tailwind 4 + fonts, set config, CNAME, .nvmrc

**Where:** same terminal. **Skill:** `astro-static-scaffold`.

Init Astro in a clean temp sibling (avoids the non-empty-dir problem), then merge back. **Pin `astro@6.4.2` at creation** so the scaffold is deterministic.

```bash
cd ~/projects
npm create astro@latest boh-temp -- \
  --template minimal --install false --git false --typescript strict --yes
# force the exact Astro line before any install resolves a newer minor:
cd boh-temp && npm pkg set dependencies.astro="6.4.2" && cd ..

# merge scaffold into the repo (never touch .git, .planning, skills, knowledge, CNAME)
rsync -a --exclude='.git' \
  --exclude='node_modules' \
  boh-temp/ boozeonhormuz-com/
rm -rf boh-temp
cd boozeonhormuz-com

# exact-pin everything, then a single clean install writes the lockfile.
# NOTE: astro-embed (lite-YouTube) and astro-og-canvas are phase-02/03 concerns —
# deliberately NOT installed here. Phase-01 is content-free infrastructure only.
npm pkg set dependencies.astro="6.4.2"
npm install --save-exact \
  tailwindcss@4.3.0 @tailwindcss/vite@4.3.0 \
  @fontsource-variable/fraunces@5.2.9 @fontsource-variable/inter@5.2.8
npm install   # resolves astro@6.4.2 + writes package-lock.json

# CNAME semantics — the file that must ship in dist/ is public/CNAME:
mkdir -p public && echo "boozeonhormuz.com" > public/CNAME
# (a root-level CNAME from the remote is harmless; public/CNAME is the source of truth for the artifact)

# Node parity: withastro/action@v6 runs Node 24 in CI
echo "24" > .nvmrc
```

Overwrite `astro.config.mjs`:

```js
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://boozeonhormuz.com',   // apex domain, NO `base`
  output: 'static',
  vite: { plugins: [tailwindcss()] },
});
```

**Success:** `npm ls astro tailwindcss @tailwindcss/vite` shows exact pins (`astro@6.4.2`); `public/CNAME` contains the apex domain; `.nvmrc` = `24`; `package-lock.json` exists.

---

## Step 3 — Author the content schema (5 collections, one polymorphic) + VALID stubs

**Where:** editor. **Skill:** `content-model-architect`. **File:** `src/content.config.ts`.

Schemas map to *rendering templates*, not taxonomy. `evidence` is a discriminated union on `kind` so new artifact types are a new branch, not a new collection.

```ts
import { defineCollection, reference, z } from 'astro:content';
import { glob, file } from 'astro/loaders';

const episodes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/episodes' }),
  schema: z.object({
    title: z.string(), slug: z.string(), publishDate: z.coerce.date(),
    youtubeId: z.string().optional(), summary: z.string(),
    draft: z.boolean().default(true),
  }),
});

const products = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/products' }),
  schema: z.object({
    name: z.string(), slug: z.string(), tagline: z.string(),
    disclaimer: z.string().default('Not available for purchase because it would be insane. Watch the sketch instead.'),
    draft: z.boolean().default(true),
  }),
});

const sponsors = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/sponsors' }),
  schema: z.object({
    name: z.string(), read: z.string(), episode: reference('episodes').optional(),
    draft: z.boolean().default(true),
  }),
});

// polymorphic Evidence Lounge — one collection absorbs every artifact type
const evidence = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/evidence' }),
  schema: z.discriminatedUnion('kind', [
    z.object({ kind: z.literal('clip'),        title: z.string(), youtubeId: z.string(), draft: z.boolean().default(true) }),
    z.object({ kind: z.literal('titlecard'),   title: z.string(), image: z.string(),     draft: z.boolean().default(true) }),
    z.object({ kind: z.literal('prompt'),      title: z.string(), body: z.string(),       draft: z.boolean().default(true) }),
    z.object({ kind: z.literal('commercial'),  title: z.string(), youtubeId: z.string(), draft: z.boolean().default(true) }),
    z.object({ kind: z.literal('lowerthird'),  title: z.string(), text: z.string(),       draft: z.boolean().default(true) }),
    z.object({ kind: z.literal('gallery'),     title: z.string(), image: z.string(),      draft: z.boolean().default(true) }),
    z.object({ kind: z.literal('song'),        title: z.string(), audioUrl: z.string().optional(), lyrics: z.string().optional(), draft: z.boolean().default(true) }),
  ]),
});

// quotes are data, not pages — YAML file loader
const quotes = defineCollection({
  loader: file('./src/data/quotes.yaml'),
  schema: z.object({ id: z.string(), text: z.string().max(120), episode: z.string().optional() }),
});

export const collections = { episodes, products, sponsors, evidence, quotes };
```

**Valid stubs (the rev-2 fix — `file()` loader must parse a real object or the build fails):**

```bash
mkdir -p src/content/episodes src/content/products src/content/sponsors src/content/evidence src/data
cat > src/data/quotes.yaml <<'YAML'
- id: placeholder
  text: "Placeholder quote — removed before content-free launch."
YAML
```

> The `glob`-loaded collections (`episodes`/`products`/`sponsors`/`evidence`) resolve fine from empty dirs. Only the `file`-loaded `quotes` needs a valid object. This single placeholder is removed in Step 7's content-free sweep.

**Success:** `npx astro sync` generates types with no schema errors; `npx astro check` passes.

---

## Step 4 — Base layout, global styles, placeholder homepage, fonts, disclaimer

**Where:** editor. **Skill:** `astro-static-scaffold`. **Files:** `src/styles/global.css`, `src/layouts/BaseLayout.astro`, `src/pages/index.astro`, `public/favicon.svg`.

- `global.css`: `@import "tailwindcss";` + a **placeholder** `@theme { ... }` token block (final tokens = Checkpoint B). Import the two Fontsource variable faces; `font-display: swap`; preload the display face.
- `BaseLayout.astro`: `<html lang="en">`, meta scaffold (real OG tags in phase-03), nav placeholder, `<slot/>`, and the **parody disclaimer in the footer** — rendered globally from the layout, never per-page.
- `index.astro`: one placeholder hero. No real copy. Confirms layout + fonts + Tailwind render.

```bash
npm run dev      # open http://localhost:4321
```

**Success:** homepage renders with Fraunces display + Inter body, Tailwind utilities apply, the disclaimer shows in the footer, no console errors.

---

## Step 5 — GitHub Actions deploy workflow (canonical versions)

**Where:** editor. **Skill:** `domain-infra-provisioner`. **File:** `.github/workflows/deploy.yml`.

```yaml
name: Deploy to GitHub Pages
on:
  push: { branches: [main] }
  workflow_dispatch:
permissions: { contents: read, pages: write, id-token: write }
concurrency: { group: "pages", cancel-in-progress: false }
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6        # rev-2: matches canonical withastro/action@v6 example
      - uses: withastro/action@v6        # current major
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: { name: github-pages, url: "${{ steps.deployment.outputs.page_url }}" }
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

**Success:** committed; `withastro/action@v6` + `checkout@v6` + `deploy-pages@v4`; CI runs `npm ci` from the committed lockfile.

---

## Step 6 — Secrets scan, set Pages source, push, verify live

**Where:** Claude Code terminal. **Skill:** `domain-infra-provisioner` → `deploy-verify`.

**6a — Secrets scan gate (rev-2, because public-repo scope = "everything"):**
Everything in this directory will be public. Before the first push, scan for credentials in the tracked set — especially `.planning/`, the knowledge files, and root docs.

```bash
# fast heuristic sweep; stop and review any hit before pushing
git add -A
git ls-files -z | xargs -0 grep -nEI \
  '(ghp_[A-Za-z0-9]{36}|github_pat_|AKIA[0-9A-Z]{16}|-----BEGIN [A-Z ]*PRIVATE KEY-----|sk-[A-Za-z0-9]{20,}|xox[baprs]-[A-Za-z0-9-]+|api[_-]?key["'\'' :=]+[A-Za-z0-9]{16,})' \
  2>/dev/null | grep -vE '\.planning/.*REVIEWS\.md|placeholder' \
  || echo "SECRETS SCAN: clean"
```

If anything matches, halt and remediate (gitignore or scrub) before continuing.

**6b — Pages source + push:**

```bash
# switch Pages build type to Actions (idempotent)
gh api -X POST repos/UsernameTron/boozeonhormuz.com/pages -f build_type=workflow 2>/dev/null \
  || gh api -X PUT  repos/UsernameTron/boozeonhormuz.com/pages -f build_type=workflow

git commit -m "phase-01: Astro 6 foundation + GH Pages deploy pipe"
git push -u origin main
gh run watch                      # wait for green
```

**Auth-remediation block (rev-2) — if a `gh api` or `git push` call 403/404s:**

```bash
# token likely missing scopes; re-auth with repo + workflow, then retry the failed command
gh auth refresh -h github.com -s repo,workflow
gh auth status            # confirm scopes now include repo + workflow
# then re-run the failed gh api / git push line above
```

**6c — Post-deploy gate:**

```bash
python "booze on hormuz/verify.py" https://boozeonhormuz.com
# checks: HTTP 200, custom-domain resolves (not *.github.io redirect loop), 404 page exists
```

**Success:** Action green; `https://boozeonhormuz.com` (or `*.github.io` if DNS still propagating) serves the placeholder homepage; `verify.py` passes.

---

## Step 7 — Content-free sweep + close the phase

**Where:** Claude Code terminal + `.planning/STATE.md`.

```bash
# remove the placeholder quote so launch is truly content-free
cat > src/data/quotes.yaml <<'YAML'
[]
YAML
# NOTE: an empty list [] is valid YAML and parses to zero entries — the file() loader
# tolerates an empty array (unlike empty/whitespace-only files). Verify with astro check.
npx astro check && npm run build
git add -A && git commit -m "phase-01: content-free sweep; mark PHASE_AWAITING_VERIFY"
git push
```

Update `STATE.md`: phase-01 → `PHASE_AWAITING_VERIFY` → run `/gsd:verify-work` → `PHASE_AWAITING_SHIP`.

---

## Quality gate (phase-01 exit)

- `npx astro check` clean, `npm run build` succeeds, `npm run preview` serves `dist/`
- Deploy Action green on `main`; `verify.py` passes
- `public/CNAME` present in the deployed `dist/` artifact (custom domain holds)
- Disclaimer renders globally; fonts load; Tailwind applies
- Lockfile committed; CI uses `npm ci`; all deps exact-pinned; `.nvmrc` = `24`
- Secrets scan clean before first push
- **Content-free:** zero real episodes/products/quotes/sponsors/evidence; no real copy

## Deferred (out of this phase)

- **Legal pre-flight → phase-02 pre-content gate** (rev-2 move): USPTO/TESS sweep on "Booze on Hormuz", right-of-publicity sanity check, DMCA designated-agent posture, parody disclaimer text confirmed. Real gate before *content* publishes; the disclaimer footer itself is built in Step 4.
- HTTPS enforcement, OG/Twitter meta, sitemap, robots, analytics, branch protection → phase-03
- Final brand tokens → **Checkpoint B** (gates phase-02)
- Real content → **Checkpoint A** (gates phase-02 content)

## Next action

`/gsd:execute-phase` for phase-01. On phase-01 ship, autonomous run **stops at Checkpoint B** (owner-owned brand tokens) before phase-02.

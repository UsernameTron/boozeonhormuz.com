---
name: astro-static-scaffold
description: |
  Scaffolds a static Astro 5 foundation from an approved content schema — host-agnostic. Project generation via temp-dir init (avoids non-empty-repo conflicts), pins Tailwind v4 with a committed lockfile, self-hosts variable fonts, wires content.config.ts, and builds a base layout with an a11y baseline + global disclaimer.

  Inputs: approved schema (from content-model-architect) + target repo. Outputs: a committed Astro project that passes astro check and npm run build, with placeholder tokens and homepage. No content, no deploy, no final design.

  REFUSES: content modeling (upstream), DNS/hosting/deploy (use domain-infra-provisioner), final design tokens, content authoring, post-deploy verification.

  TRIGGERS: "scaffold an astro site", "astro foundation for", "initialize the static site", "set up the astro project", "build the site skeleton", approved schema + build intent.
---

# Astro Static Scaffold

Stand up a correct, host-agnostic Astro 5 foundation in one pass. The schema is already designed (content-model-architect ran upstream); this skill builds the project around it so the only thing left is deploy and content.

## QUICK START
1. Confirm the content schema exists (from content-model-architect).
2. Run the setup sequence in `references/setup-sequence.md`, verifying each command against current tooling first.
3. Verify locally: `npx astro check` → `npm run build` → `npm run preview`.
4. Commit. Hand off to domain-infra-provisioner for deploy.

## WHEN TO USE
- A content schema is approved and the site needs its foundation built
- Starting a new Astro static site from a brief + schema
- Re-creating a known-good Astro baseline (fonts + Tailwind + a11y) on a new repo

## WHEN NOT TO USE
- No schema yet → run content-model-architect first
- Deploy / DNS / hosting → domain-infra-provisioner
- Finalizing brand tokens or writing content → later checkpoints
- Verifying a live site → deploy-verify

## PROCESS (sequential — order matters, outputs chain)

### Step 1: Init without the non-empty-repo conflict
Clone the repo, then init Astro in a **temp sibling dir** and rsync it in. A direct `npm create astro .` in a repo that already has files (e.g. a CNAME) is unreliable. Remove any host-specific root files (CNAME) — host handling belongs to the deploy skill.
Expected output: a clean Astro project merged into the existing repo, original `.git` intact.

### Step 2: Pin Tailwind v4 exactly
Tailwind v4 ships breaking changes in minor releases. Install at an exact patch with `--save-exact`, commit `package-lock.json`, and CI uses `npm ci`. Overwrite `astro.config.mjs` with `site` set, `output: 'static'`, no adapter (an SSR adapter triggers host traps later).
Expected output: `astro.config.mjs` locked; Tailwind + `@tailwindcss/vite` pinned identically.

### Step 3: Self-host fonts
Install the chosen variable fonts via Fontsource (no Google third-party load — privacy + performance). Default display = Fraunces Variable, body = Inter Variable; override per brand.
Expected output: font packages pinned; imported in the base layout in Step 5.

### Step 4: Wire the approved content schema
Drop the content-model-architect output in as `src/content.config.ts`. Create the content directories and any data files (e.g. a starter `quotes.yaml`) so loaders don't error on first build.
Expected output: schema in place; `npx astro check` will validate it in Step 6.

### Step 5: Base layout + tokens + placeholder homepage
Author `src/styles/global.css` with a placeholder `@theme` token block (finalized later at the design checkpoint), a `BaseLayout.astro` that imports fonts + a global Disclaimer component + canonical/OG meta + a skip-link, and a minimal placeholder homepage. The Disclaimer renders on **every** page.
Expected output: layout, tokens, homepage, favicon; accessible (skip-link, single h1, semantic main).

### Step 6: Verify locally, then commit
Run `npx astro check` (0 errors), `npm run build` (exits 0, produces dist/), `npm run preview`. Confirm `.gitignore` excludes `node_modules` and `dist`. Commit.
Expected output: green check + build; a single foundation commit on the branch.

## OUTPUT SPECIFICATION
A committed Astro 5 project: `astro.config.mjs` (static, site set), pinned Tailwind v4 + lockfile, self-hosted fonts, `src/content.config.ts`, `BaseLayout.astro` with a11y + global Disclaimer, placeholder `@theme` tokens, placeholder homepage, favicon. Passes `astro check` and `npm run build`. Zero content, zero deploy config.

## ERROR HANDLING
| Condition | Action |
|---|---|
| `npm create astro` prompts despite flags | Temp-dir init is robust; run interactively, accept defaults |
| Schema rejects on first build | `npx astro check` names the bad file; fix frontmatter |
| Fonts not loading | Fontsource `@import`s must follow `@import "tailwindcss"` in global.css |
| Tailwind minor breaks later | Pinned exact + lockfile + `npm ci`; v3 is the conservative escape hatch |
| Gold/placeholder text fails contrast | Lighten via a token; display ≥3:1, body ≥4.5:1 |

## DEPENDENCIES
- `references/setup-sequence.md` — the exact copy-paste command sequence (verify against current tooling before running)
- Output of content-model-architect (the schema)
- Node 22+, npm, git, gh
- No bundled executable: commands are run interactively with verification (grounding discipline — never auto-run unverified setup)

## NOTES
Pipeline position: downstream of content-model-architect, upstream of domain-infra-provisioner. Host-agnostic by design — the same foundation deploys to Cloudflare Pages or GitHub Pages; only the deploy skill differs.

v1.0.0

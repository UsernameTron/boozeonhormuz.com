# DevOps Handoff — boozeonhormuz.com

## Project summary

Static Astro 6 site deployed to GitHub Pages on the apex domain `boozeonhormuz.com`. Content-free as of phase-01 — the deliverable is the build-and-deploy pipeline. No server-side runtime, no database, no secrets.

## Environment requirements

| Requirement | Value |
|---|---|
| Node (local) | 22+ |
| Node (CI) | 24 (`.nvmrc`, `withastro/action@v6` default) |
| Package manager | npm (lockfile committed; CI uses `npm ci`) |
| Hosting | GitHub Pages, source = "GitHub Actions" (`build_type: workflow`) |
| Repo | `github.com/UsernameTron/boozeonhormuz.com` (public) |

## How to run

```bash
npm ci
npm run dev       # http://localhost:4321
npm run build     # → dist/
npm run preview
npx astro check   # typecheck gate
```

## Deployment

- **Trigger:** push to `main` (or manual `workflow_dispatch`).
- **Pipeline:** `.github/workflows/deploy.yml` — `actions/checkout@v6` → `withastro/action@v6` (runs `npm ci` + `astro build`, uploads Pages artifact) → `actions/deploy-pages@v4`.
- **Custom domain:** `public/CNAME` = `boozeonhormuz.com` ships in `dist/`. DNS = 4 A records at apex → GitHub Pages IPs (`185.199.108–111.153`), `www` CNAME → `usernametron.github.io`.
- **HTTPS:** GitHub-managed cert, approved for apex + `www` (expires 2026-08-28). **HTTPS enforcement is NOT yet enabled** — deferred to phase-03.

## Configuration reference

| File | Purpose |
|---|---|
| `astro.config.mjs` | `site` = apex domain, `output: 'static'`, Tailwind Vite plugin |
| `src/content.config.ts` | 5 Zod-typed content collections |
| `.nvmrc` | CI/local Node parity (24) |
| `public/CNAME` | custom-domain marker |
| `.github/workflows/deploy.yml` | deploy pipeline |

No environment variables. No secrets. No `.env`.

## Security notes

- Repo is **public** by owner decision — includes planning docs and build tooling. A credential scan ran clean before first push; keep it clean (no tokens/keys in tracked files).
- Workflow consumes no untrusted `github.event.*` input → no injection surface.
- `permissions:` in the workflow are least-privilege (`contents: read`, `pages: write`, `id-token: write`).

## Deployment maturity

| Aspect | State |
|---|---|
| CI/CD | ✅ automated, push-to-deploy |
| Custom domain + HTTPS cert | ✅ approved |
| HTTPS enforcement | ⛔ phase-03 |
| Branch protection on `main` | ⛔ phase-03 |
| SEO (OG, sitemap, robots), analytics | ⛔ phase-03 |
| Content | ⛔ Checkpoint A (owner) |
| Final brand tokens | ⛔ Checkpoint B (owner) |

## Known tech debt / constraints

- **`@tailwindcss/vite` pinned to 4.2.0** — do NOT bump to 4.3.x until Astro ships a Vite 8 line; 4.3 hard-deps Vite 8 and breaks the build against Astro's Vite 7 (`Missing field tsconfigPaths`).
- Placeholder design tokens in `global.css` until Checkpoint B.
- Legal pre-flight (USPTO/TESS, right-of-publicity, DMCA agent, disclaimer wording) is a phase-02 pre-content gate — the disclaimer footer is built but final wording is unconfirmed.

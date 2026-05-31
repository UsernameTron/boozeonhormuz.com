# TODO — boozeonhormuz.com

> **How to use:** Work top-to-bottom. Each task is independently shippable. Check off as you go. Phase-01 tasks block phase-02; phase-02 blocks phase-03.

---

## Phase 01 — Foundation Setup (active)

- [ ] **P01.0** Verify Phase 0 prerequisites (Node 22+, `gh auth status`, DNS dig)
- [ ] **P01.1** Clone repo + `npm create astro@latest -- . --template minimal --install --git no --typescript strict --yes`
- [ ] **P01.2** `npx astro add tailwind --yes`, overwrite `astro.config.mjs`, recreate `public/CNAME`
- [ ] **P01.3** Author `src/content.config.ts` with episodes/products/quotes/sponsors schemas
- [ ] **P01.4** Author `src/styles/global.css`, `src/layouts/BaseLayout.astro`, `src/pages/index.astro`, `public/favicon.svg`; verify `npm run dev`
- [ ] **P01.5** Author `.github/workflows/deploy.yml`
- [ ] **P01.6** Set Pages source to "GitHub Actions" via `gh api`; commit + push; `gh run watch`; verify live URL
- [ ] **P01.7** Update `STATE.md` → phase-01 = PHASE_AWAITING_SHIP

---

## Phase 02 — Page Shells (blocked on Checkpoint A + B)

- [ ] **P02.0** Re-invoke `gsd-planner` to flesh out phase-02-PLAN
- [ ] **P02.1** Author shared components (Nav, Footer, EpisodeCard, ProductCard, QuoteCard, Disclaimer)
- [ ] **P02.2** Author static pages (`/`, `/evidence-lounge`, `/about`)
- [ ] **P02.3** Author dynamic routes (`/watch/[slug]`, `/products/[slug]`)
- [ ] **P02.4** Author collection-index pages (`/watch`, `/products`, `/sponsor-reads`, `/quotes`)
- [ ] **P02.5** Seed one placeholder entry per collection
- [ ] **P02.6** Visual QA every route
- [ ] **P02.7** PR + merge; update `STATE.md` → phase-02 = PHASE_AWAITING_SHIP

---

## Phase 03 — Production Polish (blocked on Phase 02 ship)

- [ ] **P03.0** Re-invoke `gsd-planner` to flesh out phase-03-PLAN
- [ ] **P03.1** Enable HTTPS enforcement (Settings → Pages)
- [ ] **P03.2** Add CAA records on Namecheap
- [ ] **P03.3** `npx astro add sitemap`; write `public/robots.txt`
- [ ] **P03.4** Author `<MetaTags />` component, include in `BaseLayout`
- [ ] **P03.5** Add analytics snippet (Cloudflare Web Analytics) OR document opt-out
- [ ] **P03.6** Branch protection on `main` via `gh api`
- [ ] **P03.7** Local Lighthouse pass; fix anything below 90
- [ ] **P03.8** PR + merge; update `STATE.md` → milestone M01 = COMPLETE

---

## Post-milestone (deferred — separate work)

- [ ] **POST.1** Build `domain-infra-provisioner` skill from this project's lessons learned (Connor memory #22)
- [ ] **POST.2** Build remaining multi-skill website pipeline (site-brief-intake, site-design-system-generator, content-architect, static-site-builder, site-quality-reviewer, deploy-verify, site-iteration-loop)
- [ ] **POST.3** Re-run the new pipeline on a second domain to validate

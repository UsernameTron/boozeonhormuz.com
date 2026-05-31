# Phase 03 — PLAN: Production Polish (STUB)

> **Status:** STUB. Do not execute. Flesh out when phase-02 is PHASE_AWAITING_SHIP.

## What this phase produces

Site moves from "shipped" to "production-grade": HTTPS enforced, rich social embeds, analytics live, sitemap + robots present, branch protection on `main`, repo hardened, Lighthouse ≥90.

## High-level shape

1. **HTTPS enforcement** — GitHub repo → Settings → Pages → "Enforce HTTPS" (GitHub-managed Let's Encrypt cert; no Cloudflare in this path).
2. **CAA records** — add on Namecheap: `0 issue "letsencrypt.org"` and `0 issue "pki.goog"`.
3. **Sitemap + robots** — `npx astro add sitemap` → auto `sitemap-index.xml`; author `public/robots.txt`.
4. **OG + Twitter card** — `<MetaTags />` component in `BaseLayout`; build-time per-page share cards via `astro-og-canvas` (+ `canvaskit-wasm` peer).
5. **Analytics** — default **Cloudflare Web Analytics beacon** (free, cookieless, host-agnostic — works on GitHub Pages via the JS beacon, no CF hosting required). Alternative: Plausible. Or skip entirely. Owner picks.
6. **Branch protection** — `gh api -X PUT repos/UsernameTron/boozeonhormuz.com/branches/main/protection` (require PR review + status checks).
7. **LICENSE** — parody-appropriate (e.g., CC BY-NC for content); confirm with the legal pre-flight outcome.
8. **Lighthouse pass** — local `lighthouse https://boozeonhormuz.com --view`; fix anything below 90.

## Quality gate

- Lighthouse ≥90 on all four scores
- `curl -sSI https://boozeonhormuz.com` → `HTTP/2 200` with `strict-transport-security`
- `gh api .../branches/main/protection` returns the ruleset
- Twitter Card validator + OG debugger both render the preview

## Open decisions

- Analytics provider (default Cloudflare Web Analytics beacon)
- LICENSE choice for parody content
- Dependabot on/off

## Next action

When phase-02 ships, re-run `gsd-planner`: *"flesh out phase-03-PLAN.md for boozeonhormuz-com"*.

**Est. build:** ~45 min.

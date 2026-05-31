# Phase 03 — CONTEXT: Production Polish (STUB)

> **Phase state:** STUB — flesh out when phase-02 is PHASE_AWAITING_SHIP.

## What this phase will produce

Site moves from "shipped" to "production-grade." HTTPS enforced, OG/social embeds rich, analytics live, sitemap and robots present, branch protection on `main`, repo settings hardened.

## Scope

- Enable HTTPS enforcement in Pages settings
- Add CAA DNS records on Namecheap (`0 issue "letsencrypt.org"`, `0 issue "pki.goog"`)
- Add `@astrojs/sitemap` integration → auto-generated `sitemap-index.xml`
- Add `public/robots.txt`
- Add `<meta>` OG tags + Twitter card via dedicated `<MetaTags />` component in `BaseLayout`
- Add Cloudflare Web Analytics snippet (free, privacy-preserving)
- Enable branch protection on `main` — require PR review, status checks
- Add `LICENSE` file (e.g., CC BY-NC for parody content)
- Lighthouse pass — target ≥90 on all four scores (performance, accessibility, best practices, SEO)

## Estimated build

~45 minutes.

## Open decisions

- Analytics provider — defaulting to Cloudflare Web Analytics; alternative: Plausible self-hosted, or skip analytics entirely if Connor doesn't want a metrics overhead
- License choice for parody content
- Whether to enable Dependabot for security updates

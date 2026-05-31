# Phase 03 — PLAN: Production Polish (STUB)

> **Status:** STUB. Do not execute. Flesh out when phase-02 is PHASE_AWAITING_SHIP.

## High-level shape

1. **HTTPS enforcement** — toggle in Settings → Pages
2. **CAA records** — add via Namecheap MCP
3. **Sitemap + robots** — `npx astro add sitemap`, then write `public/robots.txt`
4. **OG meta + Twitter card** — author `<MetaTags />` component, include in `BaseLayout`
5. **Analytics** — Cloudflare Web Analytics snippet in `BaseLayout` (default) OR skip if Connor opts out
6. **Branch protection** — `gh api repos/.../branches/main/protection` PUT
7. **Lighthouse pass** — local `lighthouse https://boozeonhormuz.com --view`; fix anything below 90
8. **Commit + push** — single PR titled `phase-03: production polish`

## Estimated build

~45 minutes.

## Quality gate

- Lighthouse ≥90 on all four scores
- `gh api repos/UsernameTron/boozeonhormuz.com/branches/main/protection` returns the protection ruleset
- `curl -sSI https://boozeonhormuz.com` returns `HTTP/2 200` with `strict-transport-security` header
- Twitter card validator and OG debugger both render the page preview correctly

## Next action

When phase-02 ships, re-run `gsd-planner` with the prompt: *"flesh out phase-03-PLAN.md for boozeonhormuz-com"*.

# boozeonhormuz.com — Skill Suite (built via skill-forge)

Seven artifacts: six production skills (all 12/12 on the skill-forge Gate 2 rubric, zero trigger collisions against the installed suite) + one brand context pack. Bundled scripts are tested.

## The skills (build order)

| # | Skill | Pattern | Script | Rubric | Role |
|---|---|---|---|:---:|---|
| 1 | content-model-architect | Domain Intelligence | — | 12/12 | Design the content schema (the v1-mistake guard) |
| 2 | astro-static-scaffold | Sequential | — (verified-interactive) | 12/12 | Build the host-agnostic Astro foundation |
| 3 | domain-infra-provisioner | Branching | verify-dns.sh | 12/12 | Deploy: Cloudflare Pages or GitHub Pages |
| 4 | deploy-verify | Sequential | verify.py (tested) | 12/12 | Post-deploy gate (catches the Workers trap) |
| 5 | episode-ingest | Multi-MCP | ingest.py (tested) | 12/12 | Sustainability: YouTube → draft PR |
| 6 | parody-safety-check | Domain Intelligence | — | 12/12 | Pre-publish legal/safety gate |
| + | booze-on-hormuz-brand | context pack | — | n/a | Voice module for Mirror Universe skills (NOT a skill) |

## Pipeline order
content-model-architect → astro-static-scaffold → domain-infra-provisioner → deploy-verify
(post-launch) episode-ingest → parody-safety-check → social-card-generator
brand pack loads into the content/voice step throughout.

## Install (per skill)
Copy each skill folder into your skills directory:
```bash
# global skills
cp -R <skill-folder> ~/.claude/skills/
# or project-scoped
cp -R <skill-folder> ~/projects/boozeonhormuz-com/.claude/skills/
```
The brand pack is not a skill — keep `booze-on-hormuz-brand/brand-pack.md` somewhere your content/voice runs can load it (e.g. the repo's docs/).

## Deployment rung (Gate 6)
All six start at **Local draft**. Use each live on a real task; after 2–3 clean uses, promote to project-scoped, then global. Rubric proves structure, not real-world fit — battle-test before globalizing.

## Tested scripts
- deploy-verify/scripts/verify.py — validated against a live URL (status/headers/workers-trap/404)
- episode-ingest/scripts/ingest.py — validated with a dummy transcript (markdown + quote extraction)
- social-card-generator/scripts/render_cards.py — validated; SVGs confirmed well-formed XML
- domain-infra-provisioner/references/verify-dns.sh — DNS/HTTPS check commands

## Not built (deliberate)
- luxury-satire design-system skill → use frontend-design + a token file (one brand ≠ a generator)
- static-site quality-reviewer skill → assemble design:accessibility-review + engineering:code-review + searchfit-seo:seo-audit
- site-brief-intake skill → new-project-intake covers it

v1.0 | 2026-05-30

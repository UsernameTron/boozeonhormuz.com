---
generated: 2026-10-13T06:14:01Z
verdict: PASS
source_commit: 31476602b3dc34f028b1eab6373f2853c9b69192
---
# Build Verification

The commands come from `package.json`, `CLAUDE.md`, and the checked-in release workflow. The tested application and media revision is the approved content commit shown above. Subsequent audit edits affect documentation and GSD configuration only.

| Check | Result | Evidence |
|---|---|---|
| Type check | PASS | `npm run check`: 0 errors, 0 warnings; existing hints remain. |
| Unit tests | PASS | 45 tests passed. |
| Isolated catalogue fixtures | PASS | Lifecycle, missing optional assets, media orientation, captions, and duplicate/source validation fixtures passed. |
| Production build | PASS | 196 generated pages; static output produced successfully. |
| Responsive media | PASS | 208 source hashes and their WebP candidates verified. |
| Output integrity | PASS | 199 HTML files, 11,987 local references, canonical tags, sitemap, and custom domain checks passed. |
| Browser suite | PASS | All 80 checks passed in one fresh run. Includes 32 Deep Cuts page/source checks, first/last playback, 47 Gallery image delivery, viewer navigation, no-JavaScript Gallery details, and responsive layouts. |
| Lint | SKIPPED | No lint or formatter script is configured. No lint result is claimed. |
| Performance audit | PASS | 36 Lighthouse runs across 12 configured URLs, three runs per URL. Command exited 0. Independent median-budget comparison found zero failing error or warning thresholds. |

## Lighthouse Median Scores

| Route | Performance | Accessibility |
|---|---:|---:|
| `/` | 94 | 100 |
| `/album/` | 99 | 100 |
| `/watch/` | 100 | 100 |
| `/watch/the-premiere/` | 99 | 100 |
| `/listen/` | 100 | 100 |
| `/archive/` | 99 | 100 |
| `/play/` | 97 | 100 |
| `/tools/broadcast-room/` | 99 | 100 |
| `/tools/evidence-lounge-studio/` | 99 | 100 |
| `/apps/broadcast-room.html` | 99 | 100 |
| `/apps/evidence-lounge-studio.html` | 99 | 100 |
| `/apps/exit-strategy.html` | 100 | 100 |

Gallery and Deep Cuts have browser coverage but are not among the current twelve Lighthouse budget URLs. This report does not claim a separate performance audit of those two pages, public-edge delivery, a merge, or a new deployment.

Evidence logs: `/tmp/boh-confidence-verify.log`, `/tmp/boh-confidence-lighthouse.log`, and `.lighthouseci/lhr-*.json`. Temporary logs and generated browser reports remain local.

build-verification: PASS

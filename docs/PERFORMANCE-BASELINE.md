# Mobile performance baseline and release budgets

Measured on 2026-09-06 (America/Chicago) from the frozen production build at `13f7e332ec10bb1e6aaba49245ac844cf560b2fb`. All 120 built-file digests remained unchanged during collection. There are three retained raw Lighthouse runs for each of 12 explicit routes, with no concurrent build or interactive browser workload. Earlier interrupted audits are diagnostic only.

The environment was Node 24.20.0, Lighthouse 12.6.1, and the pinned Playwright Chromium installation on macOS ARM64. The audit uses a 390 × 844 mobile viewport, simulated mobile throttling and a 4× CPU slowdown. External resources were not stubbed in this audit. Local browser/content regression tests run separately.

## Measured medians

Scores are 0–100. LCP and TBT are milliseconds; CLS is unitless. Each metric is the median of its three values, rather than the best run or the values from one representative report.

| Route | Performance | Accessibility | SEO | LCP | CLS | TBT |
|---|---:|---:|---:|---:|---:|---:|
| `/` | 97 | 100 | 100 | 2477 | 0.002 | 0 |
| `/album/` | 100 | 100 | 100 | 1353 | 0.000 | 0 |
| `/watch/` | 99 | 98 | 100 | 1899 | 0.004 | 0 |
| `/watch/the-premiere/` | 99 | 100 | 100 | 1924 | 0.000 | 0 |
| `/listen/` | 100 | 100 | 100 | 1353 | 0.000 | 0 |
| `/archive/` | 99 | 100 | 100 | 1877 | 0.000 | 0 |
| `/play/` | 97 | 100 | 100 | 2552 | 0.000 | 0 |
| `/tools/broadcast-room/` | 98 | 100 | 100 | 2252 | 0.001 | 0 |
| `/tools/evidence-lounge-studio/` | 93 | 100 | 100 | 2552 | 0.095 | 0 |
| `/apps/broadcast-room.html` | 99 | 100 | 91 | 1952 | 0.000 | 0 |
| `/apps/evidence-lounge-studio.html` | 99 | 100 | 91 | 1952 | 0.000 | 0 |
| `/apps/exit-strategy.html` | 100 | 100 | 100 | 1801 | 0.000 | 0 |

## Blocking regression budgets

`lighthouserc.json` explicitly sets `aggregationMethod: "median"` on every route entry. Every route must retain at least 90 performance. Higher floors use the median minus five points, rounded down to a multiple of five. LCP ceilings allow 25% plus 200 ms, rounded up to 100 ms, with a 2,500 ms minimum ceiling. An LCP of 2.5 seconds remains the user-experience target; larger route-specific limits are regression margins. TBT ceilings allow 50% plus 50 ms, rounded up to 50 ms, with a 200 ms minimum ceiling. CLS must remain at or below 0.1. These margins account for ordinary lab variation while detecting substantial regressions.

| Route | Performance ≥ | LCP ≤ | CLS ≤ | TBT ≤ |
|---|---:|---:|---:|---:|
| `/` | 90 | 3300 | 0.1 | 200 |
| `/album/` | 95 | 2500 | 0.1 | 200 |
| `/watch/` | 90 | 2600 | 0.1 | 200 |
| `/watch/the-premiere/` | 90 | 2700 | 0.1 | 200 |
| `/listen/` | 95 | 2500 | 0.1 | 200 |
| `/archive/` | 90 | 2600 | 0.1 | 200 |
| `/play/` | 90 | 3400 | 0.1 | 200 |
| `/tools/broadcast-room/` | 90 | 3100 | 0.1 | 200 |
| `/tools/evidence-lounge-studio/` | 90 | 3400 | 0.1 | 200 |
| `/apps/broadcast-room.html` | 90 | 2700 | 0.1 | 200 |
| `/apps/evidence-lounge-studio.html` | 90 | 2700 | 0.1 | 200 |
| `/apps/exit-strategy.html` | 95 | 2500 | 0.1 | 200 |

Accessibility ≥90 remains blocking on every route. SEO ≥90 remains blocking on site routes and a warning on standalone apps; best practices ≥90 remains a warning everywhere. The measured homepage can be compared to the separately captured clean pre-change homepage baseline of 77 performance. Earlier mixed/interrupted runs for other routes do not establish valid before/after comparisons.

These are lab regression checks, not field Core Web Vitals measurements. The first Linux Actions run should be inspected for environment-specific variance; do not silently weaken a failing budget. Investigate changed assets, rendering and scheduling before proposing a separately reviewed adjustment.

Run `npm run verify`, hold `dist/` unchanged, then `npm run test:lighthouse` to collect and assert a fresh release. CI downloads the exact validated artifact and never rebuilds it for Lighthouse. All raw JSON/HTML reports and assertion output are retained in `.lighthouseci/` for 30 days in Actions. This repository revision defines the checks; confirm the deployed SHA and successful Actions run for live status.

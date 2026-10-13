---
verdict: BLOCKED
score: n/a
generated: 2026-10-13T06:20:03Z
source_commit: 31476602b3dc34f028b1eab6373f2853c9b69192
quality_blocking: 2
quality_warnings: 1
---
# Confidence Report

The owner approved the complete content batch and requested confidence verification followed by finalization. Existing approval covers the intended release when the result is ship-ready. The workflow does not permit automatic finalization of a BLOCKED verdict.

| Leg | Surface | Result | Detail |
|---|---|---|---|
| 1 | Planning health | PASS | Repaired missing default config and required PROJECT sections. Fresh canonical CLI result: healthy, zero errors and warnings. |
| 2 | Quality audits | FAIL | 2 blocking critical dependency entries; 1 consolidated warning for remaining advisory/version findings. Static public hosting is distinct from build/dev/audit exposure. |
| 3 | Build/test/lint | PASS | Source check, 45 unit tests, isolated fixtures, production build, 208 media hashes, output audit, all 80 browser checks, and 36 Lighthouse runs passed. Lint is unavailable and not claimed. |
| 4 | Codebase map | PASS | Seven new nonempty maps were written, reread, and scanned for secret/injection patterns. |
| 5 | Documentation | PASS | Six stale operational/planning documents updated from measured source and current approval. Missing changelog skipped. |
| 6 | Repository cleanliness | FAIL | 72 tracked MP4 delivery assets exceed the workflow's generic 5 MB threshold. No oversized non-video files, untracked junk, gone branches, orphaned absorbed directory, or unresolved debug files. |

Leg 7 completed the rollup. A FAIL in either leg 2 or leg 6 deterministically produces BLOCKED. No active phase architecture-score reports exist in the legacy archived layout, so the weighted phase score is n/a; no arbitrary confidence percentage is substituted.

## Ranked Fixes

1. **Critical Astro build dependency.** Advisory [GHSA-26w7-cxv4-gfx2](https://github.com/advisories/GHSA-26w7-cxv4-gfx2) affects installed Astro 6.4.2. The authoritative critical fix requires Astro at least 7.2.8; a reviewed framework/integration compatibility update is needed. Include patched Sharp, then rerun the dependency audit and complete source/browser/performance gates. npm's proposed Astro 6.4.8 is insufficient for this advisory. Source: leg 2.
2. **Critical audit-tool dependency.** The development LHCI/Express chain contains proxy-addr 2.0.7; [GHSA-jqcg-44mw-7w3h](https://github.com/advisories/GHSA-jqcg-44mw-7w3h) is fixed in 2.0.8. Re-resolve the audit-tool dependency tree while retaining the release budgets and exact direct dependency pins. Additional high/moderate/low entries are listed in the dependency report. Source: leg 2.
3. **Video size policy.** All 72 oversized tracked files are intentional approved MP4 web assets; the largest is 48.6 MiB. The confidence workflow nevertheless specifies FAIL for tracked files above 5 MB. Resolving this requires an explicit project-specific exception for intended media, or a separately approved external-media delivery change. Neither a destructive history rewrite nor an unrequested hosting migration was performed. Source: leg 6.

## Repository Cleanliness

| Check | Count | Threshold / interpretation |
|---|---:|---|
| Untracked files before this rollup | 0 | 0; intended reports already saved in the audit commit |
| Gone branches | 0 | 0 |
| Tracked files over 5 MiB | 72 | Workflow threshold 0; all are delivery MP4s |
| Oversized non-video files | 0 | Context for the media-policy decision |
| Orphaned `.planning/_absorbed` directory | 0 | 0 |
| Unresolved debug files | 0 | 0 |
| Active source TODO markers | 2 | Informational: deferred Studio reel and optional analytics token |

Prepared output is 1,000,366,880 bytes. Its media storage footprint needs review before adding further large collections. No generic file-size exception was inferred from the successful media push.

## Verification Limits

- GitHub Pages serves static output; the dependency audit does not establish a remotely exploitable Astro/Express service on the public site.
- The UAT CLI cannot enumerate this project's absent active phases directory. Historical M01 material remains in its existing archive, and current content approval is recorded directly. No UAT success result or new phase contract was fabricated.
- Project agent-roster and Nyquist gap analysis were skipped because this repository has no project GSD agent roster or active executed-phase summaries. Claude-specific runtime probes are unavailable in Codex. Deep ecosystem work was not requested.
- Gallery and Deep Cuts have browser coverage but are outside the current twelve Lighthouse URLs. External YouTube/provider playback is not established by stubbed provider tests.
- The public release was not re-verified in this sweep. No new PR, merge, tag, archive, deployment, or history rewrite occurred.
- Model usage and cost are unavailable.

## Saved Evidence

- `.planning/QUALITY-SWEEP.md`
- `.planning/dependencies/DEPENDENCIES-REPORT.md`
- `.planning/BUILD-VERIFICATION.md`
- `.planning/DOC-SYNC.md`
- `.planning/codebase/STACK.md`, `INTEGRATIONS.md`, `ARCHITECTURE.md`, `STRUCTURE.md`, `CONVENTIONS.md`, `TESTING.md`, `CONCERNS.md`
- Temporary local logs: `/tmp/boh-confidence-verify.log`, `/tmp/boh-confidence-lighthouse.log`
- Frozen Lighthouse reports: `.lighthouseci/lhr-*.json`

The approved application/media commit is already backed up remotely. Documentation and confidence reports are committed locally, with push/finalization held at the confidence gate.

## Ship Gate

Confidence: BLOCKED (n/a). Ship now via finalize, fix the 3 findings first, or stop?

Recommended response: Fix-first. A blocked result must be resolved before finalization; the prior publication approval does not waive dependency findings or the generic file-size policy. Rerun `$gsd-confidence` after remediation and the media-policy decision.

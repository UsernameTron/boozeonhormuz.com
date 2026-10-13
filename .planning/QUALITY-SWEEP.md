---
generated: 2026-10-13T06:14:01Z
verdict: BLOCK
blocking: 2
warnings: 1
info: 3
---
# Quality Sweep

Scope: planning health, outstanding UAT, npm dependencies, project agent roster, and validation discovery.

## BLOCKING (2)

| Source | Finding | Remediation |
|---|---|---|
| Dependency audit | Astro 6.4.2 has the critical AVIF native image processing advisory GHSA-26w7-cxv4-gfx2. The authoritative patched Astro release is 7.2.8; npm's 6.4.8 suggestion does not resolve it. | Plan a reviewed compatibility upgrade, include patched Sharp, rerun `$gsd-audit-deps` and the complete release checks. |
| Dependency audit | The development LHCI/Express dependency tree contains the critical proxy-addr 2.0.7 advisory GHSA-jqcg-44mw-7w3h; 2.0.8 is patched. | Re-resolve the affected audit-tool dependency tree and rerun `$gsd-audit-deps`; preserve performance gates. |

The deployed Pages artifact is static. Neither a production Astro server nor an Express server exists in that artifact. These findings concern build, development, and audit tools; this audit does not establish exploitation of the public site. Critical-with-fix findings still receive BLOCK under the audit contract.

## WARNINGS (1)

The npm audit also reports 24 high, 11 moderate, and 3 low vulnerable package entries. The production-manifest subset is 1 critical, 10 high, and 1 low; propagated effects mean these counts are not counts of independent CVEs. The dependency report also flags two version-staleness items. Resolve the dependency findings through one compatibility review and rerun `$gsd-audit-deps`, rather than accepting npm's suggested LHCI downgrade or force fixes.

## INFO (3)

- Planning health was initially degraded by missing canonical PROJECT sections and missing config. The reversible config repair and document sync resolved them; the fresh CLI verdict is healthy with zero errors and warnings.
- Current content is owner-approved. The complete source, fixture, media/output, and 80-browser-check validation passed. There are no active phase summaries in this legacy archived project layout.
- The selected quality-sweep scope does not perform application remediation. No dependency versions, lockfile, media bytes, release protection, or application source were changed by this audit.

## Skipped legs

- Project agent-roster audit: no `agents/gsd-*.md` roster exists in this website repository. Auditing the installed GSD source package is outside this project scope.
- UAT CLI: `.planning/phases/` does not exist; the command reports no phases directory. Historical M01 plans and finalization live under `.planning/milestones/`. Current owner approval and browser evidence are recorded separately; a zero-item UAT result was not fabricated.
- Validation-gap analysis: no executed phase SUMMARY exists in an active phases directory. No research/validation contract was invented for this maintenance batch.
- Claude-specific plugin/session runtime probes: unavailable in the Codex runtime, as required by the adapted execution contract. Deep ecosystem legs were not requested.

## Verdicts

health: PASS

uat: SKIPPED (legacy archived layout; no active phases directory)

deps: BLOCK

agents: SKIPPED (no project agent roster)

validation: SKIPPED (no active executed phase)

Leg 2: FAIL (2 blocking findings, 1 warning).

Evidence: `.planning/dependencies/DEPENDENCIES-REPORT.md`, fresh `gsd-tools validate health` output, and `/tmp/boh-confidence-verify.log`.

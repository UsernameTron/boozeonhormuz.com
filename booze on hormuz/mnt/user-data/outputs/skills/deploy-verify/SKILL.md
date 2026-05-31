---
name: deploy-verify
description: |
  Post-deploy validation gate for a static site. Runs deterministic checks via a bundled script: HTTP status, HTTPS/HSTS enforcement, the Cloudflare Workers-trap check (confirms *.pages.dev not *.workers.dev), host-serving headers, HTML-title presence, and 404-content detection — then prescribes the manual Lighthouse + broken-link passes. Emits a JSON pass/fail report.

  Inputs: a live URL + expected host. Outputs: a verification report with per-check verdicts and a prioritized fix list. Reports problems; does not fix them.

  REFUSES: building or scaffolding the site, deploying or changing DNS (use domain-infra-provisioner), editing content/design, patching the issues it finds.

  TRIGGERS: "verify the deploy", "is the site live", "post-deploy check", "check the site headers", "did the deploy work", "lighthouse check", "broken link scan".
---

# Deploy Verify

Confirm a deploy actually worked — beyond "the build went green." Catches the silent failures: missing HTTPS enforcement, the Cloudflare Workers trap, 404 content served at a 200 status, propagation half-states.

## QUICK START
1. `python3 scripts/verify.py https://<domain> --expect-host cloudflare|github`
2. Read the JSON verdict. Any FAIL → fix at the source (usually domain-infra-provisioner), re-run.
3. Run the manual passes the script can't: Lighthouse (perf/a11y/SEO ≥90) and a broken-link scan.

## WHEN TO USE
- Immediately after a deploy or DNS change
- Confirming a host migration landed (e.g. GitHub → Cloudflare)
- On every PR preview before merge (gate)
- When a site "should be live" but something looks off

## WHEN NOT TO USE
- Provisioning/deploying/DNS → domain-infra-provisioner
- Building the site → astro-static-scaffold
- Fixing the issues found → route to the owning skill (this reports, doesn't patch)

## PROCESS (sequential)

### Step 1: Run the deterministic checks
`python3 scripts/verify.py <url> --expect-host <cloudflare|github>`. The script checks: reachable, 2xx/3xx, HSTS present, NOT on workers.dev, host-serving header, `<title>` present, no 404 markers in body.
Expected output: a JSON report; exit 0 = all pass, non-zero = issues.

### Step 2: Triage failures to their source
Map each FAIL to the owning skill — missing HSTS or workers.dev URL → domain-infra-provisioner; missing title or 404 content → astro-static-scaffold or content. Do not patch here.
Expected output: a prioritized fix list naming the owning skill per issue.

### Step 3: Manual passes the script can't do
Lighthouse needs a real browser; run `npx lighthouse https://<domain> --view` (or the Chrome DevTools panel) and confirm ≥90 on performance, a11y, best-practices, SEO. Run a broken-link scan. Spot-check OG cards in a social-preview validator.
Expected output: Lighthouse scores + link/OG findings appended to the report.

### Step 4: Verdict
Combine deterministic + manual into a single PASS / FAIL-with-fixes. PASS only when all deterministic checks pass and Lighthouse ≥90.
Expected output: final verdict block.

## OUTPUT SPECIFICATION
A verification report: the script's JSON (per-check verdicts), Lighthouse scores, link/OG findings, and a final PASS/FAIL with a prioritized, source-attributed fix list.

## ERROR HANDLING
| Condition | Action |
|---|---|
| Script: not reachable | DNS still propagating, or host down; wait and re-run, check infra-state |
| Script: on workers.dev | Cloudflare trap; route to domain-infra-provisioner Branch A step 3-4 |
| Script: HSTS missing | HTTPS enforcement not on; GitHub path needs Enforce HTTPS toggle |
| Script: 404 markers at 200 | Wrong content/base path; check the build output and host root |
| Lighthouse < 90 | Append the failing audits; route perf fixes to the build, not here |

## DEPENDENCIES
- `scripts/verify.py` — bundled, tested; stdlib only (urllib/ssl), no install needed
- For the manual pass: a browser / `npx lighthouse`
- A live URL to test

## NOTES
Pipeline position: terminal verification stage, after domain-infra-provisioner. Reports and routes; never patches. Safe to run repeatedly and as a PR gate.

v1.0.0

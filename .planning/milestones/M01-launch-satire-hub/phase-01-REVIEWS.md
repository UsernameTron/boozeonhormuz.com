---
phase: 1
reviewers: [codex]
gemini_status: failed (403 ACCESS_TOKEN_SCOPE_INSUFFICIENT — environment auth, not a plan issue)
reviewed_at: 2026-05-31
plans_reviewed: [phase-01-PLAN.md]
---

# Cross-AI Plan Review — Phase 01 (Foundation Setup)

> Gemini CLI failed on an OAuth scope error (`generativelanguage.googleapis.com` access-token scope insufficient) — an environment problem, not a plan finding. Codex provided a complete independent review. One independent reviewer of a different model family is sufficient to proceed.

## Codex Review

### Summary
Solid on intent and mostly aligned with current Astro 6 + GitHub Pages practice, but with a few correctness/reproducibility gaps that could cause avoidable first-run deploy failures in a "minimum-session" build. Tightening them keeps phase-01 truly "push once, live once."

### Strengths
- Clear scope control: content-free, pipeline-first, explicit exit gates.
- Correct stack for free-tier static hosting (Astro static + Pages + Actions).
- Lockfile-driven installs (`npm ci`) + exact pins.
- Correct `site` for apex domain, no `base` misuse.
- Good CNAME-preservation and custom-domain deploy verification.
- Polymorphic `evidence` design is future-proof without collection sprawl.

### Concerns
- **HIGH** — `actions/checkout@v4` drifts from the canonical `withastro/action@v6` example (`checkout@v6`). Unnecessary drift in a "known-good minimal pipeline."
- **HIGH** — Step 3 stubs empty content dirs + YAML but never specifies a *valid* `quotes` stub shape for `file('./src/data/quotes.yaml')`. Empty/malformed YAML fails Zod validation → breaks `astro check`/`build`.
- **MEDIUM** — `npm create astro@latest` then "pin what it resolved" is reproducibility-risky; template output drifts over time. Pin `astro@6.4.2` explicitly before first install.
- **MEDIUM** — `gh auth status` only checks `repo` scope; Pages build-type toggle + run-watching need correct token context. Add a concrete auth-remediation block.
- **MEDIUM** — Legal checklist sits in the foundation deploy phase though it's deferred to content launch — process noise/scope creep in a minimum-steps phase.
- **LOW** — "recreate CNAME" is ambiguous vs the pre-existing root `CNAME`; clarify root `CNAME` vs the `public/CNAME` that must ship in `dist/`.
- **LOW** — No `.nvmrc`/`engines` pin; `withastro/action@v6` defaults to Node 24 in CI vs local Node 22 → cross-env surprises.

### Suggestions
1. Workflow → `actions/checkout@v6`, `withastro/action@v6`, `actions/deploy-pages@v4`.
2. Ship a *valid* `src/data/quotes.yaml` stub (≥1 valid object) or empty-safe parse.
3. Pin `astro@6.4.2` at scaffold time, not after.
4. Add a `gh` auth re-scope/retry block for the Pages API call.
5. Move the legal checklist to a phase-02 pre-content gate.
6. Make CNAME semantics explicit: `public/CNAME` is the artifact that must land in `dist/`.
7. Commit `.nvmrc` (`24`) or set `withastro/action` `node-version` to match local.

### Risk Assessment
**MEDIUM** — close to executable, but enough small correctness/reproducibility gaps (workflow version drift, stub schema ambiguity, scaffold/version determinism) to cause first-pass failure or ad-hoc fixes, conflicting with the 1–3 session minimum-friction objective.

**Sources:** Astro v6 content-collections + loader docs; `withastro/action@v6` README; Tailwind v4 Astro guide.

---

## Consensus Summary

Single independent reviewer (Codex). No second reviewer to cross-check, so findings are treated as a strong-single-source signal, not consensus.

### Highest-priority (must fix before execution)
1. **Workflow version drift** — pin `checkout@v6` to match the canonical Astro Pages example.
2. **`quotes.yaml` stub must be valid** — empty YAML breaks the build via Zod.
3. **Pin `astro@6.4.2` at scaffold time** — remove resolve-then-pin nondeterminism.

### Should fix
4. `gh` auth remediation block for the Pages API call.
5. Move the legal checklist out of the foundation execution path (phase-02 pre-content gate).
6. Clarify root `CNAME` vs `public/CNAME` artifact.
7. Add `.nvmrc` (`24`) for local/CI Node parity.

### Reviewer did NOT catch (orchestrator-added, structural)
8. **Directory/repo collision** — `~/projects/boozeonhormuz-com/` already exists, is gitignored by the parent workspace, is NOT yet its own git repo, and contains private build tooling. Step 1's `gh repo clone ... boozeonhormuz-com` cannot run into a populated dir, and a naive `git init && push` would publish private tooling to a public repo. Re-plan must reconcile this and decide public-repo contents.

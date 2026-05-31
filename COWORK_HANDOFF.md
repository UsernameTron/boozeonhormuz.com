# Cowork Handoff — boozeonhormuz.com Foundation (Revised)

> Paste the block below into a fresh Cowork session. It executes Phase 0–2 of `RUNBOOK.md`: legal pre-flight, host-agnostic Astro scaffold, and Cloudflare Pages deploy.

---

```
You are executing the foundation phases of a static website build for Connor's boozeonhormuz.com — a satirical fake-luxury-brand site that's the content hub for the "Who the Hell Is Don Biggly?" sketch series. The full runbook is on disk. You are the engineering executor: not the designer, not the content author. Execute the runbook as written.

## CONTEXT

- Operator: C. Pete Connor (vibecoder, MS in AI, VP of Technology at CTG). Direct, no fluff, expert-calibrated.
- Planning docs at: ~/projects/boozeonhormuz-com/docs/
- Repo: UsernameTron/boozeonhormuz.com (exists, public, has a root CNAME, DNS currently on GitHub Pages)
- This session covers RUNBOOK Phase 0 (pre-flight) → Phase 1 (scaffold) → Phase 2 (Cloudflare Pages deploy). STOP after Phase 2.

## REQUIRED READS — IN ORDER, BEFORE ANY ACTION

1. ~/Claude Cowork/ABOUT ME/about-me.md
2. ~/Claude Cowork/ABOUT ME/anti-ai-writing-style.md
3. ~/Claude Cowork/ABOUT ME/my-company.md
4. ~/projects/boozeonhormuz-com/docs/PROJECT-CONTEXT.md
5. ~/projects/boozeonhormuz-com/docs/RUNBOOK.md   ← YOUR EXECUTION SCRIPT
6. ~/projects/boozeonhormuz-com/docs/SKILLS-AND-AGENTS.md   (for which skills/reviewers to invoke)

Read silently. Do not summarize back. Then act.

## GROUNDING REQUIREMENT (non-negotiable)

This runbook contains CLI commands and package versions composed partly from memory. Before running any command that creates a project, installs a package, or calls an external API, VERIFY the current syntax/version is correct (e.g. `npm view <pkg> version`, check the tool's `--help`). If the runbook's command differs from current reality, STOP and report the delta with the corrected command — do not silently substitute. Apply hallucination-guard discipline throughout.

## INITIAL ACTIONS

1. Invoke /gsd-toolkit state-advisor on ~/projects/boozeonhormuz-com/. Confirm the foundation is planned and ready.
2. Confirm with Connor which host path to take:
   - DEFAULT (recommended): Cloudflare Pages — requires moving nameservers to Cloudflare. RUNBOOK Phase 2.
   - ALTERNATIVE: GitHub Pages — zero DNS rework, already wired. RUNBOOK Appendix A.
   Do NOT proceed past Phase 1 until Connor confirms the host. Phase 0–1 are identical either way, so begin those immediately.

## EXECUTION MANDATE

Run RUNBOOK Phase 0, then Phase 1, in order. After each step:
- Verify the "Expected" line matches reality.
- Match → proceed. Mismatch → STOP, capture exact output, report before continuing.
Working directory: ~/projects/boozeonhormuz-com/. Astro installs via the temp-dir method in Step 1 (do NOT init Astro directly in the non-empty repo).

At the Phase 1 → Phase 2 boundary, confirm Connor's host choice, then execute the matching deploy path.

## HARD CONSTRAINTS

- DO NOT write site content beyond the placeholder homepage in Step 5. Content is a separate checkpoint (Checkpoint A → Content Team).
- DO NOT finalize design tokens. The @theme block in Step 5 is an intentional placeholder; real tokens come at Checkpoint B → Visual Team.
- DO NOT add Phase 3 features (sitemap, analytics, OG cards, schema, branch protection). Out of scope this session.
- DO NOT install @astrojs/cloudflare. This is a STATIC site; the SSR adapter triggers the Workers trap.
- DO NOT skip `npx astro check`, `npm run dev`, or `npm run build` local verification in Step 6.
- DO NOT skip pinning Tailwind exactly + committing package-lock.json.
- DO NOT push before `npm run build` exits 0 locally.
- On the Cloudflare path: VERIFY the deploy URL is *.pages.dev, NOT *.workers.dev. If workers.dev, you used the wrong flow — delete and redo via Workers & Pages → Pages tab → Import repo.

## REVIEW GATES (invoke before merge — clean context, per SKILLS-AND-AGENTS.md)

Before the Phase 1 commit:
- Code Reviewer (engineering:code-review) — config + components
- Accessibility Auditor (design:accessibility-review) — skip-link, single h1, contrast ≥4.5:1 body / ≥3:1 display

Report each reviewer's verdict. If either returns blocking issues, fix and re-review before pushing.

## FAILURE PROTOCOL

On any failure:
1. Capture exact error + the command that produced it.
2. Check RUNBOOK "Common failure modes & fixes".
3. If matched, apply the documented fix ONCE.
4. Works → proceed. Fails or undocumented → STOP and report: original error, fix attempted, result, proposed next step.

## SUCCESS CRITERIA (Phase 0–2 complete when ALL true)

1. `npx astro check` exits 0
2. `npm run build` exits 0, dist/ produced
3. No fonts.googleapis.com request in the network tab (fonts are self-hosted)
4. Gold-on-navy body text ≥ 4.5:1 contrast
5. package-lock.json committed, Tailwind pinned exact (no ^ or ~)
6. Live on the chosen host (*.pages.dev or GitHub Pages URL) returns 200
7. https://boozeonhormuz.com returns 200 over HTTPS (after DNS propagation; *.pages.dev works immediately)
8. Footer disclaimer renders on every page

## OUTPUT FORMAT

Smart Brevity. Lede ≤25 words. "Why it matters" only when non-routine. Bulleted detail with concrete file paths and numbers. No filler, no apologies, no preamble. When Phase 2 is done, post the final status block and STOP — do not begin Phase 3 or any content work.

## ESCALATE TO CONNOR

- Host choice (before Phase 2)
- Any command whose verified syntax differs from the runbook
- Any failure not covered by the failure-modes table
- Cloudflare routing to workers.dev instead of pages.dev
- Phase 2 complete and ready for sign-off

## TONE

Direct. Expert-calibrated. Connor knows architecture and delegates implementation. Give him the data and the next decision, not a lecture.

Begin: read the 6 files, then run /gsd-toolkit state-advisor and start RUNBOOK Phase 0.
```

---

## After this session

**Checkpoint B (design tokens + hero media)** — stand up the Visual Team:
```
Invoke frontend-design to author the real luxury-satire design tokens for boozeonhormuz.com, replacing the placeholder @theme block in src/styles/global.css. Then invoke nano-banana-cinematic-director for the hero image + promo loop (cruise ship, sea mines, champagne, gold typography — Don Biggly is fictional). Gate with design:design-critique and design:accessibility-review (clean context). Review tokens with Connor before committing.
```

**Checkpoint A (content)** — stand up the Content Team:
```
Invoke mirror-universe-pete:content to generate copy for boozeonhormuz.com per content type (products, sponsor reads, Evidence Lounge intro, fake testimonials), mirror-universe-pete:roast for the Don Biggly quote cards into src/data/quotes.yaml, and mirror-universe-pete:doublespeak for the fake-disclaimer bits. Polish with human-writing. Gate with mirror-universe-pete:voice-engine AUDIT mode and a legal/safety reviewer (clean context — disclaimer on every page, right-of-publicity check on Don Biggly). Review with Connor before commit.
```

**Phase 3 + pipeline skills** — re-invoke `gsd-planner` to flesh out Phase 3, then `skill-builder`/`skill-forge` to codify `domain-infra-provisioner` and the rest of the website pipeline (memory #22).

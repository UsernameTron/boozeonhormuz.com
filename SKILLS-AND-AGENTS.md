# Skills & Agents — boozeonhormuz.com

How your existing Claude skills, subagents, and agent teams map onto this build. Optimized for end-result quality, not token economy — that means liberal use of clean-context reviewers and the Opus-advisor / Sonnet-executor pattern.

---

## PART A — Skill application map

Which skill fires at which stage, what it produces, and on which surface.

| Stage | Skill | What it does here | Surface |
|---|---|---|---|
| **Goal framing** | `first-principles-goal-planner` | Already implicitly done via the brief. Re-run only if the *purpose* of the site shifts (e.g. "this is now a paid Patreon funnel"). | Desktop |
| **Decision support** | `decision-toolkit` | Frame the two open forks objectively: Cloudflare vs GitHub Pages, Tailwind v4 vs v3. Produces a decision brief so the choice is recorded, not vibes. | Desktop |
| **Planning** | `gsd-planner` | Produced this runbook. Re-invoke to flesh out Phase 3 once Phase 2 ships. | Desktop |
| **Plan state advisor** | `gsd-toolkit` | Classify project state, confirm the foundation is "planned and ready," advise next command. | Desktop |
| **Foundation build** | *(no skill — raw Claude Code execution against RUNBOOK.md)* | Phase 0–2 is direct terminal work. Skills don't build it; the runbook does. | Claude Code |
| **Grounding the build** | `hallucination-guard` | Wrap the Claude Code session so it verifies every CLI flag, package version, and API path against reality instead of memory. Critical given the `npm create astro` flag uncertainty. | Claude Code |
| **Design system** (Checkpoint B) | `frontend-design` (public) | Author the real luxury-satire design tokens, type ramp, spacing scale, component patterns. **This replaces the placeholder tokens in global.css.** | Claude Code / Design |
| **Design system — what NOT to use** | ~~`obsidian-executive-poc-system`~~, ~~`obsidian-showcase-page`~~ | **Explicitly excluded.** Those encode your Obsidian dark-mode executive aesthetic. This brand overrides it — champagne-gold luxury, not emerald/violet terminal. Using them would fight the brand. | — |
| **Content voice — generation** | `mirror-universe-toolkit` **or** `mirror-universe-pete:content` | The brand voice — "a luxury brand written by a man who doesn't understand why everyone is horrified" — *is* Mirror Universe Pete. Generate product copy, sponsor reads, taglines, the Evidence Lounge intro, fake testimonials. | Desktop |
| **Content voice — euphemism bits** | `mirror-universe-pete:doublespeak` | The "fake disclaimer / legal-is-uncomfortable" comedy and any corporate-speak bits decode perfectly through this. | Desktop |
| **Content voice — quote cards** | `mirror-universe-pete:roast` | Generate Don Biggly one-liners for the quote machine (`src/data/quotes.yaml`). | Desktop |
| **Content polish** | `human-writing` | Final pass on any longer-form copy so it reads like a person wrote it, not a model. Use *after* Mirror voice generation, *before* commit. | Desktop |
| **Content prompt scaffolding** | `connor-prompt-scaffold` | Build the reusable generation prompts that feed the content pipeline (so episode N+1 copy is one prompt, not a cold start). | Desktop |
| **Visual assets — hero + promo** | `nano-banana-cinematic-director` | The brief wants "cinematic cruise ship, sea mines, champagne, gold typography." This skill is purpose-built for exactly that: foundation image + angle variations + first/last-frame video. Don Biggly is fictional, so it clears the no-real-person rule. Produces the hero and the promo loop. | Desktop / Design |
| **Page shells / components** (Phase 02) | `frontend-design` + `web-artifacts-builder` (example) | Build the polymorphic Evidence Lounge renderer, episode/product templates, quote-card grid, nav/footer. `web-artifacts-builder` if the Evidence Lounge gets interactive filtering. | Claude Code |
| **SEO + schema** (Phase 03) | `searchfit-seo:technical-seo`, `:on-page-seo`, `:schema-markup`, `:ai-visibility` | Technical audit, per-page meta, `VideoObject`/`CreativeWork` JSON-LD on episodes, and AI-visibility tuning so the satire surfaces correctly in LLM answers. | Claude Code |
| **Architecture review** | `agent-architecture-review` | Review the *content pipeline agent* design (Part C teams) before you automate episode ingestion. Catches security/correctness gaps. | Desktop |
| **Build the infra skill** (deferred) | `skill-builder` → `skill-forge` | Codify `domain-infra-provisioner` from this runbook (memory #22). `skill-builder` interviews + drafts; `skill-forge` audits to production grade. | Claude Code |
| **Build the pipeline skills** (deferred) | `multi-skill-system-designer` (done) → `skill-builder` each | The 8-skill website pipeline you designed earlier. Build each focused skill, chain per the system map. | Claude Code |
| **Context distillation** (pipeline plumbing) | `context-distillation` | Distill the brief into focused per-skill context files so each pipeline skill loads only what it needs. | Desktop |
| **Ongoing iteration** | `inbox-triage-scheduled` pattern / `create-scheduled-task` | A scheduled Cowork task that drafts the next episode's page from a YouTube URL + transcript, opens a PR, waits for your approval. | Cowork |

---

## PART B — Supporting subagents

Clean-context reviewers and specialists. The principle (from your multi-skill design): **the reviewer never sees the author's reasoning — clean whiteboard, unbiased.** Pull these from your existing plugins.

| Subagent | Role | Sourced from | Clean context? | Fires when |
|---|---|---|---|---|
| **Code Reviewer** | Security, perf, correctness on the Astro components + config | `engineering:code-review` | Yes | Before every merge to `main` |
| **Accessibility Auditor** | WCAG 2.1 AA — contrast, keyboard nav, semantic structure, focus states | `design:accessibility-review` | Yes | After Phase 1, after Phase 02 component build |
| **Design Critic** | Hierarchy, consistency, does it read "luxury" not "amateur" | `design:design-critique` | Yes | At Checkpoint B, after each page template |
| **Content Voice Auditor** | Scores copy against Mirror Universe Pete voice — banned AI-isms, voice sliders, signature moves | `mirror-universe-pete:voice-engine` (AUDIT mode) | Yes | After content generation, before commit |
| **Legal / Safety Reviewer** | Parody disclaimer present on every page; right-of-publicity gut check; no defamation of real named individuals | *custom prompt* (no plugin — author one) | Yes | Phase 0, and before any content goes public |
| **SEO / Schema Auditor** | Valid JSON-LD, meta completeness, sitemap integrity, OG cards render | `searchfit-seo:seo-audit` + `:schema-markup` | Yes | Phase 03 |
| **Performance Auditor** | Lighthouse ≥90 all four scores; flags heavy fonts, unlazy video, oversized images | *Lighthouse CI in a GH Action* + eval prompt | Yes | Phase 03, then on every PR |
| **Deploy Verifier** | Confirms live URL, HTTPS, headers, `*.pages.dev` not `*.workers.dev` | `deploy-verify` (your pipeline skill, once built) | Yes | End of Phase 2, every deploy |
| **Architecture Adversary** | The 4th ultrathink lens — actively tries to break the design | `ultrathink` (Adversarial perspective) | Yes | Before locking the content pipeline automation |

---

## PART C — Agent team compositions (options)

Four teams, deployed per phase. Each has a lead, members, and a review gate. You don't run all four at once — you stand up the team the current phase needs.

### Team 1 — Build Team (Phase 0–2: foundation)

```
LEAD: Architect (ultrathink)  ── owns the runbook, sequences the work
  ├─ Coder ......... executes Phase 1 steps, writes config + components
  ├─ Tester ........ runs astro check, build, preview; verifies each gate
  └─ GATE: Code Reviewer (clean context) ── reviews before push to main
            + Accessibility Auditor (clean context) ── a11y baseline
```
**Workflow:** Architect reads RUNBOOK → Coder executes a step → Tester verifies the "Expected" → repeat → at phase end, both clean-context reviewers gate the merge. **Hallucination-guard wraps the whole team** so CLI flags and versions get verified, not assumed.

### Team 2 — Content Team (Checkpoint A: copy)

```
LEAD: Mirror Universe Pete (content generation)  ── owns voice
  ├─ Doublespeak unit ...... fake disclaimers, legal-is-uncomfortable bits
  ├─ Roast unit ............ Don Biggly quote cards → quotes.yaml
  ├─ Human-writing polish .. final naturalness pass on long-form
  └─ GATE: Content Voice Auditor (clean context) ── PASS/FAIL on voice
            + Legal/Safety Reviewer (clean context) ── disclaimer + RoP check
```
**Workflow:** Pete generates per content type → Human-writing polishes → Voice Auditor scores (clean context, never saw the generation) → Legal Reviewer clears → commit. Reject loops back to Pete with the auditor's specific notes.

### Team 3 — Visual Team (Checkpoint B + assets)

```
LEAD: frontend-design  ── owns the design system + tokens
  ├─ Nano-Banana Cinematic Director ── hero image, angle variations, promo video
  ├─ Token author ......... writes the real @theme block (replaces placeholders)
  └─ GATE: Design Critic (clean context) ── luxury not amateur
            + Accessibility Auditor (clean context) ── contrast on final palette
```
**Workflow:** frontend-design sets tokens → Nano-Banana produces hero/promo media → Design Critic reviews the composed result (clean context) → Accessibility Auditor verifies the *final* gold/navy contrast (the placeholder may not survive). Approved tokens flow into `global.css`.

### Team 4 — Launch Team (Phase 03: production-grade)

```
LEAD: searchfit-seo orchestrator  ── owns discoverability
  ├─ technical-seo ......... crawlability, sitemap, robots
  ├─ schema-markup ......... VideoObject / CreativeWork JSON-LD
  ├─ on-page-seo ........... per-route meta + OG cards
  ├─ ai-visibility ......... how the satire surfaces in LLM answers
  └─ GATE: Performance Auditor (Lighthouse CI) ── ≥90 all scores, fails build below
            + Deploy Verifier (clean context) ── live, HTTPS, pages.dev
```
**Workflow:** SEO cluster runs in parallel → Performance Auditor gates via Lighthouse CI in the GH Action (hard fail under 90) → Deploy Verifier confirms the live state. Anything red blocks the production tag.

---

## PART D — Orchestration backbone (recommended given "prioritize end result")

Because you've told me to ignore token cost and optimize for the result, run the build under the **Advisor Strategy** pattern (`advisor-strategy-setup`):

- **Opus as planning advisor** — holds the runbook, sequences work, makes architectural calls, decides when a reviewer's objection is blocking vs cosmetic.
- **Sonnet as executor** — does the file writes, runs the commands, drafts the components.
- **Clean-context reviewers run as separate calls** — never share the executor's context, so their judgment is unbiased.

This produces better benchmark results than either model alone (your `advisor-strategy-setup` skill documents the SWE-Bench / TerminalBench lift) at the cost of more model calls — exactly the trade you authorized.

**Concrete setup:** Opus advisor with `max_uses` set generously, Sonnet executing, reviewers as discrete clean-context invocations. The Build Team and Launch Team benefit most; the Content and Visual teams are more single-pass and can run lighter.

---

## How this sequences end-to-end

```
decision-toolkit (lock the 2 forks)
   ↓
gsd-toolkit (confirm ready) ── Build Team [Opus advisor + Sonnet exec] ──► foundation live (Phase 0–2)
   ↓
Visual Team (Checkpoint B) ──► real design tokens + hero/promo media
   ↓
Content Team (Checkpoint A) ──► copy in voice, legally cleared
   ↓
Build Team again (Phase 02) ──► page shells + polymorphic Evidence Lounge
   ↓
Launch Team (Phase 03) ──► SEO, schema, analytics, Lighthouse ≥90, branch protection
   ↓
scheduled Cowork task ──► ongoing: new episode → drafted PR → your approval
   ↓
skill-builder + skill-forge ──► codify domain-infra-provisioner + the 8-skill pipeline (memory #22)
```

---

**v1.0 | 2026-05-30 | Maps Connor's skill library + plugin subagents to the boozeonhormuz.com build.**

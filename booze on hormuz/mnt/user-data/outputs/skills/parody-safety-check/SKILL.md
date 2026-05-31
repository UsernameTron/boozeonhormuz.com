---
name: parody-safety-check
description: |
  Pre-publish safety validation for satirical/parody content. Checks four risk dimensions against embedded rules: parody-disclaimer presence (every page), right-of-publicity exposure, defamation (fact vs protected opinion/parody), and real-person likeness in generated images. Emits a per-item risk report.

  Inputs: content (copy, page, image) + character/brand context. Outputs: a flagged report — CLEAR / REVIEW / HOLD per item, with concern and fix. Flags for human/attorney review; never gives legal advice or clears content as legal.

  REFUSES: giving legal advice, declaring content legally safe, acting as counsel, censoring protected satire, reviewing non-satirical content for IP it can't assess.

  TRIGGERS: "safety check this", "parody legal review", "is this publishable", "right of publicity check", "before-publish review", "defamation risk on this".
---

# Parody Safety Check

A fast gate before satirical content goes public. Catches the exposure that surfaces later as a takedown or a letter — disclaimer gaps, a character drawn too close to a real person, statements that read as fact rather than parody. It flags risk; it does not give legal advice, and it never clears content as definitively safe.

## QUICK START
1. Provide the content + the character/brand context.
2. Run each item through the four risk checks in `references/safety-rules.md`.
3. Get a per-item verdict: CLEAR / REVIEW / HOLD, each with the concern and a fix.
4. Anything REVIEW/HOLD → route to a human (and, for high-stakes, an attorney) before publish.

## WHEN TO USE
- Before satirical content (copy, page, image) ships publicly
- When a character/brand is close to a real public figure
- Confirming the parody disclaimer is present where required
- Assessing whether a line reads as protected parody or as a factual claim

## WHEN NOT TO USE
- Requests for legal advice or a definitive "is this legal" ruling → this flags, doesn't rule; escalate to counsel
- Non-satirical IP clearance it can't assess (trademark search, licensing) → human/specialist
- Writing or editing the content → content/voice skill
- Censoring satire that is actually protected → the skill defends protected parody, doesn't suppress it

## PROCESS (domain rules → flagged report)

### Step 1: Disclaimer presence
Confirm the parody/satire disclaimer renders where required — for a site, on **every** page (typically via the base layout), not just one. Missing or single-page placement → flag.
Expected output: disclaimer verdict + location note.

### Step 2: Right-of-publicity exposure
Assess whether the character, name, likeness, or scenario is close enough to an identifiable real person that it could be read as using their identity. US parody is protected but fact-specific; closeness to ONE identifiable individual raises risk. Flag with the specific resemblance and a distancing suggestion.
Expected output: RoP verdict per character/element.

### Step 3: Defamation distinction
For any statement about a real, named entity, classify: protected (opinion, hyperbole, obvious parody no reasonable person takes as fact) vs risky (a false statement of fact a reader could believe). Parody framing helps but isn't a blanket shield. Flag risky items.
Expected output: per-statement classification.

### Step 4: Image likeness
For generated/visual content, confirm no real, identifiable person's likeness is depicted. Fictional characters are fine; real-person faces are not. Flag any.
Expected output: image-likeness verdict.

### Step 5: Risk report
Compile a per-item table: CLEAR / REVIEW / HOLD, the concern, and a suggested fix. Add the overall recommendation and an explicit note: this is a risk flag, not legal clearance; high-stakes items warrant attorney review.
Expected output: `safety-report.md`.

## OUTPUT SPECIFICATION
`safety-report.md`: a per-item table (verdict, concern, fix), an overall recommendation, and the standing disclaimer that this is risk-flagging, not legal advice. CLEAR means "no flag raised," not "legally cleared."

## ERROR HANDLING
| Condition | Action |
|---|---|
| User asks "is this legal?" | Decline to rule; give the risk flags; recommend counsel for a definitive answer |
| Character clearly maps to one real person | HOLD; suggest distancing (composite the character, change identifying specifics) |
| Statement of fact about a real entity | REVIEW; suggest reframing as obvious opinion/hyperbole or removing the factual assertion |
| Disclaimer missing on some pages | HOLD until it renders globally via the layout |
| Uncertain on a close call | Flag REVIEW and escalate to human; never default to CLEAR to be helpful |

## DEPENDENCIES
- `references/safety-rules.md` — the four risk dimensions, heuristics, and the parody/opinion vs fact framework
- No script; no external services
- Human (and, for high-stakes, attorney) judgment for anything flagged

## NOTES
Pipeline position: a publish gate, before any satirical content goes live and again before wide linking. Calibrated for the boozeonhormuz.com / Don Biggly context but reusable for any parody project. Defends protected satire and flags genuine exposure — it does not suppress, and it does not clear.

v1.0.0

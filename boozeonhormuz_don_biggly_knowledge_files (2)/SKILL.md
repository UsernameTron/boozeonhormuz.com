---
name: nano-banana-cinematic-director
description: |
  End-to-end cinematic AI video production with Nano Banana Pro / Nano Banana 2 (Gemini 3 image models) for images and Veo 3.1 / Veo 3.1 Fast for video, grounded in Google's official Gemini API documentation. Four stages: narrative storyboard, foundation image + up to 14 reference variations with aspect/resolution control, Veo 3.1 first-frame/last-frame/reference-image video prompting with native synced audio, CapCut beat-locked 4K assembly. Bundles a 40+ camera-angle library, 20 video movements, scene-consistency rules, automation boundaries, and an official-API reference with model strings, pricing, and SDK code patterns.

  REFUSES: real-person deepfakes, copyrighted brand replication, fully unattended automation (per source creator's warning + Google's thought_signature requirement), non-Nano-Banana image pipelines, post-production beyond audio-synced cuts.

  TRIGGERS: "cinematic AI ad", "Nano Banana Pro", "Nano Banana 2", "AI video ad", "Veo 3.1", "Veo prompt", "camera angle variations", "first frame last frame", "foundation image", "infinite angles from one image", "multiple angles from one image", "bird's-eye view of my image", "AI character consistency across scenes", "scene consistency in AI video", "automate AI video workflow", "frame-to-frame prompting", "image to video pipeline", "gemini-3.1-flash-image", "gemini-3-pro-image", "veo-3.1-generate-preview"
---

# Nano Banana Pro Cinematic Director

## QUICK START

1. Verify the user has API access to `gemini-3.1-flash-image` (Nano Banana 2), `gemini-3-pro-image` (Nano Banana Pro), and a `veo-3.1-*-generate-preview` endpoint. Direct API via the `google-genai` SDK is the canonical path. AI Studio / Higgsfield / Flow are UI wrappers — use them if the user prefers, but the prompt structure is identical.
2. Run the four stages in order: Storyboard → Foundation Image + Variations → Frame-Based Video → Audio-Synced Assembly.
3. Never skip the Foundation Image — it carries 70%+ of the quality load. Up to 14 reference images can chain off it (10 objects + 4 characters on Flash Image; 6 + 5 on Pro Image).
4. Never auto-chain image → video without human review. See `references/automation-boundaries.md`. Google's `thought_signature` requirement across multi-turn editing reinforces this — naive automation drops signatures and breaks.

## WHEN TO USE

- User wants to create a cinematic AI video ad, short film, or product spot using Nano Banana + Veo 3.1.
- User has a concept or brand and needs a complete production pipeline from blank page to final MP4.
- User has a single starting image and wants multiple consistent camera angles (Dutch, bird's eye, rack focus, dolly, macro, etc.).
- User has two keyframes (first + last) and wants a Veo 3.1 generation prompt bridging them.
- User wants to use Veo 3.1's official reference-image feature (up to 3 assets) for character/product consistency.
- User wants to extend a previously generated Veo video (+7s per extension, up to 20 extensions, 141s max).
- User is evaluating what parts of an AI video workflow are safe to automate.
- User wants to convert a text brief into discrete storyboard scenes with starting-frame images.

## WHEN NOT TO USE

- User wants a deepfake of a real, identifiable person → refuse.
- User wants to replicate a copyrighted brand asset (logo, protected character) 1:1 → refuse and suggest inspired-style direction.
- User wants a pure image generator with no video step → use a general image-gen skill.
- User wants fully unattended end-to-end automation → refuse the fully-unattended part. Offer the staged-automation pattern instead.
- User wants post-production effects beyond basic audio-synced cuts (grading, compositing, VFX keying) → defer to a dedicated post skill.
- User wants a different image model (Flux, Midjourney, SDXL) as the primary → recommend a general img-gen skill.

## CONSTANTS

```
# Image models (official model strings, as of GA May 28, 2026)
IMAGE_FLASH           = gemini-3.1-flash-image          # Nano Banana 2 — high-volume, lower cost
IMAGE_PRO             = gemini-3-pro-image              # Nano Banana Pro — pro asset production, complex layouts, text rendering
IMAGE_FLASH_PREVIEW   = gemini-3.1-flash-image-preview  # deprecating June 25, 2026
IMAGE_PRO_PREVIEW     = gemini-3-pro-image-preview      # deprecating June 25, 2026

# Video models
VIDEO_STANDARD        = veo-3.1-generate-preview        # 720p/1080p/4K, reference images, extension, audio
VIDEO_FAST            = veo-3.1-fast-generate-preview   # same features, cheaper
VIDEO_LITE            = veo-3.1-lite-generate-preview   # 720p/1080p only, no 4K, no extension, cheapest

# Image config
ASPECT_RATIOS         = 1:1, 1:4, 1:8, 2:3, 3:2, 3:4, 4:1, 4:3, 4:5, 5:4, 8:1, 9:16, 16:9, 21:9
RESOLUTIONS           = 512, 1K, 2K, 4K   # Flash adds 512; Pro starts at 1K
THINKING_LEVELS       = minimal | high    # Flash only; minimal = default, faster
MAX_REF_IMAGES_FLASH  = 14 (10 object + 4 character)
MAX_REF_IMAGES_PRO    = 11 (6 object + 5 character)

# Video config
VIDEO_RESOLUTIONS     = 720p, 1080p (8s only), 4k (8s only, not Lite)
VIDEO_DURATIONS       = 4s, 6s, 8s         # must be 8s for 1080p/4k or references
VIDEO_ASPECT_RATIOS   = 16:9, 9:16
VEO_REFERENCE_IMAGES  = up to 3 (referenceType: "asset")
VIDEO_EXTENSION       = +7s per extension, up to 20x, 141s max (not Lite)
VIDEO_RETENTION       = 2 days server-side; download promptly
VIDEO_AUDIO           = native synced audio (dialogue + SFX + ambient via prompt)

# Pricing (paid tier, Standard, per Google docs)
PRICE_FLASH_1K        = $0.067 / image
PRICE_FLASH_2K        = $0.101 / image
PRICE_FLASH_4K        = $0.151 / image
PRICE_PRO_1K_2K       = $0.134 / image
PRICE_PRO_4K          = $0.24  / image
PRICE_VEO_31_720_1080 = $0.40 / sec
PRICE_VEO_31_4K       = $0.60 / sec
PRICE_VEO_31_FAST_720 = $0.10 / sec
PRICE_VEO_31_LITE_720 = $0.05 / sec

# Working principles
IMAGE_VARIATIONS      = 5 prompts per scene (high hit rate)
VIDEO_VARIATIONS      = 1 prompt per scene (cost-constrained)
SCENE_COUNT_TARGET    = 6–10 scenes for a standard ad
AUDIO_FIRST_PRINCIPLE = Pick audio track BEFORE cutting; sync cuts to the beat
FOUNDATION_REFERENCE  = Every follow-on scene chains from the foundation image
NARRATIVE_PRINCIPLE   = "Describe the scene, don't just list keywords" (Google's official guidance)
```

## OFFICIAL PROMPT STRUCTURE

Two prompt grammars apply — one for images, one for video. Both are documented by Google. Use them verbatim.

### Image prompt grammar (Nano Banana)

**Core principle (Google):** *Describe the scene as a narrative paragraph, don't list keywords.* Reasoning-driven generation responds better to coherent description than to comma-separated tags.

For **photorealistic** images, include:
- Subject + context (who/what, where)
- Composition (close-up, wide, portrait orientation)
- Lighting (golden hour, three-point softbox, rim-lit)
- Lens / camera (85mm portrait lens, shallow depth of field, bokeh)
- Mood (serene, gritty, heroic)

For **stylized illustrations / stickers**, declare:
- Style explicitly (kawaii, claymation, isometric, anime, pencil sketch)
- Background ("background must be white" — model does not support transparent)
- Outline + shading direction (bold clean outlines, cel-shading)

For **text in images**, use Nano Banana Pro:
- Quote the exact text in single quotes
- Describe font style ("clean bold sans-serif", "serif")
- Describe layout ("centered", "top-right corner", "fills the view")

For **product mockups**, declare:
- Studio lighting setup ("three-point softbox", "rim-lit")
- Surface ("polished concrete", "matte black backdrop")
- Camera angle as degrees ("slightly elevated 45-degree shot")

### Veo 3.1 prompt grammar (7 elements)

| # | Element | Required? | Example |
|:--|:--------|:----------|:--------|
| 1 | Subject | yes | "a ginger cat", "two hikers", "Tokyo skyline" |
| 2 | Action | yes | "drives a red convertible", "argues at a kitchen table", "rain falls on the pavement" |
| 3 | Style | yes | "cinematic", "film noir", "claymation", "documentary" |
| 4 | Camera positioning & motion | optional but high-impact | "aerial drone view", "dolly in", "slow orbit clockwise", "POV shot", "handheld" |
| 5 | Composition | optional | "wide shot", "extreme close-up", "two-shot", "single-shot" |
| 6 | Focus & lens effects | optional | "shallow depth of field", "macro lens", "rack focus", "wide-angle" |
| 7 | Ambiance | optional | "warm tones", "cool blue tones", "golden hour", "moonlit" |

### Veo 3.1 audio prompting (native synced audio)

Three cue types — write all three when audio matters:

- **Dialogue**: use straight quotes — `Man: "This must be the key."` or `A woman whispers, "Don't move."`
- **SFX**: explicit description — `tires screeching loudly, engine roaring, glass shattering`
- **Ambient**: environmental soundscape — `A faint eerie hum resonates in the background, distant thunder rolls`

## PROCESS

### Stage 1: Storyboard (concept → discrete scenes)

Goal: produce (a) a one-sentence vision and (b) 6–10 numbered scene descriptions written as **narrative paragraphs**, not bullet keyword lists.

Steps:
1. Ask the user for their brand, product, or concept. Example: "Oakley sunglasses, Mad Max desert vibe."
2. Generate a one-sentence creative vision. Confirm with the user.
3. Draft 6–10 numbered scene descriptions. Each scene must be a 2–3 sentence narrative covering: setting, subject, camera intent, mood cue. Do not write keyword tag lists — they generate worse images.
4. Present the storyboard to the user. Invite edits.
5. Flag which scenes share characters/objects. These get cross-scene references in Stage 2 (up to 14 attachments).
6. Save as `storyboard.md` with cross-reference notes.

### Stage 2: Foundation Image + Variations (Nano Banana)

Goal: produce (a) one definitive Foundation Image and (b) one starting-frame image per scene, all visually coherent, all chained off the foundation.

**Choose your model:**
- **Nano Banana Pro** (`gemini-3-pro-image`) — pick this for the foundation if the project needs accurate text rendering, complex layouts, professional finish, or search grounding. Higher cost.
- **Nano Banana 2** (`gemini-3.1-flash-image`) — pick this for scene variations and high-volume work. Supports 512px and 4K, adds `thinkingLevel` control, supports image search grounding.

**2a — Foundation Image (highest leverage step; do not skip):**
1. Ask the user for inspiration references (Pinterest, existing ads, film stills, MidJourney output).
2. Draft 4–5 candidate **narrative** prompts for the foundation. Each prompt should be a coherent paragraph with subject, lighting, lens, mood — not a tag list.
3. Specify aspect ratio + resolution explicitly. For a vertical hero shot: `aspect_ratio="9:16"`, `image_size="2K"`. For social: `1:1`, `2K`.
4. If grounding in real-world data matters (weather, sports score, current event, real entity), enable `tools=[{"google_search": {}}]`. For visual style references from real images, use `imageSearch` (Flash only).
5. Generate all candidates. User picks the winner.
6. Save the winner as `foundation.png` — this is "image one".

**2b — Scene Variations (one per scene):**
For each scene N (where N > 1):
1. Draft 5 prompt variations using camera terminology from `references/camera-angles-library.md`.
2. Keep variation prompts shorter and reference-anchored. The foundation image carries lighting / realism / palette — don't redescribe them.
3. Attach **the foundation image** (image one) as reference AND append: **"Use the same style, lighting, and aesthetic from image one."**
4. For recurring subjects (same character, product, vehicle), attach the earliest image that defines them — up to 14 total references on Flash. Cite by index: **"...of the rider from image two"**.
5. Set `aspect_ratio` and `image_size` per scene (most scenes match the foundation).
6. On Flash, set `thinkingLevel="high"` for complex compositions or text-heavy scenes; `"minimal"` (default) for fast iteration.
7. Generate. User picks the winner per scene.
8. Save as `scene_01.png ... scene_N.png`.

Expected output: N starting-frame PNGs with documented prompt + reference chain in `image-log.md` (record model used, aspect ratio, resolution, thinking level, reference image indexes).

**Code path (Python, Google Gen AI SDK):** see `references/official-api-reference.md` for the canonical snippets including reference-image attachment, thinking-level config, and grounding setup.

### Stage 3: Frame-Based Video Generation (Veo 3.1)

Goal: produce one 4–8 second video clip per scene, with character/scene continuity preserved by the starting frame and (where applicable) Veo's official reference-image and last-frame parameters.

**Choose your model:**
- **Veo 3.1** (`veo-3.1-generate-preview`) — highest quality. Use for hero scenes.
- **Veo 3.1 Fast** (`veo-3.1-fast-generate-preview`) — default. Most scenes. 4–8x cheaper than full Veo 3.1.
- **Veo 3.1 Lite** (`veo-3.1-lite-generate-preview`) — budget. No 4K, no extension, no reference images.

**Three Veo input modes — pick per scene:**

| Mode | Use when | Required config |
|:-----|:---------|:---------------|
| Text-to-video | No starting frame; scene is generative from text | `prompt` only |
| Image-to-video (first frame only) | Simple directional motion (slow zoom, static hold, pan, orbit). The starting frame anchors it. | `prompt` + `image=<starting frame>` |
| First + last frame interpolation | Focus shifts, lens pulls, transformations, reveal shots, anything where the ending look must match a known state | `prompt` + `image=<first>` + `lastFrame=<last>` in config |
| Reference images (up to 3) | Character/product consistency across scenes — pass the subject as a `VideoGenerationReferenceImage(reference_type="asset")` | `prompt` + `referenceImages=[ref1, ref2, ref3]` in config |

**Steps:**
1. For each scene, write a Veo prompt using the 7-element grammar. Write it as a coherent paragraph.
2. If audio matters, add dialogue (quoted), SFX, and ambient lines per the audio prompting syntax above.
3. Set `aspect_ratio` (`16:9` or `9:16`), `resolution` (`720p` default; `1080p` or `4k` only at `8s`), and `duration_seconds`.
4. Submit and **poll** — Veo is an async long-running operation. Min ~11s; peak 6 min.
5. Download within 2 days (server-side retention limit).
6. Save as `scene_01.mp4 ... scene_N.mp4`.

**Usable-footage rule:** treat each 8s clip as a sample from which you harvest 1–3 usable seconds. Clips that degrade late (helmet warps, face drifts) are still fine — you trim those frames in Stage 4.

**Extension (Veo 3.1 / Fast only, not Lite):**
- Pass the previously generated video as the `video` parameter to add 7 more seconds.
- Up to 20 extensions = 141 seconds max.
- Aspect ratio must be 9:16 or 16:9; resolution must be 720p.
- The 2-day retention timer resets when a video is referenced for extension.

Expected output: N scene MP4s. Document model + mode + resolution per scene in `video-log.md`.

### Stage 4: Audio-Synced Assembly (CapCut)

Goal: produce the final cut, with every scene transition landing on a musical beat.

Steps:
1. **Pick the audio track first.** Do not cut video before locking the track.
2. Note: Veo 3.1 produces native synced audio per clip. If clip-audio is what you want (dialogue + SFX), skip external music. If you want a music bed under cinematic visuals, mute clip audio at import or strip it during the edit.
3. Import the scene MP4s and the audio file into CapCut (free tier works).
4. Drop the audio on its own track. Identify the beat/cut points.
5. Drop each scene MP4 on the video track in storyboard order. Trim each clip so its transition out lands on a beat.
6. Use 1–3s of most clips. Some hero clips may get longer holds.
7. Apply minimal transitions (cuts are best; fade-to-black acceptable for open/close).
8. Overlay titles/CTA text on hero frames if needed.
9. Export at 4K.

Expected output: `final_cut.mp4` at 4K, beat-locked.

## AUTOMATION BOUNDARIES

See `references/automation-boundaries.md`. Summary:
- **Automate**: prompt drafting (LLM call), image batch via Batch API (50% cost reduction, 24h turnaround), scene tracking, async polling for Veo operations.
- **Do NOT automate**: image→video handoff without human review, scene selection from variations, video clip trimming without seeing footage, multi-turn image edits without preserving `thought_signature` fields.
- Google's `thought_signature` field is mandatory for multi-turn image editing in Gemini 3 image models — if you drop it on the next turn, you get a 400 error. Official SDKs handle this automatically in chat mode; manual REST orchestration must preserve and echo signatures.

## OUTPUT SPECIFICATION

```
{project-name}/
├── storyboard.md          # one-line vision + numbered narrative scenes + cross-refs
├── foundation.png         # the "image one" reference
├── images/
│   ├── scene_01.png
│   ├── scene_02.png
│   └── ...
├── image-log.md           # model, aspect, resolution, thinking level, reference chain
├── videos/
│   ├── scene_01.mp4
│   ├── scene_02.mp4
│   └── ...
├── video-log.md           # model, mode (text/img/first+last/refs), resolution, duration
├── audio.mp3              # locked music bed (optional if using Veo's native audio)
└── final_cut.mp4          # 4K export
```

## ERROR HANDLING

| Condition | Action |
|:----------|:-------|
| User asks for a real-person deepfake | Refuse. Offer a stylized original character. |
| User wants to replicate a copyrighted asset | Refuse. Offer inspired-style direction. |
| Foundation image looks generic or inconsistent | Stop. Do not proceed to variations. Iterate with user on inspiration. |
| Scene N drifts in character or palette | Check prompt references image one AND includes "use the same style, lighting, and aesthetic from image one". Add more reference images (up to 14). |
| Recurring character wrong (wrong face / outfit) | Add the earliest correct reference image and cite by index: "of the rider from image two". |
| Veo output degrades after ~5 seconds | Expected. Use the clean 1–3s in the edit. Do not regenerate unless the usable portion is broken. |
| First-frame-only video lands wrong subject at end | Switch to first + last frame mode. Provide both keyframes. |
| Nano Banana returns "No image data" / refuses complex prompt | Reduce prompt density. Move heavy direction to reference images. Lower thinking_level if on Flash. |
| 400 error on multi-turn edit | `thought_signature` was dropped. Use the official SDK in chat mode, or echo every signature exactly as received. |
| Generated text in image is garbled | Switch to Nano Banana Pro (`gemini-3-pro-image`); keep text under 25 chars; quote text in single quotes; describe font style. |
| User wants to automate image→video end-to-end | Refuse the fully-unattended version. Offer the staged-automation pattern (LLM prompt gen + batch image + human review + async video dispatch). |
| Scene count > 12 | Warn about cost. Suggest trimming to 8–10 hero scenes. With pricing constants above, calculate $$ before greenlighting. |
| Audio not chosen at cut time | Stop cutting. Lock audio first. Cadence depends on it. |
| Veo 3.1 vs Fast vs Lite confusion | Default to Fast. Use full 3.1 only for hero scenes. Use Lite only for budget-bound prototypes. |
| Video older than 2 days | Veo retention is 2 days. Cannot extend or re-reference. Regenerate. |
| User needs 1080p or 4K Veo output | Must use `duration_seconds=8`. Cannot do 1080p/4K at 4s or 6s. |

## DEPENDENCIES

- **Nano Banana models** — `gemini-3-pro-image` or `gemini-3.1-flash-image` via the Gemini API
- **Veo 3.1** — `veo-3.1-generate-preview` / `veo-3.1-fast-generate-preview` / `veo-3.1-lite-generate-preview` via the Gemini API
- **SDK** — `google-genai` (Python or JS/TS) is the canonical client; REST is supported; AI Studio / Higgsfield / Flow are UI wrappers
- **For CTG / ADR-0002 setup** — `google-genai` with `vertexai=True` using ADC. Keyless. See `references/official-api-reference.md`.
- **AI prompt assistant** — Claude (preferred), Gemini, or ChatGPT for drafting prompts
- **CapCut** — final assembly (free tier sufficient)
- **Reference files** (bundled):
  - `references/official-api-reference.md` — **NEW** — model strings, config params, pricing, code patterns
  - `references/camera-angles-library.md` — 40+ still-image camera angles
  - `references/video-movements-library.md` — video camera movements
  - `references/prompt-templates.md` — copy-ready patterns (rewritten for v2.0.0)
  - `references/scene-consistency-rules.md` — character/aesthetic continuity rules
  - `references/automation-boundaries.md` — what to automate vs what not
  - `references/workflow-decision-tree.md` — which path to take when

## ESCALATION

If the user needs:
- True studio-grade post (color grading, VFX, motion graphics) → hand off to a dedicated post skill.
- Voiceover and ADR beyond Veo's native audio → hand off to a dedicated voice skill.
- Campaign-scale asset variation (20+ ad units) → use Batch API (50% cost cut, 24h turnaround) and warn on iteration budget.
- Music generation → recommend Lyria 3 (`lyria-3-clip-preview` for 30s clips, `lyria-3-pro-preview` for full songs).

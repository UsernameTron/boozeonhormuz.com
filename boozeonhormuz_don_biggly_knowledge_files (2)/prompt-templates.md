# Prompt Templates (v2.0.0)

Copy-ready prompt patterns aligned to Google's official prompt structure for
Nano Banana (image) and Veo 3.1 (video).

**Core principle (Google's official guidance):**
> Describe the scene as a narrative paragraph, don't just list keywords. The
> model's strength is deep language understanding — narrative coherence beats
> tag lists, every time.

---

## Stage 1: Storyboard Prompt (feed to Claude / Gemini / GPT)

```
You are helping me storyboard a cinematic AI video ad.

Brand / concept: [e.g. Oakley sunglasses, desert motocross, Mad Max aesthetic]
Duration target: [e.g. 25 seconds]
Tone: [e.g. gritty, high contrast, heroic]

Give me:
1. A one-sentence creative vision.
2. A numbered list of 6–10 discrete scenes. For each scene, write a 2–3 sentence
   NARRATIVE PARAGRAPH covering setting, subject, camera intent, and mood.
   Do NOT write tag lists or bullet keywords — Nano Banana and Veo 3.1 both
   respond better to coherent narrative description than to disconnected
   keywords.

After the scenes, note which scenes share a recurring subject (same character,
same product, same vehicle). I will need this for cross-scene consistency
later — Nano Banana 2 supports up to 14 reference images (10 objects + 4
characters); Veo 3.1 supports up to 3 reference images.

Do not write the final video prompts yet. Just the storyboard.
```

---

## Stage 2a: Foundation Image Prompt (Nano Banana Pro recommended)

**Narrative paragraph pattern** — write a coherent description, not a tag list.

For **photorealistic** foundations:

```
A photo of [subject] [doing what] in [setting]. [Lighting description with
specific terms: golden hour / overcast natural / three-point softbox / rim-lit
night]. [Lens / camera term: 85mm portrait lens, shallow depth of field, soft
bokeh / wide-angle 24mm documentary feel / macro detail]. [Composition:
close-up portrait / wide establishing shot / 45-degree elevated product shot].
The overall mood is [serene / gritty / heroic / intimate].
[Aspect ratio orientation note: vertical / horizontal / square].
```

**Worked example (Oakley desert):**

```
A wide cinematic shot of a lone motocross rider standing beside a dust-caked
desert bike at the edge of a salt flat. The sun is low and bronze, raking
across the rider's silhouette and throwing a long shadow across the cracked
ground. Shot on a 35mm anamorphic lens with shallow depth of field — the
horizon line blurs into a heat haze. Composition is wide, two-thirds rule with
the rider on the right. The mood is heroic, gritty, lonely. Horizontal 16:9.
```

**Config to pair with this prompt:**
- Model: `gemini-3-pro-image` (Pro — best for hero foundation)
- `aspect_ratio="16:9"`, `image_size="2K"` or `"4K"`

For **stylized** foundations (anime, claymation, isometric, etc.) — declare the
style explicitly and the background:

```
A [style: kawaii / claymation / isometric / anime / 3D cartoon / pencil sketch]
of [subject]. [Style-specific direction: bold clean outlines, simple cel-shading
and vibrant palette / soft refined PBR textures and gentle lifelike lighting].
[Background: must be white / soft solid-colored / negative space top-left for
text overlay].
```

For foundations needing **accurate text** — use Nano Banana Pro, keep text
under 25 characters, quote it explicitly:

```
A [composition and setting]. [Lighting and lens]. The headline 'EXACT TEXT
HERE' appears in [clean bold serif / minimal sans-serif / hand-lettered]
font, [positioned: centered / top-right corner / fills the view]. [Mood].
```

---

## Stage 2b: Scene Variation (Nano Banana, foundation attached as reference)

The foundation image carries aesthetic, palette, lighting. Variation prompts
stay short and reference-anchored.

**Pattern:**

```
[Camera term from camera-angles-library.md] of image one, [scene-specific
action or composition detail]. Use the same style, lighting, and aesthetic
from image one.
```

**With recurring subject (Image N is the subject's reference):**

```
[Camera term] of the [rider / subject / character] from image two, [scene
action]. Use the same style, lighting, and aesthetic from image one.
```

**Worked examples:**

- `Bird's-eye-view of image one, the rider standing in the cross-shaped shadow of a power pylon. Use the same style, lighting, and aesthetic from image one.`
- `Dramatic side profile close-up of the rider from image two, helmet visor reflecting the desert horizon. Use the same style, lighting, and aesthetic from image one.`
- `Dutch angle low shot of the bike from image three, kicking up dust as it pulls away. Use the same style, lighting, and aesthetic from image one.`

**Attachments policy:**
- Image one (foundation) is **always** attached.
- Add the earliest scene where any recurring subject appears (image two onwards).
- Flash supports up to 14 attachments (10 objects + 4 characters).
- Pro supports up to 11 (6 objects + 5 characters).

**Config to pair with these prompts:**
- Model: `gemini-3.1-flash-image` (Flash is faster + cheaper for variations)
- `thinking_level="minimal"` (default) for fast iteration; `"high"` for complex compositions
- Match `aspect_ratio` to the foundation, or change deliberately for portrait/square cuts

---

## Stage 3: Veo 3.1 Prompts — 7-Element Grammar

Required: subject, action, style. Optional but high-impact: camera motion,
composition, focus, ambiance. Plus the three audio cue types when audio matters.

**Single-paragraph template:**

```
[STYLE adjective] [COMPOSITION shot type] of [SUBJECT] [ACTION], [CAMERA
MOTION]. [FOCUS / LENS effect]. [AMBIANCE: lighting, palette, mood].
[Audio dialogue in quotes if any]. [SFX]. [Ambient soundscape].
```

### Stage 3, Mode A: First frame only (simple directional motion)

Use for: slow zooms, static holds, pans, orbits where the starting frame is
the only anchor needed.

**Pattern:**

```
[Camera motion term from video-movements-library.md] toward [subject in the
first frame]. [Optional: ambiance / lens / audio cues]. Keep camera movement
[subtle / dramatic / steady] — the starting frame carries the look.
```

**Examples:**

```
Slow dolly in toward the rider standing beside the bike. Heat shimmer in the
foreground. Wind picks up grit across the salt flat. The faint metallic ping
of cooling engine.
```

```
Handheld documentary movement, subtle natural micro-tremor. Camera holds on
the rider's face as the visor reflects the horizon. Distant wind.
```

### Stage 3, Mode B: First + Last frame (focus shifts, transformations, reveals)

Use for: rack focus pulls, dolly zooms, subject transformations, reveal shots,
anything where the final frame must match a known state.

**Prompt-from-Claude pattern (feed your keyframes):**

```
I have two keyframe images attached. Write a single Veo 3.1 prompt that moves
from the first frame to the last frame.

Camera technique: [rack focus pull / slow dolly in / reveal / whip pan / dolly
zoom / orbit / none — let the motion be whatever best bridges the frames]

Use Google's Veo 3.1 prompt grammar:
- Subject (in motion description)
- Action (transition action between frames)
- Style (cinematic / documentary / film noir)
- Camera positioning and motion (the technique above)
- Composition
- Focus / lens effects
- Ambiance (lighting continuity is critical)

Add audio cues only if relevant:
- Dialogue in straight quotes
- SFX explicitly described
- Ambient soundscape

Keep the prompt tight. Describe the motion, not the subject — the keyframes
describe the subject.
```

**Expected output pattern:**

```
A slow cinematic rack focus pull from the helmet in the foreground (sharp,
first frame) to the desert horizon in the background (sharp, last frame).
Shallow depth of field throughout. Warm bronze raking light. Heat haze
shimmer. Subtle wind across the salt flat.
```

### Stage 3, Mode C: Reference images (up to 3, character/product consistency)

Use for: hero scenes that must preserve a specific character face, outfit, or
product across visual variation.

**Pattern:**

```
[7-element prompt as above], featuring [the character / the product] shown
in the reference images.
```

**Worked example:**

```
The character walks through a sunlit warehouse holding the product, then sets
it on a workbench. Slow dolly in, cinematic mood, shallow depth of field.
Soft warm window light. The clink of metal on wood as the product settles.
```

Attach character_ref + product_ref as `VideoGenerationReferenceImage` with
`reference_type="asset"`.

### Stage 3, Mode D: Video extension (+7s, Veo 3.1 / Fast only)

Use the previous operation's video as the `video` parameter; write a
continuation prompt.

```
Continue the action from the previous clip. [What happens next, in narrative
form.] [Camera continuation.] [Audio continuity — if voice is being extended,
make sure dialogue continues from the last second of the previous clip; voice
extension is unreliable if dialogue ends earlier.]
```

**Limits:**
- Up to 20 extensions per chain
- 141 seconds max total
- 720p only for extensions
- 9:16 or 16:9 aspect ratio
- Previous video must be ≤ 2 days old

---

## Stage 4: Audio Beat-Map Prompt (feed to Claude or manually)

```
I have an audio track and N Veo scene clips. I need to map scene transitions
to beats.

Audio characteristics: [BPM, phrase length, key accents — piano hit at 0:04,
drum kick at 0:08, vocal entry at 0:12]
Scene count: [N]
Target total duration: [X seconds]
Scene clip durations: [each clip is 8s; usable harvest is 1–3s per clip]

Suggest a cut map: scene index → in-time → out-time, anchored to beat
positions. Prefer cutting on beat. One hero scene holds slightly longer than
others. Note any clips where I should use Veo's native audio instead of
muting under the music bed.
```

---

## Reusable Suffix Library

**Aesthetic lock (Stage 2b, mandatory):**

```
Use the same style, lighting, and aesthetic from image one.
```

**Subject reference (Stage 2b):**

```
...of the [subject] from image [N]
```

**Motion simplicity (Stage 3, when foundation carries the look):**

```
Keep camera movement subtle. The starting frame carries the look.
```

**Veo audio cue starters:**

```
[Character name]: "exact dialogue line."         # dialogue
[Distinct sound effects, comma-separated.]        # SFX
[Ambient soundscape, one or two sentences.]       # ambient
```

---

## Quality Gates

**For any Nano Banana prompt:**

| Do | Don't |
|:---|:------|
| Write a narrative paragraph | Write a comma-separated tag list |
| Describe lighting, lens, composition in the foundation | Re-describe these in every variation |
| Name camera angles + framing in variations | Over-adjective the subject in variations |
| Reference recurring subjects by image index | Forget the aesthetic-lock suffix |
| Quote exact text in single quotes for text rendering | Exceed 25 characters in rendered text |
| Set `aspect_ratio` + `image_size` explicitly | Leave defaults when shape matters |

**For any Veo 3.1 prompt:**

| Do | Don't |
|:---|:------|
| Hit at least the 3 required elements (subject, action, style) | Skip camera direction on hero scenes |
| Write a coherent paragraph | Stack disconnected cinematic adjectives |
| Use single quotes for dialogue | Mix audio cues without separating types |
| Specify `aspect_ratio`, `resolution`, `duration_seconds` | Request 1080p or 4K at 4s or 6s — must be 8s |
| Download within 2 days | Assume the video is permanently stored |
| Reuse references for character consistency | Generate the same character 14 times from scratch |

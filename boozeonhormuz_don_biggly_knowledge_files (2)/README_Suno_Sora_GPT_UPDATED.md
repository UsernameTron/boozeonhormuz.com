
# 🎛️ README: Suno + Sora Multimodal Custom GPT Assistant (Updated)

This GPT is a full creative production assistant built to handle music lyric formatting, genre-aware prompt design, and cinematic video prompt generation for text-to-video systems like Sora.

---

## 🧠 What This Assistant Can Do

1. **Format raw lyrics for Suno**
2. **Apply Artist Modes** for tone, tag style, and genre
3. **Generate cinematic visual prompts** from lyrics/tags
4. **Inject motion, lighting, and texture modifiers** using a film-grade vocabulary
5. **Respond to structured creative triggers**, not just freeform queries

---

## 📁 Linked Knowledge Modules

This GPT has access to the following:

- `ArtistModes.md` — Defines persona behavior (Danzig, Misfits, Punk Goes Crunk, etc.)
- `TagGlossary.md` — Approved tag list for Suno-style structuring
- `LyricFormatterGuide.md` — Formatting behavior for lyric input
- `SoraPromptGeneratorModule.md` — Controls visual output format for cinematic scenes
- `SoraVisualPromptGuide.md` — Prompt scaffolding and style mapping for Sora
- `CinematicModifiers.md` — Visual vocabulary: lighting, motion, film styles
- `Genre_to_Prompt_Map.md` — Genre fusion rules and presets (optional)
- `Custom_GPT_Instructions_VisualProduction.md` — Full assistant instruction block (system-level logic)

---

## 🔑 Trigger Commands (Copy-Paste Examples)

### 🎙️ Lyric Structuring
- Format these lyrics using Suno structure and tags in [Danzig Mode].
- Apply [Misfits Mode] and tag with aggression and horror-punk elements.
- Use [Punk Goes Crunk Mode] and include [Break], [Hook], and [Bass Drop].

### 🎬 Visual Prompt Generation (Sora)
- Generate a Sora visual for this in [Artist Mode].
- Visualize this track using [Misfits Mode] with handheld camera.
- Create cinematic scene using [Acoustic Female Danzig Mode] with candlelight.

### 🔁 Modifier Injection
- Add fog, bokeh, teal/orange grading, and slow pan camera.
- Use VHS overlay, flickering light, and ambient haze.

---

## ⚠️ System Rules & Behavior (Clarified)

### 1. **Missing Lyrics or Context**
If the user says “Generate a Sora visual in Danzig Mode” but provides no lyrics/tags:  
→ **Respond with:**  
`"Cannot generate visual prompt — please provide lyrics or context."`

No hallucinated tone sketches or default tags should be created.

---

### 2. **Tag Conflicts Across Modes**
Tags like [Ghostly Echoes], [Hook], [Bridge] are interpreted **based on the current Artist Mode**.  
→ Same tag = different meaning depending on mode.

Example:  
- `[Ghostly Echoes]` in Danzig Mode → ritual fog, slow pan  
- `[Ghostly Echoes]` in Misfits Mode → VHS reverb, lo-fi chaos

---

### 3. **Custom Modifier Input**
If a user says “Add glitch horror effects,”  
→ **Do not generate new pseudo-tags** like `[Glitch Horror]`  
→ **Use cinematic language only** (as described in `CinematicModifiers.md`)  
→ All modifier behavior must be written in natural prose.

---

### 4. **Lyric-to-Visual Flow**
If a user pastes raw lyrics and specifies an Artist Mode:  
→ **Only format lyrics.**  
→ Wait for explicit visual trigger like:  
`"Now generate a Sora visual"` or `"Create cinematic output"`

Do not assume the user wants both formatting and visuals unless instructed.

---

### 5. **Loose Mood Prompts**
If user says “Make it gritty and sad” with no tags/mode:  
→ Ask:  
`"Would you like to format this using a specific Artist Mode or genre? I can help you choose one that fits the mood."`

Do **not** infer the genre or mode automatically.

---

## 💬 Meta Trigger
If unsure how to use the assistant, ask:
> "Review your README and explain what you can do."

Or:
> "Explain how to format lyrics, apply a mode, and generate visuals."

---

## 🧪 Sample One-Shot Prompt
```
Format these lyrics using Suno structure in Punk Goes Crunk Mode. Then generate a Sora visual prompt using handheld camera, red fog, and VHS static.
```

---

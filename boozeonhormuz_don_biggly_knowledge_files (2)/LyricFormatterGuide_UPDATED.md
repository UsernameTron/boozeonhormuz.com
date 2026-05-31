
# 🎼 Lyric Formatter Guide (for Suno-Style Prompting)

This guide governs how the assistant should format raw lyrics using Suno-compatible structure and tags, especially when an Artist Mode is specified.

---

## 🧠 Formatting Logic

1. **Use Tags Only When Justified**
   - Do not insert `[Bridge]` unless there's a clear contrast or pivot (melodic, rhythmic, or thematic).
   - Avoid adding `[Chorus]` or `[Hook]` unless a line is obviously meant to repeat or act as an anchor.
   - If structure is ambiguous or minimal (1–2 stanzas), default to a single `[Verse]`.

2. **Section Tags**
   - `[Intro]` — Use only for instrumental/opening lines or distinct mood setting before lyrics begin.
   - `[Verse]` — Default for narrative or non-repeating lyrical sections.
   - `[Chorus]` — Used for repeatable refrains or emotional punchlines.
   - `[Bridge]` — Reserved for contrast/pivot (musical or lyrical).
   - `[Break]`, `[Hook]`, `[Outro]` — Use only if stylistically appropriate and evident.

3. **Meta Tags**
   - Optional `Meta` block at the top can include:
     - Genre
     - Mood
     - Vocal Style
     - Instrumentation
   - Format:
     ```
     [Meta: Gothic Blues Rock | Mood: Brooding, Ritualistic | Vocal: Male Baritone | Instruments: Distorted guitars, ambient pads]
     ```

4. **Voice & Emotion Tags**
   - Add tags like `[Male Vocal]`, `[Female Vocal]`, `[Vulnerable Vocals]`, `[Melancholic Atmosphere]`, etc.
   - Use sparingly — only when clearly aligned with Artist Mode or mood cues.

5. **Artist Mode Rules Take Priority**
   - Tag and formatting behavior must follow the current Artist Mode profile (e.g., Danzig Mode = minimal, brooding, gothic structure).
   - Visual descriptions or energy level must match mode tone.

6. **Avoid Redundant Tags**
   - Do not duplicate `[Verse]` for short passages unless separated by clear stanza breaks.
   - Avoid adding `[Bridge]` or `[Hook]` as filler — GPT should err on the side of minimalism unless instructed otherwise.

---

## ✅ Example (Good)
```
[Meta: Gothic Blues Rock | Mood: Brooding, Ritualistic | Vocal: Male Baritone | Instruments: Distorted guitars, ambient pads]

[Verse]  
My shadow burns beneath the cross  
The silence cracks like glass  
I wear regret like leather skin  
And pray this storm will pass  

[Male Vocal] [Melancholic Atmosphere]
```

---

## 🛑 Example (Bad)
```
[Verse]  
My shadow burns beneath the cross  
The silence cracks like glass  
[Bridge]  
I wear regret like leather skin  
And pray this storm will pass  
```
*Reason: This is all thematically unified — no bridge detected.*

---

## Usage
This logic applies automatically when the user pastes raw lyrics and provides an Artist Mode.

GPT should:
- Always tag responsibly
- Match structure to musical style
- Ask for clarification only if absolutely necessary

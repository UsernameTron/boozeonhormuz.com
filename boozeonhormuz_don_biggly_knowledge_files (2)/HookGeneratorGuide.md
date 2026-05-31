
# 🎣 Hook Generator Guide (HookGeneratorGuide.md)

This module enables the GPT to generate compelling lyrical hooks based on a given verse, Artist Mode, and emotional tone.

---

## 🔥 What Is a Hook?

A **hook** is a short, punchy, emotionally resonant lyrical fragment:
- Designed to repeat
- Memorable and rhythmic
- Often appears in the chorus or intro
- Reinforces the track's central theme

---

## 🎯 When to Generate Hooks

Hooks should be generated:
- When the user requests it directly (e.g., "Generate a hook for this track")
- After formatting a verse if the structure feels chorus-worthy
- As part of chorus generation, if a `[Hook]` tag is relevant

---

## 🧠 Hook Generation Logic

1. **Analyze:**
   - Current `[Verse]` section
   - Active Artist Mode
   - Mood tags
   - Vocal tone

2. **Condense:**
   - Identify the emotional or thematic core of the verse
   - Create 1–2 lines that summarize or heighten the theme

3. **Style-Match:**
   - Danzig Mode → Gothic, dramatic, poetic
   - Misfits Mode → Lo-fi, aggressive, sarcastic
   - Punk Goes Crunk Mode → Punchy, rhythmic, braggadocious

4. **Tag Accordingly:**
   - Output should be labeled with `[Hook]`

---

## 🧪 Example Outputs

### 🔥 Input Verse:
```
I stomp the ash with every beat  
My city screams beneath my feet  
The sirens howl, the speakers bleed  
I'm born from static, bred to lead
```

### 🎸 Artist Mode: Punk Goes Crunk

**Hook Output:**
```
[Hook]  
Basslines bleed, I never miss.  
City raised me in glitch and hiss.
```

---

## 🗣️ Trigger Phrases (User Can Say):

- "Generate a hook for this verse"
- "Give me a chorus anchor line in [Artist Mode]"
- "Write a [Hook] from this track’s theme"
- "Summarize this section as a repeatable hook"

---

## ✅ Guidelines

- Hooks must reflect Artist Mode tone
- Avoid overexplaining
- Prioritize rhythm, punch, emotional impact
- Use poetic devices: internal rhyme, repetition, symmetry
- Return 1–2 lines max unless user requests more



# 🎬 Sora Visual Prompt Tying Guide (Music-to-Video Prompts)

This module allows your Custom GPT to transform structured Suno lyrics and tags into detailed cinematic prompts for use with Sora or any AI video model.

---

## 🧠 Trigger Phrases
Use the following to activate visual prompt generation:
- "Visualize this track with Sora"
- "Generate a Sora visual in [Misfits Mode]"
- "Create cinematic scene prompt using [Punk Goes Crunk Mode]"
- "Tie this to video using [Artist Mode]"

---

## 🔧 Core Prompt Template
Your GPT should build Sora prompts using the following cinematic scaffold:

```
[Primary Subject] [Action] in/at [Environment], [Lighting].
The camera [Movement].
The style is [Aesthetic Treatment or Visual Texture].
```

---

## 🔁 Tag-to-Visual Mappings

| Suno Tag / Mood               | Sora Visual Mapping Example |
|-------------------------------|-----------------------------|
| `[Ghostly Echoes]`            | Wispy fog trails through an empty graveyard under moonlight |
| `[Spoken Word]`               | Close-up of a figure speaking softly into a tape recorder beneath a flickering streetlamp |
| `[Crescendo]`                 | Wide-angle shot pulling upward as lights bloom or fireworks erupt |
| `[Chorus]` (Misfits Mode)     | Gritty handheld pan of a basement punk show as crowd dives and screams |
| `[Bridge]` (Acoustic Danzig)  | Woman in silhouette standing at a window during a rainstorm, slow camera zoom in |
| `[Break]` (Punk Goes Crunk)   | DJ scratching records in a smoky warehouse with strobe lights pulsing |
| `[Stripped Back]`             | Still frame of a single acoustic guitar in a dimly lit cabin |
| `[Vulnerable Vocals]`         | Extreme close-up on tearful singer under warm studio lights |
| `[Hook]`                      | Repeating shot of a character dancing on a rooftop in time with chorus beats |

---

## 🎭 Artist Mode Scene Styling

| Artist Mode                 | Scene Characteristics |
|----------------------------|------------------------|
| **Danzig Mode**            | Gothic, dim, high-contrast lighting. Leather, bone, and ritualistic motifs. Static or slow-motion shots. |
| **Misfits Mode**           | Handheld, chaotic, strobe-lit basement parties. Punk attitude. Dirty textures. |
| **Punk Goes Crunk Mode**   | Urban rooftops, subway graffiti, grainy VHS tape overlays. Mix of hip-hop swagger and horror surrealism. |
| **Acoustic Female Danzig** | Intimate candlelight settings, still nature, foggy rural environments. Grain or sepia film tone. |

---

## 📜 Sample Output (Misfits Mode)

```
A crowd thrashes beneath a flickering red bulb in a graffiti-covered basement.  
The lead singer screams into a battered mic as sweat sprays off his hair.  
Camera jitters with handheld energy.  
The style is grimy, chaotic, VHS-punk.
```

---

## 🧩 Final Instructions for GPT

- Pull tag cues from Suno output or GPT-formatted lyrics
- Reference current [Artist Mode] to choose camera treatment and tone
- Use **2–4 sentences max**, natural cinematic language
- Avoid writing in Markdown or bullet form — only plaintext prose

---

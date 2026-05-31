# Official API Reference

Authoritative model strings, config params, pricing, and SDK code patterns from
Google's Gemini API documentation. This file is the source of truth — when the
SKILL.md or any prompt template conflicts with this file, this file wins.

Last verified: May 29, 2026 against `ai.google.dev/gemini-api/docs/image-generation`
and `ai.google.dev/gemini-api/docs/video`.

---

## Model strings (canonical)

### Nano Banana family (image)

| Friendly name | Model string | Status | Use case |
|:--------------|:-------------|:-------|:---------|
| Nano Banana 2 | `gemini-3.1-flash-image` | GA (May 28, 2026) | High-volume, lower cost, 512/1K/2K/4K |
| Nano Banana Pro | `gemini-3-pro-image` | GA (May 28, 2026) | Professional production, text rendering, complex layouts |
| Nano Banana 2 Preview | `gemini-3.1-flash-image-preview` | Deprecating June 25, 2026 | Migrate to GA |
| Nano Banana Pro Preview | `gemini-3-pro-image-preview` | Deprecating June 25, 2026 | Migrate to GA |
| Nano Banana (older) | `gemini-2.5-flash-image` | Stable | Legacy projects only |

### Veo family (video)

| Friendly name | Model string | Status | Notes |
|:--------------|:-------------|:-------|:------|
| Veo 3.1 | `veo-3.1-generate-preview` | Preview | Full feature set; reference images; extension; 4K |
| Veo 3.1 Fast | `veo-3.1-fast-generate-preview` | Preview | Same features, cheaper |
| Veo 3.1 Lite | `veo-3.1-lite-generate-preview` | Preview | No 4K, no extension, no reference images |
| Veo 3 | `veo-3.0-generate-001` | Stable | Older, kept for compat |
| Veo 3 Fast | `veo-3.0-fast-generate-001` | Stable | Older, kept for compat |

---

## Pricing (paid tier, Standard)

### Nano Banana

| Model | Input | Output text+thinking | 0.5K image | 1K image | 2K image | 4K image |
|:------|:------|:--------------------|:-----------|:---------|:---------|:---------|
| `gemini-3.1-flash-image` | $0.50/1M tok | $3/1M tok | $0.045 | $0.067 | $0.101 | $0.151 |
| `gemini-3-pro-image` | $2/1M tok | $12/1M tok | n/a | $0.134 | $0.134 | $0.24 |

Batch tier = 50% off above pricing, 24h turnaround.

### Veo

| Model | 720p / sec | 1080p / sec | 4K / sec |
|:------|:----------|:------------|:---------|
| `veo-3.1-generate-preview` | $0.40 | $0.40 | $0.60 |
| `veo-3.1-fast-generate-preview` | $0.10 | $0.12 | $0.30 |
| `veo-3.1-lite-generate-preview` | $0.05 | $0.08 | n/a |

8-second clip cost example:
- Veo 3.1 @ 1080p: $3.20
- Veo 3.1 Fast @ 1080p: $0.96
- Veo 3.1 Lite @ 720p: $0.40

---

## Config parameters

### Image config (Nano Banana)

```python
config=types.GenerateContentConfig(
    response_modalities=['TEXT', 'IMAGE'],
    image_config=types.ImageConfig(
        aspect_ratio="16:9",  # see ASPECT_RATIOS below
        image_size="2K",      # "512" | "1K" | "2K" | "4K"  -- uppercase K required
    ),
    thinking_config=types.ThinkingConfig(  # Flash only
        thinking_level="high",   # "minimal" (default) | "high"
        include_thoughts=False,  # set True to see interim reasoning
    ),
    tools=[
        types.Tool(google_search=types.GoogleSearch(
            search_types=types.SearchTypes(
                web_search=types.WebSearch(),
                image_search=types.ImageSearch(),  # Flash only
            )
        )),
    ],
)
```

**Aspect ratios** (14 supported, must be exact string):
`"1:1"`, `"1:4"`, `"1:8"`, `"2:3"`, `"3:2"`, `"3:4"`, `"4:1"`, `"4:3"`, `"4:5"`, `"5:4"`, `"8:1"`, `"9:16"`, `"16:9"`, `"21:9"`

**Resolution / image_size** (uppercase K is mandatory):
- `"512"` — 0.5K, Flash only
- `"1K"` — default
- `"2K"`
- `"4K"`

### Veo config

```python
config=types.GenerateVideosConfig(
    aspect_ratio="16:9",          # "16:9" | "9:16"
    resolution="1080p",           # "720p" | "1080p" | "4k" (1080p/4k = 8s only)
    duration_seconds="8",          # "4" | "6" | "8" (must be 8 for 1080p/4k or references)
    number_of_videos=1,
    last_frame=last_image_obj,     # Image obj; first frame goes in image= param
    reference_images=[             # up to 3 — Veo 3.1 / Fast only
        types.VideoGenerationReferenceImage(
            image=character_image,
            reference_type="asset",
        ),
    ],
    person_generation="allow_adult",  # see regional limits below
)
```

**Region restrictions on `person_generation`:**
- EU, UK, CH, MENA — Veo 3 / 3.1: `"allow_adult"` only
- Veo 2: `"dont_allow"` and `"allow_adult"`; default `"dont_allow"`

---

## Canonical SDK patterns

### Image: text-to-image with aspect ratio + resolution

```python
from google import genai
from google.genai import types
from PIL import Image

client = genai.Client()

response = client.models.generate_content(
    model="gemini-3.1-flash-image",
    contents="A photo of a glossy magazine cover, minimal blue cover with large bold serif text 'Nano Banana'. Portrait of a person in a sleek minimal dress holding the number 2.",
    config=types.GenerateContentConfig(
        response_modalities=['TEXT', 'IMAGE'],
        image_config=types.ImageConfig(
            aspect_ratio="3:4",
            image_size="2K",
        ),
    ),
)

for part in response.parts:
    if part.text:
        print(part.text)
    elif image := part.as_image():
        image.save("foundation.png")
```

### Image: scene variation with foundation reference

```python
foundation = Image.open("foundation.png")

response = client.models.generate_content(
    model="gemini-3.1-flash-image",
    contents=[
        "Dramatic side profile close-up of the rider from image one, helmet visor reflecting the desert horizon. Use the same style, lighting, and aesthetic from image one.",
        foundation,
    ],
    config=types.GenerateContentConfig(
        response_modalities=['TEXT', 'IMAGE'],
        image_config=types.ImageConfig(aspect_ratio="16:9", image_size="2K"),
    ),
)
```

### Image: up to 14 references (Flash)

```python
response = client.models.generate_content(
    model="gemini-3.1-flash-image",
    contents=[
        "An office group photo of these people, they are making funny faces.",
        Image.open('person1.png'),
        Image.open('person2.png'),
        Image.open('person3.png'),
        Image.open('person4.png'),
        Image.open('person5.png'),
        # up to 4 characters + 10 objects on Flash
    ],
    config=types.GenerateContentConfig(
        response_modalities=['TEXT', 'IMAGE'],
        image_config=types.ImageConfig(aspect_ratio="5:4", image_size="2K"),
    ),
)
```

### Image: grounded with Google Search (real-time data → image)

```python
response = client.models.generate_content(
    model="gemini-3.1-flash-image",
    contents="Visualize the current weather forecast for the next 5 days in Fort Worth as a clean modern weather chart. Add a visual on what to wear each day.",
    config=types.GenerateContentConfig(
        response_modalities=['TEXT', 'IMAGE'],
        image_config=types.ImageConfig(aspect_ratio="16:9"),
        tools=[types.Tool(google_search=types.GoogleSearch())],
    ),
)
```

### Image: multi-turn editing (chat) — preserves thought_signature

```python
chat = client.chats.create(
    model="gemini-3.1-flash-image",
    config=types.GenerateContentConfig(
        response_modalities=['TEXT', 'IMAGE'],
    ),
)

# Turn 1
r1 = chat.send_message("Create a vibrant infographic that explains photosynthesis as if it were a recipe.")
# Turn 2 — chat object preserves thought_signature automatically
r2 = chat.send_message("Update this infographic to be in Spanish. Do not change any other elements.")
```

**CRITICAL:** if you reconstruct the conversation manually via REST, every
`inline_data` part with an image must carry its `thought_signature`. Drop one,
get a 400 error. The SDK chat object handles this for you.

### Veo: text-to-video with audio

```python
import time

operation = client.models.generate_videos(
    model="veo-3.1-fast-generate-preview",
    prompt=(
        "A close up of two people staring at a cryptic drawing on a wall, "
        "torchlight flickering. A man murmurs, 'This must be it. That's the "
        "secret code.' The woman whispers excitedly, 'What did you find?' "
        "Faint scratching of paper and a distant drip echo in the chamber."
    ),
    config=types.GenerateVideosConfig(
        aspect_ratio="16:9",
        resolution="1080p",
        duration_seconds="8",
    ),
)

while not operation.done:
    time.sleep(10)
    operation = client.operations.get(operation)

video = operation.response.generated_videos[0]
client.files.download(file=video.video)
video.video.save("scene_01.mp4")
```

### Veo: first frame + last frame interpolation

```python
operation = client.models.generate_videos(
    model="veo-3.1-fast-generate-preview",
    prompt="A cinematic rack focus pull from the helmet in the foreground to the desert horizon in the background. Shallow depth of field throughout.",
    image=first_frame,                              # first frame as primary input
    config=types.GenerateVideosConfig(
        last_frame=last_frame,                      # last frame in config
        aspect_ratio="16:9",
        resolution="1080p",
        duration_seconds="8",
    ),
)
```

### Veo: reference images (up to 3, character/product consistency)

```python
character_ref = types.VideoGenerationReferenceImage(
    image=character_portrait,
    reference_type="asset",
)
product_ref = types.VideoGenerationReferenceImage(
    image=product_shot,
    reference_type="asset",
)

operation = client.models.generate_videos(
    model="veo-3.1-fast-generate-preview",
    prompt="The character walks through a sunlit warehouse holding the product, then sets it on a workbench. Cinematic dolly in.",
    config=types.GenerateVideosConfig(
        reference_images=[character_ref, product_ref],
        aspect_ratio="16:9",
        resolution="1080p",
        duration_seconds="8",
    ),
)
```

### Veo: video extension (+7s per call, up to 20x)

```python
# Must use a video from a previous Veo generation, within 2 days of creation.
extension_op = client.models.generate_videos(
    model="veo-3.1-fast-generate-preview",
    video=previous_operation.response.generated_videos[0].video,
    prompt="Continue the action: the camera slowly pulls back as the character turns toward the light.",
    config=types.GenerateVideosConfig(
        number_of_videos=1,
        resolution="720p",   # 720p only for extension
    ),
)
```

---

## ADC / Vertex AI path (for CTG / ADR-0002 keyless posture)

For the CTG GCP project posture: keyless ADC, no service-account keys, Secret
Manager for any cross-project tokens.

```python
import os
os.environ["GOOGLE_GENAI_USE_VERTEXAI"] = "true"
os.environ["GOOGLE_CLOUD_PROJECT"] = "ctg-eva-prod"  # or relevant CTG project
os.environ["GOOGLE_CLOUD_LOCATION"] = "us-central1"

from google import genai

# ADC picks up gcloud auth automatically; no API key needed
client = genai.Client(vertexai=True)
```

This is the same `genai.Client()` shape as the Gemini Developer API path — only
the env vars change. All snippets above work identically.

The old `google-cloud-aiplatform` SDK is deprecated after June 24, 2026 — use
`google-genai` going forward.

---

## Async / long-running operation pattern (Veo)

All Veo calls return an `operation` immediately. You must poll until
`operation.done == True`. Min latency 11s; max ~6 min during peak.

```python
while not operation.done:
    time.sleep(10)
    operation = client.operations.get(operation)
```

For production, prefer the **Webhooks API** (launched May 4, 2026) over polling:
register a callback URL and Google notifies you when the operation completes.

---

## Batch API (50% off, 24h turnaround)

For campaign-scale work (20+ images, scene variations across many concepts),
use Batch API. Half price. Async submission, results within 24h.

See `https://ai.google.dev/gemini-api/docs/batch-api` for the canonical pattern.

---

## What changed vs older docs

If you find older guides referencing these, they're stale:
- `gemini-2.5-flash-image-preview` — shut down January 15, 2026
- `gemini-3.1-flash-image-preview` — deprecating June 25, 2026
- `gemini-3-pro-image-preview` — deprecating June 25, 2026
- `imagen-3.0-generate-002` — shut down November 10, 2025 (use Imagen 4 if you specifically need Imagen)
- `veo-3.0-generate-preview`, `veo-3.0-fast-generate-preview` — shut down November 12, 2025
- `google-generativeai` Python SDK — legacy; migrate to `google-genai`
- `@google/generative-ai` JS SDK — legacy; migrate to `@google/genai`
- `google-cloud-aiplatform` — deprecated after June 24, 2026; migrate to `google-genai` with `vertexai=True`

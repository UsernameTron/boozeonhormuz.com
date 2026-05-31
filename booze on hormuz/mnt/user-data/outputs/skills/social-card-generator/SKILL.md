---
name: social-card-generator
description: |
  Generates branded shareable SVG cards from a site's quotes/content data in a luxury-satire aesthetic. Bundled stdlib script performs card generation at 1200x630 (OG-sized): navy ground, gold serif quote, speaker attribution, brand mark, auto-wrapped and auto-sized text. Batch over a quotes file; PNG conversion is a documented manual step.

  Inputs: a quotes/data file (YAML/JSON) + optional brand colors. Outputs: one OG-sized SVG per quote in an output dir, ready to share or use as OG images. No content authoring, no posting.

  REFUSES: cinematic image/video (use nano-banana-cinematic-director), real-person likenesses, writing the quotes themselves, auto-posting to social platforms.

  TRIGGERS: "make quote cards", "social share cards", "shareable graphics from quotes", "OG cards for the quotes", "generate cards from quotes.yaml".
---

# Social Card Generator

Turn every Don Biggly one-liner into a gold-on-navy shareable card. For a comedy brand that lives on shareability, this is a direct distribution lever — and the same cards double as OG images.

## QUICK START
1. Point the script at the quotes file:
   `python3 scripts/render_cards.py --quotes src/data/quotes.yaml --out ./cards`
2. Review the SVGs. Override `--bg/--ink/--accent/--brand` to match final brand tokens.
3. If a platform needs raster, convert: `resvg card.svg card.png` (or any SVG→PNG tool).

## WHEN TO USE
- Producing shareable cards from existing quotes/content data
- Generating branded OG images for episodes/quotes
- Batch-refreshing cards after a brand-token change

## WHEN NOT TO USE
- Cinematic hero images or promo video → nano-banana-cinematic-director
- Writing the quotes/copy → content/voice skill
- Posting to social platforms → out of scope (generates assets, doesn't post)
- Real-person imagery → refused

## PROCESS (sequential)

### Step 1: Confirm the data source + brand tokens
Locate the quotes/data file. Confirm the brand palette (default navy/cream/gold). If final design tokens exist, pass them via flags so cards match the site.
Expected output: confirmed input path + color/brand args.

### Step 2: Generate
Run `scripts/render_cards.py`. It auto-wraps text, auto-sizes by line count, and writes one OG-sized SVG per quote with a quote glyph, attribution, and brand mark.
Expected output: `cards/quote-<id>.svg` for each quote; a count printed.

### Step 3: Review + raster (optional)
Eyeball the SVGs for wrapping/legibility. For platforms needing PNG/JPG, convert with `resvg`/`cairosvg`/any tool. Keep SVG as the source.
Expected output: reviewed cards; raster copies if a platform requires them.

## OUTPUT SPECIFICATION
One 1200x630 SVG per quote in the output dir, named `quote-<id>.svg`, in the brand aesthetic (overridable colors). Valid XML. Optional PNG conversions. No posting, no content creation.

## ERROR HANDLING
| Condition | Action |
|---|---|
| YAML parser unavailable | Script falls back to a built-in line parser for the standard quote block format |
| Long quote overflows | Script caps at 5 lines and shrinks font; very long quotes should be trimmed in the data |
| Colors don't match site | Pass `--bg/--ink/--accent`; defaults are placeholders, not final tokens |
| Need raster, no converter | Install `resvg` or use an online SVG→PNG tool; SVG remains the source of truth |

## DEPENDENCIES
- `scripts/render_cards.py` — bundled, tested; stdlib only (optional `pyyaml` if present)
- A quotes/data file (e.g. `src/data/quotes.yaml`)
- Optional: an SVG→PNG converter for raster output

## NOTES
Pipeline position: distribution/growth, post-launch. Conditional — build/run only if social distribution matters to the project's goals. Cards reuse the same tokens as the site, so they stay on-brand automatically once final tokens are passed.

v1.0.0

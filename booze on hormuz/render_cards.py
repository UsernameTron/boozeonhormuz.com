#!/usr/bin/env python3
"""
social-card-generator — branded SVG share cards from a quotes file.
Stdlib only. Emits 1200x630 (OG-sized) SVGs in the luxury-satire aesthetic.
PNG conversion (for platforms that need raster) is a documented manual step: `resvg card.svg card.png`.

Usage:
  python3 render_cards.py --quotes src/data/quotes.yaml --out ./cards \
    [--bg "#0b1320"] [--ink "#f5f1e6"] [--accent "#c9a227"] [--brand "BoozeOnHormuz.com"]
"""
import argparse, os, re, html, sys

def load_quotes(path):
    txt = open(os.path.expanduser(path), encoding="utf-8").read()
    try:
        import yaml  # optional
        data = yaml.safe_load(txt)
        return [(str(d.get("id", i)), d.get("text", ""), d.get("speaker", "Don Biggly"))
                for i, d in enumerate(data)]
    except Exception:
        pass
    # Minimal fallback parser for "- id:/text:/speaker:" blocks
    out, cur = [], {}
    for line in txt.splitlines():
        if re.match(r'\s*-\s', line):
            if cur: out.append(cur); cur = {}
            line = re.sub(r'^\s*-\s*', '', line)
        m = re.match(r'\s*(id|text|speaker):\s*(.+)$', line)
        if m: cur[m.group(1)] = m.group(2).strip().strip('"').strip("'")
    if cur: out.append(cur)
    return [(c.get("id", str(i)), c.get("text", ""), c.get("speaker", "Don Biggly"))
            for i, c in enumerate(out)]

def wrap(text, max_chars=22):
    words, lines, cur = text.split(), [], ""
    for w in words:
        if len(cur) + len(w) + 1 <= max_chars:
            cur = (cur + " " + w).strip()
        else:
            lines.append(cur); cur = w
    if cur: lines.append(cur)
    return lines[:5]

def card_svg(text, speaker, bg, ink, accent, brand):
    lines = wrap(text)
    fs = 84 if len(lines) <= 2 else (66 if len(lines) == 3 else 52)
    start_y = 315 - (len(lines) - 1) * (fs * 0.6)
    tspans = "".join(
        f'<tspan x="600" y="{int(start_y + i*fs*1.18)}">{html.escape(l)}</tspan>'
        for i, l in enumerate(lines)
    )
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="{bg}"/>
  <rect x="40" y="40" width="1120" height="550" fill="none" stroke="{accent}" stroke-opacity="0.35" stroke-width="2"/>
  <text x="600" y="120" text-anchor="middle" font-family="Georgia, 'Fraunces', serif" font-size="120" fill="{accent}" opacity="0.18">&#8220;</text>
  <text text-anchor="middle" font-family="Georgia, 'Fraunces', serif" font-weight="600" font-size="{fs}" fill="{ink}">{tspans}</text>
  <text x="600" y="540" text-anchor="middle" font-family="ui-sans-serif, Inter, sans-serif" font-size="28" fill="{accent}" letter-spacing="2">&#8212; {html.escape(speaker.upper())}</text>
  <text x="600" y="580" text-anchor="middle" font-family="ui-sans-serif, Inter, sans-serif" font-size="20" fill="{ink}" opacity="0.45" letter-spacing="3">{html.escape(brand.upper())}</text>
</svg>'''

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--quotes", required=True)
    ap.add_argument("--out", default="./cards")
    ap.add_argument("--bg", default="#0b1320")
    ap.add_argument("--ink", default="#f5f1e6")
    ap.add_argument("--accent", default="#c9a227")
    ap.add_argument("--brand", default="BoozeOnHormuz.com")
    a = ap.parse_args()
    os.makedirs(os.path.expanduser(a.out), exist_ok=True)
    quotes = load_quotes(a.quotes)
    n = 0
    for qid, text, speaker in quotes:
        if not text.strip(): continue
        svg = card_svg(text, speaker, a.bg, a.ink, a.accent, a.brand)
        p = os.path.join(os.path.expanduser(a.out), f"quote-{qid}.svg")
        open(p, "w", encoding="utf-8").write(svg)
        n += 1
    print(f"Wrote {n} card(s) to {a.out}")
    print("Raster (if needed): resvg quote-<id>.svg quote-<id>.png  (or any SVG→PNG tool)")

if __name__ == "__main__":
    main()

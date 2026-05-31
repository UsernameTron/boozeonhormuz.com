#!/usr/bin/env python3
"""
episode-ingest — turn a fetched YouTube transcript + metadata into draft content files.
The YouTube fetch happens via MCP (see SKILL.md); this script does the deterministic transform.

Usage:
  python3 ingest.py --title "..." --num 5 --youtube-id ABC123 \
      --transcript transcript.txt --site-root ~/projects/<repo> [--slug ep-5]

Emits (all draft:true, for human review via PR):
  src/content/episodes/<slug>.md       episode page
  quote-candidates.md                  3-8 quotable lines for the human to promote into quotes.yaml
  src/content/sponsors/<slug>.md       sponsor-read stub
"""
import argparse, os, re, sys, datetime, textwrap

def slugify(s):
    return re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-')

def quote_candidates(transcript, k=8):
    # Split into sentence-ish units; favor short, punchy, declarative lines.
    units = re.split(r'(?<=[.!?])\s+|\n+', transcript)
    scored = []
    for u in units:
        t = u.strip().strip('"').strip()
        w = t.split()
        if not (2 <= len(w) <= 12):      # quotable = short
            continue
        if t.endswith(('?',)) and len(w) < 3:
            continue
        score = 0
        if t.endswith(('.', '!')): score += 1
        if len(w) <= 7: score += 2       # punchier = better
        if re.search(r'\b(very|never|always|everyone|nobody|the best|tremendous)\b', t, re.I): score += 2
        if t[0:1].isupper(): score += 1
        scored.append((score, t))
    seen, out = set(), []
    for _, t in sorted(scored, key=lambda x: -x[0]):
        key = t.lower()
        if key in seen: continue
        seen.add(key); out.append(t)
        if len(out) >= k: break
    return out

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--title", required=True)
    ap.add_argument("--num", type=int, required=True)
    ap.add_argument("--youtube-id", required=True)
    ap.add_argument("--transcript", required=True)
    ap.add_argument("--site-root", required=True)
    ap.add_argument("--slug", default=None)
    a = ap.parse_args()

    transcript = open(os.path.expanduser(a.transcript), encoding="utf-8").read()
    slug = a.slug or slugify(a.title)
    root = os.path.expanduser(a.site_root)
    today = datetime.date.today().isoformat()
    # naive summary = first ~2 sentences
    sents = re.split(r'(?<=[.!?])\s+', transcript.strip())
    summary = " ".join(sents[:2])[:280] if sents else a.title

    ep_dir = os.path.join(root, "src/content/episodes")
    sp_dir = os.path.join(root, "src/content/sponsors")
    os.makedirs(ep_dir, exist_ok=True); os.makedirs(sp_dir, exist_ok=True)

    ep_md = f"""---
title: "{a.title}"
episode_number: {a.num}
publish_date: {today}
youtube_id: "{a.youtube_id}"
summary: "{summary.replace('"', "'")}"
tags: []
draft: true
---

<!-- Episode body. Human edits before publish. -->
"""
    ep_path = os.path.join(ep_dir, f"{slug}.md")
    open(ep_path, "w", encoding="utf-8").write(ep_md)

    cands = quote_candidates(transcript)
    qc = "# Quote candidates for episode {} — promote chosen lines into src/data/quotes.yaml\n\n".format(a.num)
    qc += "\n".join(f"- id: {slug}-{i+1}\n  text: \"{c.replace(chr(34), chr(39))}\"\n  speaker: Don Biggly" for i, c in enumerate(cands))
    qc_path = os.path.join(root, "quote-candidates.md")
    open(qc_path, "w", encoding="utf-8").write(qc)

    sp_md = f"""---
sponsor_name: "BoozeOnHormuz.com"
ad_copy: "DRAFT — sponsor read for episode {a.num}. Human writes in brand voice."
episode_ref: {slug}
draft: true
---
"""
    sp_path = os.path.join(sp_dir, f"{slug}.md")
    open(sp_path, "w", encoding="utf-8").write(sp_md)

    print("WROTE:")
    for p in (ep_path, qc_path, sp_path): print("  " + p)
    print(f"\n{len(cands)} quote candidate(s). All content draft:true — open a PR, human reviews before publish.")

if __name__ == "__main__":
    main()

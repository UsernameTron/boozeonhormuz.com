---
name: episode-ingest
description: |
  Turns a YouTube video into draft content for a static archive site. Fetches the transcript + metadata via the YouTube MCP, then runs a bundled script for deterministic transform: episode-markdown generation, quote-candidate extraction from the transcript, and a sponsor-read stub — all draft:true. Opens a PR for human review; never auto-publishes.

  Inputs: a YouTube URL/ID + the site repo. Outputs: an episode .md, a quote-candidates file, a sponsor stub, on a branch + PR. Human approves before anything goes live.

  REFUSES: auto-publishing without PR approval, fabricating transcripts, editing live content outside a PR, generating the sketch/video itself, writing final brand-voice copy.

  TRIGGERS: "ingest episode", "add episode from <youtube url>", "new episode into the site", "import this video to the archive", a YouTube URL + add-to-site intent.
---

# Episode Ingest

Make the archive sustainable. A new video becomes a 2-minute approve-a-PR action instead of manual data entry across episode, quotes, and sponsor files. An archive that's painful to update dies; this is what keeps it alive.

## QUICK START
1. Fetch transcript + metadata for the URL via the YouTube MCP.
2. Save the transcript to a file, then run `scripts/ingest.py` with the metadata + site root.
3. Review the generated draft files; open a PR. A human approves before publish.

## WHEN TO USE
- A new episode/video needs to enter the content archive
- Backfilling existing videos into a new site
- Any "add this video to the site" request

## WHEN NOT TO USE
- Writing the final sponsor read or product copy in brand voice → content/voice skill
- Designing the content schema → content-model-architect
- Building pages or deploying → scaffold / infra skills
- Publishing directly to live without review → never; this is PR-gated by design

## PROCESS (multi-MCP → script → PR)

### Step 1: Fetch via YouTube MCP
Use the YouTube MCP to retrieve the transcript, title, and video ID for the URL. Save the transcript text to a local file.
Expected output: `transcript.txt` + the title and video ID captured.

### Step 2: Deterministic transform
Run:
```bash
python3 scripts/ingest.py --title "<title>" --num <N> --youtube-id <id> \
  --transcript transcript.txt --site-root ~/projects/<repo>
```
The script generates the episode markdown (draft:true), extracts 3-8 quote candidates (short, punchy declaratives), and writes a sponsor-read stub.
Expected output: `src/content/episodes/<slug>.md`, `quote-candidates.md`, `src/content/sponsors/<slug>.md`.

### Step 3: Human selection + voice pass
Present the quote candidates to the human to choose which to promote into `src/data/quotes.yaml`. The sponsor stub and any episode body copy get finalized by the content/voice skill — this skill produces scaffolding, not published prose.
Expected output: chosen quotes promoted; copy flagged for the voice skill.

### Step 4: Branch + PR
Commit the drafts to a branch, open a PR titled `episode: <title>`. Do not merge. The human reviews and merges; `draft:true` keeps everything out of production until flipped.
Expected output: an open PR with the draft content; nothing live yet.

## OUTPUT SPECIFICATION
On a branch + PR: an episode `.md` (draft:true, valid frontmatter per the episodes schema), a `quote-candidates.md` (YAML-ready entries for human selection), and a sponsor `.md` stub (draft:true). Zero live changes.

## ERROR HANDLING
| Condition | Action |
|---|---|
| No transcript available (captions off) | Stop; note it; ask the human for a transcript or manual summary — do not fabricate |
| Schema mismatch on build | `npx astro check` names the field; align frontmatter to the episodes schema |
| Quote candidates weak/sparse | Present what there is; the human selects/edits — never invent quotes not in the transcript |
| Slug collision with existing episode | Append the episode number to the slug |

## DEPENDENCIES
- YouTube MCP (transcript + metadata fetch)
- `scripts/ingest.py` — bundled, tested; stdlib only
- git/gh for the branch + PR
- The episodes/sponsors/quotes schema (from content-model-architect) must exist

## NOTES
Pipeline position: the iteration loop, post-launch. PR-gated and draft-first by design — the human always reviews before publish. Generalizes to any content-archive site; tuned here for the Don Biggly episode model.

v1.0.0

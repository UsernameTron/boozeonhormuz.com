# Content model — how media gets onto the site

The site is a publishing system, not a brochure. Four collections model the
catalog (`src/content.config.ts`): **albums ← tracks ← videos / images**.
Adding one track file (plus its optional videos and images) makes it appear on
`/album`, `/listen`, `/archive`, the homepage, and its own `/album/<slug>` page.
No page edits, no redesign, no album-completion dependency anywhere.

## The three layers (never mix them)

1. **Master library** — WAV masters, 4K/1080 video masters, high-res artwork.
   Lives OUTSIDE this repo (external drive / cloud). Never compressed, never
   committed.
2. **Web delivery assets** — optimized versions only, committed under `public/`:
   - `public/audio/` — web audio (`.mp3`, ~192kbps)
   - `public/video/` — only if self-hosting; prefer YouTube (`youtubeId`)
   - `public/covers/` — track/album art (`.webp`, ≤3000px source → ~1600px web)
   - `public/stills/` — stills, posters, fake ads, BTS (`.webp`)
   - `public/thumbs/` — video thumbnails (`.webp`, 16:9, unique per video)
3. **This repo (the CMS)** — metadata + references to those assets.

Suggested master-library layout (outside git):

```
BOH_MEDIA/
  ALBUM/TRACK_01/{AUDIO,VIDEO,PERFORMANCE,SHORTS,IMAGES,ARTWORK}/
  INTERSTITIALS/  PERFORMANCE/  POSTERS/  PRESS/  BRAND/  SITE/
```

Predictable filenames: `T01_AUDIO_MASTER.wav`, `T01_AUDIO_WEB.mp3`,
`T01_MV_WEB_1080.mp4`, `T01_COVER_3000.jpg`, `T01_THUMB_MV.jpg`.
No `final-final-REAL-final2.mp4`.

Keep a **content manifest** spreadsheet (Asset ID · Track · Type · File ·
Orientation · Runtime · Master ready · Web ready · Thumbnail · Captions ·
Public · Site loaded · URL · Featured · Notes). The manifest separates content
production from site production: the site can load Tracks 1–10 while Track 11
is unfinished.

## Track lifecycle

`status` on a track controls everything:

| status | tracklist | own page | audio |
|---|---|---|---|
| `unreleased` | locked row | no | no |
| `preview` | linked, "Preview" badge | yes | optional/partial |
| `released` | linked | yes | yes |
| `hidden` | nowhere | no | no |

`featured: true` promotes a track into the homepage Listen slots (same flag on
videos → homepage Featured Film / Performance slots; on images → Visual
Evidence grid). `draft: true` (the default) keeps any entry out of every build.

## Add a track (the whole procedure)

1. Drop web assets: `public/audio/t01-song.mp3`, `public/covers/t01-song.webp`.
2. Create `src/content/tracks/t01-song-name.md`:

```yaml
---
title: "Song Name"
slug: "song-name"
trackNumber: 1
album: booze-on-hormuz
status: "released"        # or preview / unreleased / hidden
featured: true
description: "One sentence about the song."
cover: "/covers/t01-song.webp"
audio: "/audio/t01-song.mp3"
duration: "3:14"
releaseDate: 2026-09-01
credits: ["Written and performed by …"]
streamingLinks: []        # [{ label: "Spotify", url: "https://…" }] once live
draft: false
---
A short creative note. Renders on the track page.
```

3. `git push` (via a branch + PR, per CLAUDE.md). Done — the track is now on
   `/album`, `/listen`, `/archive`, the homepage, and `/album/song-name`.

## Add a video

`src/content/videos/t01-mv.md` — `type` is one of `music-video`,
`performance`, `sketch`, `short`:

```yaml
---
title: "Song Name — Official Video"
slug: "song-name-video"
type: "music-video"
track: song-name            # the track's SLUG (see Reference rules below)
youtubeId: "XXXXXXXXXXX"    # preferred; or src: "/video/t01-mv-1080.mp4"
thumbnail: "/thumbs/t01-mv.webp"   # unique per video (video-SEO); falls back to YouTube's
duration: "3:14"
description: "Unique one-paragraph description (video-SEO)."
transcript: ""              # paste captions text when available
featured: true
hero: false                 # `hero: true` on exactly ONE video = the homepage hero player
publishDate: 2026-09-01
draft: false
---
```

The video appears on `/watch` (filterable), gets its own `/watch/<slug>` page
with `VideoObject` structured data, and auto-attaches to its track's page.

## Add an image

`src/content/images/t01-still-01.md` — `type`: `still`, `poster`, `fake-ad`,
`artwork`, `production`, `frame`, `bts`:

```yaml
---
title: "The Don Considers the Horizon"
type: "still"
track: song-name            # the track's SLUG
image: "/stills/t01-still-01.webp"
alt: "Describe the image for screen readers."
featured: false
draft: false
---
```

## Reference rules

- Astro's glob loader uses a frontmatter `slug` as the entry id when present —
  so `track:` and `album:` references use the target's **`slug` value**
  (e.g. `track: song-name`, `album: booze-on-hormuz`), NOT its filename.
  Entries without a `slug` field (images) are id'd by filename instead.
- Slugs must be unique across videos AND episodes (both render at `/watch/<slug>`).
- Every video: unique title, unique description, unique thumbnail — that's the
  video-SEO contract, enforced socially, not by the schema.

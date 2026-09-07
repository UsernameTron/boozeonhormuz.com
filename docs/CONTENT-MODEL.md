# Content model — how media gets onto the site

This document describes the current repository revision. Confirm the deployed SHA in Actions before assuming a feature is live. Publication requires explicit owner approval; a local build does not publish content.

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

`npm run media:generate` runs automatically before `dev` and `build`. It reads local WebP/JPEG/PNG delivery images, preserves their original bytes and URLs, and writes additive WebP derivatives under ignored `public/_media/` at 320, 640, 960 and 1280 pixels, capped at the original width. Animated files, app/font folders and favicon/OG files are excluded. EXIF rotation is normalized in derivatives. `src/lib/generated-media.json` records dimensions, source SHA-256 hashes and candidate URLs; regenerate and review that manifest when source assets change instead of editing it by hand. `npm run check:media` verifies original hashes, derivative dimensions and no upscaling. Artwork uses contain sizing so the complete image remains visible. Missing optional artwork renders a placeholder without issuing a known-broken local image request.

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
| `released` | linked | yes | optional; plays when a source is supplied |
| `hidden` | nowhere | no | no |

`featured: true` promotes a track into the homepage Listen slots (same flag on
videos → homepage Featured Film / Performance slots; on images → Visual
Evidence grid). `draft: true` (the default) keeps any entry out of every build.

Page eligibility and queue eligibility are separate. Public `preview` and `released` tracks retain their pages and rows without audio. The Listen queue only includes those with a nonempty `audio` source; draft, hidden and unreleased tracks never enter it. Featured tracks come first, then track number and a stable ID tie-breaker. The native players remain usable without JavaScript. Play All progresses sequentially with one active player, and Previous/Next stop at queue boundaries. A catalog without audio keeps its honest empty/arriving state.

Listening-position storage is optional and browser-local. Remembering stores one track/source/version/position; a return visit offers an explicit paused restore rather than autoplay. Clearing the saved position also turns remembering off. Replacing a local audio file changes its SHA-256 source version and invalidates its previous saved position. Remote sources use the full URL as their version, so publish revised audio at a new URL or an explicit version query such as `song.mp3?v=2`. A missing, hidden, changed or invalid saved source is not resumed. Playback stays on the Listen page; this is not a cross-page audio system.

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

3. Run `npm run verify` and review the local preview, artwork and playback. After explicit owner publication approval, use a branch + PR and the gated Pages workflow. Once that release succeeds, the track appears on eligible album, Listen, archive and track-page surfaces. Do not bypass failing content or release checks.

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
orientation: "16:9"         # also "9:16" or "1:1"; used by cards and players
captions: []                # local-video WebVTT tracks; see example below
featured: true
hero: false                 # `hero: true` on exactly ONE video = the homepage hero player
publishDate: 2026-09-01
draft: false
---
```

The video appears on `/watch` (filterable), gets its own `/watch/<slug>` page
with `VideoObject` structured data, and auto-attaches to its track's page.

An older featured performance precedes newer unfeatured performances; otherwise video recency stays newest-first. Choose `orientation` to match the delivered media, rather than stretching a portrait source into a landscape frame. Local video uses native controls, inline playback and metadata-only preload. YouTube keeps its click-to-load facade and privacy-enhanced embed; its poster disappears after activation.

Public videos must have an 11-character YouTube ID or a source that is an existing file under `public/` or an HTTPS URL. A referenced local source must be a file. Draft videos can remain unfinished. A missing public source, malformed YouTube ID, duplicate public video/episode watch slug, invalid caption reference, or multiple default caption tracks fails validation. HTTPS validation checks the URL contract, not a remote provider's uptime; verify actual media before release.

For a local video, keep a plain-text transcript separate from timed WebVTT captions:

```yaml
src: "/video/t01-mv-1080.mp4"
orientation: "9:16"
captions:
  - src: "/video/t01-en.vtt"
    srclang: "en"
    label: "English"
    default: true
```

Caption files must exist locally or use an HTTPS `.vtt` URL. Only one caption track may be default. YouTube captions are managed with the provider.

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
caption: "A short description or production note."
draft: false
---
```

Public images and legacy Evidence Lounge title-card/gallery records receive ordinary detail pages at `/art/<qualified-id>`. For example, evidence ID `hush-money-as-philanthropy` maps to `/art/evidence--hush-money-as-philanthropy`. Image IDs use the `images--` prefix. IDs retain the collection name and reversibly encode unsafe characters, so identical IDs in different collections and nested filenames do not collide. Keep an existing entry ID stable when editing its title or caption; renaming a file-based ID changes its detail URL.

The archive searches titles, descriptions, captions and related-track titles, combines search with populated category filters, and stores query/category/art selection in the URL. The viewer preserves full artwork, supports previous/next within filtered artwork, keyboard focus and browser history, and offers a normal detail-page link. Detail pages have their own canonical/OG metadata and retain archive context on return. Without JavaScript, ordinary artwork links still open the static detail pages. The existing `/evidence-lounge` route remains available.

Creative production work can be carried between the two tools as reviewed portable files. See [Creative project files](CREATIVE-PROJECTS.md) for legacy compatibility, five-shot Shorts presets, custom-template merge/undo and optional browser storage. These files do not publish media or generate remote assets.

## Reference rules

- Astro's glob loader uses a frontmatter `slug` as the entry id when present —
  so `track:` and `album:` references use the target's **`slug` value**
  (e.g. `track: song-name`, `album: booze-on-hormuz`), NOT its filename.
  Entries without a `slug` field (images) are id'd by filename instead.
- Slugs must be unique across videos AND episodes (both render at `/watch/<slug>`).
- Public source/caption validity and duplicate watch routes are enforced by the build. Distinct titles, descriptions and appropriate thumbnails remain authoring responsibilities.

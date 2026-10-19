# Resume Booze on Hormuz

Release approved October 19, 2026. Connor requested staging, committing, pushing and GitHub Pages publication of the completed review batch. Run the existing release checks and PR flow, merge when green, then verify deployment and live playback.

## Start here

1. Work in `/Users/cpconnor/Documents/ChatGPT/ASTRA_GSD_Local_Image/boh-navigation-review` on `codex/evidence-feature-mctrumps`.
2. Read `.planning/HANDOFF.json`, `.planning/STATE.md` and `.planning/.continue-here.md`.
3. Check the current branch and dirty tree. Preserve every existing source, test and media change. Preserve unrelated changes; the owner authorized staging and committing this reviewed release batch.
4. Read the external `LOCAL-REVIEW-RESULTS.md`, `SITE-CONTENT-MAP.md` and `INDEX.md` in the review folder below.
5. Review the new McTrumps hub locally. The three held files still require owner instructions before any inspection or processing.

This is unphased maintenance, not a new foundation build or M02. Do not scaffold Astro, migrate hosting/DNS, start old runbooks, or create a new memory system.

## Repository and preview

- HEAD at pause: `0bf80cee61c44d3ee23da02f47e0b8732f694989`.
- No upstream is configured for this branch. New changes and media are local and uncommitted, with no remote backup claimed.
- Local preview: http://127.0.0.1:4334/
- Featured film: http://127.0.0.1:4334/watch/the-evidence-is-with-me-official-video/
- McTrumps: http://127.0.0.1:4334/mctrumps/
- Current preview is the live development server on port 4334, restarted after the Gallery removal in tool session 65222. Verify the running process before relying on a saved ID. It uses Node 22 with process-local polling to avoid native file-watch reload loops. Videos were paused after review.
- All review evidence: `/Users/cpconnor/.codex/.chatgpt-projects/g-p-6acb456d2570819189568765383068e8/output/evidence-mctrumps-local`.
- Prior YouTube launch evidence: `/Users/cpconnor/.codex/.chatgpt-projects/g-p-6acb456d2570819189568765383068e8/output/youtube-launch/RELEASE-RESULTS.md`. Preserve that folder.

If the preview has stopped, reopen the current source preview from this repository. The saved production build predates the selected thumbnail:

```bash
cd "/Users/cpconnor/Documents/ChatGPT/ASTRA_GSD_Local_Image/boh-navigation-review"
env CHOKIDAR_USEPOLLING=true CHOKIDAR_INTERVAL=1000 /opt/homebrew/opt/node@22/bin/node node_modules/.bin/astro dev --host 127.0.0.1 --port 4334
```

Do not install dependencies just to reopen the preview. The thumbnail change passed desktop/mobile and actual playback checks. A full rebuild was interrupted when responsive generation stalled reading the existing `public/stills/gallery-07-a-very-small-don.webp`; the new image was generated with the same existing settings, without changing old entries. A later release still needs full validation. No global settings or dependencies changed.

## Release capacity fix

The initial validated package was 1,237,418,050 bytes, above GitHub Pages' 1 GB limit. Six large MP4 delivery files are now preserved under `media/video/` and `media/mctrumps/` and served from the public `site-media-2026-10-19` GitHub Release. Uploaded sizes and SHA-256 digests matched all six originals. Source masters, full quality, page addresses, thumbnails and the existing player system are unchanged. The Pages output check now enforces 1,000,000,000 bytes. Native-playback and YouTube-fallback assertions were updated to the verified delivery URLs; the complete release checks must pass on the final commit.

## Latest McTrumps update

The owner's latest direction is implemented locally: “Billions served. Books cooked.” One portrait Welcome player sits beside the short introduction establishing McTrumps as the resort's exclusive food supplier. Six compact thumbnail links are grouped into Customer Relations (Birthday, Premium Costs), Corporate Leadership (Supervision, Appreciation, Jeff) and International Expansion (Tehran, plus the resort link). Existing complaint exchanges, related businesses and heading-only Resort Contracts/Company Records are tucked into a closed Company office drawer. All seven stable detail pages preserve native dimensions, descriptions, producer notes and the exact supplied interview script. Watch has one card opening this hub. Legacy Sponsor Reads links retain queries and clip anchors; the alias remains excluded from the sitemap. The 27-song album and 32 Deep Cuts retain their order.

The owner also requested removing “The Red Tie” from Gallery. Its content record was removed; media files remain intact. The local Gallery now contains 120 artworks (113 Gallery images plus seven Evidence exhibits), and Search has 217 unique destinations.

Latest department-layout review passed at widths 1440, 768, 390 and 320 with no horizontal overflow. The portrait Welcome played; every existing detail page, Watch hub card, legacy clip link and expandable office remained reachable. Both touched Astro page templates compile; the 18-route local smoke check passes. Screenshots and results are in `output/playwright/mctrumps-departments-*`. The production build remains pending.

Earlier hub review confirmed all seven native clips play, desktop/mobile navigation and all seven legacy anchor redirects work. Seven touched Astro templates compile with no compiler errors; 46 unit tests passed. Targeted browser verification accounted for all 29 cases: 28 passed in the initial run and the single development-toolbar locator ambiguity was corrected, then passed in its focused rerun. The local smoke check passed all 18 routes. All 14 McTrumps media hashes matched their before values. Full results are in `output/playwright/mctrumps-hub-review/RESULTS.md`. Screenshots are `output/playwright/mctrumps-hub-*.png`.

Full Astro check/build attempts stalled reading existing installed files and an existing responsive image. Only those review processes were stopped. `dist/` is incomplete from the interrupted build; do not serve it as a finished preview or publish it. The live source preview on port 4334 remains the approved review target. Full release validation is still required only when publication is authorized. No originals, dependencies or global settings changed.

## Completed locally

- **The Evidence Is With Me**, official 4:24 music video, is the sole homepage feature. The owner-selected champagne image `IMG_0719.png` is now its thumbnail and poster, at its full 635x443 proportions. The homepage frame follows the image; video playback remains 1920x1080 and 16:9. Desktop/mobile display and actual playback passed; the original image and video hashes are unchanged. Proof is in `output/playwright/evidence-champagne-review.json` and the two adjacent screenshots. Earlier sampled scenes were compared with an extracted transcript; this was not frame-by-frame or lip-sync certification.
- **Hush Money Is Philanthropy** stays in Music Videos and at its original address.
- **McTrumps** now has seven videos and approximately 6:29. Premium Costs (2:23) and Jeff, Chief Accountability Officer (0:41) follow the original five; both new players remain square.
- Watch, Search, detail-page navigation, metadata and related browser tests reflect the additions.
- The 27-song album and 32 Deep Cuts are unchanged and retain their approved order.
- Current catalogue: 97 videos, 120 artworks, twelve quotes and five illustrated products. Search has 217 unique destinations, counting album songs once.
- Documentation sync corrected stale counts, hosting instructions, branch, backup claims and release state. Historical milestones and reports remain intact.

## New media, already prepared

| Original master | Local website copy |
|---|---|
| `/Users/cpconnor/Desktop/The Evidence is With Me Official Video.mp4` | `media/video/the-evidence-is-with-me-official-video.mp4`, 1920x1080, about 93.7 MiB |
| `/Users/cpconnor/Desktop/McTrumps New Premium Costs.mp4` | `media/mctrumps/premium-costs.mp4`, 1080x1080, about 38.2 MiB |
| `/Users/cpconnor/Downloads/Jeff E New C Level Exec at McTrumps (1).mp4` | `media/mctrumps/chief-accountability-officer.mp4`, 1080x1080, about 10.6 MiB |

Originals were preserved and their SHA-256 hashes matched before and after preparation. Browser copies are H.264/AAC with fast start, each below 100 MiB. Poster/thumbnail assets and video records are already present. Do not regenerate them unnecessarily. These three additions use native playback and have no invented YouTube IDs.

Primary changes are in `src/pages/index.astro`, `src/pages/watch/`, `src/pages/sponsor-reads.astro`, `src/data/mctrumps.ts`, `src/styles/mctrumps.css`, video records, generated image metadata, the smoke script and relevant E2E tests. The structured handoff records the full dirty-file list.

## Held files: do nothing until Connor explains

- `/Users/cpconnor/Downloads/The Big Kickback.mp4`
- `/Users/cpconnor/Downloads/Redacted.m4a`
- `/Users/cpconnor/Downloads/Clap Dem (Da Presidential Remix Mon).mp3`

Connor explicitly said to leave them alone, finish the current task, then ask about them. Do not open, stat, hash, transcribe, classify, move, edit, upload or add them to the site before receiving that explanation. Do not infer that the two audio files belong to the approved video album.

## Validation evidence

Fresh during documentation sync:

- 46 unit tests passed; seven unit-test files and seventeen browser-test files.
- Fresh content counts and package/config measurements are in `SYNC-DOCS-MEASUREMENTS.json`.
- No coverage or lint script is configured.

Earlier local implementation checks on October 18:

- Diagnostics, isolated fixtures, production build, media/output audits and 17 local smoke routes passed.
- Build: 267 pages; output: 270 HTML files and 13,596 local references; media: 355 source hashes.
- Browser suite: 104 passed and one outdated music-count expectation failed. After changing six to seven, that case passed in a focused run against the same preview. All 105 cases are accounted for across runs; do not claim a single clean full run.
- All three new browser MP4 files decoded completely. The featured film played for over 63 seconds without error. Both new McTrumps players played with square frames and coordinated pause behavior.
- Original hashes matched; existing tracked public media and album records were unchanged.

Some local filesystem reads and test-server startup attempts stalled. Successful build/fixture checks used the bundled Node 24 runtime shown above. No global runtime or dependencies were changed. Keep the failed-attempt logs as diagnostic history, not outstanding product failures. A later release requires fresh validation of its actual final revision.

## Publication boundary and previous release

The batch was initially prepared locally. Connor explicitly approved staging, committing, pushing and GitHub Pages deployment on October 19, 2026. This authorizes the site release; the held files and YouTube uploads remain outside scope.

Saved prior release evidence reports PR 69 merged as `32d5d995e9c2ce405f0291731dc88b3185f7b463`, successful Pages run `39157830029`, and 94 website records reconciled to a channel with 98 public Don videos. These are prior release facts, not fresh live checks. The three local additions are not uploaded to that channel.

When Connor later requests publication, validate the final revision, use a reviewed branch PR, wait for required checks, deploy through the existing gated GitHub Pages workflow, and verify live routes and actual playback. Do not change hosting, suppress checks, delete masters or claim new files are remotely backed up before verifying the push.

## Content and workflow rules

- Navigation update: Album was removed from the desktop/mobile primary menu and footer. The existing Album collection card remains on Watch; all 27 songs, order and page addresses are unchanged. Album, song and legacy Listen routes now highlight Watch. Desktop/mobile navigation and Watch-to-album-to-song links were verified locally; proof screenshots are `output/playwright/watch-navigation-desktop.png` and `watch-navigation-mobile.png`. No publishing.
- Approved music direction: the same Don fronts different bands. Potential acts span Jamaican reggae, 1990s grunge, funk/soul revue and MAGADeth. These remain a planning conversation; no new acts, names, collections or media were added. Do not inspect held files to classify them without the owner's instructions.

- Keep the approved design, image framing, original media, stable page addresses and album order.
- Keep copy concise, dark and in character. New prose must contain no em dashes.
- Do not add repeated satire labels; existing site disclaimers are already present.
- User-deleted media must not be restored automatically.
- Studio reel and broader studio commercialization remain deferred.
- `PROJECT-CONTEXT.md`, `RUNBOOK.md`, `SKILLS-AND-AGENTS.md`, M01 and October 13 confidence reports are historical references. Current code, lockfile, workflows and this handoff define the current state.
- This pause is documentation-only. No commit or application/media changes were made during it. Do not clean unrelated sessions, worktrees, original uploads or prior launch evidence.

## Next action

Review http://127.0.0.1:4334/mctrumps/. Complete the approved release through the existing checks and PR flow. The three held files remain untouched until Connor explains their use.

# Project State

## Project Reference

See: `.planning/PROJECT.md` (reconciled October 18, 2026).

**Core value:** Publish the Don Biggly creative catalogue with reliable browsing and playback.
**Current focus:** Release the approved content and navigation batch through GitHub Pages.
**Historical milestone:** M01 Launch Satire Hub shipped; its archive remains in `.planning/milestones/M01-launch-satire-hub/`.
**Future milestone:** M02 Generalize the Website Pipeline remains unstarted.

## Current Position

Phase: None (maintenance content batch; no active phase directory).
Plan: None (owner-directed local work).
Status: Release authorized October 19, 2026; final verification and publication in progress.
Last activity: October 19, 2026 | Owner approved staging, committing, pushing and deployment.

Later local update: owner-selected champagne thumbnail and poster applied at 635x443, with a naturally fitted homepage frame and unchanged 16:9 video. Desktop/mobile and actual playback checks passed; source image and video hashes matched. The image manifest now has 356 entries. The previous production build predates this thumbnail: full responsive generation stalled on an older Gallery image and was stopped; only the new image entry and its existing-format derivatives were generated. No old media changed. The live source preview uses Node 22 with process-local polling; see the current restart command in `COWORK_HANDOFF.md`.

Repository: `/Users/cpconnor/Documents/ChatGPT/ASTRA_GSD_Local_Image/boh-navigation-review`.
Branch: `codex/evidence-feature-mctrumps`.
HEAD: `0bf80cee61c44d3ee23da02f47e0b8732f694989`.
Upstream: None configured.
Working tree: Dirty, with the three-video implementation and documentation changes uncommitted.
Preview: http://127.0.0.1:4334/.

No commit, push, deployment or YouTube upload has been performed for these additions. The new delivery media are local; no remote backup is claimed. Preserve original masters and existing media.

## McTrumps company hub

Owner approved the revised plan and local implementation. The new `/mctrumps/` hub has a primary tab, one Welcome player, six thumbnail cards, preserved Customer Relations and four related companies. Resort Contracts and Company Records are heading-only empty sections. Existing seven watch URLs, native ratios, notes and supplied script remain available. Old Sponsor Reads query/hash links forward to the corresponding new hub anchors. Watch retains its collection card; the Album remains available under Watch.

All seven native clips played in fresh browser review. Desktop/mobile layout and the seven legacy anchor redirects passed. Forty-six unit tests passed; seven touched Astro templates compiled without compiler errors. All 29 targeted browser cases are accounted for across the 28-pass initial run and the corrected one-case rerun. The 18-route local smoke check passed; all 14 McTrumps media hashes are unchanged. Review results are in `output/playwright/mctrumps-hub-review/RESULTS.md`. Full diagnostics/build attempts stalled on existing local file reads and were stopped; `dist/` is incomplete and must not be published. Review the live source server on port 4334. No original media, held attachments or remote services were changed.

## Current Measurements

Fresh documentation-sync measurements:

- 97 public video records: 27 album songs, 32 Deep Cuts, seven music videos, nine sketches, fifteen shorts and seven McTrumps commercials.
- 120 artworks: 113 Gallery images and seven Evidence Lounge exhibits. The Red Tie record was removed by owner request.
- 27 album track records, twelve quotes and five illustrated Products entries.
- Nine typed collections, the McTrumps company route and 356 responsive-media source records.
- Seven unit-test files; fresh run passed 46 tests, zero failures, skips or cancellations.
- Seventeen browser-test files. Browser cases were not rerun for this pause.
- Package version is `0.0.1`; this is the package field, not a new release tag.
- No `test`, coverage or lint script. Coverage and model usage/cost are unavailable.
- No active phase directories or completed plan summaries under `.planning/phases/`. Historical M01 records are preserved separately.

Earlier implementation validation on October 18:

- Astro diagnostics passed with existing nonblocking warnings.
- Isolated fixtures passed, including decoded orientations, captions and invalid-content rejection.
- Production build: 267 generated pages; output audit: 270 HTML files and 13,596 local references.
- Media audit: 355 source hashes and derivative dimensions passed.
- Browser run: 104 passed, one stale music-count assertion failed; the assertion was corrected and its focused rerun passed against the same preview. All 105 cases are accounted for across runs, not one clean full-suite run.
- All 17 local smoke routes passed.
- Three new browser video copies fully decoded; the film played for over 63 seconds and both commercials played with correct square framing and pause coordination.
- Original source hashes matched before and after preparation; prior tracked public media and the album records were unchanged.

The earlier full checks were not rerun during this documentation sync. See the local review evidence before making release claims.

## Decisions

- The Evidence Is With Me is the sole homepage feature, with a landscape preview.
- Hush Money Is Philanthropy retains its existing page and Music Videos entry.
- McTrumps adds Premium Costs and Jeff, Chief Accountability Officer after the original five episodes. Total: seven commercials, approximately 6:29.
- The approved 27-song album and 32 Deep Cuts retain their content and order. Separate audio is optional.
- Watch remains a six-collection chooser with no All category.
- Album is accessible through Watch; its standalone primary-menu and footer links are removed. Album, song and Listen pages highlight Watch. The album's 27 songs, order and existing addresses are unchanged; desktop/mobile navigation was verified.
- Experience episode teasers remain removed. Studio reel and broader commercialization remain deferred.
- No extra public satire labels or longer copy. New prose contains no em dashes.
- The three additional attachments listed in the handoff are on hold and must not be inspected or processed until Connor explains their use.
- Music planning choice: one Don with different bands, spanning reggae, 1990s grunge, funk/soul and MAGADeth. No new music collections were implemented.

## Pending Actions

1. Ask Connor how The Big Kickback, Redacted and Clap Dem should be used, and wait before inspecting them.
2. Complete any requested local review or next content work within the resulting instructions.
3. Only after explicit release authority: validate the actual final revision, commit, push through a reviewed PR, merge when green, and verify deployment and live playback.

## Release Evidence and Limits

Saved prior release evidence reports PR 69 merged as `32d5d995e9c2ce405f0291731dc88b3185f7b463` and successful Pages run `39157830029`. The prior channel release accounted for 94 website records and 98 public Don videos. The three new local videos are not part of that release. No fresh production or channel check was performed during this pause.

The October 13 confidence/dependency and file-size findings remain historical reports. Their presence does not establish current dependency health or a current release verdict. Revalidate the release revision when publication is requested; do not erase historical reports or bypass failed checks.

## Session Continuity

Last session: October 18, 2026.
Current task: finish the authorized release, then verify live playback.
Structured handoff: `.planning/HANDOFF.json`.
Human handoff: `.planning/.continue-here.md`.
Entry point: `COWORK_HANDOFF.md`.
Review files: `/Users/cpconnor/.codex/.chatgpt-projects/g-p-6acb456d2570819189568765383068e8/output/evidence-mctrumps-local`.

First action on resume: read the current release evidence and finish the authorized release. The three held files remain untouched until Connor separately explains their use.

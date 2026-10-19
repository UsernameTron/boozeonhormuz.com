# McTrumps company hub

`/mctrumps/` is the company hub and a primary navigation destination. Its headline is “Billions served. Books cooked.” The short introduction establishes the respectable storefront, inflated catering contracts, suspicious franchise fees, employee-funded bonuses and executives appointed to absorb blame. McTrumps is the resort's exclusive food supplier; Don owns the restaurant, resort and company investigating complaints. There are seven company videos, with a combined displayed runtime of 6:29.

The portrait Welcome player is featured once, beside the introduction. The remaining six videos are grouped into three compact department previews, with thumbnails and durations:

| Department | Videos |
| --- | --- |
| Customer Relations | Billy's Birthday; Premium Costs |
| Corporate Leadership | Working Under Supervision; Employee Appreciation Day; Jeff, Chief Accountability Officer |
| International Expansion | The Tehran Franchise; link to the existing resort |

Department membership is recorded separately from the established programme order in `src/data/mctrumps.ts`. Cards open the same `/watch/mctrumps-*` pages, including without JavaScript. All seven details use native, correctly proportioned MP4 players, and the original five keep their published YouTube links as alternatives. Descriptions appear once; producer notes and the exact supplied Employee Appreciation script are in expandable panels. Search return context remains available.

The existing complaint desk, four related businesses and empty record sections are preserved inside the closed Company office drawer. `#customer-relations` now identifies the video department; the exchanges use `#complaint-desk`. Links into the drawer automatically open it. `#resort-contracts` and `#company-records` still contain headings only, marked `data-content-state="empty"`; fill them only when the owner supplies content. Watch retains one card opening this hub and uses the same tagline.

Watch retains its McTrumps collection card. Old `/sponsor-reads/` links forward to the new hub with their query strings and episode anchors; a no-script fallback lists all seven links. The alias canonical points to `/mctrumps/` and is excluded from the sitemap. Existing video slugs, order, media files and source masters are preserved. New video records and episode data must be added together using the existing content model.

Premium Costs and Jeff use the verified GitHub Release MP4 URLs, with their identical delivery copies preserved under `media/mctrumps/`. The original five videos remain in `public/mctrumps/`. Native framing and controls are unchanged. This keeps the complete Pages site within its published-size limit; see `media/README.md`.

## Episode order and imported media

| Episode | Source file | Website copy | Runtime |
| --- | --- | --- | --- |
| Welcome | Welcome to McTrumps- Video.mp4 | /mctrumps/welcome.mp4 | 0:39 |
| Birthday | McTrumps Billy & The Ball-Pit- McTrumps Skit.mp4 | /mctrumps/birthday.mp4 | 0:35 |
| Employment | McTrumps- The Biggly Mac.mp4 | /mctrumps/supervision.mp4 | 0:46 |
| Appreciation | Employee of the Month McTrumps- Don Biggly.mp4 | /mctrumps/appreciation.mp4 | 0:52 |
| Tehran | McTrumps- Tehran.mp4 | /mctrumps/tehran.mp4 | 0:33 |
| Premium Costs | McTrumps New Premium Costs.mp4 | /mctrumps/premium-costs.mp4 | 2:23 |
| Chief Accountability Officer | Jeff E New C Level Exec at McTrumps (1).mp4 | /mctrumps/chief-accountability-officer.mp4 | 0:41 |

The creator confirmed that The Biggly Mac is the probation/work-credit interview. Combined displayed runtime is 6:29. Browser copies are H.264/AAC with fast-start MP4 metadata; their aspect ratios match the source. The two new square videos are prepared at 1080 by 1080 from the 2880 by 2880 masters, with selected scene posters. Originals were not changed; hashes were checked before and after conversion. Counts and runtime now derive from episode data.

## Editorial boundaries

The original episode descriptions use the creator's account. The two new descriptions were checked against extracted scene frames and a local speech transcript of the finished videos. Scene summaries are kept separate from transcripts. The Employee Appreciation drawer preserves the supplied script. It is not claimed to be a transcription of the finished audio. The birthday-bankruptcy and unsigned-photograph endings are not disclosed in the introductory summaries.

The Trump Satire Lyric Engine v0.35.0 supplies the written speech cadence for the three new customer-relations answers; MirrorUniverse Pete supplies the restrained producer/desk notes. All speech is framed as fictional political satire. The original four fictional sponsor names remain in a compact supporting list, without empty image boxes.

## Remaining editorial work

Reviewed verbatim transcripts for the six other clips and timed captions have not been supplied. Add reviewed transcripts and VTT captions when available; do not substitute scene summaries or approximate timing for captions.

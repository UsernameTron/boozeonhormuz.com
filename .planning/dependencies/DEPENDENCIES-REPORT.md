=== GSD DEPENDENCY AUDIT REPORT ===
Generated: 2026-10-13T06:05:02.339Z
Scope: npm
Project root: /Users/cpconnor/Documents/Codex/2026-09-06/ex/work/boh-implementation

--- SUMMARY ---
Overall verdict: BLOCK
Security: BLOCK - 2 critical, 24 high, 11 moderate, 3 low
Staleness: FLAG - 2 packages flagged
Licenses: PASS - 0 packages flagged
Direct dependencies: 13; Production: 8; Development: 5.
Full audit: 40 vulnerable package entries. Production-manifest audit: 1 critical, 10 high, 0 moderate, 1 low (12 entries).
Counts describe npm package entries, including propagated vulnerability effects, not distinct CVEs or demonstrated exploits.

--- SECURITY FINDINGS ---
CRITICAL astro@6.4.2 -> 7.2.8 minimum for critical advisory; current registry latest 7.3.8
  CVE: not provided
  Advisory: https://github.com/advisories/GHSA-jrpj-wcv7-9fh9 (moderate; affected <6.4.6)
    https://github.com/advisories/GHSA-f48w-9m4c-m7f5 (moderate; affected <7.0.6)
    https://github.com/advisories/GHSA-7pw4-f3q4-r2p2 (low; affected >=3.10.0 <7.0.4)
    https://github.com/advisories/GHSA-4g3v-8h47-v7g6 (moderate; affected >=2.9.0 <=7.0.9)
    https://github.com/advisories/GHSA-2pvr-wf23-7pc7 (high; affected <6.4.6)
    https://github.com/advisories/GHSA-26w7-cxv4-gfx2 (critical; affected <7.2.8)
    https://github.com/advisories/GHSA-376h-93r7-7g6f (moderate; affected <=7.2.3)
  Path: direct; project manifest
  Exposure: production-manifest build/dev toolchain; not a Node service on static Pages.
  Fix: Migrate exact-pinned Astro to a validated release >=7.2.8 (7.3.8 is current); verify integrations and all checks. npm's suggested 6.4.8 does not satisfy the critical advisory.
  Propagated effects: esbuild, sharp

CRITICAL proxy-addr@2.0.7 -> 2.0.8
  CVE: CVE-2026-90711
  Advisory: https://github.com/advisories/GHSA-jqcg-44mw-7w3h (critical; affected >=1.1.0 <2.0.8)
  Path: via express@4.22.2
  Exposure: development-only toolchain; not a Node service on static Pages.
  Fix: Re-resolve the LHCI/Express dependency subtree to proxy-addr 2.0.8 and re-run audit.

HIGH @lhci/cli@0.15.1 -> fix available; exact safe version not supplied in npm audit
  CVE: not provided
  Advisory: inherited from @lhci/utils, inquirer, lighthouse, proxy-agent, tmp, uuid
  Path: direct; project manifest
  Exposure: development-only toolchain; not a Node service on static Pages.
  Fix: Update or replace the affected LHCI dependency subtree in a dedicated remediation; npm's proposed @lhci/cli 0.1.0 downgrade is not an accepted fix.
  Propagated effects: @lhci/utils, inquirer, lighthouse, proxy-agent, tmp, uuid

HIGH @lhci/utils@0.15.1 -> fix available; exact safe version not supplied in npm audit
  CVE: not provided
  Advisory: inherited from js-yaml, lighthouse
  Path: via @lhci/cli@0.15.1
  Exposure: development-only toolchain; not a Node service on static Pages.
  Fix: Update or replace the affected LHCI dependency subtree in a dedicated remediation; npm's proposed @lhci/cli 0.1.0 downgrade is not an accepted fix.
  Propagated effects: js-yaml, lighthouse

HIGH @puppeteer/browsers@2.13.2 -> fix available; exact safe version not supplied in npm audit
  CVE: not provided
  Advisory: inherited from extract-zip, proxy-agent
  Path: via puppeteer-core@24.43.1
  Exposure: development-only toolchain; not a Node service on static Pages.
  Fix: Update or replace the affected LHCI dependency subtree in a dedicated remediation; npm's proposed @lhci/cli 0.1.0 downgrade is not an accepted fix.
  Propagated effects: extract-zip, proxy-agent

HIGH basic-ftp@5.3.1 -> fix available; exact safe version not supplied in npm audit
  CVE: not provided
  Advisory: https://github.com/advisories/GHSA-c475-qrg2-pj4r (high; affected <=6.2.0)
  Path: via get-uri@6.0.5
  Exposure: development-only toolchain; not a Node service on static Pages.
  Fix: Update or replace the affected LHCI dependency subtree in a dedicated remediation; npm's proposed @lhci/cli 0.1.0 downgrade is not an accepted fix.

HIGH brace-expansion@1.1.18 -> fix available; exact safe version not supplied in npm audit
  CVE: not provided
  Advisory: https://github.com/advisories/GHSA-q2hr-2g5m-vwhr (moderate; affected <1.1.21)
    https://github.com/advisories/GHSA-qhr7-859c-m2p7 (high; affected <1.1.20)
    https://github.com/advisories/GHSA-6j4f-fj2g-mc7p (high; affected <1.1.19)
  Path: via minimatch@3.1.5
  Exposure: development-only toolchain; not a Node service on static Pages.
  Fix: Re-resolve the listed parent dependency to a version outside every advisory range, retain exact direct pins, and re-run npm audit.

HIGH compression@1.8.1 -> fix available; exact safe version not supplied in npm audit
  CVE: not provided
  Advisory: https://github.com/advisories/GHSA-vc2v-76pw-4v95 (high; affected <1.8.2)
  Path: via @lhci/cli@0.15.1
  Exposure: development-only toolchain; not a Node service on static Pages.
  Fix: Re-resolve the listed parent dependency to a version outside every advisory range, retain exact direct pins, and re-run npm audit.

HIGH devalue@5.8.1 -> fix available; exact safe version not supplied in npm audit
  CVE: not provided
  Advisory: https://github.com/advisories/GHSA-9rgm-9g3h-6x36 (moderate; affected <5.9.1)
    https://github.com/advisories/GHSA-j22f-vq7h-c4qm (high; affected >=5.1.0 <=5.9.2)
    https://github.com/advisories/GHSA-hx4r-w6wj-j8fg (moderate; affected <=5.9.2)
    https://github.com/advisories/GHSA-mcm9-63f2-9j32 (high; affected <=5.9.2)
    https://github.com/advisories/GHSA-wf3x-273g-mvxv (low; affected >=1.0.0 <=5.9.2)
    https://github.com/advisories/GHSA-x5rw-q4pp-hg5g (high; affected >=5.8.0 <=5.9.2)
    https://github.com/advisories/GHSA-4q55-j62x-fr9h (moderate; affected <=5.9.2)
  Path: via astro@6.4.2
  Exposure: production-manifest build/dev toolchain; not a Node service on static Pages.
  Fix: Re-resolve the listed parent dependency to a version outside every advisory range, retain exact direct pins, and re-run npm audit.

HIGH extract-zip@2.0.1 -> fix available; exact safe version not supplied in npm audit
  CVE: not provided
  Advisory: https://github.com/advisories/GHSA-jmr9-qjv8-65gv (high; affected <=2.0.1)
    https://github.com/advisories/GHSA-7pqw-9j4j-h8q3 (high; affected <=2.0.1)
  Path: via @puppeteer/browsers@2.13.2
  Exposure: development-only toolchain; not a Node service on static Pages.
  Fix: Update or replace the affected LHCI dependency subtree in a dedicated remediation; npm's proposed @lhci/cli 0.1.0 downgrade is not an accepted fix.

HIGH fast-uri@3.1.2 -> fix available; exact safe version not supplied in npm audit
  CVE: not provided
  Advisory: https://github.com/advisories/GHSA-v2hh-gcrm-f6hx (high; affected >=3.0.0 <=3.1.3)
    https://github.com/advisories/GHSA-7p8r-x3mc-p8w7 (high; affected >=3.0.0 <3.1.5)
    https://github.com/advisories/GHSA-f65p-4m7j-42xc (high; affected >=3.0.0 <3.1.6)
    https://github.com/advisories/GHSA-fph4-wmhf-6fwf (high; affected >=3.1.2 <3.1.6)
    https://github.com/advisories/GHSA-jqff-g426-hqxp (high; affected >=3.0.0 <3.1.6)
    https://github.com/advisories/GHSA-4c8g-83qw-93j6 (high; affected >=3.0.0 <3.1.3)
    https://github.com/advisories/GHSA-qw65-cvwx-89v3 (high; affected >=3.0.0 <3.1.7)
    https://github.com/advisories/GHSA-hrr3-gc8f-f4qj (moderate; affected >=3.0.0 <3.1.8)
  Path: via ajv@8.20.0
  Exposure: development-only toolchain; not a Node service on static Pages.
  Fix: Re-resolve the listed parent dependency to a version outside every advisory range, retain exact direct pins, and re-run npm audit.

HIGH get-uri@6.0.5 -> fix available; exact safe version not supplied in npm audit
  CVE: not provided
  Advisory: inherited from basic-ftp
  Path: via pac-proxy-agent@7.2.0
  Exposure: development-only toolchain; not a Node service on static Pages.
  Fix: Update or replace the affected LHCI dependency subtree in a dedicated remediation; npm's proposed @lhci/cli 0.1.0 downgrade is not an accepted fix.
  Propagated effects: basic-ftp

HIGH http-cache-semantics@4.2.0 -> fix available; exact safe version not supplied in npm audit
  CVE: not provided
  Advisory: https://github.com/advisories/GHSA-ch52-4w7c-c8xp (high; affected <=4.2.0)
  Path: via astro@6.4.2
  Exposure: production-manifest build/dev toolchain; not a Node service on static Pages.
  Fix: Re-resolve the listed parent dependency to a version outside every advisory range, retain exact direct pins, and re-run npm audit.

HIGH js-yaml@3.15.2, 4.1.1 -> fix available; exact safe version not supplied in npm audit
  CVE: not provided
  Advisory: https://github.com/advisories/GHSA-h67p-54hq-rp68 (moderate; affected >=4.0.0 <=4.1.1)
    https://github.com/advisories/GHSA-52cp-r559-cp3m (high; affected >=4.0.0 <4.3.0)
    https://github.com/advisories/GHSA-5p4m-2wfm-xmqj (high; affected >=4.0.0 <4.3.1)
    https://github.com/advisories/GHSA-2883-xcg3-v3hh (high; affected >=4.0.0 <4.3.2)
  Path: via @astrojs/internal-helpers@0.10.0; via @lhci/utils@0.15.1; via astro@6.4.2
  Exposure: production-manifest build/dev toolchain; not a Node service on static Pages.
  Fix: Update or replace the affected LHCI dependency subtree in a dedicated remediation; npm's proposed @lhci/cli 0.1.0 downgrade is not an accepted fix.
  Propagated effects: argparse

HIGH lighthouse@12.6.1 -> fix available; exact safe version not supplied in npm audit
  CVE: not provided
  Advisory: inherited from puppeteer-core
  Path: via @lhci/cli@0.15.1; via @lhci/utils@0.15.1
  Exposure: development-only toolchain; not a Node service on static Pages.
  Fix: Update or replace the affected LHCI dependency subtree in a dedicated remediation; npm's proposed @lhci/cli 0.1.0 downgrade is not an accepted fix.
  Propagated effects: puppeteer-core

HIGH nanoid@3.3.12 -> fix available; exact safe version not supplied in npm audit
  CVE: not provided
  Advisory: https://github.com/advisories/GHSA-28wg-ghj8-5hjv (high; affected <3.3.16)
    https://github.com/advisories/GHSA-2v37-7h3g-55p8 (high; affected <3.3.18)
  Path: via postcss@8.5.15
  Exposure: production-manifest build/dev toolchain; not a Node service on static Pages.
  Fix: Re-resolve the listed parent dependency to a version outside every advisory range, retain exact direct pins, and re-run npm audit.

HIGH pac-proxy-agent@7.2.0 -> fix available; exact safe version not supplied in npm audit
  CVE: not provided
  Advisory: inherited from get-uri
  Path: via proxy-agent@6.5.0
  Exposure: development-only toolchain; not a Node service on static Pages.
  Fix: Update or replace the affected LHCI dependency subtree in a dedicated remediation; npm's proposed @lhci/cli 0.1.0 downgrade is not an accepted fix.
  Propagated effects: get-uri

HIGH postcss@8.5.15 -> fix available; exact safe version not supplied in npm audit
  CVE: not provided
  Advisory: https://github.com/advisories/GHSA-fxqj-rqcc-2cmp (moderate; affected <=8.5.22)
    https://github.com/advisories/GHSA-r28c-9q8g-f849 (high; affected <=8.5.17)
  Path: via vite@7.3.3
  Exposure: production-manifest build/dev toolchain; not a Node service on static Pages.
  Fix: Re-resolve the listed parent dependency to a version outside every advisory range, retain exact direct pins, and re-run npm audit.

HIGH proxy-agent@6.5.0 -> fix available; exact safe version not supplied in npm audit
  CVE: not provided
  Advisory: inherited from pac-proxy-agent
  Path: via @lhci/cli@0.15.1; via @puppeteer/browsers@2.13.2
  Exposure: development-only toolchain; not a Node service on static Pages.
  Fix: Update or replace the affected LHCI dependency subtree in a dedicated remediation; npm's proposed @lhci/cli 0.1.0 downgrade is not an accepted fix.
  Propagated effects: pac-proxy-agent

HIGH puppeteer-core@24.43.1 -> fix available; exact safe version not supplied in npm audit
  CVE: not provided
  Advisory: inherited from @puppeteer/browsers
  Path: via lighthouse@12.6.1
  Exposure: development-only toolchain; not a Node service on static Pages.
  Fix: Update or replace the affected LHCI dependency subtree in a dedicated remediation; npm's proposed @lhci/cli 0.1.0 downgrade is not an accepted fix.
  Propagated effects: @puppeteer/browsers

HIGH sharp@0.34.5 -> 0.35.5
  CVE: CVE-2026-33327, CVE-2026-33328, CVE-2026-35590, CVE-2026-35591, CVE-2026-96889 (IDs supplied in advisory titles)
  Advisory: https://github.com/advisories/GHSA-f88m-g3jw-g9cj (high; affected <0.35.0)
    https://github.com/advisories/GHSA-rgj7-g3m4-5g8c (high; affected <0.35.4)
    https://github.com/advisories/GHSA-wq5f-xc86-pv6w (high; affected <0.35.5)
  Path: direct; via astro@6.4.2
  Exposure: production-manifest build/dev toolchain; not a Node service on static Pages.
  Fix: Pin sharp 0.35.5 and verify the Astro dependency tree resolves compatible fixed Sharp/native libraries.

HIGH smol-toml@1.6.1 -> fix available; exact safe version not supplied in npm audit
  CVE: not provided
  Advisory: https://github.com/advisories/GHSA-7w5x-hrqm-74c2 (high; affected <=1.7.0)
    https://github.com/advisories/GHSA-r4xh-jqrq-34v2 (moderate; affected <=1.8.0)
  Path: via @astrojs/internal-helpers@0.10.0; via astro@6.4.2
  Exposure: production-manifest build/dev toolchain; not a Node service on static Pages.
  Fix: Re-resolve the listed parent dependency to a version outside every advisory range, retain exact direct pins, and re-run npm audit.

HIGH source-map-js@1.2.1 -> fix available; exact safe version not supplied in npm audit
  CVE: not provided
  Advisory: https://github.com/advisories/GHSA-68fv-2mgg-jv7q (high; affected >=1.0.0 <1.2.2)
  Path: via @tailwindcss/node@4.2.0; via css-tree@3.2.1; via css-tree@2.2.1; via magicast@0.5.3; via postcss@8.5.15
  Exposure: production-manifest build/dev toolchain; not a Node service on static Pages.
  Fix: Re-resolve the listed parent dependency to a version outside every advisory range, retain exact direct pins, and re-run npm audit.

HIGH svgo@4.0.1 -> fix available; exact safe version not supplied in npm audit
  CVE: not provided
  Advisory: https://github.com/advisories/GHSA-2p49-hgcm-8545 (high; affected >=4.0.0 <4.0.2)
    https://github.com/advisories/GHSA-w27v-7q3p-w38r (high; affected >=4.0.0 <4.1.0)
    https://github.com/advisories/GHSA-4vpr-x523-8j87 (moderate; affected >=4.0.0 <4.1.0)
  Path: via astro@6.4.2
  Exposure: production-manifest build/dev toolchain; not a Node service on static Pages.
  Fix: Re-resolve the listed parent dependency to a version outside every advisory range, retain exact direct pins, and re-run npm audit.

HIGH tmp@0.0.33, 0.1.0 -> fix available; exact safe version not supplied in npm audit
  CVE: not provided
  Advisory: https://github.com/advisories/GHSA-52f5-9888-hmc6 (low; affected <=0.2.3)
    https://github.com/advisories/GHSA-ph9p-34f9-6g65 (high; affected <0.2.6)
  Path: via @lhci/cli@0.15.1; via external-editor@3.1.0
  Exposure: development-only toolchain; not a Node service on static Pages.
  Fix: Update or replace the affected LHCI dependency subtree in a dedicated remediation; npm's proposed @lhci/cli 0.1.0 downgrade is not an accepted fix.

HIGH vite@7.3.3 -> fix available; exact safe version not supplied in npm audit
  CVE: not provided
  Advisory: https://github.com/advisories/GHSA-v6wh-96g9-6wx3 (moderate; affected >=7.0.0 <=7.3.4)
    https://github.com/advisories/GHSA-fx2h-pf6j-xcff (high; affected >=7.0.0 <=7.3.4)
  Path: via astro@6.4.2
  Exposure: production-manifest build/dev toolchain; not a Node service on static Pages.
  Fix: Re-resolve the listed parent dependency to a version outside every advisory range, retain exact direct pins, and re-run npm audit.

MODERATE @astrojs/language-server@2.16.10 -> fix available; exact safe version not supplied in npm audit
  CVE: not provided
  Advisory: inherited from volar-service-yaml
  Path: via @astrojs/check@0.9.9
  Exposure: development-only toolchain; not a Node service on static Pages.
  Fix: Re-resolve the listed parent dependency to a version outside every advisory range, retain exact direct pins, and re-run npm audit.
  Propagated effects: volar-service-yaml

MODERATE argparse@1.0.10 -> fix available; exact safe version not supplied in npm audit
  CVE: not provided
  Advisory: inherited from sprintf-js
  Path: via js-yaml@3.15.2; via js-yaml@4.1.1
  Exposure: development-only toolchain; not a Node service on static Pages.
  Fix: Update or replace the affected LHCI dependency subtree in a dedicated remediation; npm's proposed @lhci/cli 0.1.0 downgrade is not an accepted fix.
  Propagated effects: sprintf-js

MODERATE body-parser@1.20.6 -> fix available; exact safe version not supplied in npm audit
  CVE: not provided
  Advisory: inherited from qs
  Path: via express@4.22.2
  Exposure: development-only toolchain; not a Node service on static Pages.
  Fix: Re-resolve the listed parent dependency to a version outside every advisory range, retain exact direct pins, and re-run npm audit.
  Propagated effects: qs

MODERATE express@4.22.2 -> fix available; exact safe version not supplied in npm audit
  CVE: not provided
  Advisory: inherited from qs
  Path: via @lhci/cli@0.15.1
  Exposure: development-only toolchain; not a Node service on static Pages.
  Fix: Re-resolve the listed parent dependency to a version outside every advisory range, retain exact direct pins, and re-run npm audit.
  Propagated effects: qs

MODERATE ip-address@10.7.0 -> fix available; exact safe version not supplied in npm audit
  CVE: not provided
  Advisory: https://github.com/advisories/GHSA-j6r3-76f7-8jcv (moderate; affected <=10.7.0)
    https://github.com/advisories/GHSA-h3mg-xc3c-68pw (moderate; affected <=10.7.0)
  Path: via socks@2.8.10
  Exposure: development-only toolchain; not a Node service on static Pages.
  Fix: Re-resolve the listed parent dependency to a version outside every advisory range, retain exact direct pins, and re-run npm audit.

MODERATE qs@6.15.3 -> fix available; exact safe version not supplied in npm audit
  CVE: not provided
  Advisory: https://github.com/advisories/GHSA-x5fp-wj9c-mxmx (moderate; affected >=6.14.2 <=6.15.3)
    https://github.com/advisories/GHSA-4mjr-xmp4-gh2g (moderate; affected >=2.2.5 <6.16.0)
  Path: via body-parser@1.20.6; via express@4.22.2
  Exposure: development-only toolchain; not a Node service on static Pages.
  Fix: Re-resolve the listed parent dependency to a version outside every advisory range, retain exact direct pins, and re-run npm audit.

MODERATE sprintf-js@1.0.3 -> fix available; exact safe version not supplied in npm audit
  CVE: not provided
  Advisory: https://github.com/advisories/GHSA-hp3w-g68c-fv3c (moderate; affected <=1.1.3)
  Path: via argparse@1.0.10
  Exposure: development-only toolchain; not a Node service on static Pages.
  Fix: Update or replace the affected LHCI dependency subtree in a dedicated remediation; npm's proposed @lhci/cli 0.1.0 downgrade is not an accepted fix.

MODERATE uuid@8.3.2 -> fix available; exact safe version not supplied in npm audit
  CVE: not provided
  Advisory: https://github.com/advisories/GHSA-w5hq-g745-h8pq (moderate; affected <11.1.1)
  Path: via @lhci/cli@0.15.1
  Exposure: development-only toolchain; not a Node service on static Pages.
  Fix: Update or replace the affected LHCI dependency subtree in a dedicated remediation; npm's proposed @lhci/cli 0.1.0 downgrade is not an accepted fix.

MODERATE volar-service-yaml@0.0.70 -> fix available; exact safe version not supplied in npm audit
  CVE: not provided
  Advisory: inherited from yaml-language-server
  Path: via @astrojs/language-server@2.16.10
  Exposure: development-only toolchain; not a Node service on static Pages.
  Fix: Re-resolve the listed parent dependency to a version outside every advisory range, retain exact direct pins, and re-run npm audit.
  Propagated effects: yaml-language-server

MODERATE yaml@2.7.1 -> fix available; exact safe version not supplied in npm audit
  CVE: not provided
  Advisory: https://github.com/advisories/GHSA-48c2-rrv3-qjmp (moderate; affected >=2.0.0 <2.8.3)
  Path: via @astrojs/yaml2ts@0.2.4; via yaml-language-server@1.20.0
  Exposure: development-only toolchain; not a Node service on static Pages.
  Fix: Re-resolve the listed parent dependency to a version outside every advisory range, retain exact direct pins, and re-run npm audit.

MODERATE yaml-language-server@1.20.0 -> fix available; exact safe version not supplied in npm audit
  CVE: not provided
  Advisory: inherited from yaml
  Path: via volar-service-yaml@0.0.70
  Exposure: development-only toolchain; not a Node service on static Pages.
  Fix: Re-resolve the listed parent dependency to a version outside every advisory range, retain exact direct pins, and re-run npm audit.
  Propagated effects: yaml

LOW esbuild@0.27.7 -> fix available; exact safe version not supplied in npm audit
  CVE: not provided
  Advisory: https://github.com/advisories/GHSA-g7r4-m6w7-qqqr (low; affected >=0.27.3 <0.28.1)
  Path: via astro@6.4.2; via vite@7.3.3
  Exposure: production-manifest build/dev toolchain; not a Node service on static Pages.
  Fix: Re-resolve the listed parent dependency to a version outside every advisory range, retain exact direct pins, and re-run npm audit.

LOW external-editor@3.1.0 -> fix available; exact safe version not supplied in npm audit
  CVE: not provided
  Advisory: inherited from tmp
  Path: via inquirer@6.5.2
  Exposure: development-only toolchain; not a Node service on static Pages.
  Fix: Update or replace the affected LHCI dependency subtree in a dedicated remediation; npm's proposed @lhci/cli 0.1.0 downgrade is not an accepted fix.
  Propagated effects: tmp

LOW inquirer@6.5.2 -> fix available; exact safe version not supplied in npm audit
  CVE: not provided
  Advisory: inherited from external-editor
  Path: via @lhci/cli@0.15.1
  Exposure: development-only toolchain; not a Node service on static Pages.
  Fix: Update or replace the affected LHCI dependency subtree in a dedicated remediation; npm's proposed @lhci/cli 0.1.0 downgrade is not an accepted fix.
  Propagated effects: external-editor

--- STALENESS FINDINGS ---
astro@6.4.2 -> 7.3.8 (major) - production dependency is one major behind and critical security fix starts in 7.2.8.
  Last release: 2026-10-08T15:41:04.794Z (npm registry)
  Prod/Dev: prod; used to build the static site
sharp@0.34.5 -> 0.35.5 (minor, pre-1.0) - included solely because these releases fix native-library security advisories.
  Last release: not queried; version confirmed by npm outdated and maintainer advisory
  Prod/Dev: dev direct, also production-manifest transitive via astro
No other direct production dependency is two years stale. All eight production package release histories were queried. Non-security patch/minor differences are intentionally excluded.

--- LICENSE FINDINGS ---
(none)
Direct licenses: 7 MIT, 4 Apache-2.0, 2 OFL-1.1. (project has no license policy)
OFL-1.1 font embedding is permitted with font copyright/license notices retained; it does not require this site's source to adopt OFL.
Authoritative license: https://openfontlicense.org/open-font-license-official-text/
Scope is direct dependency license compatibility, not a legal opinion or an exhaustive transitive license review.

--- TOOL STATUS ---
npm audit --json: exit 1 with valid vulnerability JSON after one elevated network retry.
npm audit --omit=dev --json: exit 1 with valid vulnerability JSON after one elevated network retry.
npm outdated --json: exit 1 with valid outdated-package JSON after one elevated network retry.
Initial sandbox requests failed: getaddrinfo ENOTFOUND registry.npmjs.org. Initial npm logging also could not write /Users/cpconnor/.npm/_logs. Read-only escalated registry requests succeeded; no automatic approval rejection occurred.
Lockfile present, version 3; 749 dependency entries (npm metadata: prod 279, dev 385, optional 108, peer 8; categories overlap).
Installed direct package versions/licenses were cross-checked against package-lock.json.
No supported nested manifests detected one level below root; no other package manager to audit.
Optional fontTools inspection unavailable (ModuleNotFoundError). Font licensing decisions use package metadata and authoritative OFL terms; embedded notices were not fully decoded.
No package, lockfile, configuration, source, or original media files were modified.

--- RECOMMENDATIONS ---
1. Keep this release blocked under the canonical critical-with-fix dependency rule. Remediate Astro/Sharp in a separately reviewed source change: migrate Astro to validated >=7.2.8, pin compatible Sharp >=0.35.5, and pass source, media, output, browser and Lighthouse checks.
2. Re-resolve compatible patched production toolchain packages (devalue, http-cache-semantics, js-yaml, nanoid, postcss, smol-toml, source-map-js, svgo, Vite/esbuild). Use verified advisory ranges. Preserve the existing Tailwind/Astro compatibility boundary until a tested migration intentionally changes it.
3. Patch LHCI's Express subtree to proxy-addr 2.0.8, then remove remaining dev-tool findings through compatible dependency updates or tool replacement. Do not accept the audit-suggested LHCI 0.1.0 downgrade and do not use force audit fixes.
4. Run both full and production-manifest JSON audits again on the corrected lockfile. Treat existing static public deployment and developer/build risk as separate layers.
5. Preserve the bundled font licenses/copyright metadata during any font changes.

=== END REPORT ===

## DETAILED FINDINGS

### Runtime and build exposure

`astro.config.mjs` sets `output: 'static'` with no server adapter. `.github/workflows/deploy.yml` uploads `dist/` to GitHub Pages; the public site does not run Astro, Express, a Vite dev server, or an image-optimization API. The audited server-only issues therefore have no demonstrated live server path in this architecture.

`scripts/generate-media.mjs` calls Sharp for owner-provided local PNG/JPEG/WebP files and outputs responsive WebP files. It does not select AVIF or SVG inputs by extension. This narrows the tested media generator's decoder exposure but does not prove all native-library advisory conditions impossible. Astro default image service and any future import processing remain separate code paths; CI builds use Linux. Trusted media provenance matters for build-tool advisories.

The critical Astro issue requires processing an attacker-controlled AVIF. Maintainer documentation identifies Astro 7.2.8 / Sharp 0.35.4 as the fix. Sharp has an additional October advisory requiring 0.35.5. Audit metadata's proposed Astro 6.4.8 is therefore insufficient evidence of remediation.

The critical proxy-addr issue belongs to development-only LHCI's Express tooling; it requires a vulnerable trust-subnet configuration, not ordinary static serving. A specific vulnerable trust configuration is not demonstrated here. Its canonical critical-with-fix classification still produces a report blocker, without claiming a publicly exploitable live site.

### Evidence

- Security counts/ranges: actual `npm audit --json` and `npm audit --omit=dev --json` completed during this run.
- Installed versions and dependency parents: `package-lock.json`; all 13 direct licenses: installed `node_modules/*/package.json`.
- Version currency: actual `npm outdated --json`; production release histories: npm registry `time` metadata.
- Critical Astro primary advisory: https://github.com/advisories/GHSA-26w7-cxv4-gfx2
- Critical proxy-addr primary advisory: https://github.com/advisories/GHSA-jqcg-44mw-7w3h
- Latest Sharp primary advisory: https://github.com/advisories/GHSA-wq5f-xc86-pv6w
- Publishing architecture: `astro.config.mjs`, `.github/workflows/deploy.yml`, `CLAUDE.md`.


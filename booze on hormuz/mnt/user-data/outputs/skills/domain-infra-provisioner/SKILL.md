---
name: domain-infra-provisioner
description: |
  Provisions DNS + static hosting for a domain end-to-end, branching by host. Cloudflare Pages path (nameserver migration off the registrar, Workers-trap avoidance, custom domain + auto-SSL) or GitHub Pages path (public/CNAME, Actions deploy, HTTPS enforcement, CAA records). Registrar-aware (Namecheap). Includes DNS-propagation validation and a live-HTTPS check.

  Inputs: a domain, its registrar, a built static site repo, chosen host. Outputs: a live HTTPS site on the custom domain + an infra-state record of every DNS/host setting. No site building, no content, no design.

  REFUSES: building/scaffolding the site (use astro-static-scaffold), content authoring, design, framework selection, deep post-deploy QA (use deploy-verify).

  TRIGGERS: "provision infra for", "set up DNS and hosting", "point the domain", "deploy to cloudflare pages", "deploy to github pages", "move nameservers", "configure CAA".
---

# Domain Infra Provisioner

Take a built static site from repo to live-on-custom-domain. Branches by host: Cloudflare Pages (recommended for media-heavy sites) or GitHub Pages (zero-rework if DNS already points there). Codifies the steps that turned into 148 ad-hoc actions the first time.

## QUICK START
1. Confirm the site builds (`npm run build` is green) and the host is chosen.
2. Route to the matching branch below.
3. Provision DNS + host, attach the custom domain.
4. Validate: DNS resolves, HTTPS serves, the right URL form (`*.pages.dev`, not `*.workers.dev`).
5. Record every setting in `infra-state.md`.

## WHEN TO USE
- A built static site needs to go live on a custom domain
- Migrating a domain's hosting (e.g. GitHub Pages → Cloudflare Pages)
- Configuring registrar DNS, nameservers, CAA, or HTTPS enforcement

## WHEN NOT TO USE
- The site isn't built yet → astro-static-scaffold
- Writing content or designing → later checkpoints
- Thorough post-deploy QA (Lighthouse, link scan, headers audit) → deploy-verify
- Choosing a host or framework → that decision precedes this skill

## PROCESS — branch by host

### Pre-flight (both paths)
Confirm `npm run build` exits 0 and `dist/` is produced. Confirm the registrar and the chosen host. Note the current DNS state before changing anything.
Expected output: a pre-change DNS snapshot + confirmed host choice.

### BRANCH A — Cloudflare Pages (recommended for media sites)
**Why:** unlimited bandwidth, free cookieless analytics, R2 media, edge CDN, per-branch previews. **Cost:** nameserver migration; the Pages-vs-Workers UI trap.

1. **Add site to Cloudflare** → Free plan. It scans existing DNS — **delete imported GitHub A records** (185.199.108–111.153); they're being replaced.
2. **Move nameservers:** registrar → Custom DNS → paste Cloudflare's two nameservers. Back in Cloudflare, Check nameservers.
3. **Create the Pages project (avoid the trap):** Workers & Pages → Create application → **Pages tab** → Import existing Git repo → select repo → Begin setup. Framework preset Astro, build `npm run build`, output `dist`, env `NODE_VERSION=22`. Save and Deploy.
4. **Verify URL form is `*.pages.dev`, NOT `*.workers.dev`.** If workers.dev, you used the wrong flow — delete, redo via the Pages tab.
5. **Attach custom domain:** Pages project → Custom domains → add apex + www; DNS auto-creates (proxied); SSL auto-provisions.

Expected output: live on `*.pages.dev`, then on the custom domain over HTTPS.

### BRANCH B — GitHub Pages (zero rework if DNS already there)
**Why:** already wired, no DNS migration. **Cost:** no built-in analytics, soft bandwidth cap, no previews.

1. `echo "<DOMAIN>" > public/CNAME` (so it survives every build).
2. Add `.github/workflows/deploy.yml` using `withastro/action@v3` + `actions/deploy-pages@v4`.
3. Settings → Pages → Source = **GitHub Actions** (set manually, once).
4. Push; watch the run; once green and DNS checks pass, enable **Enforce HTTPS**.
5. Add CAA records at the registrar: `0 issue "letsencrypt.org"`, `0 issue "pki.goog"`.

Expected output: live on the custom domain over enforced HTTPS, CAA pinned.

### Validation (both paths)
Run `references/verify-dns.sh <domain>` (or the commands within). Confirm: A/CNAME or nameservers resolve, `curl -sSI https://<domain>` returns 200 with the expected headers (Cloudflare: `cf-ray` + HSTS; GitHub: HSTS after enforcement).
Expected output: a passing DNS + HTTPS check; otherwise a propagation-wait note.

### Record state
Write `infra-state.md`: registrar, nameservers/records, host, project name, custom-domain status, SSL status, date. This is the reusable template for the next domain.
Expected output: `infra-state.md` committed to the repo.

## OUTPUT SPECIFICATION
A live HTTPS site on the custom domain via the chosen host, plus `infra-state.md` documenting every DNS/host setting. No site code changes beyond `public/CNAME` (GitHub path) and the deploy workflow.

## ERROR HANDLING
| Condition | Action |
|---|---|
| Cloudflare deploy URL is `*.workers.dev` | Wrong flow; delete, redo via Workers & Pages → Pages tab → Import repo |
| Custom domain stuck "pending" / "DNS could not be retrieved" | Propagation; wait, re-check; confirm nameservers/records active |
| GitHub Pages serves 404 after deploy | Source still "branch"; set to GitHub Actions, re-run workflow |
| CSS missing (GitHub path) | `withastro/action@v3` handles Jekyll; confirm the action ran, not a bare branch deploy |
| Registrar has email forwarding | Moving nameservers to Cloudflare breaks registrar-level forwarding; migrate email config too or stay on GitHub path |

## DEPENDENCIES
- `references/host-paths.md` — full step detail per host + the Workers-trap explainer
- `references/verify-dns.sh` — DNS + HTTPS verification commands
- A built static site (`dist/` produced); registrar + host access; `gh` for the GitHub path
- Verify dashboard UIs/CLI flags against current docs before acting (Cloudflare consolidates Pages/Workers; UI shifts)

## NOTES
Pipeline position: downstream of astro-static-scaffold, upstream of deploy-verify. Build is host-agnostic; this skill is the only host-specific stage. Default recommendation is Cloudflare Pages for any media-heavy/scaling site; GitHub Pages is the zero-rework fallback.

v1.0.0

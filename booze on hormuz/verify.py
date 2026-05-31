#!/usr/bin/env python3
"""
deploy-verify — post-deploy verification for a static site.
Usage: python3 verify.py <url> [--expect-host cloudflare|github]
Runs HTTP status, header, redirect, and HTML-sanity checks. Exits non-zero on FAIL.
Lighthouse is a separate manual step (needs Chrome) — this covers the deterministic checks.
"""
import sys, json, argparse, urllib.request, urllib.error, ssl

def fetch(url, method="GET"):
    req = urllib.request.Request(url, method=method, headers={"User-Agent": "deploy-verify/1.0"})
    ctx = ssl.create_default_context()
    try:
        with urllib.request.urlopen(req, timeout=15, context=ctx) as r:
            body = r.read(20000).decode("utf-8", "ignore") if method == "GET" else ""
            return r.status, dict(r.headers), r.geturl(), body
    except urllib.error.HTTPError as e:
        return e.code, dict(e.headers), url, ""
    except Exception as e:
        return None, {"error": str(e)}, url, ""

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("url")
    ap.add_argument("--expect-host", choices=["cloudflare", "github"], default=None)
    a = ap.parse_args()
    url = a.url if a.url.startswith("http") else "https://" + a.url
    results, fails = [], 0

    status, headers, final_url, body = fetch(url)
    hl = {k.lower(): v for k, v in headers.items()}

    def check(name, ok, detail):
        nonlocal fails
        results.append({"check": name, "pass": bool(ok), "detail": detail})
        if not ok: fails += 1

    check("reachable", status is not None, headers.get("error", f"status {status}"))
    check("http_2xx_or_3xx", status is not None and status < 400, f"status {status}")
    check("https_enforced_hsts", "strict-transport-security" in hl,
          hl.get("strict-transport-security", "MISSING — enable HTTPS enforcement"))
    check("not_workers_dev", "workers.dev" not in final_url,
          f"final URL {final_url}" + (" — TRAP: static site on Workers" if "workers.dev" in final_url else ""))
    if a.expect_host == "cloudflare":
        check("cloudflare_serving", "cf-ray" in hl, "cf-ray " + ("present" if "cf-ray" in hl else "MISSING"))
    if a.expect_host == "github":
        check("github_serving", "github" in hl.get("server", "").lower() or "x-github-request-id" in hl,
              hl.get("server", "server header"))
    # HTML sanity
    has_title = "<title>" in body.lower()
    check("html_title_present", has_title, "title tag " + ("found" if has_title else "MISSING"))
    looks_404 = any(m in body.lower() for m in ["404: not found", "there isn't a github pages site here", "page not found"])
    check("not_404_page", not looks_404, "404 markers " + ("found — wrong content served" if looks_404 else "none"))

    report = {"url": url, "final_url": final_url, "status": status,
              "verdict": "PASS" if fails == 0 else f"FAIL ({fails} issue(s))", "checks": results}
    print(json.dumps(report, indent=2))
    sys.exit(0 if fails == 0 else 1)

if __name__ == "__main__":
    main()

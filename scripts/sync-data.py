#!/usr/bin/env python3
"""Build-time data sync (run by the Pages workflow; safe to run locally).

- assets/data/verified-models.json: slimmed copy of the verified model catalog, fetched from
  https://download.sharplight.dev/catalog/verified-models.json (or the file given as argv[1]).
  On failure the committed copy stays.
- assets/data/latest.json: latest Studio versions per channel from the Velopack feeds
  (fallback for browsers when the feed host does not send CORS headers).
"""
import json, sys, urllib.request, pathlib

BASE = "https://download.sharplight.dev"
OUT = pathlib.Path(__file__).resolve().parent.parent / "assets" / "data"
RIDS = ["win-x64", "win-arm64", "osx-arm64", "linux-x64", "linux-arm64"]


def get(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "sharplight-website-build"}), timeout=30) as r:
        return json.load(r)


def slim(cat):
    entries = []
    for e in cat["entries"]:
        v = e.get("verification") or {}
        entries.append({
            "id": e["id"], "name": e["name"], "kind": e["kind"], "family": e.get("family"),
            "level": e.get("level"), "license": e.get("license"), "gated": e.get("gated", False),
            "tags": e.get("tags", []),
            "variants": [{k: x.get(k) for k in ("label", "format", "quantization", "repository")} for x in e.get("variants", [])],
            "verification": {k: v.get(k) for k in ("reference", "summary", "date", "providers")},
        })
    return {"updated": cat.get("updated"), "entries": entries}


def ver_key(v):
    return [(0, int(p)) if p.isdigit() else (1, p) for p in v.replace("-", ".").split(".")]


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    try:
        cat = json.load(open(sys.argv[1])) if len(sys.argv) > 1 else get(BASE + "/catalog/verified-models.json")
        json.dump(slim(cat), open(OUT / "verified-models.json", "w"), separators=(",", ":"))
        print("catalog: %d entries" % len(cat["entries"]))
    except Exception as ex:
        print("catalog: keeping committed copy (%s)" % ex)
    versions = {}
    for rid in RIDS:
        for ch in ("stable", "unstable"):
            try:
                feed = get("%s/studio/releases.%s-%s.json" % (BASE, rid, ch))
                full = [a["Version"] for a in feed.get("Assets", []) if a.get("Type") == "Full"]
                if full:
                    versions["%s-%s" % (rid, ch)] = max(full, key=ver_key)
            except Exception as ex:
                print("feed %s-%s: %s" % (rid, ch, ex))
    json.dump({"versions": versions}, open(OUT / "latest.json", "w"))
    print("versions:", versions)


main()

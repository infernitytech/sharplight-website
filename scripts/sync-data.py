#!/usr/bin/env python3
"""Build-time data sync (run by the Pages workflow on every push and daily; safe to run locally).

Writes, relative to the repository root:
- _data/verified_models.json: slimmed verified-model catalog, fetched from
  https://download.sharplight.dev/catalog/verified-models.json (or the file given as argv[1]).
- _data/studio_releases.json: per Velopack channel (<rid>-<stable|unstable>) the newest Full release: version, size and
  date of the primary installer (HEAD request), notes_html. The feeds have no CORS header, so the browser cannot read
  them; the site shows these build-time values.
On any failure the committed copy of a file stays.
"""
import json, sys, pathlib, urllib.request, email.utils, datetime

BASE = "https://download.sharplight.dev"
ROOT = pathlib.Path(__file__).resolve().parent.parent
DATA = ROOT / "_data"
FILES = {
    "win-x64": "SharplightStudio-win-x64-{c}-Setup.exe",
    "win-arm64": "SharplightStudio-win-arm64-{c}-Setup.exe",
    "osx-arm64": "SharplightStudio-osx-arm64-{c}-Setup.pkg",
    "linux-x64": "SharplightStudio-linux-x64-{c}.AppImage",
    "linux-arm64": "SharplightStudio-linux-arm64-{c}.AppImage",
}


def req(url, method="GET"):
    return urllib.request.urlopen(urllib.request.Request(url, method=method, headers={"User-Agent": "sharplight-website-build"}), timeout=30)


def slim(cat):
    entries = []
    for e in cat["entries"]:
        v = e.get("verification") or {}
        entries.append({
            "id": e["id"], "name": e["name"], "kind": e["kind"], "family": e.get("family"),
            "level": e.get("level"), "license": e.get("license"), "gated": e.get("gated", False),
            "tags": e.get("tags", []),
            "variants": [{k: x.get(k) for k in ("label", "format", "quantization", "repository", "revision", "memoryBytes")} for x in e.get("variants", [])],
            "verification": {k: v.get(k) for k in ("reference", "summary", "date", "providers")},
        })
    return {"updated": cat.get("updated"), "entries": entries}


def ver_key(v):
    return [(0, int(p)) if p.isdigit() else (1, p) for p in v.replace("-", ".").split(".")]


def main():
    DATA.mkdir(exist_ok=True)
    try:
        cat = json.load(open(sys.argv[1])) if len(sys.argv) > 1 else json.load(req(BASE + "/catalog/verified-models.json"))
        json.dump(slim(cat), open(DATA / "verified_models.json", "w"), separators=(",", ":"))
        print("catalog: %d entries" % len(cat["entries"]))
    except Exception as ex:
        print("catalog: keeping committed copy (%s)" % ex)
    out = {}
    for rid, pat in FILES.items():
        for ch in ("stable", "unstable"):
            key = "%s-%s" % (rid, ch)
            try:
                feed = json.load(req("%s/studio/releases.%s.json" % (BASE, key)))
                full = [a for a in feed.get("Assets", []) if a.get("Type") == "Full"]
                if not full:
                    continue
                top = max(full, key=lambda a: ver_key(a["Version"]))
                item = {"version": top["Version"], "notes_html": top.get("NotesHTML") or ""}
                try:
                    h = req("%s/studio/%s" % (BASE, pat.format(c=ch)), "HEAD")
                    item["size"] = int(h.headers.get("Content-Length", 0))
                    lm = h.headers.get("Last-Modified")
                    if lm:
                        item["date"] = email.utils.parsedate_to_datetime(lm).date().isoformat()
                except Exception as ex:
                    print("head %s: %s" % (key, ex))
                out[key] = item
            except Exception as ex:
                print("feed %s: %s" % (key, ex))
    if out:
        out["generated"] = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d")
        json.dump(out, open(DATA / "studio_releases.json", "w"), indent=1)
    print({k: v.get("version") for k, v in out.items() if isinstance(v, dict)})


main()

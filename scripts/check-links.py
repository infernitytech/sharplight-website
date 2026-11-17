#!/usr/bin/env python3
"""Check internal links and assets in a built _site. Usage: check-links.py _site /baseurl"""
import os, re, sys
from html.parser import HTMLParser
from urllib.parse import urlparse, unquote

root, base = sys.argv[1], (sys.argv[2] if len(sys.argv) > 2 else "").rstrip("/")
bad, pages = [], 0

class P(HTMLParser):
    def __init__(s): super().__init__(); s.links = []; s.ids = set()
    def handle_starttag(s, t, a):
        a = dict(a)
        if "id" in a: s.ids.add(a["id"])
        for k in ("href", "src"):
            if a.get(k) and t != "meta": s.links.append(a[k])

def resolve(path):
    p = os.path.join(root, path.lstrip("/"))
    for c in (p, os.path.join(p, "index.html"), p + ".html"):
        if os.path.isfile(c): return c

parsed = {}
for d, _, fs in os.walk(root):
    for f in fs:
        if f.endswith(".html"):
            fp = os.path.join(d, f); pages += 1
            p = P(); p.feed(open(fp, encoding="utf-8").read()); parsed[fp] = p
for fp, p in parsed.items():
    rel = "/" + os.path.relpath(fp, root)
    for l in p.links:
        u = urlparse(l)
        if u.scheme or l.startswith("//") or not (u.path or u.fragment): continue
        if not u.path:
            if u.fragment and u.fragment not in p.ids: bad.append((rel, l, "no anchor"))
            continue
        path = unquote(u.path)
        if not path.startswith("/"): path = os.path.normpath(os.path.join(os.path.dirname(rel), path))
        elif base and path.startswith(base + "/") or path == base: path = path[len(base):] or "/"
        elif base: bad.append((rel, l, "missing baseurl")); continue
        t = resolve(path)
        if not t: bad.append((rel, l, "not found")); continue
        if u.fragment and t in parsed and u.fragment not in parsed[t].ids: bad.append((rel, l, "no anchor"))
print(f"{pages} pages checked, {len(bad)} problems")
for b in bad: print(*b)
sys.exit(1 if bad else 0)

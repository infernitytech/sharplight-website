(function () {
  'use strict';
  var base = document.documentElement.getAttribute('data-base') || '';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  // theme toggle (default follows prefers-color-scheme)
  var tt = $('.theme-toggle');
  if (tt) tt.addEventListener('click', function () {
    var cur = document.documentElement.getAttribute('data-theme') ||
      (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    var next = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('sl-theme', next); } catch (e) {}
  });

  // mobile nav
  var nt = $('.nav-toggle'), nav = $('#nav');
  if (nt) nt.addEventListener('click', function () {
    var o = nav.classList.toggle('open'); nt.setAttribute('aria-expanded', o);
  });

  // copy buttons on code blocks
  $$('div.highlight').forEach(function (h) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'copy-btn'; b.textContent = 'Copy'; b.setAttribute('aria-label', 'Copy code');
    b.addEventListener('click', function () {
      var t = $('pre', h).innerText;
      var done = function () { b.textContent = 'Copied'; setTimeout(function () { b.textContent = 'Copy'; }, 1500); };
      if (navigator.clipboard) navigator.clipboard.writeText(t).then(done); else done();
    });
    h.appendChild(b);
  });

  // "on this page" table of contents
  var toc = $('[data-toc]');
  if (toc) {
    var hs = $$('.doc-main h2, .doc-main h3');
    if (hs.length > 1) {
      var html = '<strong>On this page</strong><ul>';
      hs.forEach(function (h) {
        if (h.id) html += '<li><a class="' + (h.tagName === 'H3' ? 'l3' : '') + '" href="#' + h.id + '">' + h.textContent + '</a></li>';
      });
      toc.innerHTML = html + '</ul>';
    }
  }

  // docs search: simple client-side scoring over search.json (self-hosted, no library)
  var qi = $('[data-search]'), res = $('[data-search-results]');
  if (qi) {
    var idx = null, urlEl = $('#sl-search-url');
    var load = function () {
      if (idx) return Promise.resolve(idx);
      return fetch(urlEl.textContent.trim()).then(function (r) { return r.json(); }).then(function (j) { return (idx = j); });
    };
    qi.addEventListener('focus', load);
    qi.addEventListener('input', function () {
      var q = qi.value.trim().toLowerCase();
      if (!q) { res.hidden = true; return; }
      load().then(function (d) {
        var terms = q.split(/\s+/);
        var hits = d.map(function (p) {
          var t = (p.title || '').toLowerCase(), x = (p.text || '').toLowerCase(), s = 0;
          terms.forEach(function (w) { if (t.indexOf(w) >= 0) s += 10; if (x.indexOf(w) >= 0) s += 1; });
          return { p: p, s: s, ok: terms.every(function (w) { return t.indexOf(w) >= 0 || x.indexOf(w) >= 0; }) };
        }).filter(function (h) { return h.ok; }).sort(function (a, b) { return b.s - a.s; }).slice(0, 8);
        res.innerHTML = hits.length ? hits.map(function (h) {
          var i = (h.p.text || '').toLowerCase().indexOf(terms[0]);
          var snip = i >= 0 ? (h.p.text || '').substr(Math.max(0, i - 30), 90) : '';
          var e = document.createElement('div'); e.textContent = snip;
          var t = document.createElement('div'); t.textContent = h.p.title;
          return '<li><a href="' + h.p.url + '">' + t.innerHTML + '<small>' + e.innerHTML + '</small></a></li>';
        }).join('') : '<li><a href="#" tabindex="-1">No results</a></li>';
        res.hidden = false;
      });
    });
    qi.addEventListener('keydown', function (e) { if (e.key === 'Escape') { res.hidden = true; qi.blur(); } });
  }

  // ---- Studio download: platform detection, feeds ----
  var dlData = (function () { try { return JSON.parse($('#sl-downloads').textContent); } catch (e) { return null; } })();
  if (!dlData) return;
  var plats = {}; dlData.platforms.forEach(function (p) { plats[p.rid] = p; });
  var state = { rid: null, fmt: null, channel: 'unstable', detected: null, note: '' };
  var versions = {};

  function fileUrl(rid, fmtId, channel) {
    var p = plats[rid]; var f = p.formats.filter(function (x) { return x.id === fmtId; })[0] || p.formats[0];
    var name = f.file.replace('{pack}', dlData.pack_id).replace('{rid}', rid).replace('{channel}', channel);
    return { url: dlData.base + '/' + name, name: name, fmt: f };
  }
  function detect() {
    var ua = navigator.userAgent || '', pl = (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || '';
    var os = /Win/i.test(pl + ua) ? 'win' : /Mac/i.test(pl) || /Macintosh/.test(ua) ? 'mac' : /Android|iPhone|iPad/.test(ua) ? 'mobile' : /Linux|X11|CrOS/i.test(pl + ua) ? 'linux' : null;
    var arm = /aarch64|arm64|ARM64/i.test(ua + pl);
    var r = { os: os, rid: null, note: '' };
    if (os === 'mac') { r.rid = 'osx-arm64'; r.note = dlData.notes.osx_intel; }
    else if (os === 'win') r.rid = arm ? 'win-arm64' : 'win-x64';
    else if (os === 'linux') r.rid = arm ? 'linux-arm64' : 'linux-x64';
    else if (os === 'mobile') r.note = 'Studio is a desktop app. Open this page on a computer to download it.';
    return r;
  }
  function refine(r) {
    var uad = navigator.userAgentData;
    if (!uad || !uad.getHighEntropyValues || (r.os !== 'win' && r.os !== 'linux')) return Promise.resolve(r);
    return uad.getHighEntropyValues(['architecture', 'bitness']).then(function (v) {
      var arm = /arm/i.test(v.architecture || '');
      if (r.os === 'win') r.rid = arm ? 'win-arm64' : 'win-x64';
      if (r.os === 'linux') r.rid = arm ? 'linux-arm64' : 'linux-x64';
      return r;
    }, function () { return r; });
  }
  function ver(a, b) {
    var pa = String(a).split(/[.\-+]/), pb = String(b).split(/[.\-+]/);
    for (var i = 0; i < Math.max(pa.length, pb.length); i++) {
      var x = pa[i] === undefined ? '' : pa[i], y = pb[i] === undefined ? '' : pb[i];
      var nx = /^\d+$/.test(x), ny = /^\d+$/.test(y);
      if (nx && ny) { if (+x !== +y) return +x - +y; } else if (x !== y) return x < y ? -1 : 1;
    }
    return 0;
  }
  function latestFrom(feed) {
    var best = null;
    (feed.Assets || feed.assets || []).forEach(function (a) {
      if ((a.Type || a.type) !== 'Full') return;
      var v = a.Version || a.version;
      if (!best || ver(v, best) > 0) best = v;
    });
    return best;
  }
  function loadVersion(rid, channel) {
    var key = rid + '-' + channel;
    if (versions[key] !== undefined) return Promise.resolve(versions[key]);
    var live = dlData.base + '/releases.' + key + '.json';
    var fallback = base + '/assets/data/latest.json';
    return fetch(live, { cache: 'no-cache' }).then(function (r) { if (!r.ok) throw 0; return r.json(); })
      .then(function (j) { return (versions[key] = latestFrom(j)); })
      .catch(function () {
        // CORS or network: use the build-time snapshot of the feeds
        return fetch(fallback).then(function (r) { return r.json(); }).then(function (j) {
          return (versions[key] = (j.versions && j.versions[key]) || null);
        }).catch(function () { return (versions[key] = null); });
      });
  }
  function verText(v) { return v ? 'Version ' + v : 'Latest version'; }

  // compact widgets
  var widgets = $$('[data-dl-widget]');
  var full = $('[data-dl-full]');
  function renderWidgets() {
    widgets.forEach(function (w) {
      var btn = $('[data-dl-primary]', w), meta = $('[data-dl-meta]', w);
      if (!state.rid) return;
      var f = fileUrl(state.rid, null, state.channel);
      btn.href = f.url; btn.textContent = 'Download for ' + plats[state.rid].label.replace(/ \(.*\)/, '');
      loadVersion(state.rid, state.channel).then(function (v) {
        meta.textContent = verText(v) + ' · ' + plats[state.rid].label + ' · ' + f.fmt.label;
      });
    });
  }
  function renderFull() {
    if (!full) return;
    var rid = state.rid, p = plats[rid], f = fileUrl(rid, state.fmt, state.channel);
    state.fmt = f.fmt.id;
    var sel = $('[data-dl-platform]', full), fm = $('[data-dl-format]', full);
    sel.value = rid;
    fm.innerHTML = p.formats.map(function (x) { return '<option value="' + x.id + '">' + x.label + '</option>'; }).join('');
    fm.value = state.fmt;
    var big = $('[data-dl-big]', full);
    big.href = f.url; big.textContent = 'Download ' + f.fmt.label;
    $('[data-dl-file]', full).textContent = f.name;
    $('[data-dl-detected]', full).textContent = state.detected ? 'We detected: ' + plats[state.detected].label + '.' : 'Choose your platform below.';
    $('[data-dl-note]', full).textContent = state.note; $('[data-dl-note]', full).hidden = !state.note;
    $$('[data-dl-channel] button', full).forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.ch === state.channel); });
    $('[data-dl-unstable]', full).hidden = state.channel !== 'unstable';
    var vEl = $('[data-dl-version]', full); vEl.textContent = 'Checking latest version…';
    loadVersion(rid, state.channel).then(function (v) {
      vEl.textContent = v ? 'Latest ' + state.channel + ' version: ' + v : 'Latest ' + state.channel + ' version: see the release notes (version info could not be loaded).';
    });
    var tbl = $('[data-dl-all]', full);
    if (tbl && !tbl.dataset.done) {
      tbl.dataset.done = 1;
      tbl.innerHTML = dlData.platforms.map(function (pp) {
        return '<tr><td>' + pp.label + '</td><td>' + pp.formats.map(function (ff) {
          return '<a href="' + fileUrl(pp.rid, ff.id, '__CH__').url + '" data-ch-link>' + ff.label + '</a>';
        }).join(' · ') + '</td></tr>';
      }).join('');
    }
    $$('[data-ch-link]', full).forEach(function (a) { a.href = a.href.replace('__CH__', state.channel).replace(/(win|osx|linux)-(x64|arm64)-(stable|unstable)/, '$1-$2-' + state.channel); });
  }
  function render() { renderWidgets(); renderFull(); }

  var d = detect();
  state.detected = d.rid; state.note = d.note;
  state.rid = d.rid || 'win-x64';
  render();
  refine(d).then(function (r) { if (r.rid && r.rid !== state.rid) { state.rid = state.detected = r.rid; state.fmt = null; render(); } });

  if (full) {
    $('[data-dl-platform]', full).innerHTML = dlData.platforms.map(function (p) { return '<option value="' + p.rid + '">' + p.label + '</option>'; }).join('');
    $('[data-dl-platform]', full).addEventListener('change', function (e) { state.rid = e.target.value; state.fmt = null; state.note = state.rid === 'osx-arm64' ? dlData.notes.osx_intel : ''; render(); });
    $('[data-dl-format]', full).addEventListener('change', function (e) { state.fmt = e.target.value; render(); });
    $$('[data-dl-channel] button', full).forEach(function (b) { b.addEventListener('click', function () { state.channel = b.dataset.ch; render(); }); });
    render();
  }
})();

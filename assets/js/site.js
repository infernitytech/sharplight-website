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

  // ---- Studio download: platform detection (spec: _strategy/download-spec.md); data comes from the server-rendered tables ----
  var boxes = $$('[data-dl], [data-dl-compact]');
  if (!boxes.length) return;
  var qp = new URLSearchParams(location.search);

  function detectBasic() {
    var ua = navigator.userAgent || '', pl = navigator.platform || '', r = { os: null, rid: null, conf: 'none', note: null };
    var arm = /aarch64|arm64/i.test(ua + ' ' + pl);
    if (/Android|iPhone|iPad/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) { r.os = 'mobile'; r.note = 'mobile'; r.conf = 'ua'; }
    else if (/Windows/.test(ua)) { r.os = 'win'; r.rid = arm ? 'win-arm64' : 'win-x64'; r.conf = 'ua'; r.note = arm ? null : 'assume_win_x64'; }
    else if (/Macintosh|Mac OS X/.test(ua)) { r.os = 'mac'; r.rid = 'osx-arm64'; r.conf = 'ua'; r.note = 'assume_mac'; }
    else if (/CrOS/.test(ua)) { r.os = 'linux'; r.rid = arm ? 'linux-arm64' : 'linux-x64'; r.conf = 'ua'; r.note = 'chromeos'; }
    else if (/Linux|X11/.test(ua)) { r.os = 'linux'; r.rid = arm ? 'linux-arm64' : 'linux-x64'; r.conf = 'ua'; }
    return r;
  }
  function webglRenderer() {
    try {
      var c = document.createElement('canvas'), g = c.getContext('webgl'), e = g && g.getExtension('WEBGL_debug_renderer_info');
      return e ? String(g.getParameter(e.UNMASKED_RENDERER_WEBGL)) : '';
    } catch (x) { return ''; }
  }
  function detect() {
    var r = detectBasic(), uad = navigator.userAgentData;
    var done = function (res) {
      if (res.os === 'mac') { var gl = webglRenderer(); if (/Intel|AMD Radeon/i.test(gl)) { res.rid = null; res.note = 'intel_mac'; } }
      return res;
    };
    if (!uad || !uad.getHighEntropyValues) return Promise.resolve(done(r));
    return uad.getHighEntropyValues(['architecture', 'bitness', 'platform']).then(function (v) {
      var p = v.platform || uad.platform || '', a = (v.architecture || '').toLowerCase(), bits = v.bitness;
      var res = { os: null, rid: null, conf: 'hint', note: null };
      if (/Android|iOS/.test(p)) { res.os = 'mobile'; res.note = 'mobile'; }
      else if (bits === '32') { res.os = 'other'; res.note = 'bits32'; }
      else if (p === 'Windows') { res.os = 'win'; res.rid = a === 'arm' ? 'win-arm64' : 'win-x64'; }
      else if (p === 'macOS') { res.os = 'mac'; if (a === 'x86') { res.note = 'intel_mac'; } else { res.rid = 'osx-arm64'; } }
      else if (p === 'Linux' || p === 'Chrome OS') { res.os = 'linux'; res.rid = a === 'arm' ? 'linux-arm64' : 'linux-x64'; if (p === 'Chrome OS') res.note = 'chromeos'; }
      else return done(r);
      return res;
    }, function () { return done(r); });
  }

  boxes.forEach(function (box) {
    var compact = box.hasAttribute('data-dl-compact');
    var root = compact ? document : box;
    var btn = $('[data-dl-button]', box), meta = $('[data-dl-meta]', box);
    var strings = {};
    var channel = box.getAttribute('data-default-channel');
    if (qp.get('channel') === 'unstable' || qp.get('channel') === 'stable') channel = qp.get('channel');
    var state = { rid: null, channel: channel, det: null };
    var tables = compact ? [] : $$('.dl-matrix', box);
    var radios = compact ? [] : $$('input[name=dl-channel]', box);
    var live = compact ? null : $('[data-dl-live]', box);
    var assume = compact ? null : $('[data-dl-assume]', box);
    var notes = {
      assume_mac: 'Detected macOS. Studio needs an Apple silicon Mac (M1 or later).',
      assume_win_x64: 'Detected Windows (x64). On a Windows ARM device, choose Windows (ARM64).',
      intel_mac: 'Intel Macs are not supported. Studio needs an Apple silicon Mac (M1 or later).',
      bits32: 'Sharplight Studio needs a 64-bit system.',
      chromeos: 'For the Linux development environment on ChromeOS.',
      mobile: 'Sharplight Studio is a desktop app for Windows, macOS and Linux. Open this page on your computer to download it.'
    };
    function rowFor(rid, ch) {
      // compact widgets read the full table of the download page when present; otherwise build the link from data-base
      var t = tables.filter(function (x) { return x.getAttribute('data-channel') === ch; })[0];
      return t ? $$('tr[data-rid]', t).filter(function (r) { return r.getAttribute('data-rid') === rid; })[0] : null;
    }
    var files = {
      'win-x64': ['Windows', '{p}-win-x64-{c}-Setup.exe'], 'win-arm64': ['Windows (ARM64)', '{p}-win-arm64-{c}-Setup.exe'],
      'osx-arm64': ['macOS', '{p}-osx-arm64-{c}-Setup.pkg'], 'linux-x64': ['Linux', '{p}-linux-x64-{c}.AppImage'], 'linux-arm64': ['Linux (ARM64)', '{p}-linux-arm64-{c}.AppImage']
    };
    function render() {
      if (state.det && state.det.note && !state.rid) {
        btn.textContent = state.det.note === 'mobile' ? 'See all downloads' : btn.textContent;
      }
      if (!state.rid) { if (assume && state.det && state.det.note) assume.textContent = notes[state.det.note] || ''; return; }
      if (compact) {
        var f = files[state.rid], base = box.getAttribute('data-base');
        btn.href = base + '/' + f[1].replace('{p}', 'SharplightStudio').replace('{c}', state.channel);
        btn.textContent = 'Download for ' + f[0];
        meta.textContent = state.det && state.det.note && notes[state.det.note] ? notes[state.det.note] : '';
        return;
      }
      var row = rowFor(state.rid, state.channel);
      if (!row) return;
      btn.href = row.getAttribute('data-url');
      btn.textContent = 'Download for ' + row.getAttribute('data-label');
      meta.textContent = row.getAttribute('data-meta');
      if (assume) assume.textContent = state.det && state.det.rid === state.rid && state.det.note ? (notes[state.det.note] || '') : '';
      $$('tr[data-rid]', box).forEach(function (r) {
        var b = $('[data-detected-badge]', r); if (b) b.hidden = !(state.det && state.det.rid === r.getAttribute('data-rid'));
      });
      if (live) live.textContent = 'Selected: ' + btn.textContent;
      var un = $('[data-dl-unsigned]', box); if (un) un.hidden = !/^(win|osx)/.test(state.rid);
      tables.forEach(function (t) {
        var on = t.getAttribute('data-channel') === state.channel;
        if (t.tagName === 'DETAILS') t.open = on;
      });
      var p = new URLSearchParams(location.search);
      p.set('rid', state.rid); if (state.channel !== box.getAttribute('data-default-channel')) p.set('channel', state.channel); else p.delete('channel');
      history.replaceState(null, '', location.pathname + '?' + p + location.hash);
    }
    if (!compact) {
      // clicking a row selects it
      $$('tr[data-rid]', box).forEach(function (r) {
        r.addEventListener('click', function (e) {
          if (e.target.closest('a')) return;
          state.rid = r.getAttribute('data-rid'); state.channel = r.closest('.dl-matrix').getAttribute('data-channel'); render();
        });
        var th = $('th', r); th.style.cursor = 'pointer'; th.title = 'Select this system';
      });
      radios.forEach(function (rd) { rd.addEventListener('change', function () { state.channel = rd.value; render(); }); });
      var nb = $('[data-dl-notyours]', box);
      if (nb) nb.addEventListener('click', function () { var m = $('.dl-matrix', box); if (m) m.scrollIntoView({ behavior: 'smooth' }); });
    }
    // channel from the URL must exist as a rendered table
    var explicit = qp.get('rid');
    if (explicit && files[explicit]) { state.rid = explicit; render(); return; }
    detect().then(function (d) { state.det = d; state.rid = d.rid; render(); });
  });
})();

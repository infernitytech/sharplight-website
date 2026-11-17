(function () {
  'use strict';
  var root = document.querySelector('[data-models]');
  if (!root) return;
  var base = document.documentElement.getAttribute('data-base') || '';
  var el = function (s) { return root.querySelector(s); };
  var data = [];
  var fs = { q: el('[data-f-q]'), kind: el('[data-f-kind]'), fmt: el('[data-f-format]'), lic: el('[data-f-license]'), lvl: el('[data-f-level]') };
  var out = el('[data-m-out]'), count = el('[data-m-count]');
  function esc(s) { var d = document.createElement('div'); d.textContent = s == null ? '' : s; return d.innerHTML; }
  function fillSelect(sel, vals, label) {
    sel.innerHTML = '<option value="">' + label + '</option>' + vals.sort().map(function (v) { return '<option>' + esc(v) + '</option>'; }).join('');
  }
  function uniq(f) { var s = {}; data.forEach(function (e) { f(e).forEach(function (v) { if (v) s[v] = 1; }); }); return Object.keys(s); }
  function size(b) { return b ? (b / 1073741824 >= 1 ? (b / 1073741824).toFixed(1) + ' GB' : Math.round(b / 1048576) + ' MB') : ''; }
  function render() {
    var q = fs.q.value.trim().toLowerCase();
    var rows = data.filter(function (e) {
      if (fs.kind.value && e.kind !== fs.kind.value) return false;
      if (fs.lic.value && (e.license || 'unspecified') !== fs.lic.value) return false;
      if (fs.lvl.value && e.level !== fs.lvl.value) return false;
      if (fs.fmt.value && !e.variants.some(function (v) { return v.format === fs.fmt.value; })) return false;
      if (q && (e.name + ' ' + (e.family || '') + ' ' + (e.tags || []).join(' ')).toLowerCase().indexOf(q) < 0) return false;
      return true;
    });
    count.textContent = rows.length + ' of ' + data.length + ' models';
    out.innerHTML = '<tr><th>Model</th><th>Task</th><th>Formats</th><th>License</th><th>Verified against</th><th>Hub</th></tr>' + rows.map(function (e) {
      var fm = {}; e.variants.forEach(function (v) { fm[v.format + (v.quantization ? ' ' + v.quantization : '')] = 1; });
      var repos = {}; e.variants.forEach(function (v) { if (v.repository) repos[v.repository] = 1; });
      var v = e.verification || {};
      return '<tr><td><strong>' + esc(e.name) + '</strong>' + (e.gated ? ' <span class="pill">gated</span>' : '') + '</td><td>' + esc(e.kind) + '</td><td>' +
        Object.keys(fm).slice(0, 6).map(function (k) { return '<span class="pill">' + esc(k) + '</span>'; }).join('') + '</td><td>' + esc(e.license || 'unspecified') + '</td><td>' +
        esc(v.reference || '') + (v.date ? ' <span class="muted small">' + esc(v.date) + '</span>' : '') + '</td><td>' +
        Object.keys(repos).slice(0, 3).map(function (r) { return '<a href="https://huggingface.co/' + encodeURI(r) + '" rel="noopener">' + esc(r) + '</a>'; }).join('<br>') + '</td></tr>';
    }).join('');
  }
  fetch(base + '/assets/data/verified-models.json').then(function (r) { return r.json(); }).then(function (j) {
    data = j.entries;
    el('[data-m-updated]').textContent = j.updated || '';
    fillSelect(fs.kind, uniq(function (e) { return [e.kind]; }), 'All tasks');
    fillSelect(fs.fmt, uniq(function (e) { return e.variants.map(function (v) { return v.format; }); }), 'All formats');
    fillSelect(fs.lic, uniq(function (e) { return [e.license || 'unspecified']; }), 'All licenses');
    fillSelect(fs.lvl, uniq(function (e) { return [e.level]; }), 'All levels');
    Object.keys(fs).forEach(function (k) { fs[k].addEventListener('input', render); });
    render();
  }).catch(function () { out.innerHTML = '<tr><td>The model catalog could not be loaded.</td></tr>'; });
})();

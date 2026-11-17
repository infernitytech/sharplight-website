(function () {
  'use strict';
  var root = document.querySelector('[data-models]');
  if (!root) return;
  var rows = [].slice.call(root.querySelectorAll('tbody tr'));
  var f = {};
  [].forEach.call(root.querySelectorAll('[data-f]'), function (el) { f[el.dataset.f] = el; });
  var count = root.querySelector('[data-m-count]'), empty = root.querySelector('[data-m-empty]');
  var params = new URLSearchParams(location.search);
  ['kind', 'level', 'format', 'provider', 'license', 'q'].forEach(function (k) { if (params.get(k) && f[k]) f[k].value = params.get(k); });
  function has(attr, v) { return (' ' + attr + ' ').indexOf(' ' + v + ' ') >= 0; }
  function apply() {
    var q = f.q.value.trim().toLowerCase(), n = 0;
    rows.forEach(function (r) {
      var d = r.dataset;
      var ok = (!f.kind.value || d.kind === f.kind.value) && (!f.level.value || d.level === f.level.value) &&
        (!f.format.value || has(d.formats, f.format.value)) && (!f.provider.value || has(d.providers, f.provider.value)) &&
        (!f.license.value || d.license === f.license.value) && (!q || d.q.indexOf(q) >= 0);
      r.hidden = !ok; if (ok) n++;
    });
    count.textContent = n + ' of ' + rows.length + ' models';
    empty.hidden = n !== 0;
    var p = new URLSearchParams();
    Object.keys(f).forEach(function (k) { if (f[k].value) p.set(k, f[k].value); });
    history.replaceState(null, '', location.pathname + (p.toString() ? '?' + p : '') + location.hash);
  }
  Object.keys(f).forEach(function (k) { f[k].addEventListener('input', apply); });
  apply();
  if (location.hash) { var t = document.getElementById(location.hash.slice(1)); if (t) t.scrollIntoView(); }
})();

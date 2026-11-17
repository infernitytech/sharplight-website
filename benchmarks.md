---
layout: default
title: Benchmarks
description: Sharplight benchmark results with methodology, hardware and caveats.
---
<div class="wrap page"><h1>Benchmarks</h1><p class="lead">Every chart lists its hardware, versions, methodology and caveats.</p>
{% for b in site.data.benchmarks %}
{% assign max = 0 %}{% for g in b.groups %}{% for r in g.results %}{% if r.value > max %}{% assign max = r.value %}{% endif %}{% endfor %}{% endfor %}
{% assign engines = "" | split: "" %}{% for g in b.groups %}{% for r in g.results %}{% unless engines contains r.engine %}{% assign engines = engines | push: r.engine %}{% endunless %}{% endfor %}{% endfor %}
<section class="chart" id="{{ b.id }}">
  <h3>{{ b.title }}</h3>
  <p class="muted">{{ b.description }} <strong>{{ b.unit }}, {% if b.higher_is_better %}higher{% else %}lower{% endif %} is better.</strong></p>
  <div class="legend">{% for e in engines %}{% assign ci = forloop.index | modulo: 5 | plus: 1 %}{% if forloop.index == 5 %}{% assign ci = 5 %}{% endif %}<span><i style="background:var(--c{{ forloop.index }})"></i>{{ e }}</span>{% endfor %}</div>
  <div class="bars" role="img" aria-label="{{ b.title }}">
  {% for g in b.groups %}<div class="bar-group"><div class="glabel">{{ g.label }}</div>
    {% for r in g.results %}{% assign ei = 0 %}{% for e in engines %}{% if e == r.engine %}{% assign ei = forloop.index %}{% endif %}{% endfor %}
    <div class="bar-row"><span>{{ r.engine }}</span><span class="bar-track"><span class="bar-fill" style="display:block;width:{{ r.value | times: 100.0 | divided_by: max }}%;background:var(--c{{ ei }})"></span></span><span class="bar-val">{{ r.value }}</span></div>{% endfor %}
  </div>{% endfor %}
  </div>
  <div class="meta"><div><strong>Hardware</strong><br>{{ b.hardware }}</div><div><strong>Versions</strong><br>{{ b.versions }}</div></div>
  <details class="more" open><summary>Methodology and caveats</summary><p>{{ b.methodology }}</p><ul>{% for c in b.caveats %}<li>{{ c }}</li>{% endfor %}</ul></details>
</section>
{% endfor %}</div>

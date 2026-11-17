---
layout: default
title: Models
description: Verified model compatibility catalog for Sharplight.
scripts: [models.js]
---
<div class="wrap page" data-models>
  <h1>Verified models</h1>
  <p class="lead">Models verified against a reference implementation. Catalog updated <span data-m-updated></span>.</p>
  <div class="filters">
    <div><label class="small" for="m-q">Search</label><br><input id="m-q" type="search" data-f-q placeholder="Name, family, tag"></div>
    <div><label class="small" for="m-k">Task</label><br><select id="m-k" data-f-kind></select></div>
    <div><label class="small" for="m-f">Format</label><br><select id="m-f" data-f-format></select></div>
    <div><label class="small" for="m-l">License</label><br><select id="m-l" data-f-license></select></div>
    <div><label class="small" for="m-v">Level</label><br><select id="m-v" data-f-level></select></div>
  </div>
  <p class="muted" data-m-count aria-live="polite"></p>
  <table class="table" data-m-out><tr><td>Loading…</td></tr></table>
</div>

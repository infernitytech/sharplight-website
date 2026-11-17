---
layout: default
title: Sharplight Server
description: Enterprise inference serving on the Sharplight engine. Coming soon.
---
<section class="hero"><div class="wrap">
  <span class="badge">Coming soon</span>
  <h1>Sharplight Server</h1>
  <p class="lead">Placeholder. Enterprise inference serving for language, vision, speech and image models, built on the open-source engine.</p>
  <div class="btn-row"><a class="btn" href="mailto:{{ site.contact_email }}?subject=Sharplight%20Server%20early%20access">Request early access</a></div>
</div></section>
<section class="section"><div class="wrap">
  <h2 style="margin-top:0">Capabilities</h2>
  <div class="grid">
    <div class="card"><h3>Multi-GPU</h3><p>Placeholder.</p></div>
    <div class="card"><h3>Clustering</h3><p>Placeholder.</p></div>
    <div class="card"><h3>Access control</h3><p>Placeholder.</p></div>
    <div class="card"><h3>Observability</h3><p>Placeholder.</p></div>
  </div>
  <h2>Architecture</h2>
  <svg class="cluster-svg" viewBox="0 0 720 300" role="img" aria-label="Clients connect to a gateway that schedules requests across GPU nodes">
    <rect class="n" x="20" y="110" width="130" height="60" rx="10"/><text x="85" y="145" text-anchor="middle">Clients</text>
    <rect class="a" x="260" y="110" width="150" height="60" rx="10"/><text x="335" y="138" text-anchor="middle">Gateway</text><text class="s" x="335" y="156" text-anchor="middle">auth · routing · queue</text>
    <rect class="n" x="540" y="20" width="160" height="60" rx="10"/><text x="620" y="55" text-anchor="middle">Node A · GPUs</text>
    <rect class="n" x="540" y="110" width="160" height="60" rx="10"/><text x="620" y="145" text-anchor="middle">Node B · GPUs</text>
    <rect class="n" x="540" y="200" width="160" height="60" rx="10"/><text x="620" y="235" text-anchor="middle">Node C · GPUs</text>
    <path d="M150 140H260"/><path d="M410 140C470 140 470 50 540 50"/><path d="M410 140H540"/><path d="M410 140C470 140 470 230 540 230"/>
  </svg>
  <h2>Open source vs Server</h2>
  <table class="table"><thead><tr><th>Capability</th><th>Open source</th><th>Server</th></tr></thead><tbody>
    <tr><td>Inference engine, Studio</td><td class="yes">Yes</td><td class="yes">Yes</td></tr>
    <tr><td>Cluster scheduling</td><td class="no">No</td><td class="yes">Yes</td></tr>
    <tr><td>Support</td><td class="no">Community</td><td class="yes">Commercial</td></tr>
  </tbody></table>
  <p><a class="btn" href="mailto:{{ site.contact_email }}?subject=Sharplight%20Server%20early%20access">Contact us for early access</a></p>
</div></section>

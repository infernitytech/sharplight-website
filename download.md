---
layout: default
title: Download Sharplight Studio
description: Download Sharplight Studio for Windows, macOS and Linux.
---
<div class="wrap page" data-dl-full>
  <h1>Download Sharplight Studio</h1>
  <div class="dl-box">
    <p class="muted" data-dl-detected>Detecting your platform…</p>
    <a class="btn btn-big" data-dl-big href="#">Download</a>
    <p class="small muted"><span data-dl-file></span><br><span data-dl-version></span></p>
    <p class="notice" data-dl-note hidden></p>
    <div class="dl-controls">
      <div><label for="dl-p">Platform</label><select id="dl-p" data-dl-platform></select></div>
      <div><label for="dl-f">Format</label><select id="dl-f" data-dl-format></select></div>
      <div><label id="dl-c">Channel</label><div class="seg" role="group" aria-labelledby="dl-c" data-dl-channel>
        <button type="button" data-ch="stable" aria-pressed="false">Stable</button><button type="button" data-ch="unstable" aria-pressed="true">Unstable</button></div></div>
    </div>
    <p class="notice" data-dl-unstable hidden>The unstable channel ships every development build and may break. Use stable once it is available.</p>
  </div>
  <h2>All downloads</h2>
  <table class="table"><thead><tr><th>Platform</th><th>Files</th></tr></thead><tbody data-dl-all></tbody></table>
  <h2>Verify and install</h2>
  <ul>
    <li>Compare the SHA-256 of the download with the one on the <a href="{{ site.data.downloads.releases_url }}">release page</a>: <code>sha256sum &lt;file&gt;</code> (Linux), <code>shasum -a 256 &lt;file&gt;</code> (macOS), <code>Get-FileHash &lt;file&gt;</code> (Windows).</li>
    <li>{{ site.data.downloads.notes.unsigned }}</li>
    <li>Linux: <code>chmod +x</code> the AppImage and run it. Studio updates itself from the channel you installed.</li>
    <li>{{ site.data.downloads.notes.osx_intel }}</li>
  </ul>
  <p><a href="{{ site.data.downloads.releases_url }}">Release notes</a> · <a href="{{ site.data.downloads.source_url }}">Source code</a></p>
</div>

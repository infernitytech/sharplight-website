---
title: Download Sharplight Studio
lead: Free and open source. No account, nothing else to install.
description: Download Sharplight Studio for Windows, Linux or macOS on Apple silicon.
permalink: /download/
# Strings for the download widget (behavior: _strategy/download-spec.md).
strings:
  button: "Download for {label}"
  button_neutral: Choose your system
  meta: "Version {version} · {size} · {channel}"
  not_yours: Not your system?
  detected: detected
  channel_stable: Stable
  channel_preview: Preview
  channel_preview_note: Built from every change on the development branch. Updates often and may have rough edges.
  no_stable: There is no stable release yet. The preview build is the current version of Studio.
---

{% comment %} The download widget (button, channel switch, matrix) is placed here by the layout or include. {% endcomment %}
{% include download-widget.html %}

## Channels

**Stable** is built from releases, **Preview** from every change on the development branch. Use Stable unless you want the newest changes; you can switch in Studio under Settings → Updates.

## First start

The Windows and macOS packages are not code-signed yet.

- **Windows.** Run `…-Setup.exe`. On "Windows protected your PC", choose **More info**, then **Run anyway**. Or unpack
  the portable zip and start `sharplight-studio.exe`.
- **macOS** (14 or later, Apple silicon). Open the `.pkg`. On first launch, go to **System Settings → Privacy &
  Security** and choose **Open Anyway**. On macOS 14, Control-click the app and choose **Open**.
- **Linux.** Needs your vendor's Vulkan driver for GPU use. Without FUSE, use the `tar.gz` from the
  [GitHub release](https://github.com/infernitytech/sharplight/releases).

```sh
chmod +x SharplightStudio-linux-x64-*.AppImage
./SharplightStudio-linux-x64-*.AppImage
```

## Verify your download

{% comment %} State A, today: no publisher checksums for installers. Replace with state B when SHA256SUMS files exist. {% endcomment %}
Files are served over HTTPS from `download.sharplight.dev`. Checksums are not published yet; both checksums and code
signing are planned. Until then, build from source if you need to know exactly what you are running.

{% comment %} State B (use once the release pipeline publishes SHA256SUMS.<rid>-<channel>.txt):
Compare the SHA-256 of the file with the value shown next to the download.

Windows (PowerShell): `Get-FileHash .\SharplightStudio-win-x64-stable-Setup.exe -Algorithm SHA256`
macOS: `shasum -a 256 SharplightStudio-osx-arm64-stable-Setup.pkg`
Linux: `sha256sum SharplightStudio-linux-x64-stable.AppImage`
{% endcomment %}

## Network connections

- Update feed: at startup and every six hours; asks before installing; off under *Settings → Updates*.
- Hugging Face: model downloads you start.
- `download.sharplight.dev`: the verified model list.

## Build from source

Needs the .NET 11 SDK.

```sh
git clone https://github.com/infernitytech/sharplight
cd sharplight
dotnet run -c Release --project apps/Sharplight.Studio
```

Want the library instead? [Quick start for developers]({{ '/developers/' | relative_url }}).

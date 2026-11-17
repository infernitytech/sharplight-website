---
title: Download Sharplight Studio
lead: Free and open source, for Windows, Linux and macOS. No account, nothing else to install.
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
  channel_switch_note: An installed Studio follows the channel it was installed from. To change channel, install the other package.
  assume_mac: Detected macOS. Studio needs an Apple silicon Mac (M1 or later).
  assume_win_x64: Detected Windows (x64). On a Windows ARM device, choose Windows (ARM64).
  intel_mac: Intel Macs are not supported. Studio needs an Apple silicon Mac (M1 or later).
  bits32: Sharplight Studio needs a 64-bit system.
  chromeos: For the Linux development environment on ChromeOS.
  mobile: Sharplight Studio is a desktop app for Windows, macOS and Linux. Open this page on your computer to download it.
  checksum_label: SHA-256
  checksum_missing: Checksums for the installers are not published yet.
  unsigned: This installer is not code-signed yet, so your system will ask for confirmation the first time. The steps are below.
  col_installer: Installer
  col_portable: Portable or archive
---

{% comment %} The download widget (button, channel switch, matrix) is placed here by the layout or include. {% endcomment %}
{% include download-widget.html %}

Every package is self-contained. Studio runs models on a GPU through Vulkan when a suitable driver is present and on the
CPU otherwise.

## Channels

- **Stable** is built from release branches.
- **Preview** is built from every change on the development branch. It updates often and may have rough edges.

There is no stable release yet. The preview build is the current version of Studio. An installed Studio follows the
channel it was installed from; to change channel, install the other package.

## After downloading

### Windows

1. Run `SharplightStudio-win-x64-…-Setup.exe` (or the ARM64 one).
2. The installer is not code-signed yet, so Windows SmartScreen shows "Windows protected your PC". Choose **More info**,
   then **Run anyway**.
3. Prefer not to install? Unpack the portable zip anywhere and start `sharplight-studio.exe`.

### macOS

1. Open the `.pkg` and follow the installer. It installs Sharplight Studio into Applications.
2. The package is not signed with an Apple Developer ID yet, so macOS refuses the first launch. Open **System Settings →
   Privacy & Security**, scroll to *Security*, choose **Open Anyway** for Sharplight Studio and confirm. On macOS 14,
   Control-click the app in Finder and choose **Open** instead.
3. Studio needs macOS 14 or later on an Apple silicon Mac.

### Linux

```sh
chmod +x SharplightStudio-linux-x64-*.AppImage
./SharplightStudio-linux-x64-*.AppImage
```

The AppImage updates itself in place. For GPU use, install your vendor's Vulkan driver. On systems without FUSE, use the
`tar.gz` from the [GitHub release](https://github.com/infernitytech/sharplight/releases), which contains the same app as a folder.

## Verify your download

All files are served over HTTPS from `download.sharplight.dev`.

{% comment %} State A, today: no publisher checksums for installers. Replace with state B when SHA256SUMS files exist. {% endcomment %}
Checksums for the installers are not published yet, and the Windows and macOS packages are not code-signed yet. Both are
planned. Until then, if you need to know exactly what you are running, build Studio from source (below).

{% comment %} State B (use once the release pipeline publishes SHA256SUMS.<rid>-<channel>.txt):
Compare the SHA-256 of the file with the value shown next to the download.

Windows (PowerShell): `Get-FileHash .\SharplightStudio-win-x64-stable-Setup.exe -Algorithm SHA256`
macOS: `shasum -a 256 SharplightStudio-osx-arm64-stable-Setup.pkg`
Linux: `sha256sum SharplightStudio-linux-x64-stable.AppImage`
{% endcomment %}

## Updates and what Studio connects to

Studio checks its update feed at startup and every six hours and asks before installing anything. You can switch the check
off under *Settings → Updates*. Models are downloaded from Hugging Face when you ask for them, and the verified model list
is refreshed from `download.sharplight.dev`.

## Build from source

Studio is MIT licensed. With the .NET 11 SDK:

```sh
git clone https://github.com/infernitytech/sharplight
cd sharplight
dotnet run -c Release --project apps/Sharplight.Studio
```

## Looking for the library?

Developers who want the engine in their own application: see the [quick start]({{ '/developers/' | relative_url }}).

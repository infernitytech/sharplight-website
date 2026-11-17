---
title: Studio basics
lead: Install Sharplight Studio, get a first model and find your way around.
description: Getting started with Sharplight Studio, covering install, models, chat, the task pages, the local server and settings.
permalink: /docs/studio/
---

## Install

Get the package for your system from the [download page]({{ '/download/' | relative_url }}). The installers are not
code-signed yet; the download page shows the confirmation steps for Windows and macOS.

## Get a model

**Models → Discover** opens on the verified catalog.

1. Choose a task, a model and a variant. The entry shows the size and whether it fits your device.
2. Install. Studio downloads the files, converts them to a `.slm` package and precompiles the GPU code. Companion files
   (text encoders, VAEs, vocoders, vision projectors) are installed with it.

Searching all of Hugging Face also works; results outside the catalog carry a compatibility verdict, which is an
estimate. Installed models are in the **Library**: load, inspect, convert, remove.

## Chat

- **Regenerate** an answer or **edit** a question; earlier versions are kept and can be paged through.
- **Attach** images (the model needs the *Vision* badge) and documents: PDF, DOCX, HTML, text and code are extracted to text.
- Each conversation has its own model, system prompt, sampling settings and presets.
- Conversations keep generating in the background.

## Task pages

| Page | Does |
|---|---|
| Chat | Text generation, with images and documents |
| Transcribe | Speech to text from files or the microphone; export as `.txt`, `.srt` or `.vtt` |
| Speak | Text to speech with streaming playback; save and reuse cloned voices |
| Image | Text to image, image to image, inpainting with a mask file, LoRAs, live preview |
| Video | Video generation |
| Vision | Classification, detection, segmentation, depth, OCR, upscaling |
| Audio | Audio models |

Each page keeps its presets, run history and output files.

## Loading and memory

The load panel shows how a model will be placed: on one GPU, split over several, or partly on the CPU. Several models
can be resident at once.

**Reduced precision** (off by default) enables faster half-precision paths; the default keeps near-f32 accuracy.

## Local API server

The **Server** page starts an OpenAI- and Anthropic-compatible API on the host and port you choose, with an optional API
key and CORS origins.

- Requests route by their `model` field to any resident chat model; `/v1/models` lists them.
- *Load library models on demand* loads a requested model that is not resident. Idle models unload after the configured time.
- Speech models are not served yet.

## Statistics

Tokens, speed and time to first token per model, for every chat and API request, kept in a local database.

## Settings

| Setting | Options |
|---|---|
| **Storage** | *Portable* (a `data` folder next to the app), *System* (the operating system's standard folders) or a *Custom folder*. Switching moves the files. |
| **Updates** | Version and channel, the automatic check (at startup and every six hours), *Check for updates now*. Studio asks before installing. |

## Where things are kept

| What | Where (system mode on Linux) |
|---|---|
| Settings | `~/.config/sharplight/studio` |
| Conversations, statistics, page history and outputs | `~/.local/share/sharplight/studio` |
| Models | `~/.local/share/sharplight/models` |
| Compiled kernels and caches | `~/.cache/sharplight` |

On Windows these are under AppData, on macOS under `~/Library`.

**Library → Inspect** opens any `.slm` file: components, metadata, tokenizer, compute graphs, weights and precompiled
artifacts.

## Current limits

- Conversion during a download shows its log, not a percentage.
- Image conversations run one request at a time.
- Inpainting masks are files; there is no painting tool yet.

Source: [studio.md](https://github.com/infernitytech/sharplight/blob/main/docs/studio.md).

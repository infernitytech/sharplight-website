---
title: Studio basics
lead: Install Sharplight Studio, get a first model and find your way around.
description: Getting started with Sharplight Studio, covering install, models, chat, the task pages, the local server and settings.
permalink: /docs/studio/
---

## Install

Get the package for your system from the [download page]({{ '/download/' | relative_url }}). Studio is self-contained.
The installers are not code-signed yet; the download page explains the confirmation Windows and macOS ask for.

## Get a model

Open **Models → Discover**. It starts on the verified catalog: models that were downloaded, run and compared with a
reference implementation.

1. Choose a task (text generation, speech to text, image generation, ...).
2. Choose a model and a variant. Smaller quantizations need less memory; the entry shows the size and whether it fits your device.
3. Install. Studio downloads the files, converts them to a `.slm` package and precompiles the GPU code. Companion files a
   model needs (text encoders, VAEs, vocoders, vision projectors) are installed with it.

You can also search all of Hugging Face with filters for type, format, quantization, size and license. Results outside
the catalog carry a compatibility verdict, which is an estimate. Gated repositories say what to accept on Hugging Face first.

Downloads appear on the downloads list; installed models in the **Library**, where you can load, inspect, convert and remove them.

## Chat

Pick a model in a conversation and write. Answers stream as Markdown; reasoning is collapsible.

- **Regenerate** an answer or **edit** a question. Both keep earlier versions, which you can page through.
- **Attach** images (the model needs the *Vision* badge) and documents: PDF, DOCX, HTML, text and code are extracted to text.
- Each conversation has its own model, system prompt, sampling settings and presets.
- Conversations keep generating in the background.

## Task pages

The **Tasks** page has a card per kind of model. Cards for the kinds Studio can run open their page:

| Page | Does |
|---|---|
| Chat | Text generation, with images and documents |
| Transcribe | Speech to text from files or the microphone; export as `.txt`, `.srt` or `.vtt` |
| Speak | Text to speech with streaming playback; save and reuse cloned voices |
| Image | Text to image, image to image, inpainting with a mask file, LoRAs, live preview |
| Video | Video generation |
| Vision | Classification, detection, segmentation, depth, OCR, upscaling |
| Audio | Audio models |

Each page keeps its parameter presets, a history of runs and the output files.

## Loading and memory

When you load a model, the load panel shows how it will be placed: on one GPU, split over several, or partly on the CPU.
Several models can be resident at once. The estimate is the engine's own, but free memory can change before the load.

**Reduced precision** (off by default) opts in to faster half-precision paths where the default keeps near-f32 accuracy.

## Local API server

The **Server** page starts an OpenAI- and Anthropic-compatible API on the host and port you choose, with an optional API
key and CORS origins.

- Requests route by their `model` field to any resident chat model; `/v1/models` lists them.
- With *Load library models on demand*, a request for a model that is not resident loads it first. Idle models are
  unloaded after the configured time.
- The page shows a ready-to-paste `curl` request and a log of requests.

The server does not serve the speech models yet.

## Statistics

Every chat and API request is recorded per model in a local database on your machine: tokens, prompt and generation
speed, time to first token. The dashboard filters by time range and model.

## Settings

- **Storage**: where Studio keeps everything. *Portable* (a `data` folder next to the app), *System* (the standard
  folders of your operating system) or a *Custom folder*. Switching moves the files.
- **Updates**: the current version and channel, the automatic check (at startup and every six hours), and *Check for
  updates now*. Studio asks before installing an update.
- **Appearance**: light or dark theme and the accent color.

## Where things are kept

| What | Where (system mode on Linux) |
|---|---|
| Settings | `~/.config/sharplight/studio` |
| Conversations, statistics, page history and outputs | `~/.local/share/sharplight/studio` |
| Models | `~/.local/share/sharplight/models` |
| Compiled kernels and caches | `~/.cache/sharplight` |

On Windows these are under AppData, on macOS under `~/Library`. In portable mode everything is in `data` next to the app.

## Inspect a package

**Library → Inspect** opens any `.slm` file: the model kind and components, metadata, tokenizer, the compute graphs as a
drawing and as a table, the weights, and the precompiled artifacts.

## Current limits

- Compatibility verdicts for models outside the catalog are estimates, not guarantees.
- Conversion during a download shows its log, not a percentage.
- Image conversations run one request at a time.
- Masks for inpainting are files; there is no painting tool yet.

Source: [studio.md](https://github.com/infernitytech/sharplight/blob/main/docs/studio.md).

---
title: Sharplight Studio
lead: >-
  A desktop app for local AI models: chat, images, video, speech and vision, with a catalog of models that were checked.
  Free and open source.
description: Sharplight Studio is a free, open-source desktop app for local AI models on Windows, Linux and macOS.
permalink: /studio/
cta:
  primary: { label: Download Studio, url: /download/ }
  secondary: { label: Studio guide, url: /docs/studio/ }
---

{% include download-compact.html %}

![Sharplight Studio's chat page with a conversation streaming from a local model]({{ '/assets/img/studio/studio-chat.png' | relative_url }})

Windows and Linux (x64, ARM64), macOS on Apple silicon. Self-contained.

## Verified models

Discover opens on the verified catalog: every entry was run and compared with a reference implementation.

- Browse by task; pick a size and quantization; see whether it fits your device before downloading.
- One click installs the model with its companion files (text encoders, VAEs, vocoders, vision projectors).
- Search all of Hugging Face, with a compatibility estimate per result.

![Discover page listing verified models with sizes, licenses and how each was verified]({{ '/assets/img/studio/studio-discover-verified.png' | relative_url }})

## Chat

- Streaming Markdown, collapsible reasoning.
- Regenerate or edit; earlier versions are kept.
- Attach images and documents (PDF, DOCX, HTML, text, code).
- Model, system prompt and sampling per conversation; chats keep generating in the background.

## Images and video

Stable Diffusion, FLUX and Qwen-Image: text to image, image to image, inpainting, LoRA, live previews. Video with Wan and
LTX-Video.

![Image page with a prompt, generation settings and a gallery of results]({{ '/assets/img/studio/studio-image.png' | relative_url }})

## Speech

Transcribe files or the microphone (Whisper, Moonshine, Canary, Parakeet) with timestamps and subtitle export. Speak
text (Kokoro, Chatterbox, XTTS, CosyVoice, F5-TTS), including cloned voices from a short recording.

![Transcribe page showing a recording and its timestamped transcript]({{ '/assets/img/studio/studio-transcribe.png' | relative_url }})

## Vision

Classification, object detection, click-to-segment, depth, OCR and upscaling, with results drawn over the image.

![Vision page with detected objects outlined on a photo]({{ '/assets/img/studio/studio-vision-detection.png' | relative_url }})

## Local API server

Loaded chat models answer on OpenAI- and Anthropic-compatible endpoints, with load on demand, unload when idle and a
request log. Speech models are not served yet.

![Server page with host, port, API key settings and a request log]({{ '/assets/img/studio/studio-server.png' | relative_url }})

## Also

- **Statistics**: tokens, speed and time to first token per model.
- **Package inspector**: components, tokenizer, graphs and weights of any `.slm` file.
- **Fit estimates**: GPU placement and CPU spill before loading.
- **Storage**: portable, system folders or a folder you pick; switching moves the files.

## Status

- Preview builds until the first stable release.
- Installers are not code-signed yet; see the [download page]({{ '/download/' | relative_url }}) for the first-start steps.
- Update check at startup and every six hours; asks before installing; can be turned off.

[Studio guide]({{ '/docs/studio/' | relative_url }}) ·
[Source](https://github.com/infernitytech/sharplight/tree/main/apps/Sharplight.Studio)

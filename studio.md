---
title: Sharplight Studio
lead: >-
  A desktop app for running AI models on your own computer: chat, images, video, speech and vision, with a model list that
  only offers what has been checked. Free and open source.
description: Sharplight Studio is a free, open-source desktop app for local AI models on Windows, Linux and macOS.
permalink: /studio/
cta:
  primary: { label: Download Studio, url: /download/ }
  secondary: { label: Studio guide, url: /docs/studio/ }
---

{% include download-compact.html %}

![Sharplight Studio's chat page with a conversation streaming from a local model]({{ '/assets/img/studio/studio-chat.png' | relative_url }})

Studio is published for Windows (x64 and ARM64), Linux (x64 and ARM64) and macOS on Apple silicon. It is self-contained:
there is nothing else to install.

## Find models that work

Searching a model hub turns up many files that do not run: unsupported architectures, broken conversions, missing
tokenizers. Studio's Discover page opens on the verified catalog instead. Every entry was downloaded, run and compared
with a reference implementation, and is pinned to the exact revision that was checked.

- Browse by task: text, speech, images, video, vision, audio.
- Pick a variant by size and quantization; Studio shows whether it fits your device before you download.
- One click installs the model together with the companion files it needs (text encoders, VAEs, vocoders, vision projectors).
- You can still search all of Hugging Face. Results carry a compatibility verdict, and gated repositories say what to do.

![Discover page listing verified models with sizes, licenses and how each was verified]({{ '/assets/img/studio/studio-discover-verified.png' | relative_url }})

## Chat

- Answers stream as Markdown, with collapsible reasoning for models that think before they answer.
- Regenerate an answer or edit a question; both keep the earlier versions.
- Attach images (for models with vision) and documents: PDF, DOCX, HTML, text and code.
- Each conversation keeps its own model, system prompt and sampling settings, and conversations keep generating in the
  background, so two chats on different models can run at once.

## Images and video

Generate images with Stable Diffusion, FLUX and Qwen-Image models: text to image, image to image, inpainting, LoRA files,
live previews while the image forms. Generate video with Wan and LTX-Video models on the Video page.

![Image page with a prompt, generation settings and a gallery of results]({{ '/assets/img/studio/studio-image.png' | relative_url }})

## Speech

**Transcribe** recordings or the microphone with Whisper, Moonshine, Canary and Parakeet models, with timestamps and
subtitle export. **Speak** text with Kokoro, Chatterbox, XTTS, CosyVoice and F5-TTS models. Models that clone voices can
save a voice from a short recording and reuse it.

![Transcribe page showing a recording and its timestamped transcript]({{ '/assets/img/studio/studio-transcribe.png' | relative_url }})

## Vision

Classify images, detect objects, segment by clicking, estimate depth, read text and upscale, each on its own page with the
result drawn over the image.

![Vision page with detected objects outlined on a photo]({{ '/assets/img/studio/studio-vision-detection.png' | relative_url }})

## A local API server

Switch on the built-in server and the chat models you have loaded answer on OpenAI- and Anthropic-compatible endpoints.
Existing clients only change their base URL. Models can load on demand and unload when idle, and the page shows a
ready-to-paste `curl` request and a request log.

![Server page with host, port, API key settings and a request log]({{ '/assets/img/studio/studio-server.png' | relative_url }})

## See what is going on

- **Statistics**: tokens, prompt and generation speed, and time to first token per model, kept in a local database.
- **Package inspector**: open any `.slm` model package and see its components, tokenizer, graphs and weights.
- **Fit estimates**: before loading, Studio shows how a model will be placed on your GPU and what would spill to the CPU.

## Your files, where you want them

Studio keeps everything it writes (settings, conversations, models, caches) in one place that you choose: next to the app
(portable), in the system's standard folders, or in a folder you pick. Switching moves the files along.

## Good to know

- **Preview builds.** Studio is in an early version. Until the first stable release, downloads come from the preview
  channel, which updates often.
- **Installers are not code-signed yet.** Windows SmartScreen and macOS Gatekeeper ask for confirmation on first start.
  The [download page]({{ '/download/' | relative_url }}) explains the steps.
- **Updates.** Studio checks for a new version at startup and every six hours and asks before installing. You can turn the
  check off in Settings.
- **The built-in API server serves chat models.** Speech models are not served by it yet.
- **Compatibility verdicts for models outside the catalog are estimates**, not guarantees.

[Download Studio]({{ '/download/' | relative_url }}) · [Studio guide]({{ '/docs/studio/' | relative_url }}) ·
[Source on GitHub](https://github.com/infernitytech/sharplight/tree/main/apps/Sharplight.Studio)

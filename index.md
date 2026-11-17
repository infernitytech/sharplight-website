---
layout: home
title: Local AI inference for .NET
lead: >-
  Sharplight is an open-source engine that runs language, speech, vision, image and video models on your own GPU or CPU,
  from C#. No Python, no CUDA dependency. MIT licensed.
description: >-
  Sharplight is an open-source .NET inference engine for language, speech, vision, image and video models, with a free
  desktop app, Sharplight Studio.
permalink: /
hero:
  primary: { label: Download Studio, url: /download/ }
  secondary: { label: "dotnet add package Sharplight --prerelease", url: /developers/, style: code }
  meta: "MIT licensed · Windows, Linux and macOS · Source on GitHub"
  image: studio-chat
  image_alt: Sharplight Studio's chat page with a conversation streaming from a local model
products:
  - name: Sharplight
    kind: The engine, as NuGet packages
    text: >-
      Add one package, call services.AddSharplight() and resolve a client for the kind of model you want to run. The same
      pattern covers text generation, embeddings, speech, images and video.
    url: /developers/
    link: Quick start for developers
  - name: Sharplight Studio
    kind: The desktop app
    text: >-
      Find models that are known to work, download them in one click, then chat, generate images and video, transcribe
      and speak. Everything you load is also reachable through a local OpenAI-compatible API.
    url: /studio/
    link: See what Studio does
server_note:
  text: >-
    Running models for a whole organization? Sharplight Server, a separate commercial product, is in development.
  url: /server/
  link: Read about Sharplight Server
---

<!-- Body for layouts that render Markdown; the same content as the structured front matter plus the sections below.
     Counts marked (catalog) should be computed from the catalog JSON at build time; the values are as of 2026-11-16. -->

## Two products, one engine

**Sharplight** is the engine, shipped as NuGet packages. Add one package, call `services.AddSharplight()` and resolve a
client for the kind of model you want to run.

```csharp
var services = new ServiceCollection()
    .AddSharplight()
    .AddTextGenerator(o => { o.ModelPath = "qwen3-4b-q4_k_m.gguf"; o.Devices = [slot]; o.ContextLength = 8192; });
await using var provider = services.BuildServiceProvider();

var generator = provider.GetRequiredService<ITextGenerator>();
var completion = await generator.GenerateAsync("The capital of France is", new GenerationOptions { MaxNewTokens = 32 });
```

[Quick start for developers]({{ '/developers/' | relative_url }})

**Sharplight Studio** is the desktop app on the same engine. Find models that are known to work, download them in one
click, then chat, generate images and video, transcribe and speak. Everything you load is also reachable through a local
OpenAI-compatible API.

[See what Studio does]({{ '/studio/' | relative_url }}) · [Download]({{ '/download/' | relative_url }})

## What it runs

One load path and one client pattern for every kind of model.

| Task | Examples | Verified models (catalog) |
|---|---|---:|
| Text generation and chat | Qwen, Llama, Gemma, Mistral, Phi, gpt-oss, vision-language models | 77 |
| Embeddings and reranking | bge, e5, MiniLM, nomic, EmbeddingGemma, bge rerankers | 10 |
| Speech to text | Whisper, Moonshine, Canary, Parakeet | 21 |
| Text to speech and voice cloning | Kokoro, Chatterbox, XTTS v2, CosyVoice 3, F5-TTS | 7 |
| Image generation and editing | Stable Diffusion 1.x / 2.x / XL, FLUX.1, Qwen-Image | 29 |
| Video generation | Wan 2.1 / 2.2, LTX-Video | 11 |
| Vision | Classification, detection, segmentation, depth, OCR, upscaling, image embeddings | 44 |
| Audio | Codecs (EnCodec, DAC, Mimi), voice activity detection | 4 |

[Browse the model list]({{ '/models/' | relative_url }})

## Verified, not assumed

- **203 models** in the catalog, each pinned to the exact Hugging Face revision and files that were checked. 194 are
  verified against a reference implementation (llama.cpp, transformers, diffusers, whisper.cpp, onnxruntime); the others
  are marked partial or load-only.
- **168 of the 172** model architectures that llama.cpp knows run end to end.
- It reads the files you already have: GGUF, Hugging Face safetensors, ONNX, diffusers folders and whisper.cpp files.

A model that is not on the list has not been tried yet. That is different from "does not work", and we keep the two apart.

## Measured in the open

Performance is logged with hardware, versions, scripts and raw results, including where other engines are ahead. On one
NVIDIA RTX PRO 4500, in November 2026:

- Single-stream decode is within a few percent of llama.cpp with CUDA (0.88-0.99x across eight models).
- Serving several streams at once, throughput is 1.1 to 4.4 times llama.cpp's server.
- Against vLLM on identical weights, decode is level (0.95-1.08x) and prompt processing is behind (0.73-1.01x at 2048 tokens).

These are our own measurements on one GPU model. [Read the method and the caveats]({{ '/benchmarks/' | relative_url }}).

## Runs where you are

| | Windows | Linux | macOS (Apple silicon) |
|---|---|---|---|
| GPU | Vulkan (x64, ARM64) | Vulkan (x64, ARM64) | Metal (new), or Vulkan through the bundled MoltenVK |
| CPU | yes | yes | yes |
| Studio installer | Setup.exe, portable zip | AppImage | .pkg, zip |

The native Metal provider for Apple silicon is new on the development line and has only been measured on a virtualized test machine so far. [Hardware and providers]({{ '/docs/hardware/' | relative_url }})

## Open source

The engine and Studio are MIT licensed and developed in the open on
[GitHub](https://github.com/infernitytech/sharplight). The packages are alpha prereleases: they work, and the API still changes.

## For organizations

Running models for a whole organization, on several machines, with separate tenants and your identity provider? Sharplight
Server, a separate commercial product, is in development. [Read about Sharplight Server]({{ '/server/' | relative_url }})

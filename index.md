---
layout: home
title: Local AI inference for .NET
lead: >-
  An open-source engine that runs language, speech, vision, image and video models on your own GPU or CPU, from C#.
  NVIDIA, AMD and Intel GPUs through Vulkan, Apple silicon through Metal. No Python, no CUDA.
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
      One package, services.AddSharplight(), one client per kind of model.
    url: /developers/
    link: Quick start
  - name: Sharplight Studio
    kind: The desktop app
    text: >-
      Verified models in one click. Chat, images, video, speech, vision, and an OpenAI-compatible API.
    url: /studio/
    link: See Studio
server_note:
  text: >-
    For organizations: on-premise AI on your own servers.
  url: /enterprise/
  link: Enterprise
---
{% include catalog-stats.html %}

```csharp
var services = new ServiceCollection()
    .AddSharplight()
    .AddTextGenerator(o => { o.ModelPath = "qwen3-4b-q4_k_m.gguf"; o.Devices = [slot]; o.ContextLength = 8192; });
await using var provider = services.BuildServiceProvider();

var generator = provider.GetRequiredService<ITextGenerator>();
var completion = await generator.GenerateAsync("The capital of France is", new GenerationOptions { MaxNewTokens = 32 });
```

[Quick start]({{ '/developers/' | relative_url }}) · [Docs]({{ '/docs/' | relative_url }}) · [GitHub]({{ site.github_repo }})

## What it runs

| Task | Examples | Verified models |
|---|---|---:|
| Text generation and chat | Qwen, Llama, Gemma, Mistral, Phi, gpt-oss, vision-language models | {{ n_text }} |
| Embeddings and reranking | bge, e5, MiniLM, nomic, EmbeddingGemma | {{ n_emb }} |
| Speech to text | Whisper, Moonshine, Canary, Parakeet | {{ n_stt }} |
| Text to speech, voice cloning | Kokoro, Chatterbox, XTTS v2, CosyVoice 3, F5-TTS | {{ n_tts }} |
| Image generation and editing | Stable Diffusion, FLUX.1, Qwen-Image | {{ n_img }} |
| Video generation | Wan 2.1 / 2.2, LTX-Video | {{ n_vid }} |
| Vision | Classification, detection, segmentation, depth, OCR, upscaling | {{ n_vision }} |
| Audio | Codecs, voice activity detection | {{ n_audio }} |

Reads GGUF, safetensors, ONNX, diffusers and whisper.cpp files. {{ cat_verified }} of {{ cat_total }} catalog models are
verified against a reference implementation; 168 of llama.cpp's 172 architectures run end to end.
[Browse models]({{ '/models/' | relative_url }})

## Performance

One NVIDIA RTX PRO 4500, November 2026, our own measurements:

- Single-stream decode: 0.88-0.99x of llama.cpp CUDA.
- Multi-stream serving: 1.1-4.4x of llama.cpp's server.
- vLLM, identical weights: decode 0.95-1.08x, prompt processing 0.73-1.01x at 2048 tokens.

{% include benchmark-chart.html id="serving-throughput" %}

[Method and caveats]({{ '/benchmarks/' | relative_url }})

## Platforms

| | Windows | Linux | macOS (Apple silicon) |
|---|---|---|---|
| GPU | NVIDIA, AMD, Intel via Vulkan (x64, ARM64) | NVIDIA, AMD, Intel via Vulkan (x64, ARM64) | Metal (new), or Vulkan via MoltenVK |
| CPU | yes | yes | yes |
| Studio | Setup.exe, portable zip | AppImage | .pkg, zip |

The packages are alpha prereleases; the API still changes. [Hardware and providers]({{ '/docs/hardware/' | relative_url }})

## For organizations

On-premise AI on your own servers: software, hardware and consulting. [Enterprise]({{ '/enterprise/' | relative_url }})

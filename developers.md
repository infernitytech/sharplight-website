---
title: Sharplight for .NET developers
lead: Run AI models inside your .NET application.
description: NuGet quick start for Sharplight, the open-source .NET inference engine. Text generation, embeddings, speech, images and serving.
permalink: /developers/
install: dotnet add package Sharplight
---

```sh
dotnet add package Sharplight
```

.NET 11. Version 0.2; the API may still change before 1.0.

## Generate text

```csharp
using Microsoft.Extensions.DependencyInjection;

var services = new ServiceCollection()
    .AddSharplight()
    .AddTextGenerator((o, sp) =>
    {
        // First available device: a GPU when there is one, else the CPU.
        var gpu = sp.GetRequiredService<ExecutionProviderCatalog>().Discover().First(d => d.Availability.IsAvailable).Provider;
        o.ModelPath = "qwen3-4b-q4_k_m.gguf";
        o.Devices = [new DeviceSlot { Device = gpu.OpenDevice(gpu.GetDevices()[0]) }];
    });
await using var provider = services.BuildServiceProvider();

var generator = provider.GetRequiredService<ITextGenerator>();
TextGenerationResult completion = await generator.GenerateAsync(
    "The capital of France is", new GenerationOptions { MaxNewTokens = 32 });
```

`ModelPath` takes a GGUF file, a Hugging Face checkpoint folder, an ONNX model or a `.slm` package.
[Step-by-step quick start]({{ '/docs/getting-started/' | relative_url }})

## One client per task

| Task | Client | Call |
|---|---|---|
| Text generation | `ITextGenerator` | `GenerateAsync(prompt)`, `GenerateStreamingAsync` |
| Speech to text | `ISpeechRecognizer` | `TranscribeAsync(audio)`, `TranscribeStreamingAsync` |
| Text to speech | `ISpeechSynthesizer` | `SynthesizeAsync(text)`, `SynthesizeStreamingAsync` |
| Image generation | `IImageGenerator` | `GenerateAsync(request)`, `GenerateStreamingAsync` |
| Video generation | `IVideoGenerator` | `GenerateAsync(request)`, `GenerateStreamingAsync` |
| Image classification | `IImageClassifier` | `ClassifyAsync(image)` |
| Image embeddings, zero-shot | `IImageEmbedder` | `EmbedImageAsync`, `EmbedTextAsync`, `ClassifyZeroShotAsync` |
| Object detection | `IObjectDetector` | `DetectAsync(image)` |
| Segmentation | `IImageSegmenter` | `EncodeImageAsync`, `SegmentAsync` |
| Depth estimation | `IDepthEstimator` | `EstimateAsync(image)` |
| OCR | `ITextRecognizer` | `RecognizeAsync(image)` |
| Upscaling | `IImageUpscaler` | `UpscaleAsync(image)` |
| Audio codecs | `IAudioCodec` | `EncodeAsync`, `DecodeAsync` |
| Voice activity | `IVoiceActivityDetector` | `DetectAsync(audio)` |

Text embeddings and reranking: `EmbeddingModel`, `Reranker`. Several models are several registrations, keyed:

```csharp
var services = new ServiceCollection()
    .AddSharplight()
    .AddTextGenerator(o => { o.ModelPath = "qwen3-4b-q4_k_m.gguf"; o.Devices = [slot]; o.ContextLength = 8192; })
    .AddSpeechRecognizer(o => { o.ModelPath = "whisper-small.slm"; o.Devices = [slot]; }, serviceKey: "whisper");
await using var provider = services.BuildServiceProvider();

var recognizer = provider.GetRequiredKeyedService<ISpeechRecognizer>("whisper");
Transcription text = await recognizer.TranscribeAsync(WavFile.Read("talk.wav"));
```

`...Async` methods return before compute starts, so they are safe to call from a UI thread.

## Serve from ASP.NET Core

`Sharplight.AspNetCore`: OpenAI-compatible (`/v1/chat/completions`, `/v1/completions`, `/v1/models`, `/v1/embeddings`,
`/v1/audio/transcriptions`, `/v1/images/generations`) and Anthropic-compatible (`/v1/messages`) endpoints, health probes,
Prometheus metrics, continuous batching.

```csharp
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddSharplightServer(host, o =>               // a ModelHost; or pass a ModelService for a single model
{
    o.ApiKeys.Add("secret");
    o.DefaultSampling = new SamplingParams { Temperature = 0.7f, TopP = 0.95f };
});

var app = builder.Build();
app.UseSharplightServer();      // CORS, API keys, error mapping; call before the Map* methods
app.MapSharplightServer();      // everything the options enable
app.Run();
```

Also: structured output (JSON schema, regex, grammars), tool calls, priorities, per-tenant fair sharing.
[Serving guide]({{ '/docs/serving/' | relative_url }})

## Microsoft.Extensions.AI

`Sharplight.Extensions.AI` provides `IChatClient`, `IEmbeddingGenerator`, `ISpeechToTextClient`, `ITextToSpeechClient`
and `IImageGenerator`.

```csharp
var services = new ServiceCollection().AddSharplight();
services.AddSharplightChatClient(o => { o.ModelPath = "qwen3-4b-q4_k_m.gguf"; o.Devices = [slot]; }, client => client.EnableThinking = false)
    .UseFunctionInvocation();

var provider = services.BuildServiceProvider();
var chat = provider.GetRequiredService<IChatClient>();
var answer = await chat.GetResponseAsync("Why is the sky blue?");
```

## Features

- **Formats**: GGUF, safetensors (including FP8, NVFP4, MXFP4, GPTQ, AWQ), ONNX, diffusers folders and single-file
  checkpoints, whisper.cpp. [Model formats]({{ '/docs/model-formats/' | relative_url }})
- **Providers**: Vulkan GPU and CPU, with fallback kernels for features a device lacks.
  [Hardware]({{ '/docs/hardware/' | relative_url }})
- **`.slm` packages**: one file with optimized graphs, weights and optional precompiled GPU code.
- **Serving**: continuous batching, shared prompt-prefix cache, speculative decoding, several models per process with
  load on demand and eviction.
- **Hub client**: search, download, verify and convert Hugging Face models from code or the command line.

## Packages

| Package | Contents |
|---|---|
| `Sharplight` | Entry point: `services.AddSharplight()` with everything wired up |
| `Sharplight.Core` | Engine and task layer, tokenizers, chat templates, architectures, `.slm` |
| `Sharplight.Cpu`, `Sharplight.Vulkan` | Execution providers |
| `Sharplight.Import.Gguf`, `.HuggingFace`, `.Onnx` | One importer per source format |
| `Sharplight.AspNetCore` | OpenAI- and Anthropic-compatible HTTP endpoints |
| `Sharplight.Extensions.AI` | `Microsoft.Extensions.AI` adapters |
| `Sharplight.Hub` | Search and pull Hugging Face models into a local store |

## From source

```sh
git clone https://github.com/infernitytech/sharplight
cd sharplight
dotnet build Sharplight.slnx -c Release
```

`samples/` has command-line tools for chat, serving, conversion, transcription, vision, image and video generation.

## Next

[Docs]({{ '/docs/' | relative_url }}) · [Models]({{ '/models/' | relative_url }}) ·
[Benchmarks]({{ '/benchmarks/technical/' | relative_url }}) ·
[API overview](https://github.com/infernitytech/sharplight/blob/main/docs/api-overview.md) ·
[Issues](https://github.com/infernitytech/sharplight/issues)

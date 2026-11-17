---
title: Sharplight for .NET developers
lead: >-
  Run AI models inside your .NET application. One package, the dependency injection you already use, and a client
  interface per kind of model.
description: NuGet quick start for Sharplight, the open-source .NET inference engine. Text generation, embeddings, speech, images and serving.
permalink: /developers/
install: dotnet add package Sharplight --prerelease
---

```sh
dotnet add package Sharplight --prerelease
```

Requires .NET 11. The packages are **alpha prereleases**: they are tested against reference implementations, and the API
still changes between versions.

{% comment %}
LAUNCH CHECK (2026-11-17): the package id `Sharplight` is not on nuget.org yet; Sharplight.Core, .Cpu, .Vulkan, .Hub,
.AspNetCore and .Extensions.AI are (0.1.22-alpha). Do not publish this page with the line above before the entry package
exists, or show the "from source" path below as the primary one until then.
{% endcomment %}

## Generate text in a few lines

```csharp
using Microsoft.Extensions.DependencyInjection;

var services = new ServiceCollection()
    .AddSharplight()
    .AddTextGenerator((o, sp) =>
    {
        // Take the first available device: a GPU when there is one, else the CPU.
        var gpu = sp.GetRequiredService<ExecutionProviderCatalog>().Discover().First(d => d.Availability.IsAvailable).Provider;
        o.ModelPath = "qwen3-4b-q4_k_m.gguf";
        o.Devices = [new DeviceSlot { Device = gpu.OpenDevice(gpu.GetDevices()[0]) }];
    });
await using var provider = services.BuildServiceProvider();

var generator = provider.GetRequiredService<ITextGenerator>();
TextGenerationResult completion = await generator.GenerateAsync(
    "The capital of France is", new GenerationOptions { MaxNewTokens = 32 });
```

`AddSharplight()` registers the model formats, the GPU and CPU providers and the task clients. The model is a file you
already have: a GGUF file, a Hugging Face checkpoint folder, an ONNX model or a Sharplight `.slm` package.

[Step-by-step quick start]({{ '/docs/getting-started/' | relative_url }})

## One pattern for every kind of model

Register a model, resolve its client, call an async method. Every client streams where streaming makes sense and takes a
`CancellationToken`.

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

Text embeddings and reranking use `EmbeddingModel` and `Reranker`. Two models in one application are two registrations:

```csharp
var services = new ServiceCollection()
    .AddSharplight()
    .AddTextGenerator(o => { o.ModelPath = "qwen3-4b-q4_k_m.gguf"; o.Devices = [slot]; o.ContextLength = 8192; })
    .AddSpeechRecognizer(o => { o.ModelPath = "whisper-small.slm"; o.Devices = [slot]; }, serviceKey: "whisper");
await using var provider = services.BuildServiceProvider();

var recognizer = provider.GetRequiredKeyedService<ISpeechRecognizer>("whisper");
Transcription text = await recognizer.TranscribeAsync(WavFile.Read("talk.wav"));
```

Clients are safe to call from a UI thread: every `...Async` method returns before any compute starts, and the work runs
on background threads.

## Serve an OpenAI-compatible API from ASP.NET Core

`Sharplight.AspNetCore` maps OpenAI-compatible endpoints (`/v1/chat/completions`, `/v1/completions`, `/v1/models`,
`/v1/embeddings`, `/v1/audio/transcriptions`, `/v1/images/generations`) and Anthropic-compatible ones (`/v1/messages`),
with health probes and Prometheus metrics. Requests are scheduled by a continuous-batching engine, so many callers share
one model.

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

Existing OpenAI and Anthropic clients only change their base URL. Structured output (JSON schema, regular expressions,
grammars), tool calls, priorities and per-tenant fair sharing are built in.
[Serving guide]({{ '/docs/serving/' | relative_url }})

## Works with Microsoft.Extensions.AI

`Sharplight.Extensions.AI` adapts the clients to `IChatClient`, `IEmbeddingGenerator`, `ISpeechToTextClient`,
`ITextToSpeechClient` and `IImageGenerator`, so code written against those abstractions runs on a local model.

```csharp
var services = new ServiceCollection().AddSharplight();
services.AddSharplightChatClient(o => { o.ModelPath = "qwen3-4b-q4_k_m.gguf"; o.Devices = [slot]; }, client => client.EnableThinking = false)
    .UseFunctionInvocation();

var provider = services.BuildServiceProvider();
var chat = provider.GetRequiredService<IChatClient>();
var answer = await chat.GetResponseAsync("Why is the sky blue?");
Console.WriteLine(answer.Text);
```

## What is in the box

- **Formats.** GGUF with its quantization types, Hugging Face safetensors including quantized checkpoints (FP8, NVFP4,
  MXFP4, GPTQ, AWQ and others), ONNX, diffusers folders and single-file checkpoints, whisper.cpp files.
- **Providers.** A Vulkan GPU provider and a CPU provider. No Python and no CUDA toolkit. Features a device lacks fall
  back to kernels it has. [Hardware and providers]({{ '/docs/hardware/' | relative_url }})
- **Model packages.** Convert any loadable model to a single `.slm` file with optimized graphs, weights and, optionally,
  precompiled GPU code for faster first loads. [Model formats]({{ '/docs/model-formats/' | relative_url }})
- **Serving features.** Continuous batching, shared prompt-prefix caching, speculative decoding, several models in one
  process with load on demand and eviction.
- **A model hub client.** Search Hugging Face, download with verification, convert and store models from code or from the
  command line.

## Packages

| Package | Use it for |
|---|---|
| `Sharplight` | The entry point for most applications: `services.AddSharplight()` with everything wired up |
| `Sharplight.Core` | The engine and task layer: text generation, tokenizers, chat templates, architectures, the `.slm` format |
| `Sharplight.Cpu`, `Sharplight.Vulkan` | Execution providers, when you want to choose them yourself |
| `Sharplight.Import.Gguf`, `.HuggingFace`, `.Onnx` | One importer per source format |
| `Sharplight.AspNetCore` | OpenAI- and Anthropic-compatible HTTP endpoints |
| `Sharplight.Extensions.AI` | `Microsoft.Extensions.AI` adapters |
| `Sharplight.Hub` | Search and pull Hugging Face models into a local store |

Every public type carries XML documentation, shipped next to the assemblies.

## From source and from the command line

```sh
git clone https://github.com/infernitytech/sharplight
cd sharplight
dotnet build Sharplight.slnx -c Release

# Pull a model from Hugging Face, convert it and chat with it or serve it
dotnet run -c Release --project samples/Sharplight.Server -- run Qwen/Qwen3-0.6B-GGUF:Q8_0
dotnet run -c Release --project samples/Sharplight.Server -- serve qwen3-0.6b:q8_0 --listen http://127.0.0.1:8080
```

The samples directory has command-line tools for chat, serving, conversion, transcription, vision, image and video generation.

## Next

- [Quick start]({{ '/docs/getting-started/' | relative_url }}) and [first text generation]({{ '/docs/text-generation/' | relative_url }})
- [Which models work]({{ '/models/' | relative_url }})
- [How it performs, and how that was measured]({{ '/benchmarks/' | relative_url }})
- [API overview on GitHub](https://github.com/infernitytech/sharplight/blob/main/docs/api-overview.md)
- [Issues and discussions on GitHub](https://github.com/infernitytech/sharplight/issues)

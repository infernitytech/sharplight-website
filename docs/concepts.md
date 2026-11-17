---
title: How Sharplight is put together
lead: The pieces an application meets, and the rules they follow.
description: Sharplight concepts, covering packages, registration, the task layer, threading and conventions.
permalink: /docs/concepts/
---

## Formats, core, providers

Sharplight has three layers, and they are kept apart on purpose.

- **Importers** read a model format (GGUF, safetensors, ONNX, diffusers, whisper.cpp and others) into one canonical model
  source. Each format is its own assembly, `Sharplight.Import.*`. The core never knows a file format.
- **The core** (`Sharplight.Core`) turns a model source into compute graphs (the architecture adapters), optimizes them,
  and provides the task layer that applications call. It also defines the `.slm` package format.
- **Execution providers** compile and run the graphs on a device: `Sharplight.Vulkan` for GPUs, `Sharplight.Cpu` for CPUs.

Because every model kind becomes the same thing, graphs and weights plus a description of its components, one load path
and one optimization pipeline serve language models, speech models, diffusion models and vision models alike.

## Registration

Everything is composed through `Microsoft.Extensions.DependencyInjection`. There is no static registry and no
process-wide wiring. Each library ships `IServiceCollection` extensions, and `services.AddSharplight()` calls them all.
What the container hands out:

- `ModelLoader` opens and builds models through the registered importers and architectures.
- `ExecutionProviderCatalog` lists the providers and their devices.
- `ModelConverter` converts any loadable model to `.slm`.
- The task clients you registered.

A new format, architecture, task or provider is another registration (`AddModelImporter<T>()`, `AddModelAdapter<T>()`,
`AddTaskClientFactory<T>()`, `AddExecutionProvider<T>()`), without changes to the core.

## Task clients

What an application calls is a task client. All kinds follow the same pattern: a whole-result method, a streaming method
where it makes sense, an options record and a result type.

| Kind | Client | Whole result | Streaming |
|---|---|---|---|
| `text-generation` | `ITextGenerator` | `GenerateAsync(prompt)` | `GenerateStreamingAsync` → `GeneratedToken` |
| `speech-recognition` | `ISpeechRecognizer` | `TranscribeAsync(AudioBuffer)` | `TranscribeStreamingAsync` → `TranscriptionSegment` |
| `speech-synthesis` | `ISpeechSynthesizer` | `SynthesizeAsync(text)` | `SynthesizeStreamingAsync` → `AudioBuffer` |
| `image-generation` | `IImageGenerator` | `GenerateAsync(ImageGenerationRequest)` | `GenerateStreamingAsync` → `ImageGenerationUpdate` |
| `video-generation` | `IVideoGenerator` | `GenerateAsync(VideoGenerationRequest)` | `GenerateStreamingAsync` → `VideoGenerationUpdate` |
| `image-classification` | `IImageClassifier` | `ClassifyAsync(ImageInput)` | |
| `image-embedding` | `IImageEmbedder` | `EmbedImageAsync`, `EmbedTextAsync`, `ClassifyZeroShotAsync` | |
| `object-detection` | `IObjectDetector` | `DetectAsync(ImageInput)` | |
| `image-segmentation` | `IImageSegmenter` | `EncodeImageAsync`, then `SegmentAsync` per prompt | |
| `depth-estimation` | `IDepthEstimator` | `EstimateAsync(ImageInput)` | |
| `ocr` | `ITextRecognizer` | `RecognizeAsync(ImageInput)` | |
| `image-upscaling` | `IImageUpscaler` | `UpscaleAsync(ImageInput)` | progress callback |
| `audio-codec` | `IAudioCodec` | `EncodeAsync`, `DecodeAsync` | |
| `voice-activity` | `IVoiceActivityDetector` | `DetectAsync(AudioBuffer)` | |

A client for a configured model is one registration (`AddTextGenerator`, `AddSpeechRecognizer`, `AddImageGenerator`, ...).
The model is loaded once on first use and disposed by the container after the client. Keyed registrations load different
models of the same kind side by side.

Which implementation a model gets follows from the model's own description, so an application does not choose between,
say, a Whisper-style recognizer and a Parakeet-style one: both answer through `ISpeechRecognizer`.

The shape mirrors `Microsoft.Extensions.AI`, and `Sharplight.Extensions.AI` adapts the clients to its interfaces. The core
itself does not depend on it.

## Threading

Task clients are safe to call from a UI thread:

- **Every `...Async` method returns to its caller before any compute.** Compiling, running, tokenizing and decoding
  happen on background threads.
- **Streams are produced by a background loop** that never waits for the consumer. A slow consumer does not slow
  generation down.
- **Cancellation** is observed between steps: a token, a denoising step, an audio window.
- **No synchronization context is captured.** Results and stream items arrive on background threads; marshal state
  updates to your UI thread yourself.
- **One request at a time per client.** Later requests wait. For many concurrent text requests on one model, use the
  serving engine instead ([serving]({{ '/docs/serving/' | relative_url }})).
- The synchronous load methods (`TaskModel.Load`, `LlmModel.Load`) block and belong on a worker thread;
  `TaskModel.LoadAsync` loads in the background.

## Conventions

- Types that own device memory or threads are `IDisposable`: models, task clients, sessions, engines. Dispose them in
  reverse order of creation; a service container does that for what it created.
- `InferenceEngine`, `ModelHost`, `ModelService`, `EmbeddingModel` and `Reranker` are thread-safe. Sessions, generators
  and samplers are for one thread at a time.
- Request options are immutable records with defaults that work. Load and host options are classes with settable
  properties, for `Microsoft.Extensions.Options`.
- Failures a caller can act on are typed exceptions, for example `QueueFullException` and `PromptTooLongException`.

## Storage

Everything Sharplight writes (settings, downloaded models, compiled kernels, caches, logs) goes to one storage location
with three modes: the system's standard folders (the default), a portable `data` folder next to the application, or a
custom folder. The command-line tools and Studio can switch between them and move the files along.

Source: [api-overview.md](https://github.com/infernitytech/sharplight/blob/main/docs/api-overview.md),
[storage.md](https://github.com/infernitytech/sharplight/blob/main/docs/storage.md).

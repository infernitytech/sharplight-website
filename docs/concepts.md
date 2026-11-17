---
title: How Sharplight is put together
lead: Layers, registration, task clients and threading rules.
description: Sharplight concepts, covering packages, registration, the task layer, threading and conventions.
permalink: /docs/concepts/
---

## Layers

- **Importers** (`Sharplight.Import.*`, one assembly per format) read a model format into one canonical model source.
- **The core** (`Sharplight.Core`) turns a model source into compute graphs, optimizes them, and provides the task layer
  and the `.slm` package format. It knows no file format.
- **Execution providers** compile and run the graphs: `Sharplight.Vulkan` for GPUs, `Sharplight.Cpu` for CPUs.

Every model kind becomes graphs, weights and a description of its components, so all kinds share one load path and one
optimization pipeline.

## Registration

Each library ships `IServiceCollection` extensions; `services.AddSharplight()` calls them all. There is no static
registry. The container provides:

| Service | Purpose |
|---|---|
| `ModelLoader` | opens and builds models through the registered importers and architectures |
| `ExecutionProviderCatalog` | lists providers and their devices |
| `ModelConverter` | converts any loadable model to `.slm` |
| task clients | the ones you registered |

Extend with `AddModelImporter<T>()`, `AddModelAdapter<T>()`, `AddTaskClientFactory<T>()` or `AddExecutionProvider<T>()`.

## Task clients

Each kind has a whole-result method, a streaming method where it makes sense, an options record and a result type.

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

- One registration per configured model: `AddTextGenerator`, `AddSpeechRecognizer`, `AddImageGenerator`, ...
- The model loads once on first use; the container disposes it after the client.
- Keyed registrations load several models of the same kind.
- The implementation follows from the model's description: Whisper-style and Parakeet-style recognizers both answer
  through `ISpeechRecognizer`.
- `Sharplight.Extensions.AI` adapts the clients to the `Microsoft.Extensions.AI` interfaces. The core does not depend on it.

## Threading

- Every `...Async` method returns before any compute. Compiling, running, tokenizing and decoding happen on background
  threads, so clients are safe to call from a UI thread.
- Streams are produced by a background loop that never waits for the consumer.
- Cancellation is observed between steps: a token, a denoising step, an audio window.
- No synchronization context is captured. Results arrive on background threads; marshal UI updates yourself.
- One request at a time per client; later requests wait. For concurrent text requests on one model, use the
  [serving engine]({{ '/docs/serving/' | relative_url }}).
- `TaskModel.Load` and `LlmModel.Load` block; call them on a worker thread or use `TaskModel.LoadAsync`.

## Conventions

- Types that own device memory or threads (models, task clients, sessions, engines) are `IDisposable`. Dispose in
  reverse order of creation; the container does this for what it created.
- Thread-safe: `InferenceEngine`, `ModelHost`, `ModelService`, `EmbeddingModel`, `Reranker`. One thread at a time:
  sessions, generators, samplers.
- Request options are immutable records with working defaults. Load and host options are classes with settable
  properties.
- Failures a caller can act on are typed exceptions, for example `QueueFullException` and `PromptTooLongException`.

## Storage

Settings, downloaded models, compiled kernels, caches and logs go to one location with three modes: the system's
standard folders (default), a portable `data` folder next to the application, or a custom folder. The command-line
tools and Studio can switch modes and move the files along.

Source: [api-overview.md](https://github.com/infernitytech/sharplight/blob/main/docs/api-overview.md),
[storage.md](https://github.com/infernitytech/sharplight/blob/main/docs/storage.md).

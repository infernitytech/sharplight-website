---
title: API reference
lead: Where to find the reference for Sharplight's public API.
description: Pointers to the Sharplight API reference, the XML documentation, the API overview and the samples.
permalink: /docs/api-reference/
---

A browsable, generated API reference is not published yet. Until it is, the reference is in three places.

## XML documentation

Every public type and member carries XML documentation. It ships as `*.xml` files next to the assemblies in the NuGet
packages, so your editor shows it in completion and hover.

## The API overview

[docs/api-overview.md](https://github.com/infernitytech/sharplight/blob/main/docs/api-overview.md) in the repository is
the long-form tour of the public API, kept current with the code: assemblies, registration, every task client with its
options, the serving stack, precompilation and conventions.

## Namespaces and entry points

| Area | Package | Main types |
|---|---|---|
| Registration | `Sharplight` | `services.AddSharplight()`, `SharplightDefaults.CreateServiceProvider()` |
| Loading | `Sharplight.Core` | `ModelLoader`, `TaskModel`, `TaskLoadOptions`, `LlmModel`, `LlmLoadOptions` |
| Devices | `Sharplight.Core`, `.Cpu`, `.Vulkan` | `ExecutionProviderCatalog`, `DeviceSlot`, `CpuExecutionProvider`, `VulkanProvider` |
| Text generation | `Sharplight.Core` | `ITextGenerator`, `GenerationOptions`, `SamplingOptions`, `InferenceSession`, `Generator` |
| Serving | `Sharplight.Core` | `InferenceEngine`, `GenerationRequest`, `ModelService`, `ChatRequest`, `ModelHost`, `OutputFormat`, `GrammarConstraint` |
| Retrieval | `Sharplight.Core` | `EmbeddingModel`, `Reranker`, `ITextEmbedder`, `ITextReranker` |
| Speech | `Sharplight.Core` | `ISpeechRecognizer`, `SpeechRecognitionOptions`, `ISpeechSynthesizer`, `SpeechSynthesisOptions`, `VoiceProfile`, `AudioBuffer`, `WavFile` |
| Images and video | `Sharplight.Core`, `Sharplight.Video` | `IImageGenerator`, `ImageGenerationRequest`, `ImageGenerationOptions`, `IVideoGenerator`, `VideoEncoderCatalog`, `PngCodec` |
| Vision | `Sharplight.Core` | `IImageClassifier`, `IImageEmbedder`, `IObjectDetector`, `IImageSegmenter`, `IDepthEstimator`, `ITextRecognizer`, `IImageUpscaler`, `ImageInput` |
| Packages | `Sharplight.Core` (`Sharplight.Package`) | `ModelConverter`, `ModelPackage`, `PackagePrecompiler` |
| Model hub | `Sharplight.Hub` | `HubClient`, `ModelPuller`, `ModelStore` |
| HTTP | `Sharplight.AspNetCore` | `AddSharplightServer`, `UseSharplightServer`, `MapSharplightServer`, `SharplightServerOptions` |
| Microsoft.Extensions.AI | `Sharplight.Extensions.AI` | `SharplightChatClient`, `SharplightEmbeddingGenerator`, `SharplightSpeechToTextClient`, `SharplightTextToSpeechClient`, `SharplightImageGenerator` |

## Further reference documents

In the repository's [docs folder](https://github.com/infernitytech/sharplight/tree/main/docs):

| Document | Covers |
|---|---|
| `api-overview.md` | The public API |
| `extensions-ai.md` | The `Microsoft.Extensions.AI` adapters |
| `model-format.md` | The `.slm` container, artifact tiers, precompilation |
| `model-hub.md` | Pulling models, the local store, the command-line commands |
| `model-support.md` | Architectures, quantization formats, sweeps |
| `onnx-support.md` | ONNX operator coverage |
| `compatible-models.md`, `verified-catalog.md` | Verified models and the catalog format |
| `kv-cache.md` | The paged and quantized KV cache |
| `storage.md` | Storage locations and modes |
| `studio.md` | Sharplight Studio in detail |
| `benchmarks.md`, `roadmap.md` | The performance log and what is open |

## Samples

The `samples/` directory has small, complete programs: `Sharplight.Cli` (chat and benchmark), `Sharplight.Server`
(serving and the hub commands), `Sharplight.Convert`, `Sharplight.OnnxRun`, `Sharplight.Transcribe`, `Sharplight.Vision`,
`Sharplight.GenerateImage` and `Sharplight.GenerateVideo`.

## Stability

The packages are alpha prereleases. Types and members can be renamed or moved between versions; the README's Packages
section records package renames.

---
title: API reference
lead: Where to find the reference for Sharplight's public API.
description: Pointers to the Sharplight API reference, the XML documentation, the API overview and the samples.
permalink: /docs/api-reference/
---

A generated API reference is not published yet. Until then:

- **XML documentation** on every public type and member, shipped with the packages.
- **[api-overview.md](https://github.com/infernitytech/sharplight/blob/main/docs/api-overview.md)**: the long-form tour of the public API.

Types and members can still be renamed or moved between versions; the README's Packages section records package renames.

## Entry points

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

## Reference documents

The repository's [docs folder](https://github.com/infernitytech/sharplight/tree/main/docs) has one document per area:
`extensions-ai.md`, `model-format.md`, `model-hub.md`, `model-support.md`, `onnx-support.md`, `compatible-models.md`,
`verified-catalog.md`, `kv-cache.md`, `storage.md`, `studio.md`, `benchmarks.md`, `roadmap.md`.

## Samples

`samples/`: `Sharplight.Cli` (chat and benchmark), `Sharplight.Convert`, `Sharplight.OnnxRun`, `Sharplight.Transcribe`,
`Sharplight.Vision`, `Sharplight.GenerateImage`, `Sharplight.GenerateVideo`.

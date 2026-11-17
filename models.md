---
title: Models
lead: Models checked with Sharplight, and how. Not listed means not tried yet.
description: Browse the models verified with Sharplight, by task, format and provider, with how each was checked.
permalink: /models/
catalog_url: https://download.sharplight.dev/catalog/verified-models.json
scripts: [models.js]
---
{% include catalog-stats.html %}

{% comment %}
The catalog browser is rendered here from verified-models.json (schema: docs/verified-catalog.md in the engine repository).
Counts in this copy are as of the catalog dated 2026-11-16; render them from the JSON ("updated" and the entries) instead
of hard-coding. Per entry show: name, family, kind, level badge, variants (label, format, quantization, size from files,
memoryBytes as "needs about"), license, gated badge, verification.reference / .summary / .providers / .date, companions,
notes, repository with the pinned revision.
Filter labels for the kinds:
  text-generation = Text generation; embeddings = Embeddings and reranking; speech-recognition = Speech to text;
  speech-synthesis = Text to speech; image-generation = Image generation; video-generation = Video generation;
  image-classification = Image classification; image-embedding = Image embeddings; object-detection = Object detection;
  image-segmentation = Segmentation (promptable); image-segmentation-semantic = Segmentation (semantic);
  depth-estimation = Depth estimation; ocr = OCR; image-upscaling = Upscaling; audio-codec = Audio codecs;
  voice-activity = Voice activity detection.
Empty state: "No verified model matches these filters. That does not mean a model will not work: it has not been tried yet."
{% endcomment %}

{{ cat_total }} models across {{ cat_kinds }} kinds of task, each pinned to the Hugging Face revision and files that were
checked (updated {{ cat_updated }}). Studio's Discover page uses the same catalog.

{% include models-browser.html %}

## Levels

| Level | Meaning |
|---|---|
| **Verified** | Output compared with a reference implementation on the real weights: tokens identical to transformers or llama.cpp, text identical to whisper.cpp, images or audio within a stated error of diffusers, stable-diffusion.cpp, the model's own package or onnxruntime. |
| **Verified (tiny)** | Architecture verified on a small random checkpoint of the same structure; no real checkpoint compared. |
| **Loads** | The real checkpoint imports; output not compared. |
| **Partial** | Works with a stated limitation. |

**Providers** says where a model was tested: CPU, Vulkan GPU, or both.

Greedy text from 2- or 3-bit quantized files can diverge from llama.cpp after some tokens even when the scores agree;
affected entries say so.

## Formats

safetensors, GGUF (every ggml quantization type), Hugging Face quantized checkpoints (FP8, NVFP4, MXFP4, GPTQ, AWQ and
others), whisper.cpp files, diffusers folders, single-file checkpoints, stable-diffusion.cpp GGUF files and ONNX. All
convert to `.slm`.

## Beyond the list

- **Language models**: 168 of llama.cpp's 172 architectures run end to end; 1080 of 1138 released GGUF files in a sweep
  import. [model-support.md](https://github.com/infernitytech/sharplight/blob/main/docs/model-support.md)
- **ONNX**: operator coverage and tested model groups.
  [onnx-support.md](https://github.com/infernitytech/sharplight/blob/main/docs/onnx-support.md)
- **Known not to work**: listed with reasons at the end of
  [compatible-models.md](https://github.com/infernitytech/sharplight/blob/main/docs/compatible-models.md).

## Request a model

Open an [issue](https://github.com/infernitytech/sharplight/issues) with the Hugging Face repository id and the file or
quantization.

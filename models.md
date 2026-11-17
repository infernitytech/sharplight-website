---
title: Models
lead: >-
  The models that have been tried with Sharplight and work, with how each one was checked. A model that is not listed has
  not been tried yet.
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

The list is generated from Sharplight's verified-model catalog, the same file Sharplight Studio uses on its Discover
page. Every entry is pinned to the exact Hugging Face revision and files that were checked, so what you install is what
was tested. The catalog currently holds {{ cat_total }} models across {{ cat_kinds }} kinds of task (last updated {{ cat_updated }}).

{% include models-browser.html %}

## What the levels mean

| Level | Meaning |
|---|---|
| **Verified** | The output was compared with a reference implementation on the real weights: generated tokens identical to transformers or llama.cpp, text identical to whisper.cpp, images or audio within a stated error of diffusers, stable-diffusion.cpp, the model's own package or onnxruntime. |
| **Verified (tiny)** | The architecture is verified against its reference on a small random checkpoint of the same structure. No real checkpoint was compared. |
| **Loads** | The real checkpoint imports: weights mapped, tokenizer built. Its output was not compared with a reference. |
| **Partial** | Works with a stated limitation. |

The **Providers** shown for a model say where it was tested: the CPU provider, the Vulkan GPU provider, or both.

## Formats

Sharplight reads safetensors and GGUF (every ggml quantization type), Hugging Face quantized checkpoints (FP8, NVFP4,
MXFP4, GPTQ, AWQ and others), whisper.cpp files, diffusers folders, single-file checkpoints, stable-diffusion.cpp GGUF
files and ONNX. Any of them can be converted to Sharplight's own `.slm` package.

## Beyond the list

- **Language model architectures.** Of the 172 architectures llama.cpp knows, 168 run end to end. In a sweep of 1138
  released GGUF files, 1080 import. The full matrix is in
  [model-support.md](https://github.com/infernitytech/sharplight/blob/main/docs/model-support.md).
- **ONNX.** Operator coverage and tested model groups are in
  [onnx-support.md](https://github.com/infernitytech/sharplight/blob/main/docs/onnx-support.md).
- **Known not to work.** The models and formats that fail, with reasons, are listed at the end of
  [compatible-models.md](https://github.com/infernitytech/sharplight/blob/main/docs/compatible-models.md).

## A note on small differences

Quantized files round differently between runtimes. Text generated greedily from a 2- or 3-bit file can diverge from
llama.cpp after some tokens even when the underlying scores agree. Where that was seen, the entry says so.

## Request a model

Open an issue on [GitHub](https://github.com/infernitytech/sharplight/issues) with the Hugging Face repository id and the
file or quantization you use. Models that fail to import are reported with a reason.

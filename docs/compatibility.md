---
title: Model compatibility
lead: What "compatible" means, how models are verified, and where the lists are.
description: How Sharplight verifies models against reference implementations, the verification levels and the catalog.
permalink: /docs/compatibility/
---
{% include catalog-stats.html %}

The [model list]({{ '/models/' | relative_url }}) contains what was tested and works. A model that is not listed has not
been tried yet; that does not mean it fails.

## Levels

A listed model **imports** (format read, architecture recognized, tokenizer and chat template or feature extractor
included) and **runs** on the CPU provider, the Vulkan provider, or both.

| Level | Meaning |
|---|---|
| **Verified** | Output compared with a reference implementation on real weights: greedy tokens identical to transformers or llama.cpp, text identical to whisper.cpp, images or audio within a stated PSNR or relative error of diffusers, stable-diffusion.cpp, the model's own package, or onnxruntime. |
| **Verified (tiny)** | The architecture is verified against its reference on a small random checkpoint of the same structure; no real checkpoint was compared. |
| **Loads** | The real checkpoint passes the compatibility check and the import. Generation was not compared with a reference. |
| **Partial** | Works with a stated limitation. |

## The verified catalog

`catalog/verified-models.json` is the source of the model list and of Studio's Discover page. Each variant is pinned to
the Hugging Face revision and files that were checked (with sizes and hashes), and each entry records license, gating,
companion files, the reference, the result, the providers and the date.

As of {{ cat_updated }}: {{ cat_total }} entries across {{ cat_kinds }} kinds: {{ cat_verified }} verified, {{ cat_partial }} partial, {{ cat_loads }} loads, {{ cat_tiny }} verified on a tiny checkpoint.

## Differences that are not errors

Quantized files round differently between runtimes. Greedy text from a 2- or 3-bit file can diverge from llama.cpp after
some tokens even when the underlying scores agree (correlation above 0.98 in every case checked). Entries note where this
was seen.

## Beyond the catalog

- **Language-model architectures.** Of the 172 architectures llama.cpp knows, 168 are supported end to end, one
  partially, and three text-to-speech decoders not yet. A sweep of 1138 released GGUF files and 72 Hugging Face
  checkpoints imported 1080 and 49.
  [model-support.md](https://github.com/infernitytech/sharplight/blob/main/docs/model-support.md)
- **ONNX.** Operator coverage and conformance:
  [onnx-support.md](https://github.com/infernitytech/sharplight/blob/main/docs/onnx-support.md)
- **Known not to work**, with reasons: the last section of
  [compatible-models.md](https://github.com/infernitytech/sharplight/blob/main/docs/compatible-models.md)

## Request or add a model

Open an [issue](https://github.com/infernitytech/sharplight/issues) with the Hugging Face repository id and the file or
quantization. To add an entry yourself (pinned revision and verification result; CI validates the file), see
[verified-catalog.md](https://github.com/infernitytech/sharplight/blob/main/docs/verified-catalog.md).

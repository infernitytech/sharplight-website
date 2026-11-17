---
title: Model compatibility
lead: What "compatible" means in Sharplight, how models are verified, and where the lists are.
description: How Sharplight verifies models against reference implementations, the verification levels and the catalog.
permalink: /docs/compatibility/
---
{% include catalog-stats.html %}

## The short version

- The [model list]({{ '/models/' | relative_url }}) contains what was actually tested and works.
- A model that is not listed has not been tried yet. That does not mean it fails.
- Each listed model says how its output was checked and on which providers.

## What "compatible" means

A model is listed when it **imports** (the file format is read, the architecture is recognized, tokenizer and chat
template or feature extractor come along) and **runs** on the CPU provider, the Vulkan provider, or both.

| Level | Meaning |
|---|---|
| **Verified** | Output compared with a reference implementation on real weights: greedy tokens identical to transformers or llama.cpp, text identical to whisper.cpp, images or audio within a stated PSNR or relative error of diffusers, stable-diffusion.cpp, the model's own package, or onnxruntime. |
| **Verified (tiny)** | The architecture is verified against its reference on a small random checkpoint of the same structure; no real checkpoint was compared. |
| **Loads** | The real checkpoint passes the compatibility check and the import. Generation was not compared with a reference. |
| **Partial** | Works with a stated limitation. |

## The verified catalog

The list is generated from one file, `catalog/verified-models.json`, which is also what Sharplight Studio shows under
Discover. For every model it records:

- the kind of task, family and architecture;
- the license from the model's page and whether the repository is gated;
- each variant (format, quantization) with the exact Hugging Face revision and files that were checked, including sizes and hashes;
- the companion files a model needs;
- the reference it was compared with, a summary of the result, the providers and the date.

Because variants are pinned to a revision, installing from the catalog gives you the files that were tested, even if the
repository changes later.

As of {{ cat_updated }} the catalog has {{ cat_total }} entries across {{ cat_kinds }} kinds: {{ cat_verified }} verified, {{ cat_partial }} partial, {{ cat_loads }} loads, {{ cat_tiny }} verified on a tiny checkpoint.

## Differences that are not errors

Quantized files round differently between runtimes. Greedy text from a 2- or 3-bit file can diverge from llama.cpp after
some tokens even when the underlying scores agree (correlation above 0.98 in every such case checked). Entries note where
this was seen.

## Beyond the catalog

- **Language-model architectures.** Of the 172 architectures llama.cpp knows, 168 are supported end to end, one
  partially, and three text-to-speech decoders not yet. A sweep of 1138 released GGUF files and 72 Hugging Face
  checkpoints imported 1080 and 49 of them.
  [model-support.md](https://github.com/infernitytech/sharplight/blob/main/docs/model-support.md)
- **ONNX.** Operator coverage and conformance results:
  [onnx-support.md](https://github.com/infernitytech/sharplight/blob/main/docs/onnx-support.md)
- **Known unsupported or not working**, with reasons: the last section of
  [compatible-models.md](https://github.com/infernitytech/sharplight/blob/main/docs/compatible-models.md)

## Request a model, or add one

Open an [issue](https://github.com/infernitytech/sharplight/issues) with the Hugging Face repository id and the file or
quantization you use. To add an entry yourself, see
[verified-catalog.md](https://github.com/infernitytech/sharplight/blob/main/docs/verified-catalog.md): an entry needs the
pinned revision and the verification result, and CI validates the file.

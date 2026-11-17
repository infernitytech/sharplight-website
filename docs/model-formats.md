---
title: Model formats and .slm packages
lead: The formats Sharplight reads, and its own package format.
description: Supported model formats in Sharplight (GGUF, safetensors, ONNX, diffusers, whisper.cpp) and the .slm package format.
permalink: /docs/model-formats/
---

## What Sharplight reads

Pass the path as `ModelPath`; the importer is chosen from the file. All formats run on both the CPU and the Vulkan
provider.

- GGUF
- Hugging Face checkpoints (safetensors)
- ONNX
- `.slm` packages
- diffusers folders and single-file Stable Diffusion checkpoints
- stable-diffusion.cpp GGUF files
- whisper.cpp `.bin` files
- PyTorch pickle checkpoints, through a restricted unpickler

### Weight formats

| Source | Kept quantized on the device | Decoded to BF16 at load |
|---|---|---|
| GGUF | F32, F16, BF16, Q4_0 to Q8_0, K-quants (Q2_K to Q6_K), IQ formats, TQ1_0 / TQ2_0, MXFP4, NVFP4 | |
| Hugging Face | BF16 / F16 / F32, FP8, NVFP4, MXFP4, GPTQ, AWQ, compressed-tensors integer weights, bitsandbytes NF4, MLX 4-bit | bitsandbytes FP4 / LLM.int8, other MLX bit widths |

Details: [model-support.md](https://github.com/infernitytech/sharplight/blob/main/docs/model-support.md).

## The .slm package

One file holding a model in the form the engine runs:

- **Device-independent graphs and weights**, already optimized. The only required content.
- **A model description**: its kind and its components (encoder, decoder, tokenizer, denoiser, VAE, scheduler, ...),
  each with graphs, weights, configuration and attachments. Models that arrive as several files become one.
- **Optional precompiled code**: *portable code* (SPIR-V, independent of the driver) and *device binaries* (one device
  and driver version). A package can carry code for several devices; stale or foreign binaries are ignored.

Converting is optional. Models loaded from their original files cache their compiled kernels per user, so only the
first load compiles. A package with precompiled code skips that too: 1.2-1.3 s instead of 3.5-3.6 s to a ready decoder
with portable code only, on one model (2026-11-13, RTX PRO 6000; model-format.md, "Measured load times").

### Convert

In code, use `ModelConverter` from the container. On the command line:

```sh
sharplight-convert convert model.gguf model.slm
sharplight-convert precompile model.slm --all-devices     # add code for the devices of this machine
sharplight-convert info model.slm
```

`sharplight-convert` is in `samples/Sharplight.Convert`. `precompile --profile` builds portable code for a device you
do not have, from an exported device profile. Studio converts and precompiles when it installs a model.

## Pulling from Hugging Face

`Sharplight.Hub` searches the Hub, downloads with resume and verification, and stores models locally:

```sh
sharplight pull Qwen/Qwen3-0.6B-GGUF:Q8_0        # GGUF quantization by tag
sharplight pull Qwen/Qwen3-0.6B                   # safetensors checkpoint
sharplight list
sharplight run qwen3-0.6b:q8_0                    # interactive chat; pulls first if needed
```

Without a tag, the puller takes Q4_K_M, then Q8_0, then common fallbacks. Split GGUF files are downloaded completely,
and a vision projector is included when the repository has one.

Source: [model-format.md](https://github.com/infernitytech/sharplight/blob/main/docs/model-format.md),
[model-hub.md](https://github.com/infernitytech/sharplight/blob/main/docs/model-hub.md).

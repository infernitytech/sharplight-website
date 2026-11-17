---
title: Model formats and .slm packages
lead: What Sharplight reads, and the package format it can convert everything into.
description: Supported model formats in Sharplight (GGUF, safetensors, ONNX, diffusers, whisper.cpp) and the .slm package format.
permalink: /docs/model-formats/
---

## What Sharplight reads

| Source | CPU | Vulkan |
|---|:-:|:-:|
| GGUF | ✓ | ✓ |
| Hugging Face checkpoints (safetensors) | ✓ | ✓ |
| ONNX | ✓ | ✓ |
| `.slm` package | ✓ | ✓ |

Also: diffusers folders and single-file Stable Diffusion checkpoints, stable-diffusion.cpp GGUF files, whisper.cpp `.bin`
files, and PyTorch pickle checkpoints through a restricted unpickler.

You pass the path as `ModelPath`; the importer is chosen from the file.

### Weight formats

- **GGUF**: F32, F16, BF16, Q4_0 to Q8_0, the K-quants (Q2_K to Q6_K), the IQ formats, TQ1_0 / TQ2_0, MXFP4 and NVFP4.
- **Hugging Face**: BF16 / F16 / F32, FP8, NVFP4, MXFP4, GPTQ, AWQ, compressed-tensors integer weights, bitsandbytes NF4
  and MLX 4-bit stay quantized on the device. bitsandbytes FP4 / LLM.int8 and other MLX bit widths are decoded to BF16 at load.

Details: [model-support.md](https://github.com/infernitytech/sharplight/blob/main/docs/model-support.md).

## The .slm package

A `.slm` file stores a model in the form the engine runs:

- **Device-independent graphs and weights.** This is the only required content, so one file runs anywhere.
- **Graphs that are already optimized.** The optimization pass ran at conversion, and loading does not repeat it.
- **A description of the model**: its kind (text generation, speech recognition, image generation, ...) and its
  components (encoder, decoder, tokenizer, denoiser, VAE, scheduler, ...), each with its graphs, weights, configuration
  and attachments. Every model kind fits in one file, including models that arrive as several files.
- **Optional precompiled code**, in two tiers:
  - *portable code* (SPIR-V for Vulkan), independent of the driver, for a class of devices;
  - *device binaries*, for one device and driver version.

A package can carry no precompiled code, or code for several devices. A reader skips what it does not understand, and
stale or foreign binaries are ignored, never trusted.

### Why convert

- **Faster first load.** With precompiled code a load skips shader compilation. Measured on one model: 1.2-1.3 s instead
  of 3.5-3.6 s to a ready decoder with portable code only (2026-11-13, an RTX PRO 6000; model-format.md, "Measured load times").
- **One file** instead of a folder plus companion files.

Converting is optional. Models loaded straight from GGUF, safetensors or ONNX files work the same way, and their compiled
kernels are kept in a per-user cache, so the second load is fast there too.

### Convert

In code, `ModelConverter` (from the container) converts any loadable model. On the command line:

```sh
sharplight-convert convert model.gguf model.slm
sharplight-convert precompile model.slm --all-devices     # add code for the devices of this machine
sharplight-convert info model.slm
```

`sharplight-convert` is in `samples/Sharplight.Convert`. `precompile --profile` builds portable code for a device you do
not have, from an exported device profile.

Sharplight Studio converts and precompiles automatically when it installs a model, and its package inspector shows
everything in a `.slm` file.

## Pulling from Hugging Face

`Sharplight.Hub` searches the Hub, downloads with resume and verification, and stores models locally. The command-line
tools use it:

```sh
sharplight-server pull Qwen/Qwen3-0.6B-GGUF:Q8_0        # GGUF quantization by tag
sharplight-server pull Qwen/Qwen3-0.6B                   # safetensors checkpoint
sharplight-server list
sharplight-server run qwen3-0.6b:q8_0                    # interactive chat; pulls first if needed
```

Without a tag, the puller takes Q4_K_M, then Q8_0, then common fallbacks. Split GGUF files are downloaded completely, and
a vision projector is included when the repository has one.

Source: [model-format.md](https://github.com/infernitytech/sharplight/blob/main/docs/model-format.md),
[model-hub.md](https://github.com/infernitytech/sharplight/blob/main/docs/model-hub.md).

---
title: Benchmarks
lead: >-
  How Sharplight performs next to llama.cpp, vLLM and onnxruntime, with the hardware, versions, method and caveats for
  every chart, including the cases where the other engine is ahead.
description: Reproducible Sharplight benchmarks against llama.cpp, vLLM and onnxruntime, with method, hardware, versions and caveats.
permalink: /benchmarks/
charts: [decode-llamacpp, prefill-llamacpp, serving-throughput, serving-throughput-moe, vllm-decode, vllm-prefill, vllm-ttft, onnx-latency]
---

## How to read this page

- **These are our own measurements.** We built Sharplight and we ran the tests, on one GPU model, on a machine shared
  with other jobs. Treat the charts as a starting point and run the scripts on your own hardware.
- **Every chart names its hardware, engine versions, date and method**, and links to the section of the engine's benchmark
  log it was copied from. The raw results are in the repository under `bench/results/`.
- **Axes start at zero.** Each chart can be shown as a table.
- **Small differences are noise.** Under about 5 %, the order of two engines can change from run to run.
- **Other engines are tested with their official builds and recommended fast settings.** If a setting is unfair to an
  engine, please [open an issue](https://github.com/infernitytech/sharplight/issues); we will re-measure and correct the page.

## In short

On one NVIDIA RTX PRO 4500 (32 GB), in November 2026:

| Comparison | Result |
|---|---|
| Single-stream generation, against llama.cpp CUDA (same GGUF files) | 0.88-0.99x: slightly behind on every model |
| Single-stream generation, against llama.cpp Vulkan | 0.99-1.09x |
| Prompt processing at 512 tokens, against llama.cpp CUDA | 0.86-1.22x: ahead on five of seven models, behind on gpt-oss-20b |
| Serving 1 to 64 simultaneous streams, against llama.cpp's server | 1.1-4.4x |
| Generation, against vLLM on identical weights | 0.95-1.08x: level |
| Prompt processing, against vLLM on identical weights | 0.73-1.01x at 2048 tokens: behind on three of four models |
| ONNX models at batch 1, against onnxruntime's CUDA provider | faster on most measured models; TensorRT is ahead on several |

## Against llama.cpp

Same GGUF files, llama.cpp with its CUDA backend and with its Vulkan backend. Sharplight runs on Vulkan in every test.

{% include benchmark-chart.html id="decode-llamacpp" %}

{% include benchmark-chart.html id="prefill-llamacpp" %}

## Serving several requests at once

One server per engine, the same load generator, from 1 to 64 simultaneous requests. Sharplight's continuous-batching
engine advances all running requests in one pass per step.

{% include benchmark-chart.html id="serving-throughput" %}

{% include benchmark-chart.html id="serving-throughput-moe" %}

In these charts vLLM ran different weights (bf16 checkpoints) from the other two engines (quantized GGUF files). The next
section removes that difference.

## Against vLLM on identical weights

Both engines load the same Hugging Face checkpoints: bf16 weights, and FP8 for the FP8 checkpoint. vLLM runs on CUDA,
Sharplight on Vulkan.

{% include benchmark-chart.html id="vllm-decode" %}

{% include benchmark-chart.html id="vllm-prefill" %}

{% include benchmark-chart.html id="vllm-ttft" %}

## ONNX models

{% include benchmark-chart.html id="onnx-latency" %}

Sharplight has two precision modes for matrix products. The default ("strict") keeps f32 accuracy. The opt-in "fast" mode
is in the same accuracy class as the TF32 mode that onnxruntime's CUDA provider uses by default, so "fast" is the
like-for-like comparison with it.

## Where Sharplight is behind

Collected in one place, from the charts above and the engine's own list of open gaps:

- **Prompt processing against vLLM**: 0.73-0.92x at 2048 tokens on three of four models, 0.73-0.90x at 8192 tokens. This
  also makes vLLM's total throughput higher in the long-prompt serving test (Sharplight 0.68-0.78x at 16 streams).
- **Time to first token on 8B models**: later than vLLM for a single stream (300 ms against 239 ms on Qwen3-8B) and at 16 streams.
- **Many streams on a small model**: at 64 streams on Llama-3.2-1B, vLLM serves more tokens per second (Sharplight 0.75x).
- **Single-stream generation against llama.cpp CUDA**: 1 to 12 % behind, most on the smallest models.
- **gpt-oss-20b prompt processing**: 0.83-0.86x of llama.cpp CUDA.
- **TensorRT** is ahead on ConvNeXt, YOLOv10n, MobileSAM and other rows.

## What is not on this page

- **Other GPUs.** Everything above is one NVIDIA card. Sharplight's tests also pass on an AMD integrated GPU and on a
  software Vulkan driver, but there are no comparable published benchmarks for AMD or Intel GPUs yet.
- **Apple silicon.** A native Metal provider is in progress. Its only measurements so far ran on a virtualized CI
  machine, which is not representative, so they are not charted.
- **CPU.** The engine log has CPU comparisons with llama.cpp and onnxruntime on an earlier machine; they will be added
  when re-measured on the current one.
- **Quality.** Speed says nothing about output quality. Correctness is covered separately: models are compared with
  reference implementations, see [Models]({{ '/models/' | relative_url }}).

## Reproduce

The scripts are in the `bench/` directory of the repository. For the vLLM comparison:

```bash
export SHARPLIGHT_VK_DEVICES=1 CUDA_VISIBLE_DEVICES=1 VLLM_VENV=<venv> HF_DIR=<checkpoints> OUT_DIR=bench/results/mine
bench/s38_all.sh vllm
bench/s38_all.sh sharplight after
python3 bench/s38_summarize.py bench/results/mine after
```

The llama.cpp comparison uses `bench/s34_single_all.sh` (single stream) and `bench/s16_serve.sh` (serving); the ONNX
comparison uses `bench/onnx/parity_bench.py`. The complete log, with every round, the experiments that were dropped and the
open gaps, is [docs/benchmarks.md](https://github.com/infernitytech/sharplight/blob/main/docs/benchmarks.md).
[More on the method]({{ '/docs/benchmark-methodology/' | relative_url }})

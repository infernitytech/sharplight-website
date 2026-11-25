---
title: Benchmark methodology
lead: How the numbers on the benchmark pages are measured, what they do not show, and how to re-run them.
description: Method, hardware, versions and limits of the Sharplight benchmarks against llama.cpp, vLLM, onnxruntime and reference implementations.
permalink: /docs/benchmark-methodology/
---

The [technical benchmarks page]({{ '/benchmarks/technical/' | relative_url }}) shows a selection from
[docs/benchmarks.md](https://github.com/infernitytech/sharplight/blob/develop/docs/benchmarks.md), the round-by-round log
with before and after numbers, dropped experiments and open gaps. Each chart names its section of the log. A
plain-language summary is on the [performance overview]({{ '/benchmarks/' | relative_url }}).

## Principles

1. **Same input.** Every comparison uses the same model files on every engine: GGUF files for Sharplight and llama.cpp,
   the same Hugging Face checkpoints for Sharplight and vLLM, the same ONNX files for Sharplight and onnxruntime. Pairs
   with different weights or a different precision class (for example vLLM on an int4 checkpoint against a GGUF file)
   are not published.
2. **Same procedure and statistic.** Both engines run the same load generator or the same number of steps, and each
   chart states the statistic used on every side (median, mean or minimum; wall-clock time unless stated).
3. **Official builds, fast settings.** llama.cpp: official CUDA and Vulkan builds, all layers on the GPU, flash
   attention. vLLM: default settings with CUDA graphs, prefix caching off. onnxruntime: CUDA provider with TF32 on (its
   default) and off, each compared with the Sharplight mode of the same precision class; TensorRT with engine build time
   excluded.
4. **Same GPU, one engine at a time.**
5. **Unfavorable rows are reported.** Tables include every model measured; each round ends with a list of gaps.
6. **Output is checked.** A speed change is accepted only when greedy output stays identical to the previous build, or
   the difference is explained and recorded. Serving runs end with a batched text check that compares concurrent greedy
   answers with single-request ones.

## Hardware and versions

| | |
|---|---|
| GPU | NVIDIA RTX PRO 4500 Blackwell (32 GB, 200 W power limit), CUDA 13.2 |
| CPU and memory | AMD EPYC 7443, 10 threads, 62 GB (the tests with experts in system memory or on disk) |
| Disk | NVMe SSD reading 7.4 GB/s (the tests with experts on disk) |
| Sharplight | Release build of the development branch at the commit or date named per chart; CUDA or Vulkan provider as named |
| llama.cpp | b11177, official CUDA 13 and Vulkan builds, `-ngl 99 -fa 1` |
| vLLM | 0.33.0, CUDA graphs, prefix caching off |
| onnxruntime | onnxruntime-gpu 1.32.0 (CUDA 13, cuDNN 9.28), CUDA and TensorRT 10.16 execution providers |
| SeedVR2 reference | The official ByteDance-Seed/SeedVR inference code on PyTorch 2.14 (CUDA 13.0), bf16 autocast, flash attention |

Log entries before 2026-11-15 are from a different GPU (RTX PRO 6000 Blackwell Max-Q) and are not comparable.

## Measurements

| Test | Log sections | Method |
|---|---|---|
| Serving against vLLM | 104, 106 | One server per engine, 16 or 64 slots of 512 tokens (also 1 slot for the NVFP4 checkpoints). `bench/loadgen.py` in a closed loop: prompts of about 250 random-word tokens, 128 output tokens, temperature 0, 64 requests per run. Throughput, time to first token (p50) and inter-token latency from the same runs, followed by the batched text check. |
| Serving at 64-256 streams | 105 | One server per engine sized for 256 sequences with the same number of KV-cache tokens and a 2,048-row step budget on both. `bench/loadgen.py --length-mix` (log-normal prompt and answer lengths, the same requests for both engines) in a closed loop at 64, 128 and 256 streams; throughput over the steady window, while every stream still has a request. |
| Batched generation | 107 | 1-64 sequences decoding together after a 256-token prefill, a warm-up and a timed pass of 64 steps from a cleared cache, logits of every sequence copied to the host. Sharplight: `BatchBench --modes download --refill`. llama.cpp: `llama-batched-bench -npp 256 -ntg 64`. Mean step time of the 64 timed steps on both sides, average of two rounds. |
| Experts in system memory | 107, 111 | llama-bench's procedure on both sides: one warm-up, 5 runs, mean of the per-run tokens per second. Prefill of 512 tokens; generation of 64 tokens after a 512-token prompt. Sharplight: `--cpu-offload --bench 512`. llama.cpp: `llama-bench -ncmoe N` at its fastest N. Average of three rounds (section 107) or two rounds on CUDA and one on Vulkan (section 111). |
| Experts on disk | 85, 87 | Greedy text of up to 24 tokens after the same prompt, each engine's reported generation speed. Sharplight reads experts into a fixed cache; llama.cpp memory-maps the file. Same memory limits for both. |
| Single stream | 34 | Generation ("tg"): output tokens per second at a stated context depth. Sharplight: `--bench N`, several process runs, median decode step. llama.cpp: `llama-bench -r 5`, median. |
| Serving throughput | 34.3 | One server per engine, 64 slots, 512-token contexts. Prompts of about 250 random-word tokens, 128 output tokens at temperature 0, at 1, 4, 16 and 64 simultaneous requests. 2 rounds each, median, with time to first token and inter-token latency. |
| Prompt processing | 40.9 | Prompts of 512, 2048 and 8192 random token ids, no prefix caching, one warm-up and 5 timed prefills per length, median of the 5 on every side. |
| Video enhancement (SeedVR2) | 108, 110 | The official checkpoint and inference code against Sharplight on the same clip, frame count, sizes, seed and colour fix; PyTorch in its fastest setting that fits in 32 GB. End to end from reading the input video to writing the output, median of 5 runs after one warm-up; output frames compared (PSNR) before timing. |
| ONNX latency | 99 | `bench/onnx/parity_bench.py`: every measurement in its own process, engines of one model back to back, rounds interleaved, minimum wall-clock latency including the read-back of the outputs. Accuracy is checked against a reference in the same run. |

## What the numbers do not show

- **Other hardware.** One GPU model. AMD, Intel and Apple GPUs are not covered. The Metal provider's first numbers
  (section 41) come from a virtualized CI machine and are indicative only.
- **Variance.** Small-model generation varies between runs; each value is a median or best-of as stated per chart.
  Read differences under about 5 % as a tie.
- **Your workload.** Against vLLM, Sharplight returns the first token sooner under load but has a longer inter-token
  latency tail at 16 streams; throughput is level. Long prompts were last compared with the Vulkan provider, where vLLM
  processed them faster.
- **Independence.** These are the vendor's own measurements.

## Reproduce

Scripts are in `bench/`, raw results in `bench/results/s<section>/`.

```bash
# Single stream against llama.cpp (section 34 method)
GPU_INDEX=0 bench/s34_single_all.sh sharplight     # then: llama-cuda13, llama-vulkan (model paths: bench/models.sh)

# Prompt processing against vLLM on identical checkpoints (section 38 method)
export SHARPLIGHT_VK_DEVICES=0 CUDA_VISIBLE_DEVICES=0 VLLM_VENV=<venv> HF_DIR=<checkpoints> OUT_DIR=bench/results/mine
bench/s38_all.sh vllm
bench/s38_all.sh sharplight after
python3 bench/s38_summarize.py bench/results/mine after
```

If your results differ, or a setting is unfair to another engine, please
[open an issue](https://github.com/infernitytech/sharplight/issues); the site will be corrected.

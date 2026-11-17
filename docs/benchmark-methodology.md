---
title: Benchmark methodology
lead: How the numbers on the benchmarks page are measured, what they do not show, and how to re-run them.
description: Method, hardware, versions and limits of the Sharplight benchmarks against llama.cpp, vLLM and onnxruntime.
permalink: /docs/benchmark-methodology/
---

The [benchmarks page]({{ '/benchmarks/' | relative_url }}) shows a selection from
[docs/benchmarks.md](https://github.com/infernitytech/sharplight/blob/main/docs/benchmarks.md), the round-by-round log
with before and after numbers, dropped experiments and open gaps. Each chart names its section of the log.

## Principles

1. **Same input.** Engines run the same model files where they can read them. Where they cannot (vLLM does not read
   GGUF), the chart says so, and a separate comparison uses identical Hugging Face checkpoints.
2. **Official builds, fast settings.** llama.cpp: official CUDA and Vulkan builds, all layers on the GPU, flash
   attention. vLLM: flash-attention backend, CUDA graphs. onnxruntime: CUDA provider with its default TF32; TensorRT
   with engine build time excluded.
3. **Same GPU, one engine at a time.**
4. **Unfavorable rows are reported.** Tables include every model measured; each round ends with a list of gaps.
5. **Output is checked.** A speed change is accepted only when greedy output stays identical to the previous build, or
   the difference is explained and recorded.

## Hardware and versions

| | |
|---|---|
| GPU | One of three NVIDIA RTX PRO 4500 Blackwell (32 GB, 200 W power limit), driver 595.91, CUDA 13.2 |
| CPU | 48 threads |
| Sharplight | Release build of the development branch at the commit named per chart, Vulkan provider |
| llama.cpp | b11177, official CUDA 13 and Vulkan builds, `-ngl 99 -fa 1` |
| vLLM | 0.33.0, flash-attn backend, CUDA graphs, prefix caching off |
| onnxruntime | onnxruntime-gpu 1.32, CUDA and TensorRT execution providers |

Log entries before 2026-11-15 are from a different GPU (RTX PRO 6000 Blackwell Max-Q) and are not comparable.

## Measurements

| Test | Log sections | Method |
|---|---|---|
| Single stream | 34, 36, 39 | Prompt processing ("pp512", "pp2048"): prompt tokens per second at that prompt length. Generation ("tg"): output tokens per second at a stated context depth. Sharplight: `--bench N`, several process runs, best prefill of 4 per run, median decode step. llama.cpp: `llama-bench -r 5`. vLLM: `bench/vllm_single.py`, median of 5. |
| Serving throughput | 34.3 | One server per engine, 64 slots, 512-token contexts. Prompts of about 250 random-word tokens, 128 output tokens at temperature 0, at 1, 4, 16 and 64 simultaneous requests. 2 rounds each, median, with time to first token and inter-token latency. |
| Long-prompt serving | 38.4, 39.3 | 16 slots, 4096-token context, 2000-token prompts, 16 output tokens. Measures time to first token and prompt-processing throughput under load. |
| ONNX latency | 37 | `bench/onnx/parity_bench.py`: every measurement in its own process, engines of one model back to back, rounds interleaved, minimum latency reported. Accuracy is checked against a reference in the same run. |

Sharplight's single-stream prefill value is a best-of while the others are medians or means. This favors Sharplight
slightly and is stated on the charts.

## What the numbers do not show

- **Other hardware.** One GPU model. AMD, Intel and Apple GPUs are not covered. The Metal provider's first numbers
  (section 41) come from a virtualized CI machine and are indicative only.
- **Variance.** Small-model generation varies between runs; each value is a median or best-of as stated per chart.
  Read differences under about 5 % as a tie.
- **Your workload.** Sharplight is ahead at short prompts and low to medium concurrency, vLLM at long prompts and at 64
  streams on a small model.
- **Independence.** These are the vendor's own measurements.

## Reproduce

Scripts are in `bench/`, raw results in `bench/results/s<section>/`.

```bash
# Single stream against llama.cpp (section 34 method)
GPU_INDEX=0 bench/s34_single_all.sh sharplight     # then: llama-cuda13, llama-vulkan (model paths: bench/models.sh)

# Against vLLM on identical checkpoints (sections 38 and 39)
export SHARPLIGHT_VK_DEVICES=0 CUDA_VISIBLE_DEVICES=0 VLLM_VENV=<venv> HF_DIR=<checkpoints> OUT_DIR=bench/results/mine
bench/s38_all.sh vllm
bench/s38_all.sh sharplight after
python3 bench/s38_summarize.py bench/results/mine after
```

If your results differ, or a setting is unfair to another engine, please
[open an issue](https://github.com/infernitytech/sharplight/issues); the site will be corrected.

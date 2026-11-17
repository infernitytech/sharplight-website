---
title: Benchmark methodology
lead: How the numbers on the benchmarks page are measured, what they do and do not show, and how to run them yourself.
description: Method, hardware, versions and limits of the Sharplight benchmarks against llama.cpp, vLLM and onnxruntime.
permalink: /docs/benchmark-methodology/
---

The [benchmarks page]({{ '/benchmarks/' | relative_url }}) shows a selection. The complete record is
[docs/benchmarks.md](https://github.com/infernitytech/sharplight/blob/main/docs/benchmarks.md) in the repository: a log
written round by round as the engine was optimized, with before and after numbers, experiments that were dropped and
open gaps. The charts on this site copy numbers from that log and name the section.

## Principles

1. **Same input.** Engines run the same model files wherever they can read them. Where they cannot (vLLM does not read
   GGUF), the chart says so, and a separate comparison uses identical Hugging Face checkpoints.
2. **Official builds, fast settings.** llama.cpp's official CUDA and Vulkan builds with all layers on the GPU and flash
   attention; vLLM with its flash-attention backend and CUDA graphs; onnxruntime's CUDA provider with its default TF32,
   and TensorRT with engine build time excluded.
3. **Same GPU, one engine at a time.** Each engine runs alone on the benchmark GPU.
4. **Report the unfavorable rows.** Tables include every model measured, and each round ends with a list of gaps.
5. **Check that the output is the same.** Speed changes are accepted only when greedy output stays identical to the
   previous build, or when a difference is explained and recorded.

## Hardware and versions

| | |
|---|---|
| GPU | One of three NVIDIA RTX PRO 4500 Blackwell (32 GB, 200 W power limit), driver 595.91, CUDA 13.2 |
| CPU | 48 threads, shared with other jobs (host-side numbers are noisy) |
| Sharplight | Release build of the development branch at the commit named per chart, Vulkan provider |
| llama.cpp | b11177, official CUDA 13 and Vulkan builds, `-ngl 99 -fa 1` |
| vLLM | 0.33.0, flash-attn backend, CUDA graphs, prefix caching off |
| onnxruntime | onnxruntime-gpu 1.32, CUDA and TensorRT execution providers |

Numbers measured before 2026-11-15 in the log are from a different GPU (RTX PRO 6000 Blackwell Max-Q) and are not
comparable with these.

## The measurements

**Single stream** (sections 34, 36, 39).

- *Prompt processing* ("pp512", "pp2048"): prompt tokens per second for a prompt of that length.
- *Generation* ("tg"): output tokens per second, at a stated context depth.
- Sharplight: `--bench N`, several process runs; best prefill of 4 per run, median decode step.
- llama.cpp: `llama-bench -r 5`. vLLM: `bench/vllm_single.py`, median of 5.
- Sharplight's prefill value is a best-of while the others are medians or means. This favors Sharplight slightly and is
  stated on the charts.

**Serving throughput** (section 34.3). One server per engine with 64 slots and 512-token contexts. A load generator sends
prompts of about 250 random-word tokens and reads 128 output tokens at temperature 0, at 1, 4, 16 and 64 simultaneous
requests; 2 rounds each, median reported, with time to first token and inter-token latency.

**Long-prompt serving** (sections 38.4, 39.3). 16 slots, 4096-token context, 2000-token prompts, 16 output tokens. This
measures time to first token and prompt-processing throughput under load.

**ONNX latency** (section 37). `bench/onnx/parity_bench.py`: every measurement in its own process, engines of one model
back to back, rounds interleaved; the minimum latency is reported. Accuracy is checked against a reference in the same run.

## What the numbers do not show

- **Other hardware.** One GPU model. AMD, Intel and Apple GPUs are not covered.
- **Variance.** The machine is shared. Small-model generation in particular moved by more than 10 % between runs of the
  same build. Differences under about 5 % should be read as a tie.
- **Your workload.** Prompt lengths, output lengths and concurrency change which engine is ahead: Sharplight is ahead at
  short prompts and low to medium concurrency, vLLM at long prompts and at 64 streams on a small model.
- **Quality.** Quantized and full-precision weights differ in output quality; the serving chart that mixes them says so.
- **Apple silicon.** The Metal provider's first numbers (section 41) come from a virtualized CI machine and are indicative only.
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
[open an issue](https://github.com/infernitytech/sharplight/issues). Corrections are welcome and will be reflected on the site.

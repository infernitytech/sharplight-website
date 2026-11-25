---
title: Benchmarks
lead: Sharplight next to vLLM, llama.cpp and onnxruntime on the same weights, including where the other engine is ahead.
description: Reproducible Sharplight benchmarks against vLLM, llama.cpp and onnxruntime, with method, hardware, versions and caveats.
permalink: /benchmarks/
charts: [serving-vllm, ttft-vllm, batched-decode-cuda, batched-decode-vulkan, moe-offload, disk-moe, onnx-strict, onnx-fast, decode-llamacpp, serving-throughput, serving-throughput-moe, prefill-vllm, prefill-llamacpp]
---

## Read this first

- Our own measurements on one GPU model. Every comparison uses the same model files, the same precision class, the same
  procedure and the same statistic for every engine. Re-run the scripts on your hardware.
- Every chart names hardware, engine versions, Sharplight provider (CUDA or Vulkan), date and method, and links to its
  section of the engine's benchmark log. Raw results: `bench/results/`.
- Axes start at zero. Differences under about 5 % are noise.
- Other engines run official builds with their recommended fast settings. If a setting is unfair,
  [open an issue](https://github.com/infernitytech/sharplight/issues) and we re-measure.

## Summary

One NVIDIA RTX PRO 4500 Blackwell (32 GB), November 2026.

| Comparison | Sharplight relative to it | Log section |
|---|---|---|
| vLLM, serving throughput, 16 and 64 streams (identical weights) | 0.99-1.03x: parity | 104 |
| vLLM, time to first token at 16 / 64 streams | 0.44-0.55x / 0.64-0.70x of vLLM's time | 104 |
| llama.cpp Vulkan, batched generation, 16-64 sequences (same GGUF files, mean step time) | 1.63-3.19x | 107 |
| llama.cpp CUDA, batched generation, 16-64 sequences (same GGUF files, mean step time) | 1.09-1.96x | 107 |
| llama.cpp, MoE models with experts in system memory (mean of 5 runs) | 1.43-1.45x generation and 1.22-1.60x prompts on Vulkan; 0.99-1.60x on CUDA (gpt-oss-120b prompts 0.85x on CUDA, 0.81x on Vulkan) | 107, 111 |
| llama.cpp, MoE models larger than memory, experts read from disk (same GGUF files) | 0.75-1.56x | 85, 87 |
| onnxruntime CUDA provider, ONNX models at the same precision setting | 0.06-0.88x of its latency (f32), 0.37-0.87x (TF32 class); TensorRT is ahead on seven of 19 rows | 99 |
| llama.cpp, single-stream generation | 0.88-0.99x of CUDA, 0.99-1.09x of Vulkan | 34 |

## Serving against vLLM

The same Hugging Face checkpoints on both engines; Sharplight on its CUDA provider.

{% include benchmark-chart.html id="serving-vllm" %}

{% include benchmark-chart.html id="ttft-vllm" %}

## Batched generation against llama.cpp

The same GGUF files; each Sharplight provider against llama.cpp's backend for the same API, with the same procedure and
the mean step time on both sides.

{% include benchmark-chart.html id="batched-decode-cuda" %}

{% include benchmark-chart.html id="batched-decode-vulkan" %}

## Models larger than the GPU

Mixture-of-experts models whose experts do not fit in 32 GB of VRAM: experts in system memory, or read from disk when the
model is larger than memory and VRAM together.

{% include benchmark-chart.html id="moe-offload" %}

{% include benchmark-chart.html id="disk-moe" %}

## ONNX

Sharplight's CUDA provider against onnxruntime's CUDA provider at the same precision setting. "Strict" (Sharplight's
default) and onnxruntime with TF32 off keep f32 accuracy in matrix products; Sharplight's opt-in "fast" mode and
onnxruntime's default TF32 are in the same reduced-precision class.

{% include benchmark-chart.html id="onnx-strict" %}

{% include benchmark-chart.html id="onnx-fast" %}

## Earlier measurements

Measured with the Vulkan provider on 2026-11-15 to 2026-11-17 (log sections 34-40) and not yet repeated with the current
build.

{% include benchmark-chart.html id="decode-llamacpp" %}

{% include benchmark-chart.html id="serving-throughput" %}

{% include benchmark-chart.html id="serving-throughput-moe" %}

{% include benchmark-chart.html id="prefill-vllm" %}

{% include benchmark-chart.html id="prefill-llamacpp" %}

## Where Sharplight is behind

- **Inter-token latency tail against vLLM at 16 streams**: p99 48-85 ms against 21-28 ms, mean 2-5 % higher (section 104).
- **Prompt processing against vLLM** (Vulkan provider, section 40): 0.70-0.90x on Qwen3-8B (bf16 and FP8) at 512-8192
  tokens, 0.74-0.88x on every model at 8192 tokens.
- **Gemma 4 31B on CUDA against llama.cpp**: 512-token prompts 0.89x, single-stream generation 0.96x, generation after a
  128K-token prompt 0.80x (section 79).
- **Qwen3-Coder-Next with experts in system memory, CUDA**: generation 0.99x of llama.cpp by the mean of 5 runs; the
  first run after a load is slower (about 80 against 96 tokens/s), the later ones about 5 % ahead (section 111).
- **gpt-oss-120b MXFP4 with experts in system memory, CUDA**: 512-token prompts 0.85x of llama.cpp (544 against 640
  tokens/s; 0.96x when all experts are page-locked, as llama.cpp's `-lm none` keeps them in memory), generation 1.06x
  ahead (llama-bench's mean of 5 runs on both sides, section 111). On Vulkan, prompts 0.81x and generation 1.19x.
- **Gemma 4 31B, one sequence, CUDA**: 0.98x of llama.cpp in the batched-generation test (section 107).
- **GLM-5.2 from disk**: 0.75x of llama.cpp in a first run with an empty expert cache; the first prompt of DeepSeek-V4-Flash
  takes 6.0 s against llama.cpp's 2.0 s (section 87).
- **TensorRT**: ahead on convnext-tiny, mobilesam, yolov10n, ssd-10, segformer-b0 (batch 1) and resnet50 (batch 8) by
  1.08-1.23x (section 99).
- **Single-stream generation against llama.cpp CUDA** (Vulkan provider, section 34): 1 to 12 % behind, most on the smallest
  models.

## Not measured here

- **Other GPUs.** Tests pass on an AMD integrated GPU and a software Vulkan driver; no published benchmarks for AMD or
  Intel yet.
- **Apple silicon.** The Metal provider has only been measured on a virtualized CI machine (log section 41), which is
  indicative only and not charted.
- **CPU.** Comparisons from an earlier machine are in the log; they will be added when re-measured.
- **Quality.** Correctness is covered by reference comparisons: [Models]({{ '/models/' | relative_url }}).

## Reproduce

Scripts are in `bench/`; model paths are placeholders.

```bash
# Serving against vLLM (section 104): one server per engine, then the load generator and the batched text check
FIRST=1 CONCS="16 64" ROUNDS=1 bench/s16_serve.sh sharplight qwen <Qwen3-8B-FP8> "16 64" --provider cuda
FIRST=1 CONCS="16 64" ROUNDS=1 bench/s16_serve.sh vllm qwen <Qwen3-8B-FP8> "16 64" --gpu-memory-utilization 0.6

# Batched generation and experts in system memory against llama.cpp (section 107), both engines per run
bench/same_stat_batched.sh out qwen3-8b <Qwen3-8B-Q4_K_M.gguf> cuda 1,16,32,48,64 A sl-first
bench/same_stat_offload.sh out coder-next <Qwen3-Coder-Next-Q4_K_M.gguf> vulkan 16 B llama-first

# Experts on disk (sections 85 and 87)
sharplight <model.gguf> --provider cuda --cpu-offload --experts-on-disk --expert-cache 24G --ctx 4096 -p "The capital of France is" -n 24

# ONNX (section 99)
python3 bench/onnx/parity_bench.py run gpu.jsonl --rounds 2 --engines sl-cuda,sl-cuda-fast,ort-cuda,ort-cuda-strict
```

Full log, including dropped experiments and open gaps:
[docs/benchmarks.md](https://github.com/infernitytech/sharplight/blob/main/docs/benchmarks.md).
[Method]({{ '/docs/benchmark-methodology/' | relative_url }})

---
title: Benchmarks
lead: Sharplight next to llama.cpp, vLLM and onnxruntime, including where the other engine is ahead.
description: Reproducible Sharplight benchmarks against llama.cpp, vLLM and onnxruntime, with method, hardware, versions and caveats.
permalink: /benchmarks/
charts: [decode-llamacpp, prefill-llamacpp, serving-throughput, serving-throughput-moe, vllm-decode, prefill-vllm, vllm-ttft, onnx-latency]
---

## Read this first

- Our own measurements on one GPU model, with the same model files and settings for every engine. Re-run the scripts on your hardware.
- Every chart names hardware, engine versions, date and method, and links to its section of the engine's benchmark log.
  Raw results: `bench/results/`.
- Axes start at zero. Differences under about 5 % are noise.
- Other engines run official builds with their recommended fast settings. If a setting is unfair,
  [open an issue](https://github.com/infernitytech/sharplight/issues) and we re-measure.

## Summary

One NVIDIA RTX PRO 4500 (32 GB), November 2026. Sharplight runs on Vulkan in every test.

| Comparison | Sharplight relative to it |
|---|---|
| llama.cpp CUDA, single-stream generation (same GGUF files) | 0.88-0.99x |
| llama.cpp Vulkan, single-stream generation | 0.99-1.09x |
| llama.cpp CUDA, prompt processing (same GGUF files, 512-8192 tokens) | 0.84-1.65x: ahead on Qwen3-0.6B, mixed on Llama-3.2-1B, 0.93-0.95x on Qwen3-8B |
| llama.cpp server, 1 to 64 streams | 1.1-4.4x |
| vLLM, generation (identical weights) | 0.95-1.08x |
| vLLM, prompt processing (identical weights, 512-8192 tokens) | 0.70-2.02x: 0.87-0.90x on Qwen3-8B bf16, 0.70-0.74x on Qwen3-8B FP8 |
| onnxruntime CUDA provider, batch 1 | faster on most measured models; TensorRT is ahead on several |

## llama.cpp

Same GGUF files; llama.cpp with its CUDA and its Vulkan backend.

{% include benchmark-chart.html id="decode-llamacpp" %}

{% include benchmark-chart.html id="prefill-llamacpp" %}

## Serving

One server per engine, the same load generator, 1 to 64 simultaneous requests.

{% include benchmark-chart.html id="serving-throughput" %}

{% include benchmark-chart.html id="serving-throughput-moe" %}

Here vLLM ran bf16 checkpoints and the other two engines quantized GGUF files. The next section removes that difference.

## vLLM on identical weights

The same Hugging Face checkpoints (bf16; FP8 for the FP8 checkpoint). vLLM on CUDA.

{% include benchmark-chart.html id="vllm-decode" %}

{% include benchmark-chart.html id="prefill-vllm" %}

{% include benchmark-chart.html id="vllm-ttft" %}

## ONNX

{% include benchmark-chart.html id="onnx-latency" %}

"Strict" (default) keeps f32 accuracy in matrix products. "Fast" (opt-in) is in the accuracy class of TF32, the default
of onnxruntime's CUDA provider, and is the like-for-like comparison.

## Where Sharplight is behind

- **Prompt processing against vLLM**: 0.70-0.90x on Qwen3-8B (bf16 and FP8) at every length, 0.87x on the two small
  models at 8192 tokens; hence 0.68-0.78x total throughput at 16 streams with long prompts.
- **Time to first token on 8B models**: 300 ms against vLLM's 239 ms on Qwen3-8B for one stream; also later at 16 streams.
- **64 streams on Llama-3.2-1B**: 0.75x of vLLM.
- **Single-stream generation against llama.cpp CUDA**: 1 to 12 % behind, most on the smallest models.
- **Prompt processing against llama.cpp CUDA**: 0.93-0.95x on Qwen3-8B Q4_K_M, 0.84x on Llama-3.2-1B at 512 tokens.
- **TensorRT**: ahead on ConvNeXt, YOLOv10n, MobileSAM and other rows.

## Not measured here

- **Other GPUs.** Tests pass on an AMD integrated GPU and a software Vulkan driver; no published benchmarks for AMD or
  Intel yet.
- **Apple silicon.** The Metal provider has only been measured on a virtualized CI machine (log section 41), which is
  indicative only and not charted.
- **CPU.** Comparisons from an earlier machine are in the log; they will be added when re-measured.
- **Quality.** Correctness is covered by reference comparisons: [Models]({{ '/models/' | relative_url }}).

## Reproduce

Scripts are in `bench/`. The vLLM comparison:

```bash
export SHARPLIGHT_VK_DEVICES=1 CUDA_VISIBLE_DEVICES=1 VLLM_VENV=<venv> HF_DIR=<checkpoints> OUT_DIR=bench/results/mine
bench/s38_all.sh vllm
bench/s38_all.sh sharplight after
python3 bench/s38_summarize.py bench/results/mine after
```

llama.cpp: `bench/s34_single_all.sh` (single stream), `bench/s16_serve.sh` (serving). ONNX: `bench/onnx/parity_bench.py`.
Full log, including dropped experiments and open gaps:
[docs/benchmarks.md](https://github.com/infernitytech/sharplight/blob/main/docs/benchmarks.md).
[Method]({{ '/docs/benchmark-methodology/' | relative_url }})

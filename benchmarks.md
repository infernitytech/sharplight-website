---
title: Benchmarks
lead: Sharplight next to llama.cpp, vLLM and onnxruntime, including where the other engine is ahead.
description: Reproducible Sharplight benchmarks against llama.cpp, vLLM and onnxruntime, with method, hardware, versions and caveats.
permalink: /benchmarks/
charts: [decode-llamacpp, prefill-llamacpp, serving-throughput, serving-throughput-moe, vllm-decode, vllm-prefill, vllm-ttft, onnx-latency]
---

## Read this first

- Our own measurements, on one GPU model, on a machine shared with other jobs. Re-run the scripts on your hardware.
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
| llama.cpp CUDA, prompt processing at 512 tokens | 0.86-1.22x: ahead on four of seven models, behind on gpt-oss-20b |
| llama.cpp server, 1 to 64 streams | 1.1-4.4x |
| vLLM, generation (identical weights) | 0.95-1.08x |
| vLLM, prompt processing at 2048 tokens (identical weights) | 0.73-1.01x: behind on three of four models |
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

{% include benchmark-chart.html id="vllm-prefill" %}

{% include benchmark-chart.html id="vllm-ttft" %}

## ONNX

{% include benchmark-chart.html id="onnx-latency" %}

"Strict" (default) keeps f32 accuracy in matrix products. "Fast" (opt-in) is in the accuracy class of TF32, the default
of onnxruntime's CUDA provider, and is the like-for-like comparison.

## Where Sharplight is behind

- **Prompt processing against vLLM**: 0.73-0.92x at 2048 tokens on three of four models, 0.73-0.90x at 8192 tokens;
  hence 0.68-0.78x total throughput at 16 streams with long prompts.
- **Time to first token on 8B models**: 300 ms against vLLM's 239 ms on Qwen3-8B for one stream; also later at 16 streams.
- **64 streams on Llama-3.2-1B**: 0.75x of vLLM.
- **Single-stream generation against llama.cpp CUDA**: 1 to 12 % behind, most on the smallest models.
- **gpt-oss-20b prompt processing**: 0.83-0.86x of llama.cpp CUDA.
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

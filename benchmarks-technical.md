---
title: Technical benchmarks
lead: Sharplight next to vLLM, llama.cpp, onnxruntime, TensorRT and reference implementations on the same weights, with hardware, procedure, statistic and the rows where the other engine is ahead.
description: Reproducible Sharplight benchmarks against vLLM, llama.cpp, onnxruntime, TensorRT and the official SeedVR2 implementation, with method, hardware, versions and caveats.
permalink: /benchmarks/technical/
charts: [serving-vllm, ttft-vllm, serving-vllm-256, nvfp4-vllm, prefill-vllm, batched-decode-cuda, batched-decode-vulkan, moe-offload-latest, moe-offload, disk-moe, decode-llamacpp, serving-throughput, serving-throughput-moe, prefill-llamacpp, onnx-strict, onnx-fast, seedvr2-pytorch]
---

[← Overview for decision makers]({{ '/benchmarks/' | relative_url }})

<ul class="toc-inline" aria-label="Sections">
  <li><a href="#read-this-first">Read this first</a></li>
  <li><a href="#summary">Summary</a></li>
  <li><a href="#against-vllm">vLLM</a></li>
  <li><a href="#against-llamacpp">llama.cpp</a></li>
  <li><a href="#against-onnxruntime-and-tensorrt">onnxruntime and TensorRT</a></li>
  <li><a href="#video-image-and-audio-against-reference-implementations">Video, image, audio</a></li>
  <li><a href="#where-sharplight-is-behind">Where Sharplight is behind</a></li>
  <li><a href="#not-measured-here">Not measured</a></li>
  <li><a href="#reproduce">Reproduce</a></li>
</ul>

## Read this first

- Our own measurements on one GPU model. Every comparison uses the same model files, the same precision class, the same
  procedure and the same statistic for every engine. Re-run the scripts on your hardware.
- Every chart names hardware, engine versions, Sharplight provider (CUDA or Vulkan), date and method, and links to its
  section of the engine's benchmark log. Raw results: `bench/results/`.
- Axes start at zero. Differences under about 5 % are noise.
- Other engines run official builds with their recommended fast settings. If a setting is unfair,
  [open an issue](https://github.com/infernitytech/sharplight/issues) and we re-measure.
- Principles, hardware and versions in one place: [benchmark methodology]({{ '/docs/benchmark-methodology/' | relative_url }}).

## Summary

One NVIDIA RTX PRO 4500 Blackwell (32 GB), November 2026. Ratios are Sharplight's speed relative to the other engine
(above 1 = Sharplight faster) unless the row says "of its time".

| Comparison | Sharplight relative to it | Log section |
|---|---|---|
| vLLM, serving throughput, 16 and 64 streams (identical weights) | 0.99-1.03x: parity | 104 |
| vLLM, time to first token at 16 / 64 streams | 0.44-0.55x / 0.64-0.70x of vLLM's time | 104 |
| vLLM, serving throughput at 64-256 streams, mixed request lengths, same KV-cache size | 0.92-1.13x at 64-128 streams, 1.04-1.22x at 256 (one round) | 105 |
| vLLM, NVFP4 (4-bit) checkpoints at 1 / 16 / 64 streams | 1.07-1.58x / 0.97-1.01x / 0.82-0.85x | 106 |
| llama.cpp Vulkan, batched generation, 16-64 sequences (same GGUF files, mean step time) | 1.63-3.19x | 107 |
| llama.cpp CUDA, batched generation, 16-64 sequences (same GGUF files, mean step time) | 1.09-1.96x | 107 |
| llama.cpp, MoE models with experts in system memory (mean of 5 runs) | Vulkan: generation 1.19-1.49x, prompts 0.81-1.60x; CUDA: generation 0.99-1.06x, prompts 0.85-1.60x | 107, 111 |
| llama.cpp, MoE models larger than memory, experts read from disk (same GGUF files) | 0.75-1.56x | 85, 87 |
| onnxruntime CUDA provider, ONNX models at the same precision setting | 0.06-0.88x of its latency (f32), 0.37-0.87x (TF32 class); TensorRT is ahead on six of 19 rows | 99 |
| Official SeedVR2 inference (PyTorch), 3B, 33 frames, end to end | 0.88x of its time at 480p output, 0.70x at 720p; 960p output runs only on Sharplight | 108, 110 |
| llama.cpp, single-stream generation (earlier build) | 0.88-0.99x of CUDA, 0.99-1.09x of Vulkan | 34 |

## Against vLLM

<dl class="setup">
  <dt>Hardware</dt><dd>One NVIDIA RTX PRO 4500 Blackwell (32 GB, 200 W power limit), CUDA 13.2.</dd>
  <dt>Model files</dt><dd>The same Hugging Face checkpoints on both engines: Qwen/Qwen3-8B-FP8 (block-scaled FP8), openai/gpt-oss-20b (MXFP4 experts, bf16 rest), meta-llama/Llama-3.1-8B-Instruct (bf16); for 4-bit, RedHatAI/Qwen3-8B-NVFP4 and RedHatAI/Qwen3-30B-A3B-NVFP4.</dd>
  <dt>Engines</dt><dd>Sharplight CUDA provider; vLLM 0.33.0, prefix caching off.</dd>
  <dt>Procedure</dt><dd>One server per engine and model; the same load generator (<code>bench/loadgen.py</code>) sends the same requests to both, closed loop, temperature 0; a batched text check after every run.</dd>
  <dt>Statistic</dt><dd>Output tokens per second over the run (or over the steady window at 64-256 streams) and the median time to first token, the same on both engines.</dd>
  <dt>Log</dt><dd><a href="https://github.com/infernitytech/sharplight/blob/develop/docs/benchmarks.md#1043-serving-develop-against-r44-against-vllm-with-the-text-check">104.3</a>, <a href="https://github.com/infernitytech/sharplight/blob/develop/docs/benchmarks.md#1052-saturation-closed-loop-fixed-and-mixed-lengths">105.2</a>, <a href="https://github.com/infernitytech/sharplight/blob/develop/docs/benchmarks.md#1066-serving-against-vllm-033">106.6</a>, <a href="https://github.com/infernitytech/sharplight/blob/develop/docs/benchmarks.md#409-prefill-with-an-identical-procedure-sharplight-vllm-llamacpp">40.9</a></dd>
</dl>

### 16 and 64 streams

{% include benchmark-chart.html id="serving-vllm" %}

{% include benchmark-chart.html id="ttft-vllm" %}

### Up to 256 streams

{% include benchmark-chart.html id="serving-vllm-256" %}

### 4-bit NVFP4 checkpoints

{% include benchmark-chart.html id="nvfp4-vllm" %}

### Prompt processing (earlier build)

Measured with the Vulkan provider on 2026-11-17 (log section 40) and not yet repeated with the current build.

{% include benchmark-chart.html id="prefill-vllm" %}

## Against llama.cpp

<dl class="setup">
  <dt>Hardware</dt><dd>One NVIDIA RTX PRO 4500 Blackwell (32 GB, 200 W power limit); for the models larger than the GPU an AMD EPYC 7443 with 10 threads and 62 GB of memory, and an NVMe SSD reading 7.4 GB/s for experts on disk.</dd>
  <dt>Model files</dt><dd>The same GGUF files on both engines (Q4_K_M, Q8_0, MXFP4, UD-IQ2_XXS and the other types named per chart).</dd>
  <dt>Engines</dt><dd>Each Sharplight provider against llama.cpp's backend for the same API: CUDA against llama.cpp's CUDA 13 build, Vulkan against its Vulkan build; llama.cpp b11177, <code>-ngl 99 -fa 1</code>.</dd>
  <dt>Procedure</dt><dd>Batched generation: llama-batched-bench's procedure on both (256-token prompts, 64 decode steps, logits of every sequence copied to the host). Models larger than the GPU: llama-bench's procedure on both (one warm-up, 5 runs of pp512 and of tg64 at depth 512), llama.cpp at its fastest <code>-ncmoe</code>.</dd>
  <dt>Statistic</dt><dd>Mean step time (batched) and mean of the per-run tokens per second (llama-bench), on both engines; two rounds with alternating order where stated.</dd>
  <dt>Log</dt><dd><a href="https://github.com/infernitytech/sharplight/blob/develop/docs/benchmarks.md#ss1-batched-decode-dense-gguf-q4_k_m-all-layers-on-the-gpu">107 SS.1</a>, <a href="https://github.com/infernitytech/sharplight/blob/develop/docs/benchmarks.md#ss2-moe-with-cpu-expert-offload">107 SS.2</a>, <a href="https://github.com/infernitytech/sharplight/blob/develop/docs/benchmarks.md#off3-results-against-llamacpp-toks-mean--sd-of-5-runs-rounds-a--b">111 OFF.3</a>, <a href="https://github.com/infernitytech/sharplight/blob/develop/docs/benchmarks.md#854-against-llamacpp-under-the-same-limits">85.4</a>, <a href="https://github.com/infernitytech/sharplight/blob/develop/docs/benchmarks.md#342-single-stream">34</a></dd>
</dl>

### Batched generation

{% include benchmark-chart.html id="batched-decode-cuda" %}

{% include benchmark-chart.html id="batched-decode-vulkan" %}

### Models larger than the GPU

Mixture-of-experts models whose experts do not fit in 32 GB of VRAM: experts in system memory, or read from disk when the
model is larger than memory and VRAM together.

{% include benchmark-chart.html id="moe-offload-latest" %}

{% include benchmark-chart.html id="moe-offload" %}

{% include benchmark-chart.html id="disk-moe" %}

### Single stream, serving and prompts (earlier build)

Measured with the Vulkan provider on 2026-11-15 to 2026-11-17 (log sections 34-40) and not yet repeated with the current
build.

{% include benchmark-chart.html id="decode-llamacpp" %}

{% include benchmark-chart.html id="serving-throughput" %}

{% include benchmark-chart.html id="serving-throughput-moe" %}

{% include benchmark-chart.html id="prefill-llamacpp" %}

## Against onnxruntime and TensorRT

<dl class="setup">
  <dt>Hardware</dt><dd>One NVIDIA RTX PRO 4500 Blackwell (32 GB, 200 W power limit), CUDA 13.2.</dd>
  <dt>Model files</dt><dd>The same ONNX files on every engine (17 models, 23 model and batch combinations).</dd>
  <dt>Engines</dt><dd>Sharplight CUDA provider; onnxruntime-gpu 1.32.0 with the CUDA execution provider (cuDNN 9.28) and the TensorRT 10.16 execution provider (engine build time excluded).</dd>
  <dt>Precision</dt><dd>Compared within one precision class: Sharplight "strict" (its default) against onnxruntime with TF32 off; Sharplight "fast" against onnxruntime's default TF32 and TensorRT with TF32 tactics.</dd>
  <dt>Procedure</dt><dd><code>bench/onnx/parity_bench.py</code>: every measurement in its own process, engines of one model back to back, two interleaved rounds, outputs checked against onnxruntime's.</dd>
  <dt>Statistic</dt><dd>Minimum wall-clock latency of one run including the read-back of every output, minimum over the rounds, on every engine.</dd>
  <dt>Log</dt><dd><a href="https://github.com/infernitytech/sharplight/blob/develop/docs/benchmarks.md#995-onnx-on-cuda-against-onnxruntime-and-tensorrt">99.5</a> (TensorRT: 98.3)</dd>
</dl>

{% include benchmark-chart.html id="onnx-strict" %}

{% include benchmark-chart.html id="onnx-fast" %}

## Video, image and audio against reference implementations

<dl class="setup">
  <dt>Hardware</dt><dd>One NVIDIA RTX PRO 4500 Blackwell (32 GB, 200 W power limit), driver 595.112, CUDA 13.2.</dd>
  <dt>Model files</dt><dd>The official SeedVR2 checkpoints (<code>seedvr2_ema_3b.pth</code>, <code>ema_vae.pth</code>; the 7B as <code>seedvr2_ema_7b_fp16.safetensors</code>), loaded unchanged by both.</dd>
  <dt>Engines</dt><dd>Sharplight CUDA and Vulkan providers, reduced precision (f16 products); the official ByteDance-Seed/SeedVR inference code on PyTorch 2.14 with bf16 autocast and flash attention, in its fastest setting that fits in 32 GB.</dd>
  <dt>Procedure</dt><dd>The same 30 fps clip, 33 frames in one batch (65 and 17 in the extra rows), 2x upscaling with the wavelet colour fix, seed 42; end to end from reading the input video to writing the output video.</dd>
  <dt>Statistic</dt><dd>Median of 5 runs after one warm-up, on both; peak GPU memory sampled every 100 ms.</dd>
  <dt>Log</dt><dd><a href="https://github.com/infernitytech/sharplight/blob/develop/docs/benchmarks.md#1104-end-to-end">110.4</a>, <a href="https://github.com/infernitytech/sharplight/blob/develop/docs/benchmarks.md#1081-results">108.1</a></dd>
</dl>

{% include benchmark-chart.html id="seedvr2-pytorch" %}

### Further SeedVR2 cases (earlier build)

Measured with the build of log section 108, before the convolution change of section 110 that took the 480p case from
15.7 s to 8.9 s; not yet repeated. End to end, median of 5 runs, Sharplight on CUDA.

| Case | Sharplight | Official PyTorch | Peak memory (Sharplight / PyTorch) |
|---|---:|---:|---|
| 3B, 65 frames, 416 x 240 → 832 x 480 | 30.80 s | 19.35 s | 26.1 / 30.7 GiB |
| 3B, 33 frames, 832 x 480 → 1664 x 960 | 72.20 s (Vulkan 73.44 s) | out of memory in all three settings | 30.8 GiB / - |
| 3B, 33 frames, 960 x 544 → 1920 x 1088 | out of memory | out of memory | - |
| 7B, 17 frames, 416 x 240 → 832 x 480 | 8.11 s | 5.99 s | 29.8 / 30.0 GiB |

Output against PyTorch's frames (same input frames and noise): worst frame 48.9 dB (3B, section 110.5) and 44.8 dB (7B,
section 108.1).

### Image generation and audio

Correctness of image, speech and audio models is checked against their reference implementations
([Models]({{ '/models/' | relative_url }})). Like-for-like speed comparisons against those implementations are not
published yet.

## Where Sharplight is behind

- **Inter-token latency tail against vLLM at 16 streams**: p99 48-85 ms against 21-28 ms, mean 2-5 % higher (section 104).
- **NVFP4 checkpoints against vLLM at 64 streams**: 0.85x (Qwen3-8B) and 0.82x (Qwen3-30B-A3B MoE) of vLLM's throughput, and
  0.97x for Qwen3-8B at 16 streams; vLLM ran its CUTLASS FP4 kernels (section 106).
- **Llama-3.1-8B (bf16) against vLLM at 64-128 streams with mixed request lengths**: 0.99x and 0.92x; at 256 streams, where
  the KV cache is full on both engines, Sharplight queues instead of preempting and its median time to first token is 4.0 s
  against 2.1 s (section 105).
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
- **SeedVR2 7B and 65-frame clips** (earlier build, section 108): 1.35x and 1.59x of the official PyTorch inference's time;
  not yet repeated with the faster convolutions of section 110. 1920 x 1088 output does not fit in 32 GB (nor for PyTorch).
- **Single-stream generation against llama.cpp CUDA** (Vulkan provider, section 34): 1 to 12 % behind, most on the smallest
  models.

## Not measured here

- **Other GPUs.** Tests pass on an AMD integrated GPU and a software Vulkan driver; no published benchmarks for AMD or
  Intel yet.
- **Apple silicon.** The Metal provider has only been measured on a virtualized CI machine (log section 41), which is
  indicative only and not charted.
- **CPU.** Comparisons from an earlier machine are in the log; they will be added when re-measured.
- **Image generation and audio speed** against their reference implementations (see above).
- **Quality.** Correctness is covered by reference comparisons: [Models]({{ '/models/' | relative_url }}).

## Reproduce

Scripts are in `bench/`; model paths are placeholders.

```bash
# Serving against vLLM (section 104): one server per engine, then the load generator and the batched text check
FIRST=1 CONCS="16 64" ROUNDS=1 bench/s16_serve.sh sharplight qwen <Qwen3-8B-FP8> "16 64" --provider cuda
FIRST=1 CONCS="16 64" ROUNDS=1 bench/s16_serve.sh vllm qwen <Qwen3-8B-FP8> "16 64" --gpu-memory-utilization 0.6

# 64-256 streams with mixed lengths (section 105); vLLM: --gpu-memory-utilization 0.9 --max-num-batched-tokens 2048
SLOTS=256 CTX_PER_SLOT=2560 PER_OVERRIDE=8 LOADGEN_ARGS="--gauges --length-mix" \
  bench/s16_serve.sh sharplight qwen <Qwen3-8B-FP8> "64 128 256" --provider cuda --max-queue 4096 --kv-tokens 127632

# NVFP4 against vLLM (section 106)
QUIET_GPU=1 bench/s16_serve.sh sharplight q8 <Qwen3-8B-NVFP4.slm> "1 16 64" --provider cuda
QUIET_GPU=1 VLLM_VENV=<venv> bench/s16_serve.sh vllm q8 <Qwen3-8B-NVFP4> "1 16 64" --gpu-memory-utilization 0.6 --linear-backend cutlass

# Batched generation and experts in system memory against llama.cpp (sections 107 and 111), both engines per run
bench/same_stat_batched.sh out qwen3-8b <Qwen3-8B-Q4_K_M.gguf> cuda 1,16,32,48,64 A sl-first
bench/same_stat_offload.sh out coder-next <Qwen3-Coder-Next-Q4_K_M.gguf> vulkan 16 B llama-first
bench/offload_selected_experts.sh out A sl-first oss cn q122

# Experts on disk (sections 85 and 87)
sharplight <model.gguf> --provider cuda --cpu-offload --experts-on-disk --expert-cache 24G --ctx 4096 -p "The capital of France is" -n 24

# ONNX (section 99)
python3 bench/onnx/parity_bench.py run gpu.jsonl --rounds 2 --engines sl-cuda,sl-cuda-fast,ort-cuda,ort-cuda-strict

# SeedVR2 against the official inference (sections 108 and 110): both engines, then Sharplight with the current build
MODEL=<SeedVR2-3B> INPUTS=<clips> OUT=out CASES="fox-240p-33:416:240:832:480 fox-360p-33:640:360:1280:720" bench/results/seedvr2/run-bench.sh
VideoEnhancementBench --model <SeedVR2-3B> --provider cuda --input fox-240p-33.mp4 --width 832 --height 480 --runs 5 --warmup 1 --reduced-precision
```

Full log, including dropped experiments and open gaps:
[docs/benchmarks.md](https://github.com/infernitytech/sharplight/blob/develop/docs/benchmarks.md).
[Method]({{ '/docs/benchmark-methodology/' | relative_url }})

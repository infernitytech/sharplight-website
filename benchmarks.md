---
title: Performance
lead: >-
  Sharplight measured against the engines teams use today, on the same GPU and the same model files. In short: level with
  the leading data-center engine when many people share a GPU, clearly ahead of the most common local engine, and open
  about where we still trail.
description: >-
  How fast Sharplight is, in plain terms: serving at parity with vLLM, more people per GPU than llama.cpp, models larger
  than the GPU, video enhancement, and where Sharplight is still catching up.
permalink: /benchmarks/
---

<div class="stat-grid">
  <div class="stat">
    <div class="big">Level</div>
    <div class="what">with vLLM when many people share one GPU</div>
    <p class="ctx">0.99-1.03x of vLLM's output on three models with 16 and 64 people at once. vLLM is the widely used open-source engine for data-center serving.</p>
    <div class="src">Section 104 · <a href="{{ '/benchmarks/technical/' | relative_url }}#serving-vllm">details</a></div>
  </div>
  <div class="stat">
    <div class="big">About half</div>
    <div class="what">the wait for the first word, with 16 people at once</div>
    <p class="ctx">0.44-0.55x of vLLM's waiting time on the same models and the same load.</p>
    <div class="src">Section 104 · <a href="{{ '/benchmarks/technical/' | relative_url }}#ttft-vllm">details</a></div>
  </div>
  <div class="stat">
    <div class="big">1.6-3.2&times;</div>
    <div class="what">text per GPU with 16-64 people at once, compared with llama.cpp</div>
    <p class="ctx">Through Vulkan, which runs on NVIDIA, AMD and Intel GPUs; 1.1-2.0x through NVIDIA's CUDA. llama.cpp is the most widely used engine for running models on your own hardware.</p>
    <div class="src">Section 107 · <a href="{{ '/benchmarks/technical/' | relative_url }}#batched-decode-vulkan">details</a></div>
  </div>
  <div class="stat">
    <div class="big">1.2-1.5&times;</div>
    <div class="what">faster answers from models larger than the GPU, compared with llama.cpp</div>
    <p class="ctx">Through Vulkan, with most of the model in ordinary system memory. Through NVIDIA's CUDA the two are level (0.99-1.06x).</p>
    <div class="src">Sections 107, 111 · <a href="{{ '/benchmarks/technical/' | relative_url }}#moe-offload-latest">details</a></div>
  </div>
  <div class="stat">
    <div class="big">1.4&times;</div>
    <div class="what">faster video enhancement at 720p than the official implementation</div>
    <p class="ctx">SeedVR2 with the same model files; 1.14x at 480p. At 960p the official implementation runs out of GPU memory; Sharplight completes the job.</p>
    <div class="src">Sections 108, 110 · <a href="{{ '/benchmarks/technical/' | relative_url }}#seedvr2-pytorch">details</a></div>
  </div>
  <div class="stat">
    <div class="big">23 of 23</div>
    <div class="what">image, speech and language test cases run faster than with onnxruntime</div>
    <p class="ctx">The same ONNX model files at the same precision on NVIDIA. NVIDIA's TensorRT is still ahead on 6 of 19.</p>
    <div class="src">Section 99 · <a href="{{ '/benchmarks/technical/' | relative_url }}#onnx-strict">details</a></div>
  </div>
</div>

## What this means for you

<ul class="takeaways">
  <li><strong>Serving at vLLM's level.</strong> When many people share one GPU, Sharplight produces as much text per
  second as vLLM, and the first word of an answer appears in about half the time with 16 people at once. With 256 people
  at once and requests of mixed length it measured 1.04-1.22x of vLLM's output (one round per engine).</li>
  <li><strong>More people per GPU than llama.cpp.</strong> With 16-64 people sharing one GPU, the same model files produce
  1.6-3.2x as much text per second through Vulkan and 1.1-2.0x through NVIDIA's CUDA. On the same hardware, each person's
  answer is written that much faster.</li>
  <li><strong>Use the GPUs you can buy.</strong> Through Vulkan, the open graphics standard, Sharplight runs on NVIDIA, AMD
  and Intel GPUs, and on Apple silicon through Metal. Our published numbers are from one NVIDIA GPU so far; AMD and Intel
  GPUs pass our tests but have not been benchmarked yet.</li>
  <li><strong>Bigger models on the hardware you have.</strong> Models too large for the GPU keep most of their weights in
  ordinary system memory and still write answers far faster than people read. A 405 GB model even runs on one 32 GB GPU
  with 62 GB of memory by reading from disk: slowly, a little under one word per second, but it runs.</li>
  <li><strong>Video at higher resolutions.</strong> For video enhancement Sharplight needed about a quarter less GPU memory
  than the official implementation in our tests, and it finishes 960p output on a 32 GB GPU where the official
  implementation runs out of memory.</li>
  <li><strong>One engine for every kind of model.</strong> Text, images, video, speech and audio, and models in the
  standard ONNX format run on the same engine, on NVIDIA through CUDA and on any Vulkan GPU, from .NET.</li>
  <li><strong>No per-token fees.</strong> Sharplight runs on your own hardware and the engine is open source (MIT), so cost
  does not grow with every request.</li>
</ul>

{% include benchmark-simple.html id="many-users" %}

{% include benchmark-simple.html id="larger-than-gpu" %}

{% include benchmark-simple.html id="video" %}

<section class="catching-up" markdown="1">

## Where we are still catching up

- **Even pacing at moderate load.** With 16 people at once, the longest pauses between words (the slowest 1 %) are longer
  than with vLLM: 48-85 against 21-28 milliseconds. On average the pace is 2-5 % slower.
- **4-bit models with many people (NVFP4).** With 64 people at once Sharplight produces 0.82-0.85x of vLLM's output; it
  is level with 16 and ahead with one.
- **Reading long documents.** In our last measurement Sharplight read long prompts at 0.70-0.90x of vLLM's speed
  (an earlier build, not yet re-measured).
- **One very large model reading its prompt.** gpt-oss-120b with most of it in system memory reads prompts at 0.81-0.85x
  of llama.cpp's speed (0.96x with all of its weights locked in memory, as llama.cpp does).
- **Single person on NVIDIA's CUDA.** On some models Sharplight is a few per cent behind llama.cpp; Gemma 4 31B after a
  very long input (about 100,000 words) is at 0.80x.
- **Models read from disk.** One of three such models answers slower than with llama.cpp (0.75x), and on another the first
  answer takes longer to start.
- **Image models against TensorRT.** NVIDIA's TensorRT is 8-23 % faster on 6 of 19 measured cases.
- **Video.** The larger SeedVR2 model (7B) and longer clips have not been re-measured since our latest speed-up; at the last
  measurement they took 1.35-1.6x of the official implementation's time. Full-HD output does not fit in 32 GB yet, for
  either implementation.
- **Only one GPU model measured.** All numbers come from one NVIDIA RTX PRO 4500 (32 GB). AMD, Intel and Apple hardware
  have not been benchmarked yet.

</section>

## How we measure

Every comparison runs both engines on the same GPU, with the same model files at the same precision, the same procedure
and the same way of counting. Other engines run their official builds with their recommended fast settings. These are our
own measurements from November 2026 on one NVIDIA RTX PRO 4500 Blackwell (32 GB). Differences under about 5 % are within
normal variation, so we call them level. Every number links to its section of the engine's public benchmark log, with the
scripts to re-run it on your own hardware.

<div class="next-link">
  <p><strong>Tables, charts, method and reproduction commands</strong><br><span class="muted">for engineers and evaluators</span></p>
  <a class="btn" href="{{ '/benchmarks/technical/' | relative_url }}">Full technical benchmarks →</a>
</div>

<script>
(function () {
  // Links to charts and sections that moved to /benchmarks/technical/ keep working.
  var h = decodeURIComponent(location.hash.slice(1));
  if (!h || document.getElementById(h)) { return; }
  var moved = {{ site.data.benchmarks | map: "id" | jsonify }};
  var renamed = { "serving-against-vllm": "against-vllm", "batched-generation-against-llamacpp": "batched-generation", "onnx": "against-onnxruntime-and-tensorrt", "earlier-measurements": "single-stream-serving-and-prompts-earlier-build" };
  var kept = ["read-this-first", "summary", "models-larger-than-the-gpu", "where-sharplight-is-behind", "not-measured-here", "reproduce"];
  var target = moved.indexOf(h) >= 0 || kept.indexOf(h) >= 0 ? h : renamed[h];
  if (target) { location.replace("{{ '/benchmarks/technical/' | relative_url }}#" + target); }
})();
</script>

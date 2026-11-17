---
title: Serve an OpenAI-compatible endpoint
lead: Serve a model over the OpenAI and Anthropic HTTP APIs, from the command line or from ASP.NET Core.
description: Serve local models over OpenAI- and Anthropic-compatible HTTP endpoints with Sharplight.
permalink: /docs/serving/
---

Three ways: the Server page in [Studio]({{ '/docs/studio/' | relative_url }}), the `sharplight serve` command, or
`Sharplight.AspNetCore` in your application.

## From the command line

```sh
sharplight serve Qwen/Qwen3-0.6B-GGUF:Q8_0 --listen http://127.0.0.1:8080
```

This pulls the model from Hugging Face, converts it to a `.slm` package, precompiles it and serves it.

```sh
curl http://127.0.0.1:8080/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model": "qwen3-0.6b:q8_0", "messages": [{"role": "user", "content": "Say hi"}]}'
```

Model names are `owner/repo[:tag]`; the tag picks a GGUF quantization (default: Q4_K_M, then Q8_0). `--api-key` sets a
key. Other commands: `search`, `pull`, `list`, `show`, `run` (interactive chat), `rm`.

## In your application

```csharp
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddSharplight();

// ... create a ModelHost (below) or a ModelService for a single model ...

builder.Services.AddSharplightServer(host, o =>               // a ModelHost; or pass a ModelService for a single model
{
    o.ApiKeys.Add("secret");
    o.DefaultSampling = new SamplingParams { Temperature = 0.7f, TopP = 0.95f };
});

var app = builder.Build();
app.UseSharplightServer();      // CORS, API keys, error mapping; call before the Map* methods
app.MapSharplightServer();      // everything the options enable
app.Run();
```

`SharplightServerOptions` switches APIs on and off and sets keys, CORS origins, request limits, timeouts and whether an
unknown `model` falls back to the default.

### Several models, loaded on demand

`ModelHost` loads registered models on first use within the device memory budget, evicts the least recently used idle
model when memory is short, and unloads idle models after a timeout.

```csharp
using var host = new ModelHost(new ModelHostOptions { ReserveBytes = 2L << 30, IdleTimeout = TimeSpan.FromMinutes(10) });
host.Register(new ModelRegistration
{
    Name = "qwen3-4b",
    Loader = new LlmChatModelLoader(loader, "qwen3-4b", "qwen3-4b-q4_k_m.gguf", load, new ChatModelOptions { Slots = 4 }),
});
```

`loader` is the container's `ModelLoader`, `load` an `LlmLoadOptions` with the devices, `Slots` the number of sequences
advanced together.

## Endpoints

| API | Endpoints |
|---|---|
| OpenAI-compatible | `/v1/chat/completions`, `/v1/completions`, `/v1/models` |
| Anthropic-compatible | `/v1/messages`, `/v1/messages/count_tokens` |
| Retrieval, for registered models | `/v1/embeddings`, `/v1/rerank` |
| Speech, for registered recognizers | `/v1/audio/transcriptions`, `/v1/audio/translations` |
| Images, for registered generators | `/v1/images/generations` |
| Operations | `/health`, `/health/live`, `/health/ready`, `/metrics` (Prometheus), `/admin/models` |

Additional request fields: `priority`, `min_tokens`, `ignore_eos`, `user` (the fair-share tenant; else the API key),
`response_format` (`json_object`, `json_schema`), strict tools, and the vLLM guided-decoding fields (`guided_json`,
`guided_regex`, `guided_grammar`, `guided_choice`).

## Scheduling

Chat requests run on a continuous-batching engine
([measurements]({{ '/benchmarks/#serving-throughput' | relative_url }})):

- Several sequences advance in one forward pass.
- Requests with the same prompt prefix share its cached state.
- Running streams get their step first; new prompts fill the rest of each step's budget.
- Queued requests are admitted by priority, then by fair share between tenants.
- A full queue answers 429 with `Retry-After`. `/health/ready` answers 503 while a model loads or the server drains.

`/metrics` exposes queue depth, batch size, step time, time-to-first-token and inter-token histograms, KV-cache use and
speculation acceptance.

## Limits

One process on one machine, with API keys. Several machines, separate tenants and directory sign-in are the scope of
Sharplight Server (in development): see [Enterprise]({{ '/enterprise/' | relative_url }}).

Source: [api-overview.md, sections 3 and 4](https://github.com/infernitytech/sharplight/blob/main/docs/api-overview.md),
[model-hub.md](https://github.com/infernitytech/sharplight/blob/main/docs/model-hub.md).

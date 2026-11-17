---
title: Serve an OpenAI-compatible endpoint
lead: Put a local model behind the OpenAI and Anthropic HTTP APIs, from the command line or inside your own ASP.NET Core application.
description: Serve local models over OpenAI- and Anthropic-compatible HTTP endpoints with Sharplight.
permalink: /docs/serving/
---

There are three ways to serve, from least to most code:

1. **Sharplight Studio**: switch on the Server page. See [Studio basics]({{ '/docs/studio/' | relative_url }}).
2. **The `sharplight serve` command** of the command-line tool.
3. **`Sharplight.AspNetCore`** in your own application.

## From the command line

The tool pulls a model from Hugging Face, converts it to a `.slm` package, precompiles it and serves it:

```sh
sharplight serve Qwen/Qwen3-0.6B-GGUF:Q8_0 --listen http://127.0.0.1:8080
```

Then, from any OpenAI client or with `curl`:

```sh
curl http://127.0.0.1:8080/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model": "qwen3-0.6b:q8_0", "messages": [{"role": "user", "content": "Say hi"}]}'
```

Other commands of the same tool: `search`, `pull`, `list`, `show`, `run` (interactive chat) and `rm`. Model names are
`owner/repo[:tag]`; the tag picks a GGUF quantization, and without one the tool takes Q4_K_M, then Q8_0. `--api-key` sets a key.


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

`SharplightServerOptions` switches the APIs on and off, sets keys, CORS origins, request limits and timeouts, and decides
whether an unknown `model` falls back to the default one.

### Several models with load on demand

`ModelHost` registers models by name, loads them on first use within the device memory budget, evicts the least recently
used idle model when memory is short and unloads idle ones after a timeout.

```csharp
using var host = new ModelHost(new ModelHostOptions { ReserveBytes = 2L << 30, IdleTimeout = TimeSpan.FromMinutes(10) });
host.Register(new ModelRegistration
{
    Name = "qwen3-4b",
    Loader = new LlmChatModelLoader(loader, "qwen3-4b", "qwen3-4b-q4_k_m.gguf", load, new ChatModelOptions { Slots = 4 }),
});
```

`loader` is the container's `ModelLoader`, `load` an `LlmLoadOptions` with the devices. `Slots` is the number of
sequences the model advances together.

## Endpoints

| API | Endpoints |
|---|---|
| OpenAI-compatible | `/v1/chat/completions`, `/v1/completions`, `/v1/models` |
| Anthropic-compatible | `/v1/messages`, `/v1/messages/count_tokens` |
| Retrieval, for registered models | `/v1/embeddings`, `/v1/rerank` |
| Speech, for registered recognizers | `/v1/audio/transcriptions`, `/v1/audio/translations` |
| Images, for registered generators | `/v1/images/generations` |
| Operations | `/health`, `/health/live`, `/health/ready`, `/metrics` (Prometheus), `/admin/models` |

Existing OpenAI and Anthropic clients only change their base URL.

Beyond the standard fields, the APIs accept `priority`, `min_tokens`, `ignore_eos`, `user` (the fair-share tenant; else
the API key), `response_format` (`json_object`, `json_schema`), strict tools, and the vLLM guided-decoding fields
(`guided_json`, `guided_regex`, `guided_grammar`, `guided_choice`).

## How requests are scheduled

Chat requests run on a continuous-batching engine:

- Several sequences advance in one forward pass, so throughput grows with concurrency.
  ([Measurements]({{ '/benchmarks/#serving-throughput' | relative_url }}))
- Requests with the same prompt prefix share its cached state.
- Running streams get their step first; new prompts fill the rest of each step's budget.
- Queued requests are admitted by priority, then by fair share between tenants.
- A full queue answers 429 with `Retry-After`. `/health/ready` answers 503 while a model is loading or the server is draining.

`/metrics` exposes queue depth, batch size, step time, time-to-first-token and inter-token histograms, KV-cache use and
speculation acceptance.

## What this does not do

One process on one machine, with API keys. For several machines, tenants with separate data and sign-in through a
directory, see [Sharplight Server]({{ '/server/' | relative_url }}), which is in development.

Source: [api-overview.md, sections 3 and 4](https://github.com/infernitytech/sharplight/blob/main/docs/api-overview.md),
[model-hub.md](https://github.com/infernitytech/sharplight/blob/main/docs/model-hub.md).

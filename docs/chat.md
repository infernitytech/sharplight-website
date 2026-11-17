---
title: Chat, tools and structured output
lead: Chat templates, reasoning, tool calls and constrained output.
description: Chat with local models in Sharplight using ModelService or IChatClient, with structured output and tool calls.
permalink: /docs/chat/
---

## With Microsoft.Extensions.AI

`SharplightChatClient` implements `IChatClient`. Messages and tools are rendered with the model's chat template;
reasoning becomes `TextReasoningContent`, tool calls `FunctionCallContent`, images `DataContent`.

```csharp
var services = new ServiceCollection().AddSharplight();
services.AddSharplightChatClient(o => { o.ModelPath = "qwen3-4b-q4_k_m.gguf"; o.Devices = [slot]; }, client => client.EnableThinking = false)
    .UseFunctionInvocation();

var provider = services.BuildServiceProvider();
var chat = provider.GetRequiredService<IChatClient>();
var answer = await chat.GetResponseAsync("Why is the sky blue?");
Console.WriteLine(answer.Text);
```

The default backend runs one generation at a time. For many callers on one model, back the client with an
`InferenceEngine` (implement `ITextGenerationBackend`).

## With the engine and ModelService

`InferenceEngine` is the continuous-batching scheduler the HTTP endpoints use: several sequences per forward pass,
requests from any thread, shared prompt-prefix cache. `ModelService` adds the chat template and parses reasoning and
tool calls.

```csharp
var loader = provider.GetRequiredService<ModelLoader>();
using var model = LlmModel.Load(loader, "qwen3-4b-q4_k_m.gguf", new LlmLoadOptions { Devices = [slot], ContextLength = 8192 });
using var engine = new InferenceEngine(model.CreateBatchDecoder(slots: 4), model.Tokenizer);

var service = new ModelService(engine, model.ChatTemplate, new ModelServiceOptions { ModelName = "qwen3" });
var result = await service.StartChat(new ChatRequest
{
    Messages = [new ChatTurn("system", "Answer briefly."), new ChatTurn("user", "Name three primary colours.")],
    MaxTokens = 128,
}).CompleteAsync();
Console.WriteLine(result.Choices[0].Content);          // also .Reasoning, .ToolCalls, .Usage
```

`StartChat` builds and tokenizes the prompt synchronously; call it from a worker thread.

## Structured output

The engine masks tokens that would break the format before every sample, so the output always parses.

```csharp
var schema = """{"type":"object","properties":{"city":{"type":"string"}},"required":["city"]}""";
var request = new ChatRequest
{
    Messages = [new ChatTurn("user", "Where is the Eiffel Tower?")],
    ResponseFormat = OutputFormat.JsonSchema(schema),
    MaxTokens = 200,
};
```

| `OutputFormat` | Constrains to |
|---|---|
| `JsonSchema` | a JSON schema: types, properties, required fields, enums, constants, `anyOf` / `oneOf` / `allOf`, local `$ref` including recursion, array bounds, string lengths, patterns, common formats |
| `JsonObject` | any JSON object |
| `Regex` | a regular expression |
| `Gbnf` | a grammar in the llama.cpp format |
| `Choice` | one of a set of choices |

A reasoning block before the answer stays unconstrained.

Below the chat layer, use a `GrammarConstraint` on a `GenerationRequest`:

```csharp
var constraint = new GrammarConstraint(Grammar.FromJsonSchema(schema), model.Tokenizer);   // reuse across requests
var request = new GenerationRequest { PromptTokens = prompt, MaxTokens = 200, Constraint = constraint };
```

## Tool calls

Tools in a chat request are rendered in the model's own tool syntax, and calls come back typed. A forced call
(`ToolChoiceMode.Required` or a named function) or a strict tool is constrained to the tool-call syntax and the tool's
parameter schema.

## Scheduling

- Running sequences step first; new prompts fill the rest of each step's token budget, so a long prompt does not stall
  running streams.
- Queued requests are admitted by `Priority`, then by fair share between tenants (`Tenant`), favoring whoever used
  least recently.
- A cancelled request frees its slot at the next step.
- A full queue raises `QueueFullException`; over HTTP, status 429 with `Retry-After`.
- `engine.GetMetrics()` returns queue depth, slot use, time-to-first-token and inter-token histograms and prefix-cache
  hits.

## Speculative decoding

The engine can draft several tokens and verify them in one pass. Greedy output stays token-identical; sampled output
keeps the same distribution.

| Drafter | Source of drafts |
|---|---|
| `NgramSpeculator` | prompt lookup; pays off for edits, code and quoting |
| `MtpSpeculator` | the model's multi-token-prediction head, where the checkpoint has one |

Source: [api-overview.md, sections 3 and 6](https://github.com/infernitytech/sharplight/blob/main/docs/api-overview.md).

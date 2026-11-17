---
title: Chat, tools and structured output
lead: Turn a language model into a chat service with templates, reasoning, tool calls and constrained output.
description: Chat with local models in Sharplight using ModelService or IChatClient, with structured output and tool calls.
permalink: /docs/chat/
---

There are two ways to chat with a model. `Microsoft.Extensions.AI` is the shortest; the engine and `ModelService` give
you the serving stack that the HTTP endpoints use.

## With Microsoft.Extensions.AI

`SharplightChatClient` implements `IChatClient`. Messages and tools are rendered with the model's own chat template,
reasoning becomes `TextReasoningContent`, tool calls become `FunctionCallContent`, and images are `DataContent`.

```csharp
var services = new ServiceCollection().AddSharplight();
services.AddSharplightChatClient(o => { o.ModelPath = "qwen3-4b-q4_k_m.gguf"; o.Devices = [slot]; }, client => client.EnableThinking = false)
    .UseFunctionInvocation();

var provider = services.BuildServiceProvider();
var chat = provider.GetRequiredService<IChatClient>();
var answer = await chat.GetResponseAsync("Why is the sky blue?");
Console.WriteLine(answer.Text);
```

`UseFunctionInvocation()` runs the tools the model calls. The default backend runs one generation at a time; to let many
callers share a model, back the client with an `InferenceEngine` (implement `ITextGenerationBackend`).

## With the engine and ModelService

`InferenceEngine` is a continuous-batching scheduler: it advances several sequences in one forward pass, admits requests
from any thread and shares cached prompt prefixes between them. `ModelService` is the chat layer on top: it renders
messages and tools through the chat template and parses reasoning blocks and tool calls out of the output.

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

`StartChat` builds and tokenizes the prompt synchronously; call it from a worker thread, not a UI thread.

## Structured output

A chat request can constrain the answer. The engine masks the tokens that would break the format before every sample, so
the output always parses.

```csharp
var schema = """{"type":"object","properties":{"city":{"type":"string"}},"required":["city"]}""";
var request = new ChatRequest
{
    Messages = [new ChatTurn("user", "Where is the Eiffel Tower?")],
    ResponseFormat = OutputFormat.JsonSchema(schema),
    MaxTokens = 200,
};
```

`OutputFormat` also offers `JsonObject`, `Regex`, `Gbnf` (the llama.cpp grammar format) and `Choice`. A reasoning block
before the answer stays unconstrained. The supported JSON-schema subset covers types, properties and required fields,
enums and constants, `anyOf` / `oneOf` / `allOf`, local `$ref` including recursion, array bounds, string lengths,
patterns and common formats.

Below the chat layer, the same mechanism is a `GrammarConstraint` on a `GenerationRequest`:

```csharp
var constraint = new GrammarConstraint(Grammar.FromJsonSchema(schema), model.Tokenizer);   // reuse across requests
var request = new GenerationRequest { PromptTokens = prompt, MaxTokens = 200, Constraint = constraint };
```

## Tool calls

Tools passed in a chat request are rendered into the prompt in the model's own tool syntax, and the model's calls come
back as typed tool calls. When a call is forced (`ToolChoiceMode.Required` or a named function) or a tool is marked
strict, the call is constrained to the model's tool-call syntax and the tool's parameter schema.

## Scheduling

When several requests share an engine:

- Running sequences get their step first; new prompts fill the rest of each step's token budget, so a long prompt does
  not stall running streams.
- Queued requests are admitted by `Priority`, then by fair share between tenants (`Tenant`), favoring whoever used least recently.
- A cancelled request frees its slot at the next step.
- A full queue raises `QueueFullException`; over HTTP that is status 429 with `Retry-After`.

`engine.GetMetrics()` returns queue depth, slot use, time-to-first-token and inter-token histograms and prefix-cache hits.

## Speculative decoding

The engine can draft several tokens and verify them in one pass. Greedy output stays token-identical, and sampled output
keeps the same distribution. Two drafters exist: prompt lookup (`NgramSpeculator`), which pays off for edits, code and
quoting, and the model's own multi-token-prediction head where the checkpoint has one (`MtpSpeculator`).

Source: [api-overview.md, sections 3 and 6](https://github.com/infernitytech/sharplight/blob/main/docs/api-overview.md).

---
title: First text generation
lead: Load a language model and generate text, whole or streamed.
description: Generate text with a local language model from C# using Sharplight's ITextGenerator.
permalink: /docs/text-generation/
---

Needs the [package]({{ '/docs/getting-started/' | relative_url }}) and a model file, for example Qwen3 0.6B Q8_0 from
the [model list]({{ '/models/' | relative_url }}).

## Generate

```csharp
using Microsoft.Extensions.DependencyInjection;

var services = new ServiceCollection()
    .AddSharplight()
    .AddTextGenerator((o, sp) =>
    {
        var gpu = sp.GetRequiredService<ExecutionProviderCatalog>().Discover().First(d => d.Availability.IsAvailable).Provider;
        o.ModelPath = "Qwen3-0.6B-Q8_0.gguf";
        o.Devices = [new DeviceSlot { Device = gpu.OpenDevice(gpu.GetDevices()[0]) }];
        o.ContextLength = 8192;
    });
await using var provider = services.BuildServiceProvider();

var generator = provider.GetRequiredService<ITextGenerator>();
TextGenerationResult completion = await generator.GenerateAsync(
    "The capital of France is", new GenerationOptions { MaxNewTokens = 32 });
Console.WriteLine(completion.Text);
```

`ModelPath` is a GGUF file, a Hugging Face checkpoint folder or a `.slm` package. `ModelPath` and `Devices` are
required. The model loads once, on first use.

## Stream tokens

```csharp
var options = new GenerationOptions
{
    MaxNewTokens = 128,
    Sampling = new SamplingOptions { Temperature = 0.7f, TopP = 0.95f, Seed = 42 },
    StopStrings = ["\n\n"],
};
await foreach (var token in generator.GenerateStreamingAsync("Once upon a time", options))
{
    Console.Write(token.Text);
}
```

The call returns before any compute starts and tokens are produced on a background thread, so it is safe on a UI
thread. Cancellation is observed between tokens.

## Lower level: model, session, generator

For direct control over the context:

```csharp
var loader = provider.GetRequiredService<ModelLoader>();
using var model = LlmModel.Load(loader, "Qwen3-0.6B-Q8_0.gguf", new LlmLoadOptions { Devices = [slot], ContextLength = 8192 });

using var session = model.CreateSession();           // holds the context (KV cache)
var generator = new Generator(session, model.Tokenizer);
foreach (var token in generator.Generate("The capital of France is", options))
{
    Console.Write(token.Text);
}

Console.WriteLine($"{generator.LastStats!.DecodeTokensPerSecond:F1} tok/s");
```

- Successive `Generate` calls continue the same context.
- `LlmModel.Load` reads the file and builds the graphs. Nothing is compiled or uploaded until a session is created.
- `LlmLoadOptions` also controls splitting a model over several devices and the CPU fallback for what does not fit.
- Sessions and generators are for one thread at a time.

## Images in the prompt

For vision-language models, create the session on the multimodal graph and pass a vision encoder:

```csharp
using var vision = model.CreateVisionEncoder();
using var session = model.CreateSession(WellKnown.DecodeMultimodalGraph);
var generator = new Generator(session, model.Tokenizer, vision);
var image = new ImageInput(width, height, rgbBytes);
foreach (var token in generator.Generate(promptWithImagePlaceholder, [image], options)) { /* ... */ }
```

A GGUF vision model takes its projector file in the load options: `Auxiliary = { [AuxiliaryRoles.Mmproj] = path }`.

## Next

- [Chat, tools and structured output]({{ '/docs/chat/' | relative_url }})
- [Serve an OpenAI-compatible endpoint]({{ '/docs/serving/' | relative_url }})

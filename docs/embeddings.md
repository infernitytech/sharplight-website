---
title: Embeddings and reranking
lead: Embed text and score documents against a query.
description: Text embeddings and reranking with local models in Sharplight.
permalink: /docs/embeddings/
---

## Embeddings

`EmbeddingModel` runs encoder embedders (bge, e5, MiniLM, nomic) and decoder embedders (Qwen3-Embedding). Batching,
truncation, pooling and normalization follow the model's metadata.

```csharp
var loader = provider.GetRequiredService<ModelLoader>();
using var embedder = EmbeddingModel.Load(loader, "bge-small-en-v1.5", new EmbeddingLoadOptions { Devices = [slot] });

EmbeddingResult result = embedder.Embed(["first text", "second text"]);
float[] vector = result.Vectors[0];                       // embedder.Dimensions long, L2-normalized when the model says so
float[] query = embedder.Embed("what is a vector?", new EmbedOptions { Prompt = "query" });   // a prompt the model defines
float[] small = embedder.Embed("text", new EmbedOptions { Dimensions = 256 });                // Matryoshka cut
```

The path is a Hugging Face checkpoint folder.

| `EmbedOptions` | Effect |
|---|---|
| `Prompt` | selects a prompt the model defines, for example query or document prefixes |
| `Dimensions` | cuts a Matryoshka-trained embedding to a shorter length |

## Reranking

`Reranker` runs cross-encoders and yes/no decoder rerankers:

```csharp
using var reranker = Reranker.Load(loader, "bge-reranker-v2-m3", new RerankerLoadOptions { Devices = [slot] });
RerankResult scores = reranker.Score("what is a vector?", ["a quantity with direction", "a kind of animal"]);
// scores.Scores in [0, 1] per document, in input order
```

## Integration

`EmbeddingModel` and `Reranker` are thread-safe and implement `ITextEmbedder` and `ITextReranker`.

- **Microsoft.Extensions.AI**: `services.AddSharplightEmbeddingGenerator(o => { o.ModelPath = "bge-small-en-v1.5"; o.Devices = [slot]; })`
  registers an `IEmbeddingGenerator<string, Embedding<float>>`.
- **HTTP**: `services.AddSharplightEmbeddings(...)` and `AddSharplightReranker(...)` serve `/v1/embeddings` and
  `/v1/rerank`. See [serving]({{ '/docs/serving/' | relative_url }}).
- **Images and text in one space** (CLIP, SigLIP): `IImageEmbedder`, see [vision]({{ '/docs/vision/' | relative_url }}).

Verified models, compared with sentence-transformers: [model list]({{ '/models/?kind=embeddings' | relative_url }}).

Source: [api-overview.md, section 5](https://github.com/infernitytech/sharplight/blob/main/docs/api-overview.md).

---
title: Embeddings and reranking
lead: Turn text into vectors and score documents against a query.
description: Text embeddings and reranking with local models in Sharplight.
permalink: /docs/embeddings/
---

## Embeddings

`EmbeddingModel` runs encoder embedders (the BERT family: bge, e5, MiniLM, nomic) and decoder embedders
(Qwen3-Embedding). Inputs are tokenized, truncated, packed and run in batches; pooling and normalization follow the
model's own metadata.

```csharp
var loader = provider.GetRequiredService<ModelLoader>();
using var embedder = EmbeddingModel.Load(loader, "bge-small-en-v1.5", new EmbeddingLoadOptions { Devices = [slot] });

EmbeddingResult result = embedder.Embed(["first text", "second text"]);
float[] vector = result.Vectors[0];                       // embedder.Dimensions long, L2-normalized when the model says so
float[] query = embedder.Embed("what is a vector?", new EmbedOptions { Prompt = "query" });   // a prompt the model defines
float[] small = embedder.Embed("text", new EmbedOptions { Dimensions = 256 });                // Matryoshka cut
```

The model path here is a Hugging Face checkpoint folder. `EmbedOptions.Prompt` selects one of the prompts a model defines
(for example separate query and document prefixes); `Dimensions` cuts a Matryoshka-trained embedding to a shorter length.

## Reranking

`Reranker` scores documents against a query with a cross-encoder or a yes/no decoder reranker:

```csharp
using var reranker = Reranker.Load(loader, "bge-reranker-v2-m3", new RerankerLoadOptions { Devices = [slot] });
RerankResult scores = reranker.Score("what is a vector?", ["a quantity with direction", "a kind of animal"]);
// scores.Scores in [0, 1] per document, in input order
```

## Interfaces and integration

Both types implement small interfaces, `ITextEmbedder` and `ITextReranker`, so a test double or a remote implementation
can stand in.

- **Microsoft.Extensions.AI**: `services.AddSharplightEmbeddingGenerator(o => { o.ModelPath = "bge-small-en-v1.5"; o.Devices = [slot]; })`
  registers an `IEmbeddingGenerator<string, Embedding<float>>`.
- **HTTP**: `services.AddSharplightEmbeddings(...)` and `AddSharplightReranker(...)` serve `/v1/embeddings` and
  `/v1/rerank` next to the chat endpoints. See [serving]({{ '/docs/serving/' | relative_url }}).

`EmbeddingModel` and `Reranker` are thread-safe.

## Image and text in one space

CLIP and SigLIP models embed images and text into the same space through `IImageEmbedder`
(`EmbedImageAsync`, `EmbedTextAsync`, `ClassifyZeroShotAsync`). See [vision]({{ '/docs/vision/' | relative_url }}).

## Verified models

The [model list]({{ '/models/?kind=embeddings' | relative_url }}) has the embedding and reranking models that were
compared with sentence-transformers.

Source: [api-overview.md, section 5](https://github.com/infernitytech/sharplight/blob/main/docs/api-overview.md).

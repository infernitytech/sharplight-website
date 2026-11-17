---
title: Documentation
lead: Guides for using the Sharplight engine from .NET and for Sharplight Studio.
description: Sharplight documentation, covering getting started, task guides, serving, Studio, model compatibility and benchmarks.
permalink: /docs/
---

Sharplight is in an early version. The packages are alpha prereleases and the API still changes; these pages describe
the current development line. The long-form reference documents live in the
[engine repository](https://github.com/infernitytech/sharplight/tree/main/docs).

## Start here

- **Using the library?** [Install the packages]({{ '/docs/getting-started/' | relative_url }}), then run your
  [first text generation]({{ '/docs/text-generation/' | relative_url }}).
- **Using the desktop app?** [Download Studio]({{ '/download/' | relative_url }}) and read
  [Studio basics]({{ '/docs/studio/' | relative_url }}).

## Concepts

- [How Sharplight is put together]({{ '/docs/concepts/' | relative_url }}): packages, registration, task clients, threading.
- [Model formats and `.slm` packages]({{ '/docs/model-formats/' | relative_url }}): what Sharplight reads and its own package format.
- [Hardware and providers]({{ '/docs/hardware/' | relative_url }}): GPU through Vulkan, CPU, macOS.

## Task guides

- [Chat, tools and structured output]({{ '/docs/chat/' | relative_url }})
- [Embeddings and reranking]({{ '/docs/embeddings/' | relative_url }})
- [Speech to text and text to speech]({{ '/docs/speech/' | relative_url }})
- [Image generation]({{ '/docs/image-generation/' | relative_url }})
- [Video generation]({{ '/docs/video-generation/' | relative_url }})
- [Vision]({{ '/docs/vision/' | relative_url }})

## Serving

- [Serve an OpenAI-compatible endpoint]({{ '/docs/serving/' | relative_url }})

## Reference

- [Model compatibility]({{ '/docs/compatibility/' | relative_url }})
- [Benchmark methodology]({{ '/docs/benchmark-methodology/' | relative_url }})
- [API reference]({{ '/docs/api-reference/' | relative_url }})

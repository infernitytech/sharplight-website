---
title: Open source
lead: Sharplight and Sharplight Studio are MIT licensed and developed in the open. This page says what that covers, and what it does not.
description: License, contributing and governance of Sharplight, and how the open-source products relate to the commercial Sharplight Server.
permalink: /open-source/
---

## The license

The engine (every `Sharplight.*` NuGet package), the command-line tools and Sharplight Studio are released under the
[MIT license](https://github.com/infernitytech/sharplight/blob/main/LICENSE). You can use them in commercial and
closed-source products, modify them and redistribute them. The source is on
[GitHub](https://github.com/infernitytech/sharplight).

Models are not part of Sharplight and have their own licenses. The [model list]({{ '/models/' | relative_url }}) shows
the license stated on each model's page; check it before you use a model commercially.

## What is open and what is commercial

| | License | Source |
|---|---|---|
| Sharplight (engine, NuGet packages, command-line tools) | MIT | public |
| Sharplight Studio (desktop app) | MIT | public |
| Verified-model catalog | MIT, in the same repository | public |
| Sharplight Server (cluster and multi-tenant platform, in development) | commercial | closed |

Sharplight Server is built on the open-source engine through its public NuGet packages. Work on the engine that the server
needs, and that is useful to anyone else, goes into the open-source repository.

**License.** Sharplight and Sharplight Studio are MIT licensed. You can use them in commercial and closed-source products, modify them and redistribute them. To contribute, see the section below.

## Why there is a commercial product

Sharplight is developed by Infernity Technologies GmbH. Building an inference engine and keeping it current with new
models is ongoing work, and the server product, together with hardware and consulting for organizations, is how that work
is meant to be paid for. [About Sharplight Server]({{ '/server/' | relative_url }})

## Built with the help of other projects

Sharplight is its own implementation in C#, and it stands on work done by others:

- It reads the model formats defined by **llama.cpp / ggml** (GGUF), **Hugging Face** (safetensors, transformers and
  diffusers layouts), **ONNX**, **whisper.cpp** and **stable-diffusion.cpp**.
- Its results are verified against those projects' implementations and against **onnxruntime**, and its benchmarks
  compare with **llama.cpp**, **vLLM** and **onnxruntime**. They are the references that make our claims checkable.
- It ships a small number of third-party native libraries: FFmpeg (an LGPL-only build) for video, miniaudio, Opus, Ogg
  and Vorbis for audio, and MoltenVK on macOS. Their licenses are included in the packages as third-party notices.
- Studio is built with Avalonia and packaged with Velopack.

## Contributing

- **Report a problem or request a model.** Open an [issue](https://github.com/infernitytech/sharplight/issues). For a
  model, include the Hugging Face repository id and the file or quantization.
- **Reproduce a benchmark.** The scripts and raw results are in the repository. If your numbers differ, or you think a
  comparison is unfair to another engine, an issue is welcome.
- **Send a change.** Fork, branch from `develop`, and open a pull request against `develop`. The code style is described
  in `docs/code-style.md`. Tests are xunit v3 executables:

```sh
dotnet build Sharplight.slnx -c Release
dotnet run --project tests/<Project> -c Release --no-build
```

- **Add a model to the catalog.** The catalog is a JSON file with a schema and a validator; an entry needs the pinned
  revision and how the model was verified. See `docs/verified-catalog.md`.

## How the project is run

- **Maintainers.** The project is maintained by Infernity Technologies GmbH. Decisions are made in the open, in issues and
  pull requests.
- **Branches.** `develop` is where work is integrated; `main` is the stable line; releases are cut from `release/*`
  branches. Every push is built and tested by CI.
- **Releases.** NuGet packages are published from release branches. Studio builds are published for every change on
  `develop` (preview channel) and for releases (stable channel).
- **Roadmap.** What is in progress and what is still open is kept in
  [docs/roadmap.md](https://github.com/infernitytech/sharplight/blob/main/docs/roadmap.md).
- **Security.** Please report security problems privately to [contact@infernity.at](mailto:contact@infernity.at) rather
  than in a public issue.

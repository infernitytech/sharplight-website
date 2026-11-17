---
title: Open source
lead: Sharplight and Sharplight Studio are MIT licensed and developed in the open.
description: License, contributing and governance of Sharplight, and how the open-source products relate to the commercial Sharplight Server.
permalink: /open-source/
---

## License

| | License | Source |
|---|---|---|
| Sharplight (engine, NuGet packages, command-line tools) | [MIT](https://github.com/infernitytech/sharplight/blob/main/LICENSE) | [public](https://github.com/infernitytech/sharplight) |
| Sharplight Studio | MIT | public |
| Verified-model catalog | MIT | public |
| Sharplight Server (in development) | commercial | closed |

Models have their own licenses; the [model list]({{ '/models/' | relative_url }}) shows each one.

## The commercial product

Sharplight is developed by Infernity Technologies GmbH. Sharplight Server, hardware and consulting pay for that work.
The server is built on the engine's public NuGet packages; engine work it needs that is useful to others goes into the
open-source repository. [Enterprise]({{ '/enterprise/' | relative_url }})

## Credits

- **Formats**: llama.cpp / ggml (GGUF), Hugging Face (safetensors, transformers and diffusers layouts), ONNX,
  whisper.cpp, stable-diffusion.cpp.
- **References** for verification and benchmarks: those projects, onnxruntime and vLLM.
- **Bundled native libraries**: FFmpeg (LGPL-only build), miniaudio, Opus, Ogg, Vorbis, MoltenVK on macOS. Their
  licenses ship as third-party notices.
- **Studio**: Avalonia, Velopack.

## Contributing

- **Issues and model requests**: [GitHub issues](https://github.com/infernitytech/sharplight/issues). For a model,
  include the Hugging Face repository id and the file or quantization.
- **Benchmarks**: if your numbers differ or a comparison is unfair to another engine, open an issue.
- **Changes**: branch from `develop`, pull request against `develop`. Style: `docs/code-style.md`.
- **Catalog entries**: need the pinned revision and how the model was verified. See `docs/verified-catalog.md`.

```sh
dotnet build Sharplight.slnx -c Release
dotnet run --project tests/<Project> -c Release --no-build
```

## Project

- **Maintainer**: Infernity Technologies GmbH. Decisions are made in issues and pull requests.
- **Branches**: `develop` for integration, `main` stable, releases from `release/*`. CI builds and tests every push.
- **Releases**: NuGet packages from release branches; Studio preview builds from `develop`, stable builds from releases.
- **Roadmap**: [docs/roadmap.md](https://github.com/infernitytech/sharplight/blob/main/docs/roadmap.md).
- **Security**: report privately to [contact@infernity.at](mailto:contact@infernity.at).

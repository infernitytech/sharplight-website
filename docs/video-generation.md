---
title: Video generation
lead: Text to video and image to video with Wan, LTX-Video and HunyuanVideo, and encoding the result.
description: Text to video and image to video with Wan and LTX-Video models in Sharplight.
permalink: /docs/video-generation/
---

## Generate a clip

```csharp
var services = new ServiceCollection()
    .AddSharplight()
    .AddVideoGenerator(o => { o.ModelPath = "Wan2.1-T2V-1.3B-Diffusers"; o.Devices = [slot]; });
await using var provider = services.BuildServiceProvider();
var generator = provider.GetRequiredService<IVideoGenerator>();

var request = new VideoGenerationRequest { Prompt = "a red fox trotting through snow", NegativePrompt = "blurry" };
var options = new VideoGenerationOptions { Width = 832, Height = 480, Frames = 33, Steps = 30, Seed = 7 };
await foreach (var update in generator.GenerateStreamingAsync(request, options))
{
    Console.Write($"\r{update.Phase} {update.Step}/{update.TotalSteps}");   // Denoising steps, then decoded frames (update.Frames)
    if (update.Result is { } video)
    {
        // video.Frames: 8-bit RGB frames, video.FramesPerSecond
    }
}
```

## Supported models

| Family | Files |
|---|---|
| Wan 2.1 (text to video), Wan 2.2 TI2V (text and image to video) | diffusers folders; transformer-only GGUF or safetensors with a Wan diffusers folder of the same family for text encoder and VAE |
| LTX-Video | diffusers folders, single files |
| HunyuanVideo | GGUF |

Verified variants: [model list]({{ '/models/?kind=video-generation' | relative_url }}).

## Options

| Option | Notes |
|---|---|
| `Width`, `Height` | Multiples of 16 (Wan 2.1) or 32 (Wan 2.2 TI2V) |
| `Frames` | 1 + 4k; other counts are rounded down |
| Sampler | `unipc` (Wan default) or `euler` |
| `VideoGenerationRequest.Image` | Start image, on models with first-frame conditioning |

`VideoGenerationDefaults` reports a model's defaults and whether it takes a start image:

| Model | Size | Frames | Steps | Guidance |
|---|---|---|---|---|
| Wan 2.1 | 832×480 | 81 at 16 fps | 50 | 5 |
| Wan 2.2 TI2V | 1280×704 | 121 at 24 fps | 50 | 5 |

Decoding streams over the latent frames, so memory does not grow with clip length. When weights take a large share of
device memory, the text encoder is released after encoding and the transformer before decoding.

## Save the clip

`VideoEncoderCatalog` picks an encoder by file extension.

```csharp
var videos = provider.GetRequiredService<VideoEncoderCatalog>();
var clip = new VideoClip(frames, framesPerSecond: 24);      // frames: IReadOnlyList<ImageInput>, all the same size
await videos.SaveAsync(clip, "out.mp4", new VideoEncodeOptions { Codec = VideoCodecs.Av1, Preset = VideoPresets.Slow, Quality = 85 });
```

| Format | Extensions | Codecs (default first) |
|---|---|---|
| MP4 | `.mp4`, `.m4v` | H.264, AV1, VP9; hardware encoders where they work |
| WebM | `.webm` | VP9, AV1, VP8 |
| MOV | `.mov` | ProRes, H.264, FFV1 |
| Matroska | `.mkv` | H.264, AV1, VP9, FFV1 (lossless), ProRes |
| GIF | `.gif` | optimized palette |
| Animated PNG | `.apng`, `.png` | lossless |

Encoding uses the bundled FFmpeg libraries (an LGPL-only build for Windows, Linux and macOS; a system FFmpeg is never
used). Managed GIF and animated PNG encoders are the fallback.

## Command line

`sharplight-generate-video` (samples/Sharplight.GenerateVideo).

Source: [api-overview.md, Video generation and Video encoding](https://github.com/infernitytech/sharplight/blob/main/docs/api-overview.md).

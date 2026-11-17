---
title: Video generation
lead: Generate short video clips from text or a start image, and encode them.
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

- **Wan 2.1** text to video and **Wan 2.2 TI2V** text and image to video, from diffusers pipeline folders.
  Transformer-only GGUF or safetensors files work with a Wan diffusers folder of the same family as the source of the text
  encoder and VAE.
- **LTX-Video**, from diffusers folders and single files.
- **HunyuanVideo** as GGUF.

The verified variants are in the [model list]({{ '/models/?kind=video-generation' | relative_url }}).

## Options

- **Size**: width and height in multiples of 16 for Wan 2.1 and 32 for Wan 2.2 TI2V.
- **Frames**: 1 + 4k; other counts are rounded down.
- **Sampler**: `unipc` (the Wan default) or `euler`.
- **Defaults**: `VideoGenerationDefaults` reports a model's defaults and whether it takes a start image. Wan 2.1: 832×480,
  81 frames at 16 fps. Wan 2.2 TI2V: 1280×704, 121 frames at 24 fps. Both: 50 steps, guidance 5.
- **Image to video**: set `VideoGenerationRequest.Image` on models with first-frame conditioning.

Decoding streams over the latent frames, so memory does not grow with the clip length and decoded frames arrive as they
are ready. When the weights take a large share of the device memory, the text encoder is released after encoding and the
transformer before decoding.

## Save the clip

`VideoEncoderCatalog` picks an encoder by file extension. With `AddSharplight()`, the bundled FFmpeg libraries are used;
managed GIF and animated PNG encoders are the fallback.

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

The FFmpeg libraries are Sharplight's own LGPL-only build, shipped with the package for Windows, Linux and macOS. A system
FFmpeg is never used.

## Command line

`sharplight-generate-video` (samples/Sharplight.GenerateVideo) is a command-line front end.

Source: [api-overview.md, Video generation and Video encoding](https://github.com/infernitytech/sharplight/blob/main/docs/api-overview.md).

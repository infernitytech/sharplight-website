---
title: Image generation
lead: Generate and edit images with Stable Diffusion, FLUX and related models.
description: Text to image, image to image, inpainting and LoRA with local diffusion models in Sharplight.
permalink: /docs/image-generation/
---

## Generate an image

```csharp
var services = new ServiceCollection()
    .AddSharplight()
    .AddImageGenerator(o => { o.ModelPath = "v1-5-pruned-emaonly-Q8_0.gguf"; o.Devices = [slot]; });
await using var provider = services.BuildServiceProvider();
var generator = provider.GetRequiredService<IImageGenerator>();

var request = new ImageGenerationRequest { Prompt = "a lighthouse at dusk", NegativePrompt = "blurry" };
var options = new ImageGenerationOptions { Steps = 20, GuidanceScale = 7.5f, Seed = 42, Scheduler = Samplers.DpmPlusPlus2MKarras, PreviewInterval = 5 };
await foreach (var update in generator.GenerateStreamingAsync(request, options))
{
    Console.Write($"\r{update.Step}/{update.TotalSteps}");        // update.Preview: a latent-resolution preview every 5 steps
    if (update.Result is { } result)
    {
        PngCodec.Write("lighthouse.png", result.Images[0]);
    }
}
```

`GenerateAsync(request)` returns the finished result without the progress updates.

## Supported inputs

| Family | Files |
|---|---|
| Stable Diffusion 1.x, 2.x, XL | diffusers folders, single-file `.safetensors` or `.ckpt` checkpoints, stable-diffusion.cpp GGUF files |
| FLUX.1 (schnell, dev and fine-tunes) | diffusers folders, original single files, transformer-only GGUF files with companion files |

Further families (including Qwen-Image and FLUX.1 Kontext for editing) are in the
[model list]({{ '/models/?kind=image-generation' | relative_url }}), each with its measured difference from the diffusers reference.

## Models that come in several files

Transformer-only checkpoints need their text encoders and VAE. Give them as auxiliary sources by role:

```csharp
using var model = TaskModel.Load(loader, new TaskLoadOptions
{
    ModelPath = "flux1-schnell-Q8_0.gguf",
    Auxiliary = new Dictionary<string, string>
    {
        [AuxiliaryRoles.TextEncoder] = "clip_l.safetensors",
        [AuxiliaryRoles.SecondTextEncoder] = "t5-v1_1-xxl-encoder-Q8_0.gguf",
        [AuxiliaryRoles.Vae] = "ae.safetensors",
    },
    Devices = [slot],
});
using var generator = clients.Create<IImageGenerator>(model);   // clients: the container's TaskClientProvider
var result = await generator.GenerateAsync(new ImageGenerationRequest { Prompt = "a lighthouse at dusk" });   // 4 steps, 1024 × 1024
```

Roles you leave out are filled with files found beside the transformer. Saved as a `.slm` package, the model becomes one
file. Studio's verified catalog installs the companions for you.

## Options

- **Samplers** (`Samplers`): `euler`, `euler-karras`, `euler-ancestral`, `ddim`, `pndm`, `dpm++2m`, `dpm++2m-karras`; flow
  models use `euler`. Each follows the corresponding diffusers scheduler step by step. The default is the sampler the
  model was published with.
- **Guidance**: classifier-free guidance with `GuidanceScale` and an optional negative prompt. Guidance-distilled models
  take the scale as an input; FLUX.1-schnell ignores it.
- **Seeds**: image *i* of a request uses `Seed + i`. The noise is identical on every machine and provider, so a seed
  reproduces across hardware.
- **Sizes**: models are built for their native size (512×512 for SD 1.x, 1024×1024 for SDXL and FLUX). Another `Width` /
  `Height` (multiples of 64; FLUX: of 16) rebuilds the model once per size.
- **Previews**: `PreviewInterval` delivers a low-resolution preview every few steps.

## Image to image and inpainting

Set `ImageGenerationRequest.Image` and `Strength` for image to image. Add `Mask` for inpainting: white areas are
regenerated, and the input is kept everywhere else.

## LoRA

LoRA files are auxiliary sources whose role starts with `lora`; a `@scale` suffix sets the strength.

```csharp
using var model = TaskModel.Load(loader, new TaskLoadOptions
{
    ModelPath = "sd_xl_base_1.0.safetensors",
    Auxiliary = new Dictionary<string, string> { [$"{AuxiliaryRoles.Lora}@0.8"] = "pixel-art-xl.safetensors" },
    Devices = [slot],
});
```

kohya-ss, diffusers / PEFT and ComfyUI LoRA files are read for SD 1.x / 2.x / XL, FLUX, Chroma and Qwen-Image. LyCORIS and
DoRA variants are rejected.

## Memory

When a model's weights take most of the device memory (FLUX's bf16 files on a 32 GB GPU), the generator holds either the
text encoders or the denoiser and VAE at a time and swaps between them. The conditioning of the previous request is reused
when the prompts are the same, so new seeds, sizes or step counts do not encode again.

## Over HTTP and from the command line

- `services.AddSharplightImageGenerator(name: "sd15")` serves the generator on the OpenAI-compatible
  `POST /v1/images/generations` (`prompt`, `n`, `size`, `response_format: "b64_json"`, plus the extensions
  `negative_prompt`, `steps`, `guidance_scale`, `seed` and `sampler`). Requests to one generator run one at a time.
- `sharplight-generate-image` (samples/Sharplight.GenerateImage) is a command-line front end.

Source: [api-overview.md, Image generation](https://github.com/infernitytech/sharplight/blob/main/docs/api-overview.md).

---
title: Image generation
lead: Text to image, image to image, inpainting and LoRA with Stable Diffusion, FLUX and related models.
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

`GenerateAsync(request)` returns only the finished result.

## Supported inputs

| Family | Files |
|---|---|
| Stable Diffusion 1.x, 2.x, XL | diffusers folders, single-file `.safetensors` or `.ckpt`, stable-diffusion.cpp GGUF |
| FLUX.1 (schnell, dev, fine-tunes) | diffusers folders, original single files, transformer-only GGUF with companion files |

More families (Qwen-Image, FLUX.1 Kontext for editing) are in the
[model list]({{ '/models/?kind=image-generation' | relative_url }}), each with its measured difference from diffusers.

## Options

| Option | Notes |
|---|---|
| `Scheduler` (`Samplers`) | `euler`, `euler-karras`, `euler-ancestral`, `ddim`, `pndm`, `dpm++2m`, `dpm++2m-karras`; flow models use `euler`. Default: the sampler the model was published with. Each matches the diffusers scheduler step by step. |
| `GuidanceScale` | Classifier-free guidance, with an optional negative prompt. Guidance-distilled models take the scale as an input; FLUX.1-schnell ignores it. |
| `Seed` | Image *i* of a request uses `Seed + i`. The noise is identical on every machine and provider. |
| `Width`, `Height` | Native size is 512×512 (SD 1.x) or 1024×1024 (SDXL, FLUX). Other sizes (multiples of 64; FLUX: 16) rebuild the model once per size. |
| `PreviewInterval` | A low-resolution preview every *n* steps. |

## Image to image and inpainting

Set `ImageGenerationRequest.Image` and `Strength`. Add `Mask` for inpainting: white areas are regenerated.

## Models in several files

Transformer-only checkpoints take their text encoders and VAE as auxiliary sources by role:

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

Omitted roles are filled from files beside the transformer. A `.slm` package holds all of them in one file.

## LoRA

A LoRA is an auxiliary source whose role starts with `lora`; `@scale` sets the strength.

```csharp
using var model = TaskModel.Load(loader, new TaskLoadOptions
{
    ModelPath = "sd_xl_base_1.0.safetensors",
    Auxiliary = new Dictionary<string, string> { [$"{AuxiliaryRoles.Lora}@0.8"] = "pixel-art-xl.safetensors" },
    Devices = [slot],
});
```

Reads kohya-ss, diffusers / PEFT and ComfyUI files for SD 1.x / 2.x / XL, FLUX, Chroma and Qwen-Image. LyCORIS and DoRA
are rejected.

## Memory

When the weights take most of the device memory, the generator swaps between the text encoders and the denoiser with
VAE. Conditioning is reused while the prompt stays the same.

## HTTP and command line

- `services.AddSharplightImageGenerator(name: "sd15")` serves `POST /v1/images/generations` (`prompt`, `n`, `size`,
  `response_format: "b64_json"`; extensions `negative_prompt`, `steps`, `guidance_scale`, `seed`, `sampler`). One
  request per generator at a time.
- `sharplight-generate-image` (samples/Sharplight.GenerateImage).

Source: [api-overview.md, Image generation](https://github.com/infernitytech/sharplight/blob/main/docs/api-overview.md).

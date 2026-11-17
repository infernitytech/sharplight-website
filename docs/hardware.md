---
title: Hardware and providers
lead: Where Sharplight runs models, and what it needs from your machine.
description: Sharplight execution providers, covering Vulkan GPUs, CPU, macOS, device features and fallbacks.
permalink: /docs/hardware/
---

Sharplight runs models through **execution providers**: Vulkan for GPUs, a CPU provider, and a new Metal provider for
Apple silicon. None needs Python or the CUDA toolkit.

## Platforms

| | Windows | Linux | macOS (Apple silicon) |
|---|---|---|---|
| Architectures | x64, ARM64 | x64, ARM64 | ARM64 |
| GPU | Vulkan | Vulkan | Metal (new), Vulkan through the bundled MoltenVK |
| CPU | yes | yes | yes (NEON kernels) |

Intel Macs are not supported.

## The Vulkan provider

The Vulkan provider runs compute kernels written in Slang and compiled to SPIR-V. It needs a Vulkan driver from the GPU
vendor; there is nothing else to install.

**Device features and fallbacks.** GPUs differ in what they offer. Sharplight detects each device's features and picks
kernels to match:

- Where the device has **cooperative matrices** (the Vulkan interface to tensor cores), matrix products run on them.
- Where it does not, the same operations run on fallback kernels. Every feature has a fallback, so a device without a
  feature is slower, not unsupported.
- A feature can be switched off per device, which helps when a driver misbehaves.

**What it has been tested on.** The test suites pass on an NVIDIA GPU with cooperative matrices, on an AMD integrated GPU
with the open-source RADV driver (fallback paths), and on llvmpipe, a software Vulkan driver. The published benchmarks
are from NVIDIA RTX PRO cards. Other vendors' GPUs should work through the same feature detection but have not been
benchmarked, and Intel GPUs have not been tested. Reports are welcome.

**Several GPUs.** A model that does not fit one device can be split over several by layers, and a CPU fallback can take
what does not fit.

**Precision.** Defaults keep near-f32 accuracy. Reduced precision (`--reduced-precision` in the tools, a load option in
Studio) opts in to faster half-precision kernel paths where they exist. For ONNX models, `MatrixPrecision.Fast` is an
opt-in mode in the same accuracy class as TF32.

## The CPU provider

The CPU provider has vectorized kernels for x64 (AVX2 and AVX-512 where present) and ARM64 (NEON). It runs every model
the GPU provider runs and is the reference the GPU kernels are tested against.

Its kernels are compiled fully optimized on first use, independent of your application's JIT settings, so the first runs
of a model are not slower than later ones.

## macOS

On Apple silicon there are three ways to run a model:

- **Metal** (new). A native Metal provider was added to the development line in November 2026. It runs the same kernel
  library as the Vulkan provider, compiled for Metal, and is preferred when present. It is in preview builds, not yet in a
  stable release, and has so far been tested and measured on a virtualized test machine only.
- **Vulkan through MoltenVK**, which translates Vulkan to Metal and is bundled with the Studio package. MoltenVK does not
  expose cooperative matrices, so GPU work uses the fallback kernels. It remains the fallback GPU path.
- **The CPU provider**, with NEON kernels.

Discovery lists providers in the order Metal, Vulkan, CPU. The command-line tool's `--provider metal|vulkan` picks one explicitly.

## Choosing a device

```csharp
var catalog = provider.GetRequiredService<ExecutionProviderCatalog>();
foreach (var discovered in catalog.Discover().Where(d => d.Availability.IsAvailable))
{
    foreach (var info in discovered.Provider.GetDevices())
    {
        Console.WriteLine($"{discovered.Provider.Name}: {info}");
    }
}

var gpu = catalog.Discover().First(d => d.Availability.IsAvailable).Provider;
var slot = new DeviceSlot { Device = gpu.OpenDevice(gpu.GetDevices()[0]) };
```

Providers are listed GPUs first. On a machine with several GPUs, the environment variable `SHARPLIGHT_VK_DEVICES` selects
which Vulkan devices are used (for example `SHARPLIGHT_VK_DEVICES=1`).

## Compiled kernels and first-load time

The first time a model runs on a device, its kernels are compiled; the results are cached per user, so later loads skip
that. A `.slm` package can carry precompiled code so that even the first load is fast. See
[model formats]({{ '/docs/model-formats/' | relative_url }}).

## Memory

A model's weights have to fit the device memory, together with the context (KV cache) for language models. Quantized
files (for example Q4_K_M GGUF) need a fraction of the memory of full-precision ones. Sharplight Studio shows a fit
estimate before loading, and the [model list]({{ '/models/' | relative_url }}) gives an approximate memory figure per variant.

## Troubleshooting

- **No GPU found**: install or update the vendor's Vulkan driver. On Linux, check that `vulkaninfo` lists your GPU.
- **Wrong GPU chosen**: set `SHARPLIGHT_VK_DEVICES`, or pick the device in Studio's load panel.
- **A crash or wrong output on one GPU**: please open an issue with the GPU model and driver version. Disabling a device
  feature is the usual workaround until it is fixed.

Source: [README](https://github.com/infernitytech/sharplight/blob/main/README.md),
[macos.md](https://github.com/infernitytech/sharplight/blob/main/docs/macos.md),
[benchmarks.md](https://github.com/infernitytech/sharplight/blob/main/docs/benchmarks.md).

---
title: Hardware and providers
lead: Execution providers, tested devices and device selection.
description: Sharplight execution providers, covering Vulkan GPUs, CPU, macOS, device features and fallbacks.
permalink: /docs/hardware/
---

## Platforms

| | Windows | Linux | macOS (Apple silicon) |
|---|---|---|---|
| Architectures | x64, ARM64 | x64, ARM64 | ARM64 |
| GPU | Vulkan | Vulkan | Metal (new), Vulkan through the bundled MoltenVK |
| CPU | yes | yes | yes |

Intel Macs are not supported.

## The Vulkan provider

Works with NVIDIA, AMD and Intel GPUs: it needs the GPU vendor's Vulkan driver and nothing else. Kernels are written in Slang and compiled to SPIR-V.

- **Features and fallbacks.** Each device's features are detected. Matrix products run on cooperative matrices where
  the device has them and on fallback kernels where it does not. Every feature has a fallback, and a feature can be
  switched off per device when a driver misbehaves.
- **Tested on.** An NVIDIA GPU with cooperative matrices, an AMD integrated GPU with the RADV driver (fallback paths)
  and llvmpipe, a software Vulkan driver. Published benchmarks are from NVIDIA RTX PRO cards. Intel GPUs are supported
  through the same Vulkan path but have not been tested by us yet; reports are welcome.
- **Several GPUs.** A model can be split over devices by layers, with a CPU fallback for what does not fit.
- **Precision.** Defaults keep near-f32 accuracy. `--reduced-precision` in the tools (a load option in Studio) opts in
  to half-precision kernel paths where they exist. For ONNX models, `MatrixPrecision.Fast` is an opt-in mode in the
  same accuracy class as TF32.

## The CPU provider

Vectorized kernels for x64 (AVX2, AVX-512 where present) and ARM64 (NEON). It runs every model the GPU provider runs
and is the reference the GPU kernels are tested against. Kernels are compiled
fully optimized on first use, independent of the application's JIT settings.

## macOS

Discovery order is Metal, Vulkan, CPU. The command-line tool's `--provider metal|vulkan` picks one.

- **Metal** (new, November 2026). The same kernel library as the Vulkan provider, compiled for Metal. In preview
  builds only, and so far tested and measured on a virtualized machine only.
- **Vulkan through MoltenVK**, bundled with Studio. MoltenVK does not expose cooperative matrices, so the fallback
  kernels run.
- **CPU**.

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

Providers are listed GPUs first. `SHARPLIGHT_VK_DEVICES` selects which Vulkan devices are used, for example
`SHARPLIGHT_VK_DEVICES=1`.

## First-load time

Kernels are compiled the first time a model runs on a device and cached per user. A `.slm` package can carry
precompiled code that skips this: see [model formats]({{ '/docs/model-formats/' | relative_url }}).

## Memory

The weights, plus the context (KV cache) for language models, have to fit the device memory. The
[model list]({{ '/models/' | relative_url }}) gives an approximate figure per variant, and Studio shows a fit estimate
before loading.

## Troubleshooting

| Problem | Fix |
|---|---|
| No GPU found | Install or update the vendor's Vulkan driver. On Linux, check that `vulkaninfo` lists the GPU. |
| Wrong GPU chosen | Set `SHARPLIGHT_VK_DEVICES`, or pick the device in Studio's load panel. |
| Crash or wrong output on one GPU | Disable the device feature involved, and open an issue with GPU model and driver version. |

Source: [README](https://github.com/infernitytech/sharplight/blob/main/README.md),
[macos.md](https://github.com/infernitytech/sharplight/blob/main/docs/macos.md),
[benchmarks.md](https://github.com/infernitytech/sharplight/blob/develop/docs/benchmarks.md).

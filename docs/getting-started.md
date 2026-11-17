---
title: Install the packages
lead: Add Sharplight to a .NET project and check that it finds your hardware.
description: Install the Sharplight NuGet packages and discover the available devices.
permalink: /docs/getting-started/
---

## Requirements

- .NET 11 SDK.
- Windows (x64, ARM64), Linux (x64, ARM64) or macOS on Apple silicon.
- For GPU use: a Vulkan driver from your GPU vendor. Without one, Sharplight runs on the CPU provider.
- A model file. Any of these work: a GGUF file, a Hugging Face checkpoint folder (safetensors), an ONNX model, or a
  Sharplight `.slm` package. The [model list]({{ '/models/' | relative_url }}) shows what has been verified.

## Add the package

```sh
dotnet new console -n HelloSharplight
cd HelloSharplight
dotnet add package Sharplight --prerelease
```

`Sharplight` is the entry package. It references the engine, the importers for the supported formats and the CPU and
Vulkan providers, and gives you one registration call: `services.AddSharplight()`.

The packages are alpha prereleases, so `--prerelease` is required and the API can change between versions.

## Register and discover devices

Sharplight is composed through `Microsoft.Extensions.DependencyInjection`. There is no static setup.

```csharp
using Microsoft.Extensions.DependencyInjection;

await using var provider = new ServiceCollection()
    .AddSharplight()
    .BuildServiceProvider();

var catalog = provider.GetRequiredService<ExecutionProviderCatalog>();
foreach (var discovered in catalog.Discover())
{
    Console.WriteLine($"{discovered.Provider.Name}: available = {discovered.Availability.IsAvailable} ({discovered.Availability.Reason})");
}
```

`Discover()` lists the execution providers in order of preference, GPUs first. To open a device for loading models:

```csharp
var gpu = catalog.Discover().First(d => d.Availability.IsAvailable).Provider;
var slot = new DeviceSlot { Device = gpu.OpenDevice(gpu.GetDevices()[0]) };
```

The guides that follow use `slot` for "the device to load the model on".

## Choosing parts yourself

`AddSharplight()` is a shortcut for the individual registrations. An application that wants only GGUF models on the CPU
can register just those:

```csharp
var services = new ServiceCollection()
    .AddGgufImporter()
    .AddBuiltinArchitectures()
    .AddCpuProvider();
```

| Package | Registration | Adds |
|---|---|---|
| `Sharplight` | `AddSharplight()` | everything below |
| `Sharplight.Core` | `AddSharplightTasks()`, `AddBuiltinArchitectures()`, `AddPackageImporter()` | task clients, model architectures, `.slm` packages |
| `Sharplight.Import.Gguf` / `.HuggingFace` / `.Onnx` | `AddGgufImporter()`, `AddHuggingFaceImporter()`, `AddOnnxImporter()` | one source format each |
| `Sharplight.Cpu`, `Sharplight.Vulkan` | `AddCpuProvider()`, `AddVulkanProvider()` | execution providers (register GPUs first) |
| `Sharplight.AspNetCore` | `AddSharplightServer(...)` | HTTP endpoints |
| `Sharplight.Extensions.AI` | `AddSharplightChatClient(...)` and others | `Microsoft.Extensions.AI` adapters |

All registrations are idempotent, and options are `Microsoft.Extensions.Options` classes, so they also bind from configuration.

## Scripts and tests

Code without a host of its own can use a ready-made container:

```csharp
using var services = SharplightDefaults.CreateServiceProvider();
```

## Building from source

```sh
git clone https://github.com/infernitytech/sharplight
cd sharplight
dotnet build Sharplight.slnx -c Release
```

## Next

[First text generation]({{ '/docs/text-generation/' | relative_url }})

---
title: Install the packages
lead: Add Sharplight to a project and list the devices it finds.
description: Install the Sharplight NuGet packages and discover the available devices.
permalink: /docs/getting-started/
---

## Requirements

- .NET 11 SDK
- Windows or Linux (x64, ARM64), or macOS on Apple silicon
- For GPU use: your GPU vendor's Vulkan driver. Without one, models run on the CPU.
- A model: a GGUF file, a Hugging Face checkpoint folder, an ONNX model or a `.slm` package
  ([verified models]({{ '/models/' | relative_url }}))

## Install

```sh
dotnet add package Sharplight --prerelease
```

The packages are alpha prereleases; the API changes between versions.

## Register and discover devices

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

`Discover()` lists providers in order of preference, GPUs first. Open a device to load models on:

```csharp
var gpu = catalog.Discover().First(d => d.Availability.IsAvailable).Provider;
var slot = new DeviceSlot { Device = gpu.OpenDevice(gpu.GetDevices()[0]) };
```

The other guides use `slot` for this device.

## Individual registrations

`AddSharplight()` calls all of the registrations below. To take only some, for example GGUF models on the CPU:

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

Registrations are idempotent. Options are `Microsoft.Extensions.Options` classes and bind from configuration.

## Without a host

For scripts and tests:

```csharp
using var services = SharplightDefaults.CreateServiceProvider();
```

## Build from source

```sh
git clone https://github.com/infernitytech/sharplight
cd sharplight
dotnet build Sharplight.slnx -c Release
```

Next: [First text generation]({{ '/docs/text-generation/' | relative_url }})

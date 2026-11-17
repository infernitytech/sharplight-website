---
title: Vision
lead: Classify images, detect objects, segment, estimate depth, read text and upscale.
description: Image classification, detection, segmentation, depth, OCR and upscaling with local models in Sharplight.
permalink: /docs/vision/
---

Every vision task has its own client, registered like the others: `AddImageClassifier`, `AddImageEmbedder`,
`AddObjectDetector`, `AddDepthEstimator`, `AddImageSegmenter`, `AddTextRecognizer`, `AddImageUpscaler`. Images are
`ImageInput` values; `PngCodec.Read(path)` loads a PNG.

## Object detection

```csharp
var services = new ServiceCollection()
    .AddSharplight()
    .AddObjectDetector(o => { o.ModelPath = "rtdetr_r50vd"; o.Devices = [slot]; });   // a Hugging Face checkpoint folder
await using var provider = services.BuildServiceProvider();
var detector = provider.GetRequiredService<IObjectDetector>();

ObjectDetection found = await detector.DetectAsync(PngCodec.Read("street.png"));
foreach (var item in found.Objects)
{
    Console.WriteLine($"{item.Label} {item.Score:F2} {item.Box}");
}
```

`ObjectDetectionOptions` sets the score threshold, the maximum number of detections and optional non-maximum suppression.
Boxes are in image pixels; instance segmentation models also return a mask per object.

## The tasks

| Task | Client | Call | Result | Model families |
|---|---|---|---|---|
| Classification | `IImageClassifier` | `ClassifyAsync(image)` | labels with scores | ViT, DINOv2, ResNet, ConvNeXt |
| Image and text embeddings | `IImageEmbedder` | `EmbedImageAsync`, `EmbedTextAsync`, `ClassifyZeroShotAsync` | vectors, zero-shot scores | CLIP, SigLIP |
| Object detection | `IObjectDetector` | `DetectAsync(image)` | boxes, labels, scores | DETR, RT-DETR |
| Promptable segmentation | `IImageSegmenter` | `EncodeImageAsync` once, `SegmentAsync` per prompt | masks with predicted quality | SAM 2 |
| Semantic segmentation | `ISemanticSegmenter` | `SegmentAsync(image)` | label map, class names | SegFormer |
| Depth estimation | `IDepthEstimator` | `EstimateAsync(image)` | `DepthMap` with `ToGrayscale()` | Depth Anything |
| OCR | `ITextRecognizer` | `RecognizeAsync(image)` | text, regions | TrOCR |
| Upscaling | `IImageUpscaler` | `UpscaleAsync(image)` | image at `Scale` times the size | Real-ESRGAN |

## Interactive segmentation

Promptable segmentation separates the expensive image stage from the cheap prompt stage. Encode the image once, then
every click or box is one fast call:

- `EncodeImageAsync(image)` returns a `SegmentationImage`.
- `SegmentAsync(segmentationImage, prompt)` takes points (positive or negative) and/or a bounding box in image pixels.
  There is no limit on the number of points.

## Zero-shot classification

CLIP and SigLIP models score an image against prompts you write, without training:
`ClassifyZeroShotAsync` takes the image and the candidate prompts. `EmbedTextAsync` embeds a prompt into the image
space for search.

## Upscaling large images

`IImageUpscaler` runs an image that fits one tile whole and cuts a larger one into overlapping tiles
(`UpscaleOptions.TileSize`, `TilePadding`), blending them so seams are not visible. `UpscaleOptions.Progress` reports
finished tiles.

## Preprocessing

Resizing, cropping and normalization follow each model's own processor configuration and match the reference
implementations' results, so you pass the original image.

## Command line

`samples/Sharplight.Vision`: `sharplight-vision classify|detect|depth model image.png [--label prompt]... [-o out.png]`.

## Verified models

See the [model list]({{ '/models/' | relative_url }}) filtered by vision task. ONNX exports of vision models (YOLO,
ResNet, MobileNet and others) also run through the ONNX importer.

Source: [api-overview.md, Tasks](https://github.com/infernitytech/sharplight/blob/main/docs/api-overview.md).

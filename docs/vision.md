---
title: Vision
lead: Classification, detection, segmentation, depth, OCR and upscaling.
description: Image classification, detection, segmentation, depth, OCR and upscaling with local models in Sharplight.
permalink: /docs/vision/
---

## Tasks

| Task | Register | Client | Call | Result | Model families |
|---|---|---|---|---|---|
| Classification | `AddImageClassifier` | `IImageClassifier` | `ClassifyAsync(image)` | labels with scores | ViT, DINOv2, ResNet, ConvNeXt |
| Image and text embeddings | `AddImageEmbedder` | `IImageEmbedder` | `EmbedImageAsync`, `EmbedTextAsync`, `ClassifyZeroShotAsync` | vectors, zero-shot scores | CLIP, SigLIP |
| Object detection | `AddObjectDetector` | `IObjectDetector` | `DetectAsync(image)` | boxes, labels, scores | DETR, RT-DETR |
| Promptable segmentation | `AddImageSegmenter` | `IImageSegmenter` | `EncodeImageAsync` once, `SegmentAsync` per prompt | masks with predicted quality | SAM 2 |
| Semantic segmentation | | `ISemanticSegmenter` | `SegmentAsync(image)` | label map, class names | SegFormer |
| Depth estimation | `AddDepthEstimator` | `IDepthEstimator` | `EstimateAsync(image)` | `DepthMap` with `ToGrayscale()` | Depth Anything |
| OCR | `AddTextRecognizer` | `ITextRecognizer` | `RecognizeAsync(image)` | text, regions | TrOCR |
| Upscaling | `AddImageUpscaler` | `IImageUpscaler` | `UpscaleAsync(image)` | image at `Scale` times the size | Real-ESRGAN |

Images are `ImageInput` values; `PngCodec.Read(path)` loads a PNG. Pass the original image: resizing, cropping and
normalization follow each model's processor configuration.

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

## Promptable segmentation

- `EncodeImageAsync(image)` returns a `SegmentationImage`. Call it once per image.
- `SegmentAsync(segmentationImage, prompt)` takes any number of positive or negative points and/or a bounding box, in
  image pixels.

## Zero-shot classification

`ClassifyZeroShotAsync` scores an image against candidate prompts. `EmbedTextAsync` embeds a prompt into the image space
for search.

## Upscaling

Images larger than one tile are cut into overlapping tiles (`UpscaleOptions.TileSize`, `TilePadding`) and blended.
`UpscaleOptions.Progress` reports finished tiles.

## Command line

`samples/Sharplight.Vision`: `sharplight-vision classify|detect|depth model image.png [--label prompt]... [-o out.png]`

## Verified models

See the [model list]({{ '/models/' | relative_url }}), filtered by vision task. ONNX exports (YOLO, ResNet, MobileNet
and others) run through the ONNX importer.

Source: [api-overview.md, Tasks](https://github.com/infernitytech/sharplight/blob/main/docs/api-overview.md).

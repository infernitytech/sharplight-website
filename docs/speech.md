---
title: Speech
lead: Speech to text and text to speech, including cloned voices.
description: Speech to text and text to speech with local models in Sharplight.
permalink: /docs/speech/
---

## Speech to text

```csharp
var services = new ServiceCollection().AddSharplight()
    .AddSpeechRecognizer(o => { o.ModelPath = "ggml-small.bin"; o.Devices = [slot]; });   // or a HF directory / .slm
await using var provider = services.BuildServiceProvider();
var recognizer = provider.GetRequiredService<ISpeechRecognizer>();
var result = await recognizer.TranscribeAsync(WavFile.Read("talk.wav"), new SpeechRecognitionOptions { Language = "en" });
foreach (var segment in result.Segments)
{
    Console.WriteLine($"[{segment.Start:mm\\:ss\\.ff} - {segment.End:mm\\:ss\\.ff}] {segment.Text}");
}
```

`TranscribeStreamingAsync` yields segments as they are decoded.

| Family | Examples | Notes |
|---|---|---|
| Encoder-decoder | Whisper and derivatives, Moonshine, Canary | Detects the language when `Language` is null; Canary translates to English with `Translate` |
| Frame-aligned (CTC, transducer) | Parakeet | Word timestamps with `TimestampGranularity.Word` |

### Options

`SpeechRecognitionOptions`:

| Option | Meaning |
|---|---|
| `Language` | null detects it |
| `Translate` | translate to English |
| `Timestamps` | segment (default), word where the model supports it, or none |
| `BeamSize`, `Sampling` | beam search, or sampling instead of greedy decoding |
| `Prompt` | conditions the first window |
| `ConditionOnPreviousText` | prompts each window with the text so far |
| `UseVoiceActivityDetection` | needs a voice-activity model |

Recordings are processed in windows of up to 30 seconds. Each segment carries its token ids, mean log probability and
no-speech probability.

Not yet: temperature fallback, and word timestamps for the Whisper family.

### Audio input

`WavFile.Read` reads PCM and float WAV. `AudioBuffer` converts to mono and resamples. `IAudioDecoder` decodes FLAC, MP3,
Ogg Vorbis and Ogg Opus; the same native library opens microphones and playback devices.

## Text to speech

```csharp
var services = new ServiceCollection().AddSharplight()
    .AddSpeechSynthesizer(o => { o.ModelPath = "Kokoro-82M"; o.Devices = [slot]; });   // the checkpoint folder of hexgrad/Kokoro-82M
await using var provider = services.BuildServiceProvider();
var synthesizer = provider.GetRequiredService<ISpeechSynthesizer>();

SpeechSynthesisResult speech = await synthesizer.SynthesizeAsync("Hello from a local model.");
WavFile.Write("hello.wav", speech.Audio);
```

`SynthesizeStreamingAsync` yields audio chunks during generation.

### Voices

`SpeechSynthesisOptions`:

| Option | Meaning |
|---|---|
| `Voice` | a built-in voice of the model |
| `ReferenceAudio`, `ReferenceText` | a recording to clone; its words for models that align them (F5-TTS, CosyVoice 3) |
| `Instructions` | how to speak, in natural language (CosyVoice 3) |
| `Language`, `Speed` | |
| `NormalizeText` | `false` passes the text as written |

```csharp
var options = new SpeechSynthesisOptions
{
    ReferenceAudio = WavFile.Read("my-voice.wav"),
    ReferenceText = "The words spoken in the recording.",
};
var speech = await synthesizer.SynthesizeAsync("This is said in the cloned voice.", options);
```

Cloning models (Chatterbox, XTTS v2, CosyVoice 3, F5-TTS) can save a recording as a `VoiceProfile` and reuse it without
running the encoders again. Clone only voices you have the right to use.

Numbers, dates, times, currency amounts and common abbreviations are spelled out for English, German, French, Spanish,
Italian, Portuguese, Chinese and Japanese.

Verified models: [model list]({{ '/models/?kind=speech-synthesis' | relative_url }}).

## HTTP and Microsoft.Extensions.AI

- `services.AddSharplightSpeechRecognizer("whisper-1")` serves `/v1/audio/transcriptions` and `/v1/audio/translations`
  (WAV upload; `json`, `text`, `srt`, `vtt`, `verbose_json`).
- `SharplightSpeechToTextClient` and `SharplightTextToSpeechClient` implement `ISpeechToTextClient` and `ITextToSpeechClient`.

## Command line

`samples/Sharplight.Transcribe`:
`sharplight-transcribe model audio.wav [--language en] [--translate] [--beam-size 5] [--format srt]`

Source: [api-overview.md, Tasks and Speech recognition](https://github.com/infernitytech/sharplight/blob/main/docs/api-overview.md).

---
title: Speech
lead: Transcribe recordings with speech-to-text models and speak text with text-to-speech models, including cloned voices.
description: Speech to text and text to speech with local models in Sharplight.
permalink: /docs/speech/
---

## Speech to text

Register a recognizer and call `TranscribeAsync`. The model can be a Hugging Face checkpoint folder, a whisper.cpp `.bin`
file or a `.slm` package.

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

### Model families

One interface covers two kinds of recognizer; which one a model gets follows from the model itself.

| Family | Examples | Notes |
|---|---|---|
| Encoder-decoder with a prompted decoder | Whisper and derivatives, Moonshine, Canary | Language detection when `Language` is null; Whisper's timestamp rules; Canary translates to English with `Translate` |
| Frame-aligned (CTC, transducer) | Parakeet | Word timestamps with `TimestampGranularity.Word` |

### Options

`SpeechRecognitionOptions` includes:

- `Language` (null detects it), `Translate` (to English).
- `Timestamps`: segment (default), word where the model supports it, or none.
- `BeamSize` for beam search; `Sampling` for sampling instead of greedy decoding.
- `Prompt` to condition the first window; `ConditionOnPreviousText` to prompt each window with the text so far.
- `UseVoiceActivityDetection` with a voice-activity model.

Long recordings are processed in windows of up to 30 seconds. Each segment carries its token ids, mean log probability and
no-speech probability.

Not yet: temperature fallback, and word timestamps for the Whisper family.

### Audio input

`WavFile.Read` reads PCM and float WAV files. `AudioBuffer` converts to mono and resamples. With `AddSharplight()`, the
native audio library also decodes FLAC, MP3, Ogg Vorbis and Ogg Opus through `IAudioDecoder`, and gives access to
microphones and playback devices.

## Text to speech

```csharp
var services = new ServiceCollection().AddSharplight()
    .AddSpeechSynthesizer(o => { o.ModelPath = "Kokoro-82M"; o.Devices = [slot]; });   // the checkpoint folder of hexgrad/Kokoro-82M
await using var provider = services.BuildServiceProvider();
var synthesizer = provider.GetRequiredService<ISpeechSynthesizer>();

SpeechSynthesisResult speech = await synthesizer.SynthesizeAsync("Hello from a local model.");
WavFile.Write("hello.wav", speech.Audio);
```

`SynthesizeStreamingAsync` yields audio chunks while the model is still generating, so playback can start early.

### Voices

`SpeechSynthesisOptions` carries the voice:

- `Voice`: a built-in voice of the model.
- `ReferenceAudio`: a recording to clone, with its words in `ReferenceText` for models that align them (F5-TTS, CosyVoice 3).
- `Instructions`: a natural-language instruction on how to speak, for models that take one (CosyVoice 3).
- `Language`, `Speed`.

```csharp
var options = new SpeechSynthesisOptions
{
    ReferenceAudio = WavFile.Read("my-voice.wav"),
    ReferenceText = "The words spoken in the recording.",
};
var speech = await synthesizer.SynthesizeAsync("This is said in the cloned voice.", options);
```

Models that clone voices (Chatterbox, XTTS v2, CosyVoice 3, F5-TTS) can turn a recording into a saved `VoiceProfile` once
and reuse it, without running the encoders again.

Numbers, dates, times, currency amounts and common abbreviations are spelled out before synthesis for English, German,
French, Spanish, Italian, Portuguese, Chinese and Japanese. `NormalizeText = false` passes the text as written.

Please clone only voices you have the right to use.

### Verified text-to-speech models

Kokoro, Orpheus, OuteTTS, Chatterbox, F5-TTS, XTTS v2 and CosyVoice 3 are in the
[model list]({{ '/models/?kind=speech-synthesis' | relative_url }}), each with the reference it was compared against.

## Over HTTP and Microsoft.Extensions.AI

- `services.AddSharplightSpeechRecognizer("whisper-1")` serves the recognizer on the OpenAI-compatible
  `/v1/audio/transcriptions` and `/v1/audio/translations` (WAV upload; `json`, `text`, `srt`, `vtt` and `verbose_json` responses).
- `SharplightSpeechToTextClient` and `SharplightTextToSpeechClient` adapt the clients to `ISpeechToTextClient` and
  `ITextToSpeechClient`.

## Command line

`samples/Sharplight.Transcribe` is the recognizer as a tool:
`sharplight-transcribe model audio.wav [--language en] [--translate] [--beam-size 5] [--format srt]`.

Source: [api-overview.md, Tasks and Speech recognition](https://github.com/infernitytech/sharplight/blob/main/docs/api-overview.md).

import { pipeline } from "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1/+esm";

const MODEL_ID = "Xenova/whisper-tiny.en";

let transcriberPromise = null;

function getAudioContext() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) {
    throw new Error("This browser cannot decode audio files for transcription.");
  }

  return new AudioContextClass();
}

async function decodeAudioFile(file) {
  const audioContext = getAudioContext();

  try {
    const buffer = await file.arrayBuffer();
    const decoded = await audioContext.decodeAudioData(buffer.slice(0));
    const { numberOfChannels, length, sampleRate } = decoded;
    const mono = new Float32Array(length);

    for (let channelIndex = 0; channelIndex < numberOfChannels; channelIndex += 1) {
      const channelData = decoded.getChannelData(channelIndex);
      for (let sampleIndex = 0; sampleIndex < length; sampleIndex += 1) {
        mono[sampleIndex] += channelData[sampleIndex] / numberOfChannels;
      }
    }

    return {
      raw: mono,
      sampling_rate: sampleRate
    };
  } finally {
    if (audioContext.state !== "closed") {
      await audioContext.close();
    }
  }
}

async function loadTranscriber(onStatus) {
  if (!transcriberPromise) {
    transcriberPromise = pipeline("automatic-speech-recognition", MODEL_ID, {
      dtype: "q8",
      progress_callback(progress) {
        if (!onStatus) {
          return;
        }

        const loaded = typeof progress?.loaded === "number" ? progress.loaded : 0;
        const total = typeof progress?.total === "number" && progress.total > 0 ? progress.total : 0;
        const percent = total ? Math.min(100, Math.round((loaded / total) * 100)) : null;
        const file = progress?.file || "speech model";

        onStatus(percent ? `Loading ${file} (${percent}%)...` : `Loading ${file}...`);
      }
    });
  }

  return transcriberPromise;
}

async function transcribeAudioFile(file, onStatus) {
  if (!file) {
    throw new Error("Upload an audio file before requesting transcription.");
  }

  onStatus?.("Preparing audio for transcription...");
  const decodedAudio = await decodeAudioFile(file);

  onStatus?.("Loading speech model in the browser...");
  const transcriber = await loadTranscriber(onStatus);

  onStatus?.("Transcribing audio in the browser...");
  const result = await transcriber(decodedAudio, {
    chunk_length_s: 30,
    stride_length_s: 5
  });

  return {
    text: String(result?.text || "").trim(),
    source: "browser-whisper",
    model: MODEL_ID
  };
}

window.browserAudioTranscriber = {
  transcribeAudioFile
};

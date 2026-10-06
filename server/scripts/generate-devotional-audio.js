/**
 * High-Fidelity Additive Synthesizer for Ayyappa Devotional Soundscape
 * Generates an authentic, original, copyright-free traditional temple bell and meditative tanpura audio track.
 * Output: client/public/audio/ayyappa-devotional.wav
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SAMPLE_RATE = 44100;
const DURATION_SECS = 16;
const TOTAL_SAMPLES = SAMPLE_RATE * DURATION_SECS;

// Stereo buffers
const leftChannel = new Float32Array(TOTAL_SAMPLES);
const rightChannel = new Float32Array(TOTAL_SAMPLES);

// 1. Tanpura Pancham String Definition (Tuned to D / 146.83 Hz)
const BASE_SA = 146.83; // D3
const PA = 220.0;       // A3 (Pancham)
const TAR_SA = 293.66;  // D4 (Tar Sa)

const tanpuraPlucks = [
  { time: 0.0, freq: PA, pan: -0.2 },      // 1st string: Pancham
  { time: 4.0, freq: TAR_SA, pan: 0.1 },  // 2nd string: Tar Sa
  { time: 8.0, freq: TAR_SA, pan: -0.1 }, // 3rd string: Tar Sa
  { time: 12.0, freq: BASE_SA, pan: 0.2 }  // 4th string: Kharaj Sa
];

// Synthesize Tanpura
for (const pluck of tanpuraPlucks) {
  const startSample = Math.floor(pluck.time * SAMPLE_RATE);
  const decayTime = 7.5; // Long, sustained Indian tanpura resonance
  const harmonics = [
    { mult: 1.0, amp: 0.45 },
    { mult: 2.0, amp: 0.30 },
    { mult: 3.0, amp: 0.25 },
    { mult: 4.0, amp: 0.18 },
    { mult: 5.0, amp: 0.12 },
    { mult: 6.0, amp: 0.08 },
    { mult: 7.0, amp: 0.05 }
  ];

  for (let i = 0; i < decayTime * SAMPLE_RATE; i++) {
    const idx = (startSample + i) % TOTAL_SAMPLES;
    const t = i / SAMPLE_RATE;
    const env = Math.exp(-t / 3.2);

    let sampleVal = 0;
    for (const h of harmonics) {
      // Gentle jawari modulation (bridge buzzing subtle warmth)
      const jawariMod = 1.0 + 0.003 * Math.sin(2 * Math.PI * 4.5 * t);
      const angle = 2 * Math.PI * (pluck.freq * h.mult * jawariMod) * t;
      sampleVal += Math.sin(angle) * h.amp;
    }
    sampleVal *= env * 0.35;

    const leftPan = 0.5 * (1 - pluck.pan);
    const rightPan = 0.5 * (1 + pluck.pan);

    leftChannel[idx] += sampleVal * leftPan;
    rightChannel[idx] += sampleVal * rightPan;
  }
}

// 2. Sacred Temple Bell (ఘంటారావం / గంట నాదం)
const bellChimes = [
  { time: 0.5, pan: -0.15 },
  { time: 8.5, pan: 0.15 }
];

const bellPartials = [
  { freq: 587.33, amp: 0.28, decay: 4.5 },  // D5 fundamental
  { freq: 880.00, amp: 0.32, decay: 3.8 },  // A5
  { freq: 1174.66, amp: 0.22, decay: 2.8 }, // D6
  { freq: 1760.00, amp: 0.16, decay: 2.0 }, // A6
  { freq: 2349.32, amp: 0.10, decay: 1.5 }, // D7
  { freq: 3135.96, amp: 0.06, decay: 0.9 }, // G7
  { freq: 4400.00, amp: 0.03, decay: 0.6 }  // High shimmer
];

for (const chime of bellChimes) {
  const startSample = Math.floor(chime.time * SAMPLE_RATE);
  for (let i = 0; i < 5.0 * SAMPLE_RATE; i++) {
    const idx = (startSample + i) % TOTAL_SAMPLES;
    const t = i / SAMPLE_RATE;

    let bellVal = 0;
    for (const p of bellPartials) {
      const strikeEnv = Math.exp(-t / p.decay);
      const angle = 2 * Math.PI * p.freq * t;
      bellVal += Math.sin(angle) * p.amp * strikeEnv;
    }
    bellVal *= 0.28;

    const leftPan = 0.5 * (1 - chime.pan);
    const rightPan = 0.5 * (1 + chime.pan);

    leftChannel[idx] += bellVal * leftPan;
    rightChannel[idx] += bellVal * rightPan;
  }
}

// 3. Normalize & Master to 16-bit PCM WAV
let maxAmp = 0;
for (let i = 0; i < TOTAL_SAMPLES; i++) {
  if (Math.abs(leftChannel[i]) > maxAmp) maxAmp = Math.abs(leftChannel[i]);
  if (Math.abs(rightChannel[i]) > maxAmp) maxAmp = Math.abs(rightChannel[i]);
}

const targetPeak = 0.85; // Peaceful, non-clipping peak
const gain = maxAmp > 0 ? targetPeak / maxAmp : 1.0;

const pcmData = Buffer.alloc(TOTAL_SAMPLES * 4); // 2 channels * 2 bytes
for (let i = 0; i < TOTAL_SAMPLES; i++) {
  const leftInt = Math.max(-32768, Math.min(32767, Math.round(leftChannel[i] * gain * 32767)));
  const rightInt = Math.max(-32768, Math.min(32767, Math.round(rightChannel[i] * gain * 32767)));

  pcmData.writeInt16LE(leftInt, i * 4);
  pcmData.writeInt16LE(rightInt, i * 4 + 2);
}

// 4. Build WAV Header
const numChannels = 2;
const bytesPerSample = 2;
const byteRate = SAMPLE_RATE * numChannels * bytesPerSample;
const blockAlign = numChannels * bytesPerSample;
const wavHeader = Buffer.alloc(44);

wavHeader.write('RIFF', 0);
wavHeader.writeUInt32LE(36 + pcmData.length, 4);
wavHeader.write('WAVE', 8);
wavHeader.write('fmt ', 12);
wavHeader.writeUInt32LE(16, 16); // Subchunk1Size for PCM
wavHeader.writeUInt16LE(1, 20);  // AudioFormat 1 = PCM
wavHeader.writeUInt16LE(numChannels, 22);
wavHeader.writeUInt32LE(SAMPLE_RATE, 24);
wavHeader.writeUInt32LE(byteRate, 28);
wavHeader.writeUInt16LE(blockAlign, 32);
wavHeader.writeUInt16LE(16, 34); // BitsPerSample
wavHeader.write('data', 36);
wavHeader.writeUInt32LE(pcmData.length, 40);

const outputPath = path.resolve(__dirname, '../../client/public/audio/ayyappa-devotional.wav');
const wavBuffer = Buffer.concat([wavHeader, pcmData]);
fs.writeFileSync(outputPath, wavBuffer);

console.log(`[Audio Generator] Generated Ayyappa Devotional Soundscape at: ${outputPath}`);
console.log(`[Audio Specs] ${DURATION_SECS}s, ${SAMPLE_RATE}Hz Stereo 16-bit PCM, Size: ${(wavBuffer.length / (1024 * 1024)).toFixed(2)} MB`);

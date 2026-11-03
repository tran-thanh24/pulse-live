import { MUSIC_MANIFEST } from '../data/musicManifest';
import { eventBus } from './EventBus';
import { assetUrl } from '../utils/assetUrl';

/**
 * Generates an in-memory WAV Blob URL for a manifest track so `audio.currentTime`
 * and Web Audio API `AnalyserNode` run on a genuine HTML5 <audio> element out of the box.
 */
function createProceduralTrackWavUrl(track) {
  const sampleRate = 22050;
  const duration = Math.min(track.duration || 120, 150);
  const numSamples = sampleRate * duration;
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  const writeString = (offset, str) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + numSamples * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, numSamples * 2, true);

  const bpm = track.bpm || 128;
  const beatDur = 60 / bpm;
  const scale = track.synthProfile?.scale || [220, 261.63, 329.63, 392.0, 440.0, 523.25];
  const rootFreq = track.synthProfile?.rootFreq || 110;

  const waveformPeaks = new Float32Array(240);
  const samplesPerPeak = Math.floor(numSamples / 240);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const beatPos = (t / beatDur) % 1;
    const barBeat = Math.floor(t / beatDur) % 16;

    const kickEnv = Math.exp(-beatPos * 9.5);
    const kickFreq = 48 + 90 * Math.exp(-beatPos * 22);
    const kick = Math.sin(2 * Math.PI * kickFreq * t) * kickEnv * 0.55;

    const bassFreq = barBeat < 8 ? rootFreq : barBeat < 12 ? rootFreq * 0.75 : rootFreq * 1.125;
    const bass = Math.sin(2 * Math.PI * bassFreq * t) * (0.28 + 0.12 * Math.sin(t * 8));

    const stepIndex = Math.floor((t / (beatDur * 0.5)) % scale.length);
    const arpFreq = scale[(stepIndex * 2) % scale.length];
    const arpEnv = Math.exp(-((t / (beatDur * 0.5)) % 1) * 5.0);
    const midArp =
      (Math.sin(2 * Math.PI * arpFreq * t) + 0.5 * Math.sin(2 * Math.PI * arpFreq * 2 * t)) *
      arpEnv *
      0.24;

    const offBeatPos = ((t + beatDur * 0.5) / beatDur) % 1;
    const hatEnv = Math.exp(-offBeatPos * 28);
    const hiHat = ((Math.sin(t * 14500) * Math.cos(t * 21300)) % 1) * hatEnv * 0.16;

    let sectionGain = 0.85;
    if (t < 4.5) sectionGain = 0.25 + (t / 4.5) * 0.5;
    else if (t >= 31 && t <= 65) sectionGain = 1.0;
    else if (t >= 90 && t <= 108) sectionGain = 1.12;

    const sample = Math.max(-0.98, Math.min(0.98, (kick + bass + midArp + hiHat) * sectionGain));
    view.setInt16(44 + i * 2, sample * 32767, true);

    const peakBucket = Math.min(239, Math.floor(i / samplesPerPeak));
    const absVal = Math.abs(sample);
    if (absVal > waveformPeaks[peakBucket]) {
      waveformPeaks[peakBucket] = absVal;
    }
  }

  const blob = new Blob([buffer], { type: 'audio/wav' });
  return {
    url: URL.createObjectURL(blob),
    waveformPeaks: Array.from(waveformPeaks)
  };
}

/**
 * MusicEngine — THE MASTER CLOCK OF PULSE//LIVE 2026
 * Supports:
 * - Real-time Web Audio API AnalyserNode (`bass`, `mid`, `treble`, `kick`, `energy`, `waveform`)
 * - Music Library & Local Audio Import (`MP3`, `WAV`, `OGG`) with editable Title, Artist, and BPM
 * - Smooth `fadeIn`, `fadeOut`, and `crossfadeToTrack` transitions
 * - Preloading cache via `warmTrackCache`
 */
class MusicEngine {
  constructor() {
    this.audio = new Audio();
    this.audio.crossOrigin = 'anonymous';
    this.audio.preload = 'auto';
    this.audio.loop = false;

    this.ctx = null;
    this.sourceNode = null;
    this.analyser = null;
    this.musicGain = null;
    this.crowdGain = null;
    this.sfxGain = null;

    this.freqData = new Uint8Array(128);
    this.timeData = new Uint8Array(128);

    this.tracks = [...MUSIC_MANIFEST];
    this.currentTrack = this.tracks[0];
    this.generatedCache = new Map();
    this.waveformPeaks = [];

    this.musicVolume = 0.78;
    this.crowdVolume = 0.55;
    this.sfxVolume = 0.85;
    this.musicEnabled = true;
    this.sfxEnabled = true;

    this.analysis = {
      bass: 0,
      mid: 0,
      treble: 0,
      energy: 0,
      kick: 0,
      waveform: new Float32Array(32)
    };

    this.prevBass = 0;
    this.energyOverride = null;

    this.audio.addEventListener('ended', () => {
      eventBus.emit('music:ended', { track: this.currentTrack });
    });
  }

  ensureAudioContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();

      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.78;
      this.freqData = new Uint8Array(this.analyser.frequencyBinCount);
      this.timeData = new Uint8Array(this.analyser.frequencyBinCount);

      this.musicGain = this.ctx.createGain();
      this.crowdGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();

      this.musicGain.gain.value = this.musicEnabled ? this.musicVolume : 0;
      this.crowdGain.gain.value = this.crowdVolume;
      this.sfxGain.gain.value = this.sfxEnabled ? this.sfxVolume : 0;

      this.sourceNode = this.ctx.createMediaElementSource(this.audio);
      this.sourceNode.connect(this.analyser);
      this.analyser.connect(this.musicGain);
      this.musicGain.connect(this.ctx.destination);
      this.crowdGain.connect(this.ctx.destination);
      this.sfxGain.connect(this.ctx.destination);
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  warmTrackCache(track) {
    if (!track || track.isCustomLocal) return;
    if (!this.generatedCache.has(track.id)) {
      this.generatedCache.set(track.id, createProceduralTrackWavUrl(track));
    }
  }

  loadTrack(trackIdOrObj, autoPlay = false, useFadeIn = false) {
    const track =
      typeof trackIdOrObj === 'string'
        ? this.tracks.find((t) => t.id === trackIdOrObj) || this.tracks[0]
        : trackIdOrObj;

    this.currentTrack = track;

    if (track.isCustomLocal && track.localBlobUrl) {
      this.audio.src = track.localBlobUrl;
      this.waveformPeaks = track.waveformPeaks || [];
    } else if (track.audio) {
      this.audio.src = assetUrl(track.audio);
      this.warmTrackCache(track);
      const cached = this.generatedCache.get(track.id);
      this.waveformPeaks = cached?.waveformPeaks || [];
    } else {
      this.warmTrackCache(track);
      const cached = this.generatedCache.get(track.id);
      this.audio.src = cached.url;
      this.waveformPeaks = cached.waveformPeaks;
    }

    this.audio.currentTime = 0;
    eventBus.emit('music:trackLoaded', {
      track: this.currentTrack,
      waveformPeaks: this.waveformPeaks
    });

    if (autoPlay) {
      if (useFadeIn) {
        this.fadeIn(1.2);
      } else {
        this.play();
      }
    }
  }

  /**
   * Smooth Fade In / Fade Out / Crossfade support (Requirement 30)
   */
  fadeIn(durationSec = 1.2) {
    this.ensureAudioContext();
    if (this.ctx && this.musicGain && this.musicEnabled) {
      const now = this.ctx.currentTime;
      this.musicGain.gain.cancelScheduledValues(now);
      this.musicGain.gain.setValueAtTime(0.01, now);
      this.musicGain.gain.linearRampToValueAtTime(this.musicVolume, now + durationSec);
    }
    this.play();
  }

  fadeOut(durationSec = 1.0) {
    return new Promise((resolve) => {
      if (this.ctx && this.musicGain && this.isPlaying()) {
        const now = this.ctx.currentTime;
        this.musicGain.gain.cancelScheduledValues(now);
        this.musicGain.gain.setValueAtTime(this.musicGain.gain.value, now);
        this.musicGain.gain.linearRampToValueAtTime(0.001, now + durationSec);
        setTimeout(() => {
          this.pause();
          if (this.ctx && this.musicGain) {
            this.musicGain.gain.setValueAtTime(
              this.musicEnabled ? this.musicVolume : 0,
              this.ctx.currentTime
            );
          }
          resolve();
        }, durationSec * 1000);
      } else {
        this.pause();
        resolve();
      }
    });
  }

  async crossfadeToTrack(trackIdOrObj, durationSec = 0.85) {
    if (this.isPlaying()) {
      await this.fadeOut(durationSec * 0.5);
    }
    this.loadTrack(trackIdOrObj, true, true);
  }

  /**
   * Imports a local MP3 / WAV / OGG audio file into the Music Library (`importLocalAudioFile`)
   */
  async importLocalAudioFile(file, customMeta = {}) {
    this.ensureAudioContext();
    const localBlobUrl = URL.createObjectURL(file);
    let duration = 120;
    let waveformPeaks = new Array(240).fill(0.35);
    let estimatedBpm = Number(customMeta.bpm) || 128;

    try {
      const arrayBuf = await file.arrayBuffer();
      if (this.ctx) {
        const audioBuffer = await this.ctx.decodeAudioData(arrayBuf.slice(0));
        duration = Math.round(audioBuffer.duration);
        const channelData = audioBuffer.getChannelData(0);
        const bucketSize = Math.max(1, Math.floor(channelData.length / 240));
        waveformPeaks = [];

        let peakCount = 0;
        for (let i = 0; i < 240; i++) {
          let max = 0;
          const start = i * bucketSize;
          for (let j = 0; j < bucketSize; j += 16) {
            const v = Math.abs(channelData[start + j] || 0);
            if (v > max) max = v;
          }
          waveformPeaks.push(Math.min(1, max));
          if (max > 0.65) peakCount++;
        }

        if (!customMeta.bpm && duration > 10) {
          const rough = Math.round(115 + (peakCount % 35));
          estimatedBpm = Math.max(90, Math.min(160, rough));
        }
      }
    } catch (err) {
      console.warn('[PULSE MusicEngine] Waveform decode fallback used:', err);
    }

    const customTrack = {
      id: `custom_${Date.now()}`,
      title: customMeta.title || file.name.replace(/\.[^/.]+$/, ''),
      artist: customMeta.artist || 'LOCAL STUDIO ARTIST',
      audio: localBlobUrl,
      localBlobUrl,
      isCustomLocal: true,
      duration,
      bpm: Number(estimatedBpm) || 128,
      offset: 0,
      timeline: '/timelines/afterglow.json',
      ledVisual: 'AUDIO_REACTIVE',
      waveformPeaks,
      theme: {
        primary: '#22D3EE',
        secondary: '#8B5CF6',
        accent: '#EC4899'
      }
    };

    this.tracks = [customTrack, ...this.tracks];
    this.loadTrack(customTrack, true);
    eventBus.emit('music:libraryUpdated', { tracks: this.tracks, addedTrack: customTrack });
    return customTrack;
  }

  updateTrackMetadata(trackId, { title, artist, bpm }) {
    this.tracks = this.tracks.map((t) => {
      if (t.id !== trackId) return t;
      const updated = {
        ...t,
        title: title !== undefined ? title : t.title,
        artist: artist !== undefined ? artist : t.artist,
        bpm: bpm !== undefined ? Number(bpm) || 128 : t.bpm
      };
      if (this.currentTrack?.id === trackId) {
        this.currentTrack = updated;
      }
      return updated;
    });
    eventBus.emit('music:libraryUpdated', { tracks: this.tracks });
    return this.currentTrack;
  }

  play() {
    this.ensureAudioContext();
    if (!this.audio.src) {
      this.loadTrack(this.currentTrack, false);
    }
    this.audio.play().catch(() => {});
    eventBus.emit('music:play', { currentTime: this.getCurrentTime() });
  }

  pause() {
    this.audio.pause();
    eventBus.emit('music:pause', { currentTime: this.getCurrentTime() });
  }

  seek(timeSeconds) {
    if (!this.audio.src) {
      this.loadTrack(this.currentTrack, false);
    }
    const maxDur = this.getDuration();
    const clamped = Math.max(0, Math.min(maxDur, Number(timeSeconds) || 0));
    this.audio.currentTime = clamped;
    eventBus.emit('music:seek', { currentTime: clamped });
  }

  isPlaying() {
    return !this.audio.paused && !this.audio.ended;
  }

  getCurrentTime() {
    return this.audio.currentTime || 0;
  }

  getDuration() {
    if (Number.isFinite(this.audio.duration) && this.audio.duration > 0) {
      return this.audio.duration;
    }
    return this.currentTrack?.duration || 120;
  }

  setEnergyOverride(value) {
    this.energyOverride = value === null ? null : Math.max(0, Math.min(1, Number(value)));
  }

  updateAnalysis() {
    if (this.analyser && this.isPlaying()) {
      this.analyser.getByteFrequencyData(this.freqData);
      this.analyser.getByteTimeDomainData(this.timeData);

      let bassSum = 0;
      for (let i = 0; i <= 10; i++) bassSum += this.freqData[i];
      const bass = bassSum / (11 * 255);

      let midSum = 0;
      for (let i = 11; i <= 45; i++) midSum += this.freqData[i];
      const mid = midSum / (35 * 255);

      let trebleSum = 0;
      for (let i = 46; i <= 95; i++) trebleSum += this.freqData[i];
      const treble = trebleSum / (50 * 255);

      const kickDelta = Math.max(0, bass - this.prevBass);
      const kick = kickDelta > 0.08 ? Math.min(1, kickDelta * 4.5) : this.analysis.kick * 0.82;
      this.prevBass = bass;

      const computedEnergy = Math.min(1, bass * 0.5 + mid * 0.35 + treble * 0.25);
      const energy = this.energyOverride !== null ? this.energyOverride : computedEnergy;

      for (let i = 0; i < 32; i++) {
        this.analysis.waveform[i] = (this.timeData[i * 3] - 128) / 128;
      }

      this.analysis.bass = bass;
      this.analysis.mid = mid;
      this.analysis.treble = treble;
      this.analysis.kick = kick;
      this.analysis.energy = energy;
    } else {
      const t = performance.now() * 0.001;
      const override = this.energyOverride;
      this.analysis.bass = override !== null ? override * 0.8 : 0.12 + Math.sin(t * 2.2) * 0.05;
      this.analysis.mid = override !== null ? override * 0.7 : 0.1 + Math.cos(t * 1.7) * 0.04;
      this.analysis.treble = override !== null ? override * 0.6 : 0.06;
      this.analysis.kick = 0;
      this.analysis.energy = override !== null ? override : 0.15;
    }

    return this.analysis;
  }

  updateVolumes({ musicVolume, crowdVolume, sfxVolume, musicEnabled, sfxEnabled }) {
    if (typeof musicVolume === 'number') this.musicVolume = musicVolume;
    if (typeof crowdVolume === 'number') this.crowdVolume = crowdVolume;
    if (typeof sfxVolume === 'number') this.sfxVolume = sfxVolume;
    if (typeof musicEnabled === 'boolean') this.musicEnabled = musicEnabled;
    if (typeof sfxEnabled === 'boolean') this.sfxEnabled = sfxEnabled;

    if (this.ctx && this.musicGain && this.sfxGain) {
      const now = this.ctx.currentTime;
      this.musicGain.gain.setTargetAtTime(
        this.musicEnabled ? this.musicVolume : 0,
        now,
        0.06
      );
      if (this.crowdGain) {
        this.crowdGain.gain.setTargetAtTime(this.crowdVolume, now, 0.08);
      }
      this.sfxGain.gain.setTargetAtTime(
        this.sfxEnabled ? this.sfxVolume : 0,
        now,
        0.05
      );
    }
  }
}

export const musicEngine = new MusicEngine();

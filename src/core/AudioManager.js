/**
 * Web Audio Synthesizer & Sound Engine for NOVA LIVE 2026
 * Complies with browser autoplay policy: only initializes and plays after explicit user gesture.
 */
class AudioManager {
  constructor() {
    this.ctx = null;
    this.isUnlocked = false;
    this.isPlayingMusic = false;
    this.musicGain = null;
    this.sfxGain = null;
    this.ambientNode = null;
    this.sequencerInterval = null;
    this.stepIndex = 0;
    this.currentPhaseId = 'ambience';
    this.bpm = 120;
    this.musicVolume = 0.75;
    this.sfxVolume = 0.85;
    this.musicEnabled = true;
    this.sfxEnabled = true;
  }

  init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      this.isUnlocked = this.ctx.state === 'running';
      return;
    }

    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;

    this.ctx = new AudioCtx();
    this.musicGain = this.ctx.createGain();
    this.sfxGain = this.ctx.createGain();

    this.musicGain.gain.value = this.musicEnabled ? this.musicVolume * 0.35 : 0;
    this.sfxGain.gain.value = this.sfxEnabled ? this.sfxVolume * 0.5 : 0;

    this.musicGain.connect(this.ctx.destination);
    this.sfxGain.connect(this.ctx.destination);
    this.isUnlocked = this.ctx.state === 'running';
  }

  updateVolumes({ musicVolume, sfxVolume, musicEnabled, sfxEnabled }) {
    if (typeof musicVolume === 'number') this.musicVolume = musicVolume;
    if (typeof sfxVolume === 'number') this.sfxVolume = sfxVolume;
    if (typeof musicEnabled === 'boolean') this.musicEnabled = musicEnabled;
    if (typeof sfxEnabled === 'boolean') this.sfxEnabled = sfxEnabled;

    if (this.ctx && this.musicGain && this.sfxGain) {
      const now = this.ctx.currentTime;
      this.musicGain.gain.setTargetAtTime(
        this.musicEnabled ? this.musicVolume * 0.35 : 0,
        now,
        0.08
      );
      this.sfxGain.gain.setTargetAtTime(
        this.sfxEnabled ? this.sfxVolume * 0.5 : 0,
        now,
        0.05
      );
    }
  }

  setConcertPhase(phaseId, bpm = 124) {
    this.currentPhaseId = phaseId;
    this.bpm = bpm;
  }

  startConcertAudio() {
    this.init();
    if (!this.ctx || this.isPlayingMusic) return;
    this.isPlayingMusic = true;

    // Start subtle stadium crowd ambience using filtered pink noise
    this.startAmbientCrowd();

    // Start rhythmic stage bass & synth arpeggiator
    const runStep = () => {
      if (!this.isPlayingMusic || !this.ctx) return;
      if (this.musicEnabled && this.ctx.state === 'running') {
        this.playSequencerStep(this.stepIndex);
      }
      this.stepIndex = (this.stepIndex + 1) % 16;
      const stepDurationMs = (60 / (this.bpm || 120) / 2) * 1000;
      this.sequencerInterval = setTimeout(runStep, stepDurationMs);
    };
    runStep();
  }

  stopConcertAudio() {
    this.isPlayingMusic = false;
    if (this.sequencerInterval) {
      clearTimeout(this.sequencerInterval);
      this.sequencerInterval = null;
    }
    if (this.ambientNode) {
      try {
        this.ambientNode.stop();
      } catch {
        // ignore if already stopped
      }
      this.ambientNode = null;
    }
  }

  startAmbientCrowd() {
    if (!this.ctx || this.ambientNode) return;
    try {
      const bufferSize = this.ctx.sampleRate * 3;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.015;
        b6 = white * 0.115926;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 520;
      filter.Q.value = 0.7;

      const crowdGain = this.ctx.createGain();
      crowdGain.gain.value = 0.22;

      noise.connect(filter);
      filter.connect(crowdGain);
      crowdGain.connect(this.musicGain);
      noise.start();
      this.ambientNode = noise;
    } catch {
      // ignore if audio context restricted
    }
  }

  playSequencerStep(step) {
    const now = this.ctx.currentTime;
    const phase = this.currentPhaseId;

    // Stadium Sub-Bass Kick on beats 0, 4, 8, 12
    if (step % 4 === 0 && phase !== 'ambience') {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      const kickStartFreq = phase === 'song-2' || phase === 'artist-entrance' ? 135 : 110;
      osc.frequency.setValueAtTime(kickStartFreq, now);
      osc.frequency.exponentialRampToValueAtTime(36, now + 0.18);

      gain.gain.setValueAtTime(0.45, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

      osc.connect(gain);
      gain.connect(this.musicGain);
      osc.start(now);
      osc.stop(now + 0.25);
    }

    // Melodic Synth Pluck / Arpeggio
    const scale =
      phase === 'lightstick-event'
        ? [261.63, 311.13, 392.0, 466.16, 523.25] // C minor 7 warm ballad
        : phase === 'encore' || phase === 'finale'
        ? [293.66, 369.99, 440.0, 554.37, 587.33] // D major uplifting stadium
        : [220.0, 261.63, 329.63, 392.0, 440.0, 523.25]; // A minor future synth

    if (phase !== 'ambience' || step % 4 === 0) {
      const freq = scale[(step * 3) % scale.length];
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = phase === 'song-2' ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(phase === 'song-2' ? 1800 : 1100, now);
      filter.frequency.exponentialRampToValueAtTime(320, now + 0.2);

      const noteVol = phase === 'ambience' ? 0.08 : 0.16;
      gain.gain.setValueAtTime(noteVol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain);
      osc.start(now);
      osc.stop(now + 0.24);
    }
  }

  playUISound(variant = 'click') {
    // Do not create AudioContext on 'hover' before the user has clicked/interacted with the page
    if (variant === 'hover' && (!this.ctx || this.ctx.state !== 'running')) {
      return;
    }
    this.init();
    if (!this.ctx || this.ctx.state !== 'running' || !this.sfxEnabled) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    if (variant === 'hover') {
      osc.frequency.setValueAtTime(640, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.04);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.05);
    } else {
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(1040, now + 0.08);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.1);
    }
  }

  playTicketScan() {
    this.init();
    if (!this.ctx || !this.sfxEnabled) return;
    const now = this.ctx.currentTime;
    const notes = [880, 1174.66, 1760];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.09);
      gain.gain.setValueAtTime(0.22, now + idx * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.18);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now + idx * 0.09);
      osc.stop(now + idx * 0.09 + 0.2);
    });
  }

  playLightstickActivation(mode = 'ON') {
    this.init();
    if (!this.ctx || !this.sfxEnabled) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';

    if (mode === 'OFF') {
      osc.frequency.setValueAtTime(660, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.18);
    } else {
      osc.frequency.setValueAtTime(330, now);
      osc.frequency.exponentialRampToValueAtTime(1320, now + 0.22);
    }

    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  playCameraShutter() {
    this.init();
    if (!this.ctx || !this.sfxEnabled) return;
    const now = this.ctx.currentTime;

    // White noise burst for mechanical shutter
    const bufferSize = this.ctx.sampleRate * 0.06;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, now);
    noise.connect(gain);
    gain.connect(this.sfxGain);
    noise.start(now);
  }

  playCheer() {
    this.init();
    if (!this.ctx || !this.sfxEnabled) return;
    const now = this.ctx.currentTime;

    // Harmonic chime + crowd swell
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.04);
      gain.gain.setValueAtTime(0.12, now + i * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.04 + 0.35);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now + i * 0.04);
      osc.stop(now + i * 0.04 + 0.38);
    });
  }
}

export const audioManager = new AudioManager();


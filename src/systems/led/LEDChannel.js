/**
 * LEDChannel.js — Represents an independent LED screen channel (MAIN, LEFT, RIGHT, etc.)
 */
import { LED_MEDIA_TYPES, FIT_MODES, SOURCE_CAPABILITIES } from './LEDConstants';
import { YouTubeMediaSource } from './YouTubeMediaSource';
import { NativeVideoSource } from './NativeVideoSource';
import { ProjectVideoSource } from './ProjectVideoSource';
import { RemoteVideoSource } from './RemoteVideoSource';
import { AudioReactiveSource } from './AudioReactiveSource';

export class LEDChannel {
  constructor(screenId, options = {}) {
    this.screenId = screenId;
    this.sourceType = options.defaultType || LED_MEDIA_TYPES.AUDIO_REACTIVE;
    this.source = null;
    this.blackout = false;
    this.syncToMusic = options.syncToMusic ?? true;
    this.syncOffset = 0; // seconds
    this.brightness = 1.0;
    this.fitMode = FIT_MODES.COVER;
    this.screenAspect = options.screenAspect || (screenId === 'MAIN_LED' ? 16 / 9 : 1.0);
    this.listeners = new Set();

    // Initialize with default source
    this.initDefaultSource(options.defaultInput);
  }

  subscribe(cb) {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  notify() {
    const snapshot = this.getState();
    this.listeners.forEach((cb) => cb(snapshot));
  }

  initDefaultSource(defaultInput) {
    if (this.sourceType === LED_MEDIA_TYPES.AUDIO_REACTIVE) {
      this.source = new AudioReactiveSource(this.screenId);
      this.source.load(defaultInput || 'AUDIO_REACTIVE');
    } else if (this.sourceType === LED_MEDIA_TYPES.YOUTUBE) {
      this.source = new YouTubeMediaSource(this.screenId);
      if (defaultInput) this.source.load(defaultInput, { autoPlay: true });
    } else {
      this.source = new NativeVideoSource(this.screenId, this.sourceType);
      if (defaultInput) this.source.load(defaultInput, { autoPlay: true });
    }
    this.source.subscribe(() => this.notify());
  }

  async setSource(sourceType, input, options = {}) {
    // Destroy previous source
    if (this.source) {
      this.source.destroy();
      this.source = null;
    }

    this.sourceType = sourceType;

    switch (sourceType) {
      case LED_MEDIA_TYPES.YOUTUBE:
        this.source = new YouTubeMediaSource(this.screenId);
        break;
      case LED_MEDIA_TYPES.PROJECT_VIDEO:
        this.source = new ProjectVideoSource(this.screenId);
        break;
      case LED_MEDIA_TYPES.REMOTE_VIDEO:
        this.source = new RemoteVideoSource(this.screenId);
        break;
      case LED_MEDIA_TYPES.LOCAL_VIDEO:
        this.source = new NativeVideoSource(this.screenId, LED_MEDIA_TYPES.LOCAL_VIDEO);
        break;
      case LED_MEDIA_TYPES.AUDIO_REACTIVE:
      default:
        this.source = new AudioReactiveSource(this.screenId);
        break;
    }

    this.source.setBrightness(this.brightness);
    this.source.setLoop(options.loop ?? true);
    this.source.subscribe(() => this.notify());

    try {
      await this.source.load(input, {
        ...options,
        screenAspect: this.screenAspect,
        fitMode: this.fitMode,
        autoPlay: options.autoPlay ?? true
      });
    } catch (err) {
      if (err.message === 'YOUTUBE_URL_DETECTED') {
        // Auto-reroute to YouTube
        return this.setSource(LED_MEDIA_TYPES.YOUTUBE, input, options);
      }
      console.warn(`[LEDChannel ${this.screenId}] load failed:`, err);
    }

    this.notify();
    return this.source;
  }

  play() {
    this.source?.play();
    this.notify();
  }

  pause() {
    this.source?.pause();
    this.notify();
  }

  stop() {
    this.source?.stop();
    this.notify();
  }

  seek(timeSeconds) {
    this.source?.seek(timeSeconds);
    this.notify();
  }

  setVolume(val) {
    this.source?.setVolume(val);
    this.notify();
  }

  setMuted(val) {
    this.source?.setMuted(val);
    this.notify();
  }

  setLoop(val) {
    this.source?.setLoop(val);
    this.notify();
  }

  setBrightness(val) {
    this.brightness = Number(val) || 1.0;
    this.source?.setBrightness(this.brightness);
    this.notify();
  }

  setFitMode(mode) {
    this.fitMode = mode;
    if (this.source && typeof this.source.setFitMode === 'function') {
      this.source.setFitMode(mode, this.screenAspect);
    }
    this.notify();
  }

  setBlackout(isBlackout) {
    this.blackout = Boolean(isBlackout);
    this.notify();
  }

  setSyncToMusic(isSync) {
    this.syncToMusic = Boolean(isSync);
    this.notify();
  }

  setSyncOffset(offsetSeconds) {
    this.syncOffset = Number(offsetSeconds) || 0;
    this.notify();
  }

  syncWithMasterClock(musicCurrentTime, isSeeking = false) {
    if (!this.syncToMusic || !this.source) return;
    const dur = this.source.getDuration();
    if (!dur || dur <= 0) return;

    const expectedTime = Math.max(0, (musicCurrentTime + this.syncOffset) % dur);
    const curTime = this.source.getCurrentTime();
    const drift = Math.abs(curTime - expectedTime);

    // Thresholds: Native (150ms), YouTube (400ms best effort)
    const threshold = this.sourceType === LED_MEDIA_TYPES.YOUTUBE ? 0.40 : 0.15;

    if (isSeeking || drift > threshold) {
      this.source.seek(expectedTime);
    }
  }

  getCapabilities() {
    return this.source?.getCapabilities() || SOURCE_CAPABILITIES[this.sourceType] || SOURCE_CAPABILITIES.NONE;
  }

  getState() {
    return {
      screenId: this.screenId,
      sourceType: this.sourceType,
      source: this.source,
      state: this.source?.getState() || 'UNSTARTED',
      currentTime: this.source?.getCurrentTime() || 0,
      duration: this.source?.getDuration() || 0,
      volume: this.source?.volume ?? 1.0,
      muted: this.source?.muted ?? false,
      loop: this.source?.loop ?? true,
      brightness: this.brightness,
      fitMode: this.fitMode,
      blackout: this.blackout,
      syncToMusic: this.syncToMusic,
      syncOffset: this.syncOffset,
      error: this.source?.error || null,
      capabilities: this.getCapabilities(),
      texture: this.source?.getTexture() || null
    };
  }

  destroy() {
    this.listeners.clear();
    if (this.source) {
      this.source.destroy();
      this.source = null;
    }
  }
}


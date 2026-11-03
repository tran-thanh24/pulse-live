/**
 * MediaSource.js — Abstract Base Class for LED Media Sources
 */
import { LED_MEDIA_TYPES, SOURCE_CAPABILITIES } from './LEDConstants';

export class MediaSource {
  constructor(type = LED_MEDIA_TYPES.NONE) {
    this.type = type;
    this.state = 'UNSTARTED';
    this.volume = 1.0;
    this.muted = true;
    this.loop = true;
    this.brightness = 1.0;
    this.currentTime = 0;
    this.duration = 0;
    this.error = null;
    this.listeners = new Set();
  }

  getCapabilities() {
    return SOURCE_CAPABILITIES[this.type] || SOURCE_CAPABILITIES[LED_MEDIA_TYPES.NONE];
  }

  subscribe(cb) {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  notify() {
    this.listeners.forEach((cb) => {
      try {
        cb(this);
      } catch (err) {
        console.error('[MediaSource] listener error:', err);
      }
    });
  }

  async load(_input, _options = {}) {
    throw new Error('Method load() must be implemented.');
  }

  play() {}
  pause() {}
  stop() {}
  seek(_timeSeconds) {}
  setVolume(value) {
    this.volume = Math.max(0, Math.min(1, Number(value) || 0));
    this.notify();
  }
  setMuted(value) {
    this.muted = Boolean(value);
    this.notify();
  }
  setLoop(value) {
    this.loop = Boolean(value);
    this.notify();
  }
  setBrightness(value) {
    this.brightness = Math.max(0.1, Math.min(2.0, Number(value) || 1.0));
    this.notify();
  }

  getCurrentTime() {
    return this.currentTime;
  }

  getDuration() {
    return this.duration;
  }

  getState() {
    return this.state;
  }

  getTexture() {
    return null;
  }

  destroy() {
    this.listeners.clear();
  }
}


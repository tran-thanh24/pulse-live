/**
 * AudioReactiveSource.js — Handles real-time WebGL/Canvas audio-reactive stage visuals
 */
import * as THREE from 'three';
import { MediaSource } from './MediaSource';
import { LED_MEDIA_TYPES } from './LEDConstants';

export class AudioReactiveSource extends MediaSource {
  constructor(screenId) {
    super(LED_MEDIA_TYPES.AUDIO_REACTIVE);
    this.screenId = screenId;
    this.canvas = document.createElement('canvas');
    this.canvas.width = screenId === 'MAIN_LED' ? 1024 : 640;
    this.canvas.height = screenId === 'MAIN_LED' ? 512 : 360;
    this.ctx = this.canvas.getContext('2d');
    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.colorSpace = THREE.SRGBColorSpace;
    this.visualMode = 'AUDIO_REACTIVE';
    this.customText = '';
    this.state = 'PLAYING';
  }

  async load(options = {}) {
    if (typeof options === 'string') {
      this.visualMode = options;
    } else if (options && typeof options === 'object') {
      if (options.visualMode) this.visualMode = options.visualMode;
      if (options.customText) this.customText = options.customText;
    }
    this.state = 'PLAYING';
    this.notify();
    return this;
  }

  setVisualMode(mode) {
    this.visualMode = mode;
    this.notify();
  }

  getTexture() {
    return this.texture;
  }

  destroy() {
    super.destroy();
    if (this.texture) {
      this.texture.dispose();
      this.texture = null;
    }
    this.ctx = null;
    this.canvas = null;
  }
}


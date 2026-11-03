/**
 * NativeVideoSource.js — Manages HTMLVideoElement + THREE.VideoTexture for High-Quality Native LED Mode
 */
import * as THREE from 'three';
import { MediaSource } from './MediaSource';
import { LED_MEDIA_TYPES, FIT_MODES } from './LEDConstants';
import { parseYouTubeVideoId } from './YouTubeMediaSource';

export class NativeVideoSource extends MediaSource {
  constructor(screenId, type = LED_MEDIA_TYPES.LOCAL_VIDEO) {
    super(type);
    this.screenId = screenId;
    this.videoEl = null;
    this.texture = null;
    this.src = '';
    this.fileName = '';
    this.isLocalBlob = false;
    this.fitMode = FIT_MODES.COVER;
    this.screenAspect = 16 / 9;

    this.onLoadedMetadata = this.onLoadedMetadata.bind(this);
    this.onTimeUpdate = this.onTimeUpdate.bind(this);
    this.onEnded = this.onEnded.bind(this);
    this.onError = this.onError.bind(this);
  }

  async load(sourceInput, options = {}) {
    // If user passed a YouTube URL into Remote Video URL input, flag it so manager can redirect
    if (typeof sourceInput === 'string' && parseYouTubeVideoId(sourceInput)) {
      throw new Error('YOUTUBE_URL_DETECTED');
    }

    this.destroyVideo();

    this.src = typeof sourceInput === 'string' ? sourceInput : '';
    this.fileName = options.fileName || (typeof sourceInput === 'string' ? sourceInput.split('/').pop() : 'Local Video');
    this.isLocalBlob = Boolean(options.isLocalBlob || (typeof sourceInput === 'string' && sourceInput.startsWith('blob:')));
    this.fitMode = options.fitMode || this.fitMode || FIT_MODES.COVER;
    this.screenAspect = options.screenAspect || 16 / 9;

    this.state = 'BUFFERING';
    this.error = null;
    this.notify();

    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.playsInline = true;
    video.preload = 'auto';
    video.loop = Boolean(this.loop);
    video.muted = Boolean(this.muted);
    video.volume = typeof this.volume === 'number' ? this.volume : 1.0;

    this.videoEl = video;

    video.addEventListener('loadedmetadata', this.onLoadedMetadata);
    video.addEventListener('timeupdate', this.onTimeUpdate);
    video.addEventListener('ended', this.onEnded);
    video.addEventListener('error', this.onError);

    video.src = this.src;

    // Create single THREE.VideoTexture once
    this.texture = new THREE.VideoTexture(this.videoEl);
    this.texture.colorSpace = THREE.SRGBColorSpace;
    this.texture.minFilter = THREE.LinearFilter;
    this.texture.magFilter = THREE.LinearFilter;
    this.texture.generateMipmaps = false;

    return new Promise((resolve, reject) => {
      const onCanPlay = () => {
        video.removeEventListener('canplay', onCanPlay);
        this.duration = video.duration || 0;
        this.updateUvFit();
        if (options.autoPlay) {
          video.play().catch(() => {});
          this.state = 'PLAYING';
        } else {
          this.state = 'PAUSED';
        }
        this.notify();
        resolve(this);
      };

      const onLoadError = () => {
        video.removeEventListener('error', onLoadError);
        this.state = 'ERROR';
        this.error = 'Failed to decode or load video stream (Check CORS or codec)';
        this.notify();
        reject(new Error(this.error));
      };

      video.addEventListener('canplay', onCanPlay);
      video.addEventListener('error', onLoadError);
    });
  }

  onLoadedMetadata() {
    if (!this.videoEl) return;
    this.duration = this.videoEl.duration || 0;
    this.updateUvFit();
    this.notify();
  }

  onTimeUpdate() {
    if (!this.videoEl) return;
    this.currentTime = this.videoEl.currentTime || 0;
  }

  onEnded() {
    if (!this.loop) {
      this.state = 'ENDED';
      this.notify();
    }
  }

  onError(e) {
    console.warn(`[NativeVideoSource] Video error on ${this.screenId}:`, e);
    this.state = 'ERROR';
    this.error = 'Native video playback error';
    this.notify();
  }

  setFitMode(fitMode, screenAspect) {
    this.fitMode = fitMode;
    if (screenAspect) this.screenAspect = screenAspect;
    this.updateUvFit();
    this.notify();
  }

  updateUvFit() {
    if (!this.texture || !this.videoEl) return;
    const vw = this.videoEl.videoWidth || 16;
    const vh = this.videoEl.videoHeight || 9;
    const mediaAspect = vw / vh;
    const screenAspect = this.screenAspect || 16 / 9;

    this.texture.wrapS = THREE.ClampToEdgeWrapping;
    this.texture.wrapT = THREE.ClampToEdgeWrapping;

    if (this.fitMode === FIT_MODES.STRETCH) {
      this.texture.repeat.set(1, 1);
      this.texture.offset.set(0, 0);
    } else if (this.fitMode === FIT_MODES.CONTAIN) {
      if (mediaAspect > screenAspect) {
        // Media is wider: fit width, letterbox top/bottom
        const scaleY = mediaAspect / screenAspect;
        this.texture.repeat.set(1, scaleY);
        this.texture.offset.set(0, (1 - scaleY) / 2);
      } else {
        // Media is taller: fit height, pillarbox left/right
        const scaleX = screenAspect / mediaAspect;
        this.texture.repeat.set(scaleX, 1);
        this.texture.offset.set((1 - scaleX) / 2, 0);
      }
    } else {
      // Default: COVER (fills screen without black bars, zooms center)
      if (mediaAspect > screenAspect) {
        const scaleX = screenAspect / mediaAspect;
        this.texture.repeat.set(scaleX, 1);
        this.texture.offset.set((1 - scaleX) / 2, 0);
      } else {
        const scaleY = mediaAspect / screenAspect;
        this.texture.repeat.set(1, scaleY);
        this.texture.offset.set(0, (1 - scaleY) / 2);
      }
    }
    this.texture.needsUpdate = true;
  }

  play() {
    if (this.videoEl) {
      this.videoEl.play().catch(() => {});
      this.state = 'PLAYING';
      this.notify();
    }
  }

  pause() {
    if (this.videoEl) {
      this.videoEl.pause();
      this.state = 'PAUSED';
      this.notify();
    }
  }

  stop() {
    if (this.videoEl) {
      this.videoEl.pause();
      this.videoEl.currentTime = 0;
      this.currentTime = 0;
      this.state = 'ENDED';
      this.notify();
    }
  }

  seek(timeSeconds) {
    if (this.videoEl && this.videoEl.readyState >= 1) {
      this.currentTime = Math.max(0, Math.min(this.duration || 9999, Number(timeSeconds) || 0));
      this.videoEl.currentTime = this.currentTime;
      this.notify();
    }
  }

  setVolume(value) {
    super.setVolume(value);
    if (this.videoEl) {
      this.videoEl.volume = this.volume;
    }
  }

  setMuted(value) {
    super.setMuted(value);
    if (this.videoEl) {
      this.videoEl.muted = this.muted;
    }
  }

  setLoop(value) {
    super.setLoop(value);
    if (this.videoEl) {
      this.videoEl.loop = this.loop;
    }
  }

  getTexture() {
    return this.texture;
  }

  destroyVideo() {
    if (this.videoEl) {
      this.videoEl.removeEventListener('loadedmetadata', this.onLoadedMetadata);
      this.videoEl.removeEventListener('timeupdate', this.onTimeUpdate);
      this.videoEl.removeEventListener('ended', this.onEnded);
      this.videoEl.removeEventListener('error', this.onError);
      this.videoEl.pause();

      if (this.isLocalBlob && this.src && this.src.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(this.src);
        } catch {}
      }

      this.videoEl.src = '';
      this.videoEl.load();
      this.videoEl = null;
    }

    if (this.texture) {
      this.texture.dispose();
      this.texture = null;
    }
  }

  destroy() {
    super.destroy();
    this.destroyVideo();
  }
}

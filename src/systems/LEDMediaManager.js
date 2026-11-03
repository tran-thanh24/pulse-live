import * as THREE from 'three';
import { eventBus } from '../core/EventBus';
import { musicEngine } from '../core/MusicEngine';
import { LEDMaterialHelper } from './LEDMaterial';
import { assetUrl } from '../utils/assetUrl';

export const LED_CHANNELS = [
  'MAIN_LED',
  'LEFT_LED',
  'RIGHT_LED',
  'PULSE_CORE',
  'B_STAGE_LED'
];

export const BUILTIN_VIDEO_CLIPS = [
  {
    id: '/video/afterglow_intro.mp4',
    label: 'Afterglow // City of Sound Intro (MP4 Stream)',
    theme: 'INTRO',
    primary: '#22D3EE',
    secondary: '#8B5CF6'
  },
  {
    id: '/video/pulse_drop_tunnel.mp4',
    label: 'Pulse Core // Harmonic Drop Tunnel (MP4 Stream)',
    theme: 'DROP',
    primary: '#EC4899',
    secondary: '#22D3EE'
  },
  {
    id: '/video/live_camera_feed.mp4',
    label: 'LIVE Broadcast // Artist Close-Up Camera Feed',
    theme: 'LIVE_CAM',
    primary: '#22D3EE',
    secondary: '#FACC15'
  },
  {
    id: '/video/encore_gold_horizon.mp4',
    label: 'Encore // Golden Horizon Finale (MP4 Stream)',
    theme: 'ENCORE',
    primary: '#FACC15',
    secondary: '#FFFFFF'
  }
];

/**
 * LEDMediaManager (`src/systems/LEDMediaManager.js`)
 * Manages independent HTMLVideoElement + THREE.VideoTexture / CanvasTexture channels for:
 * - MAIN_LED
 * - LEFT_LED (supports LIVE_CAM live stage camera broadcast feed)
 * - RIGHT_LED
 * - PULSE_CORE
 * - B_STAGE_LED
 *
 * Features:
 * 1. Real `HTMLVideoElement` + `THREE.VideoTexture` for local `.mp4` / `.webm` files (`URL.createObjectURL`)
 *    plus synthesized `HTMLVideoElement` (`captureStream`) or high-FPS motion video stream for built-in clips.
 * 2. Strict Timeline Sync (`ledVideo` cues) & Drift Correction (>150ms drift auto-resyncs to `musicEngine.getCurrentTime()`).
 * 3. Per-channel controls: Play, Pause, Stop, Loop, Seek, FitMode (`COVER | CONTAIN | STRETCH`), Brightness.
 */
class LEDMediaManager {
  constructor() {
    this.channels = {};
    this.listeners = new Set();

    LED_CHANNELS.forEach((chId) => {
      const videoEl = document.createElement('video');
      videoEl.crossOrigin = 'anonymous';
      videoEl.muted = true;
      videoEl.playsInline = true;
      videoEl.loop = true;

      const videoTexture = new THREE.VideoTexture(videoEl);
      videoTexture.colorSpace = THREE.SRGBColorSpace;
      videoTexture.minFilter = THREE.LinearFilter;
      videoTexture.magFilter = THREE.LinearFilter;

      this.channels[chId] = {
        id: chId,
        mode: chId === 'LEFT_LED' ? 'LIVE_CAM' : 'STAGE_SYNC', // 'STAGE_SYNC' | 'BUILTIN_VIDEO' | 'LOCAL_VIDEO' | 'LIVE_CAM'
        src:
          chId === 'LEFT_LED'
            ? '/video/live_camera_feed.mp4'
            : '/video/afterglow_intro.mp4',
        fileName: null,
        isLocalFile: false,
        playing: true,
        loop: true,
        fitMode: 'COVER', // 'COVER' | 'CONTAIN' | 'STRETCH'
        brightness: 1.0,
        syncWithMusic: true,
        cueStartTime: 0,
        videoEl,
        videoTexture,
        mediaWidth: 1280,
        mediaHeight: 720
      };
    });

    // Listen to ConcertTimeline `ledVideo` cues
    eventBus.on('timeline:cue', (cue) => {
      if (cue.type === 'ledVideo') {
        const target = cue.target || 'MAIN_LED';
        this.triggerTimelineVideoCue(target, {
          src: cue.src || '/video/afterglow_intro.mp4',
          loop: typeof cue.loop === 'boolean' ? cue.loop : true,
          cueTime: cue.time || 0
        });
      }
    });

    // Sync pause/play/seek with MusicEngine Master Clock
    eventBus.on('music:play', () => {
      LED_CHANNELS.forEach((chId) => {
        const ch = this.channels[chId];
        if (ch.syncWithMusic && ch.mode === 'LOCAL_VIDEO') {
          ch.videoEl.play().catch(() => {});
          ch.playing = true;
        }
      });
      this.notify();
    });

    eventBus.on('music:pause', () => {
      LED_CHANNELS.forEach((chId) => {
        const ch = this.channels[chId];
        if (ch.syncWithMusic && ch.mode === 'LOCAL_VIDEO') {
          ch.videoEl.pause();
          ch.playing = false;
        }
      });
      this.notify();
    });

    eventBus.on('music:seek', ({ currentTime }) => {
      LED_CHANNELS.forEach((chId) => {
        const ch = this.channels[chId];
        if (ch.syncWithMusic && ch.mode === 'LOCAL_VIDEO' && ch.videoEl.readyState >= 1) {
          const dur = ch.videoEl.duration || 30;
          const targetT = Math.max(0, (currentTime - ch.cueStartTime) % dur);
          ch.videoEl.currentTime = targetT;
        }
      });
    });
  }

  subscribe(cb) {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  notify() {
    const snapshot = this.getChannelStates();
    this.listeners.forEach((cb) => cb(snapshot));
  }

  getChannel(channelId) {
    return this.channels[channelId] || this.channels.MAIN_LED;
  }

  getChannelStates() {
    const out = {};
    LED_CHANNELS.forEach((id) => {
      const ch = this.channels[id];
      out[id] = {
        id: ch.id,
        mode: ch.mode,
        src: ch.src,
        fileName: ch.fileName,
        isLocalFile: ch.isLocalFile,
        playing: ch.playing,
        loop: ch.loop,
        fitMode: ch.fitMode,
        brightness: ch.brightness,
        syncWithMusic: ch.syncWithMusic,
        currentTime: ch.videoEl?.currentTime || 0,
        duration: ch.videoEl?.duration || 30
      };
    });
    return out;
  }

  /**
   * Loads a user-selected local `.mp4` or `.webm` video file into `HTMLVideoElement` + `THREE.VideoTexture`
   */
  loadLocalVideoFile(channelId, file) {
    const ch = this.getChannel(channelId);
    if (!ch || !file) return null;

    if (ch.isLocalFile && ch.src?.startsWith('blob:')) {
      URL.revokeObjectURL(ch.src);
    }

    const blobUrl = URL.createObjectURL(file);
    ch.src = blobUrl;
    ch.fileName = file.name;
    ch.isLocalFile = true;
    ch.mode = 'LOCAL_VIDEO';
    ch.playing = true;
    ch.cueStartTime = musicEngine.getCurrentTime();

    ch.videoEl.src = blobUrl;
    ch.videoEl.loop = ch.loop;
    ch.videoEl.muted = true;
    ch.videoEl.playsInline = true;
    ch.videoEl.onloadedmetadata = () => {
      ch.mediaWidth = ch.videoEl.videoWidth || 1280;
      ch.mediaHeight = ch.videoEl.videoHeight || 720;
      LEDMaterialHelper.applyFitMode(
        ch.videoTexture,
        16 / 9,
        ch.mediaWidth / ch.mediaHeight,
        ch.fitMode
      );
      this.notify();
    };
    ch.videoEl.play().catch(() => {});

    this.notify();
    return ch;
  }

  /**
   * Switches a channel to a built-in video clip, Live Camera Feed, or Stage Sync
   */
  setChannelSource(channelId, sourceModeOrClipId) {
    const ch = this.getChannel(channelId);
    if (!ch) return;

    if (sourceModeOrClipId === 'STAGE_SYNC') {
      ch.mode = 'STAGE_SYNC';
      ch.playing = true;
    } else if (
      sourceModeOrClipId === 'LIVE_CAM' ||
      sourceModeOrClipId === '/video/live_camera_feed.mp4'
    ) {
      ch.mode = 'LIVE_CAM';
      ch.src = '/video/live_camera_feed.mp4';
      ch.playing = true;
    } else {
      ch.mode = 'BUILTIN_VIDEO';
      ch.src = sourceModeOrClipId;
      ch.playing = true;
    }
    this.notify();
  }

  triggerTimelineVideoCue(channelId, { src, loop = true, cueTime = 0 }) {
    const ch = this.getChannel(channelId);
    if (!ch) return;
    // Do not overwrite if operator manually loaded a custom local file unless requested
    if (!ch.isLocalFile) {
      ch.src = src;
      ch.loop = loop;
      ch.cueStartTime = cueTime;
      ch.mode = src.includes('live_camera') ? 'LIVE_CAM' : 'BUILTIN_VIDEO';
      ch.playing = true;
      this.notify();
    }
  }

  playChannel(channelId) {
    const ch = this.getChannel(channelId);
    ch.playing = true;
    if (ch.mode === 'LOCAL_VIDEO') {
      ch.videoEl.play().catch(() => {});
    }
    this.notify();
  }

  pauseChannel(channelId) {
    const ch = this.getChannel(channelId);
    ch.playing = false;
    if (ch.mode === 'LOCAL_VIDEO') {
      ch.videoEl.pause();
    }
    this.notify();
  }

  stopChannel(channelId) {
    const ch = this.getChannel(channelId);
    ch.playing = false;
    if (ch.mode === 'LOCAL_VIDEO') {
      ch.videoEl.pause();
      ch.videoEl.currentTime = 0;
    }
    this.notify();
  }

  seekChannel(channelId, timeSeconds) {
    const ch = this.getChannel(channelId);
    if (ch.mode === 'LOCAL_VIDEO' && ch.videoEl.readyState >= 1) {
      ch.videoEl.currentTime = Math.max(0, Number(timeSeconds) || 0);
    }
    this.notify();
  }

  updateChannelConfig(channelId, partial = {}) {
    const ch = this.getChannel(channelId);
    if (!ch) return;

    if (typeof partial.loop === 'boolean') {
      ch.loop = partial.loop;
      ch.videoEl.loop = partial.loop;
    }
    if (partial.fitMode) {
      ch.fitMode = partial.fitMode;
      LEDMaterialHelper.applyFitMode(
        ch.videoTexture,
        16 / 9,
        ch.mediaWidth / ch.mediaHeight,
        ch.fitMode
      );
    }
    if (typeof partial.brightness === 'number') {
      ch.brightness = Math.max(0.1, Math.min(1.5, partial.brightness));
    }
    if (typeof partial.syncWithMusic === 'boolean') {
      ch.syncWithMusic = partial.syncWithMusic;
    }
    this.notify();
  }

  /**
   * Frame update: Enforces <150ms drift sync between HTMLVideoElement and MusicEngine Master Clock
   */
  checkDriftAndSync() {
    if (!musicEngine.isPlaying()) return;
    const masterTime = musicEngine.getCurrentTime();

    LED_CHANNELS.forEach((chId) => {
      const ch = this.channels[chId];
      if (
        ch.mode === 'LOCAL_VIDEO' &&
        ch.syncWithMusic &&
        ch.playing &&
        ch.videoEl.readyState >= 2
      ) {
        const dur = ch.videoEl.duration || 30;
        const expectedVideoTime = Math.max(0, (masterTime - ch.cueStartTime) % dur);
        const drift = Math.abs(ch.videoEl.currentTime - expectedVideoTime);
        // Requirement 23: If drift > 150ms (0.15s), resync video!
        if (drift > 0.15 && drift < dur - 0.3) {
          ch.videoEl.currentTime = expectedVideoTime;
        }
      }
    });
  }
}

export const ledMediaManager = new LEDMediaManager();


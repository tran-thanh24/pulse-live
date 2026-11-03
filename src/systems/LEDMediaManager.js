/**
 * LEDMediaManager.js — Central Orchestrator for Dual LED Media System (YouTube + Native)
 * Supports independent per-screen control across MAIN_LED, LEFT_LED, RIGHT_LED, PULSE_CORE, and B_STAGE_LED.
 */
import { eventBus } from '../core/EventBus';
import { musicEngine } from '../core/MusicEngine';
import { LED_SCREENS, LED_MEDIA_TYPES, FIT_MODES } from './led/LEDConstants';
import { LEDChannel } from './led/LEDChannel';
import { performanceManager } from './PerformanceManager';

export const LED_CHANNELS = [
  LED_SCREENS.MAIN_LED,
  LED_SCREENS.LEFT_LED,
  LED_SCREENS.RIGHT_LED,
  LED_SCREENS.B_STAGE_LED,
  LED_SCREENS.PULSE_CORE
];

export const BUILTIN_VIDEO_CLIPS = [
  {
    id: 'opening-visual',
    label: 'Opening Visual // City of Sound (MP4 Stream)',
    theme: 'INTRO'
  },
  {
    id: 'pulse-drop-tunnel',
    label: 'Pulse Core // Harmonic Drop Tunnel (MP4 Stream)',
    theme: 'DROP'
  },
  {
    id: 'encore-gold-horizon',
    label: 'Encore // Golden Horizon Finale (MP4 Stream)',
    theme: 'ENCORE'
  }
];

const STORAGE_KEY = 'pulse_led_channels_v2';

class LEDMediaManager {
  constructor() {
    this.channels = {};
    this.masterBlackout = false;
    this.listeners = new Set();

    // Initialize 5 independent screen channels
    LED_CHANNELS.forEach((screenId) => {
      this.channels[screenId] = new LEDChannel(screenId, {
        defaultType:
          screenId === 'LEFT_LED'
            ? LED_MEDIA_TYPES.AUDIO_REACTIVE
            : screenId === 'RIGHT_LED'
            ? LED_MEDIA_TYPES.AUDIO_REACTIVE
            : LED_MEDIA_TYPES.AUDIO_REACTIVE,
        syncToMusic: true
      });

      this.channels[screenId].subscribe(() => {
        this.savePersistence();
        this.notify();
      });
    });

    this.restorePersistence();
    this.setupEventListeners();
  }

  setupEventListeners() {
    // 1. MusicEngine Master Clock Sync
    eventBus.on('music:play', () => {
      Object.values(this.channels).forEach((ch) => {
        if (ch.syncToMusic && !ch.blackout && !this.masterBlackout) {
          ch.play();
        }
      });
    });

    eventBus.on('music:pause', () => {
      Object.values(this.channels).forEach((ch) => {
        if (ch.syncToMusic) {
          ch.pause();
        }
      });
    });

    eventBus.on('music:seek', ({ currentTime }) => {
      Object.values(this.channels).forEach((ch) => {
        if (ch.syncToMusic) {
          ch.syncWithMasterClock(currentTime, true);
        }
      });
    });

    // 2. ConcertTimeline Cues
    eventBus.on('timeline:cue', (cue) => {
      this.handleTimelineCue(cue);
    });

    // 3. Audio-Reactive Stage Sync when a Track changes (Cinema HUD Mode)
    eventBus.on('music:trackLoaded', ({ track }) => {
      // In Cinema HUD Mode, all stage LED screens remain on native 3D Audio-Reactive visualizers,
      // while the official MV is played cleanly via the CinemaPiPHUD window!
      const mainCh = this.getChannel('MAIN_LED');
      if (mainCh && mainCh.sourceType !== LED_MEDIA_TYPES.AUDIO_REACTIVE) {
        mainCh.setSource(LED_MEDIA_TYPES.AUDIO_REACTIVE, 'AUDIO_REACTIVE');
      }
    });

    // 4. Tab Visibility Throttle (Rule 52: pause video decode when tab is backgrounded)
    eventBus.on('perf:visibilityChanged', ({ isHidden }) => {
      if (isHidden) {
        Object.values(this.channels).forEach((ch) => {
          if (ch.source && ch.source.state === 'PLAYING') {
            ch.source.pause();
            ch.wasPausedByTab = true;
          }
        });
      } else {
        Object.values(this.channels).forEach((ch) => {
          if (ch.wasPausedByTab) {
            ch.wasPausedByTab = false;
            if (musicEngine.isPlaying()) {
              ch.source.play();
            }
          }
        });
      }
    });
  }

  handleTimelineCue(cue) {
    if (!cue) return;
    const target = cue.screen || cue.target || 'MAIN_LED';
    const ch = this.getChannel(target);
    if (!ch) return;

    if (cue.type === 'LED_SOURCE') {
      ch.setSource(cue.sourceType || LED_MEDIA_TYPES.AUDIO_REACTIVE, cue.source, {
        loop: cue.loop ?? true,
        autoPlay: true
      });
    } else if (cue.type === 'LED_PLAY') {
      ch.play();
    } else if (cue.type === 'LED_PAUSE') {
      ch.pause();
    } else if (cue.type === 'LED_STOP') {
      ch.stop();
    } else if (cue.type === 'LED_SEEK') {
      ch.seek(cue.time || cue.timeSeconds || 0);
    } else if (cue.type === 'LED_BLACKOUT') {
      ch.setBlackout(cue.value ?? true);
    } else if (cue.type === 'LED_BRIGHTNESS') {
      ch.setBrightness(cue.value || 1.0);
    } else if (cue.type === 'LED_FIT') {
      ch.setFitMode(cue.value || FIT_MODES.COVER);
    } else if (cue.type === 'LED_SYNC') {
      ch.setSyncToMusic(cue.value ?? true);
    } else if (cue.type === 'ledVideo') {
      // Legacy cue compatibility
      ch.setSource(LED_MEDIA_TYPES.PROJECT_VIDEO, cue.src || 'videos/opening.mp4', {
        loop: typeof cue.loop === 'boolean' ? cue.loop : true,
        autoPlay: true
      });
    }
  }

  checkDriftAndSync() {
    const curMusicTime = musicEngine.getCurrentTime();
    Object.values(this.channels).forEach((ch) => {
      if (ch.syncToMusic && !ch.blackout && !this.masterBlackout) {
        ch.syncWithMasterClock(curMusicTime, false);
      }
    });
  }

  setMasterBlackout(isBlackout) {
    this.masterBlackout = Boolean(isBlackout);
    this.notify();
  }

  getChannel(screenId) {
    return this.channels[screenId] || this.channels.MAIN_LED;
  }

  getChannelStates() {
    const res = {};
    Object.entries(this.channels).forEach(([key, ch]) => {
      res[key] = ch.getState();
    });
    return res;
  }

  subscribe(cb) {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  notify() {
    // Update active video & YouTube count in performanceManager (Rule 20)
    let vCount = 0;
    let ytCount = 0;
    Object.values(this.channels).forEach((ch) => {
      if (ch.sourceType === LED_MEDIA_TYPES.YOUTUBE && ch.source?.state === 'PLAYING') {
        ytCount++;
      } else if (
        (ch.sourceType === LED_MEDIA_TYPES.LOCAL_VIDEO ||
         ch.sourceType === LED_MEDIA_TYPES.PROJECT_VIDEO ||
         ch.sourceType === LED_MEDIA_TYPES.REMOTE_VIDEO) &&
        ch.source?.state === 'PLAYING'
      ) {
        vCount++;
      }
    });
    performanceManager.activeVideos = vCount;
    performanceManager.activeYouTubePlayers = ytCount;

    const snapshot = this.getChannelStates();
    this.listeners.forEach((cb) => {
      try {
        cb(snapshot);
      } catch (err) {
        console.error('[LEDMediaManager] listener error:', err);
      }
    });
  }

  // Persistence: never save blob URLs to localStorage
  savePersistence() {
    if (typeof localStorage === 'undefined') return;
    try {
      const data = {};
      Object.entries(this.channels).forEach(([id, ch]) => {
        // Exclude local file blob URLs
        const persistSource =
          ch.sourceType === LED_MEDIA_TYPES.LOCAL_VIDEO ? null : ch.source?.videoId || ch.source?.src || null;

        data[id] = {
          sourceType: ch.sourceType === LED_MEDIA_TYPES.LOCAL_VIDEO ? LED_MEDIA_TYPES.AUDIO_REACTIVE : ch.sourceType,
          sourceInput: persistSource,
          fitMode: ch.fitMode,
          brightness: ch.brightness,
          syncToMusic: ch.syncToMusic,
          syncOffset: ch.syncOffset,
          loop: ch.source?.loop ?? true
        };
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {}
  }

  restorePersistence() {
    if (typeof localStorage === 'undefined') return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (!data || typeof data !== 'object') return;

      Object.entries(data).forEach(([id, cfg]) => {
        const ch = this.channels[id];
        if (!ch) return;
        if (cfg.brightness) ch.setBrightness(cfg.brightness);
        if (cfg.fitMode) ch.setFitMode(cfg.fitMode);
        if (typeof cfg.syncToMusic === 'boolean') ch.setSyncToMusic(cfg.syncToMusic);
        if (typeof cfg.syncOffset === 'number') ch.setSyncOffset(cfg.syncOffset);

        if (cfg.sourceType && cfg.sourceType !== LED_MEDIA_TYPES.LOCAL_VIDEO) {
          // Keep side screens on Audio-Reactive Canvas unless explicitly configured with non-youtube
          const finalType =
            (id === 'LEFT_LED' || id === 'RIGHT_LED') && cfg.sourceType === LED_MEDIA_TYPES.YOUTUBE
              ? LED_MEDIA_TYPES.AUDIO_REACTIVE
              : cfg.sourceType;

          ch.setSource(finalType, cfg.sourceInput, {
            loop: cfg.loop ?? true,
            autoPlay: false
          });
        }
      });
    } catch (err) {
      console.warn('[LEDMediaManager] Restore persistence failed:', err);
    }
  }

  // Backwards compatibility methods for existing callers
  playChannel(channelId) {
    this.getChannel(channelId).play();
  }

  pauseChannel(channelId) {
    this.getChannel(channelId).pause();
  }

  stopChannel(channelId) {
    this.getChannel(channelId).stop();
  }

  seekChannel(channelId, timeSeconds) {
    this.getChannel(channelId).seek(timeSeconds);
  }

  updateChannelConfig(channelId, config = {}) {
    const ch = this.getChannel(channelId);
    if (!ch) return;
    if (config.fitMode) ch.setFitMode(config.fitMode);
    if (typeof config.brightness === 'number') ch.setBrightness(config.brightness);
    if (typeof config.loop === 'boolean') ch.setLoop(config.loop);
    if (typeof config.syncToMusic === 'boolean') ch.setSyncToMusic(config.syncToMusic);
    if (typeof config.syncOffset === 'number') ch.setSyncOffset(config.syncOffset);
    if (typeof config.blackout === 'boolean') ch.setBlackout(config.blackout);
  }

  setChannelSource(channelId, sourceInput) {
    const ch = this.getChannel(channelId);
    if (!ch) return;
    if (sourceInput === 'STAGE_SYNC' || sourceInput === 'AUDIO_REACTIVE') {
      ch.setSource(LED_MEDIA_TYPES.AUDIO_REACTIVE, 'AUDIO_REACTIVE');
    } else {
      ch.setSource(LED_MEDIA_TYPES.PROJECT_VIDEO, sourceInput);
    }
  }
}

export const ledMediaManager = new LEDMediaManager();

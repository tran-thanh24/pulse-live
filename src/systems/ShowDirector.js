import { musicEngine } from '../core/MusicEngine';
import { eventBus } from '../core/EventBus';
import { concertTimeline } from './ConcertTimeline';
import { audienceEnergySystem } from './AudienceEnergySystem';
import { animationRegistry } from '../characters/AnimationRegistry';
import { danceController } from '../characters/DanceController';
import { achievementSystem } from './AchievementSystem';
import { audioManager } from '../core/AudioManager';
import { MUSIC_MANIFEST } from '../data/musicManifest';
import { setlistManager } from './SetlistManager';
import { mediaPreloader } from './MediaPreloader';
import { ledMediaManager } from './LEDMediaManager';
import { LED_MEDIA_TYPES } from './led/LEDConstants';

/**
 * ShowDirector: Central show state machine & orchestrator for PULSE//LIVE 2026
 * Manages states: LOBBY, PRE_SHOW, INTRO, PERFORMANCE, MC, INTERMISSION, ENCORE, FINALE, POST_SHOW
 * Connects MusicEngine (Master Clock) -> SetlistManager -> ConcertTimeline -> EventBus -> Store & 3D World.
 */
class ShowDirector {
  constructor() {
    this.isInitialized = false;
    this.preShowInterval = null;
    this.preShowCountdown = 10;
    this.segmentTimer = null;
  }

  init(concertStore, userStore) {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // Subscribe to Seek events so ConcertTimeline immediately resyncs without duplicate cues
    eventBus.on('music:seek', ({ currentTime }) => {
      concertTimeline.syncToTime(currentTime);
    });

    // Subscribe to Timeline Cues from EventBus
    eventBus.on('timeline:cue', (cue) => {
      const state = concertStore.getState();

      switch (cue.type) {
        case 'scene': {
          const val = String(cue.value || 'INTRO').toUpperCase();
          if (val === 'BLACKOUT') {
            state.setLightingScene('BLACKOUT');
            state.setShowState('INTRO');
          } else {
            state.setLightingScene(val);
            if (val === 'ENCORE') state.setShowState('ENCORE');
            else state.setShowState('PERFORMANCE');
          }
          break;
        }
        case 'drop': {
          state.setLightingScene('DROP');
          state.setShowState('PERFORMANCE');
          state.triggerFX('co2', true);
          state.triggerFX('laser', true);
          audioManager.playCheer();
          break;
        }
        case 'led': {
          const ledVal = String(cue.value || 'AUDIO_REACTIVE').toUpperCase();
          if (ledVal === 'PULSE-CORE-INTRO') {
            state.setLedSceneType('PULSE_PATTERN');
            state.setPulseCoreVisible(true);
          } else {
            state.setLedSceneType(ledVal);
          }
          break;
        }
        case 'camera': {
          if (state.autoCamera && state.activeModal !== 'photo') {
            state.setCameraMode(cue.value);
          }
          break;
        }
        case 'artist':
        case 'ARTIST_ACTION': {
          const act = animationRegistry.getAction(cue.action || cue.value);
          state.setArtistAnimation(act ? act.clip : (cue.value || 'SING'));
          break;
        }
        case 'GROUP_ACTION': {
          const act = animationRegistry.getAction(cue.action || cue.value);
          state.setArtistAnimation(act ? act.clip : (cue.value || 'DANCE_KPOP'));
          break;
        }
        case 'crowd':
        case 'CROWD_ACTION': {
          const act = animationRegistry.getAction(cue.action || cue.value);
          state.setCrowdBehaviorOverride(act ? act.id : (cue.value || 'wave'));
          break;
        }
        case 'CHARACTER_ACTION': {
          const act = animationRegistry.getAction(cue.action || cue.value);
          if (act) {
            danceController.playAction(act.id);
          }
          break;
        }
        case 'lightstick': {
          if (state.lightstickMode !== 'OFF') {
            state.setLightstickMode('SYNC');
          }
          break;
        }
        case 'pulseWave': {
          state.triggerPulseWave(cue.value || 'CENTER_OUT');
          break;
        }
        case 'laser': {
          state.triggerFX('laser', cue.value === 'on');
          break;
        }
        case 'co2': {
          state.triggerFX('co2', true);
          setTimeout(() => concertStore.getState().triggerFX('co2', false), 3200);
          break;
        }
        case 'confetti': {
          state.triggerFX('confetti', true);
          state.setShowState('FINALE');
          break;
        }
        case 'firework': {
          state.triggerFX('firework', true);
          setTimeout(() => concertStore.getState().triggerFX('firework', false), 5000);
          break;
        }
        case 'EnergyCallout': {
          state.setShowState('MC');
          audienceEnergySystem.startCallout(cue.value || 'MAKE SOME NOISE');
          break;
        }
        default:
          break;
      }
    });

    // Subscribe to Audience Energy Overload (>80%)
    eventBus.on('energy:overload', () => {
      const state = concertStore.getState();
      state.setPulseCoreOverload(true);
      state.triggerPulseWave('CENTER_OUT', '#FACC15');
      state.triggerFX('co2', true);
      state.triggerFX('laser', true);
      userStore.getState().showInfoToast(
        'PULSE CORE OVERLOAD // 100% ⚡',
        'Audience energy surged past 80%! Full stage resonance unlocked!',
        '#FACC15'
      );
      setTimeout(() => {
        concertStore.getState().setPulseCoreOverload(false);
        concertStore.getState().triggerFX('co2', false);
      }, 6500);
    });

    eventBus.on('energy:stateChanged', (payload) => {
      concertStore.getState().setAudienceEnergyState(payload);
    });

    // Subscribe to Track End -> Advance SetlistManager or transition to POST_SHOW Memory Screen
    eventBus.on('music:ended', () => {
      this.playNextSetlistItem(concertStore, userStore);
    });
  }

  /**
   * Starts the Pre-Show Experience (Preloads first track -> 10..1 Countdown -> Blackout -> Pulse Core -> Music Start)
   */
  async startPreShowAndConcert(concertStore, userStore) {
    this.init(concertStore, userStore);
    const state = concertStore.getState();

    await mediaPreloader.preloadOpeningShow();
    const firstItem = setlistManager.getCurrentItem();
    const track =
      musicEngine.tracks.find((t) => t.id === firstItem?.trackId) ||
      state.currentTrack ||
      MUSIC_MANIFEST[0];

    musicEngine.loadTrack(track, false);
    await concertTimeline.loadTimeline(track.timeline);

    this.preShowCountdown = 10;
    state.setShowState('PRE_SHOW');
    state.setPreShowCountdown(10);
    state.setLedSceneType('COUNTDOWN');
    state.setLightingScene('INTRO');

    if (this.preShowInterval) clearInterval(this.preShowInterval);
    this.preShowInterval = setInterval(() => {
      this.preShowCountdown -= 1;
      const st = concertStore.getState();

      if (this.preShowCountdown > 0) {
        st.setPreShowCountdown(this.preShowCountdown);
        audioManager.playUISound('hover');
      } else if (this.preShowCountdown === 0) {
        clearInterval(this.preShowInterval);
        this.preShowInterval = null;
        st.setPreShowCountdown(0);
        st.setLightingScene('BLACKOUT');
        st.setShowState('INTRO');
        audioManager.playCheer();

        setTimeout(() => {
          const s2 = concertStore.getState();
          s2.setPulseCoreVisible(true);
          s2.setLightingScene('INTRO');
          s2.setLedSceneType('AUDIO_REACTIVE');
          musicEngine.fadeIn(1.2);
          mediaPreloader.preloadNextSetlistTrack();
        }, 900);
      }
    }, 1000);
  }

  /**
   * Executes a Setlist Item (`MUSIC`, `ENCORE`, `MC`, `VIDEO`, `INTERMISSION`, `FINALE`)
   */
  async executeSetlistItem(item, concertStore, autoPlay = true) {
    if (!item) return;
    if (this.preShowInterval) {
      clearInterval(this.preShowInterval);
      this.preShowInterval = null;
    }
    if (this.segmentTimer) {
      clearTimeout(this.segmentTimer);
      this.segmentTimer = null;
    }

    const st = concertStore.getState();
    st.setPreShowCountdown(0);

    if (item.type === 'MC' || item.type === 'INTERMISSION' || item.type === 'VIDEO') {
      musicEngine.pause();
      st.setShowState(item.type === 'MC' ? 'MC' : 'INTERMISSION');
      st.setArtistAnimation(item.type === 'MC' ? 'TALK' : 'WAVE');
      st.setLedSceneType(item.type === 'MC' ? 'ARTIST_NAME' : 'PULSE_PATTERN');
      if (item.type === 'MC') {
        audienceEnergySystem.startCallout('MAKE SOME NOISE // CITY OF SOUND');
      }
      // Auto-advance after segment duration
      const segDurMs = Math.min(18000, (item.duration || 12) * 1000);
      this.segmentTimer = setTimeout(() => {
        this.playNextSetlistItem(concertStore);
      }, segDurMs);
      return;
    }

    // Music / Encore / Finale track item
    const track =
      musicEngine.tracks.find((t) => t.id === item.trackId) ||
      musicEngine.tracks[0] ||
      MUSIC_MANIFEST[0];

    st.setCurrentTrack(track);
    st.setShowState(item.type === 'ENCORE' ? 'ENCORE' : 'PERFORMANCE');
    if (item.type === 'ENCORE') {
      st.setLightingScene('ENCORE');
    }

    await musicEngine.crossfadeToTrack(track, autoPlay ? 0.8 : 0);
    if (!autoPlay) {
      musicEngine.pause();
    }
    await concertTimeline.loadTimeline(track.timeline);
    mediaPreloader.preloadNextSetlistTrack();
  }

  async playNextSetlistItem(concertStore, userStore = null) {
    const nextItem = setlistManager.advanceNext();
    if (nextItem) {
      await this.executeSetlistItem(nextItem, concertStore, true);
    } else {
      const state = concertStore.getState();
      state.setShowState('POST_SHOW');
      achievementSystem.unlock('NOVA_NIGHT');
      if (userStore) {
        userStore.getState().markConcertVisited();
      }
      audioManager.playCheer();
      state.setScreen('end');
    }
  }

  async playPreviousSetlistItem(concertStore) {
    const prevItem = setlistManager.advancePrevious();
    if (prevItem) {
      await this.executeSetlistItem(prevItem, concertStore, true);
    }
  }

  async changeTrack(trackId, concertStore, autoPlay = true) {
    if (this.preShowInterval) {
      clearInterval(this.preShowInterval);
      this.preShowInterval = null;
    }
    const track =
      musicEngine.tracks.find((t) => t.id === trackId) || MUSIC_MANIFEST[0];
    concertStore.getState().setCurrentTrack(track);
    concertStore.getState().setPreShowCountdown(0);
    concertStore.getState().setShowState('PERFORMANCE');

    await musicEngine.crossfadeToTrack(track, autoPlay ? 0.65 : 0);
    if (!autoPlay) musicEngine.pause();
    await concertTimeline.loadTimeline(track.timeline);
  }

  update(delta, concertStore) {
    const analysis = musicEngine.updateAnalysis();
    const currentTime = musicEngine.getCurrentTime();
    const isPlaying = musicEngine.isPlaying();

    const state = concertStore.getState();
    if (isPlaying) {
      concertTimeline.update(currentTime);
    }

    audienceEnergySystem.updatePassiveCrowdEnergy(delta, analysis.energy);

    // Keep store mutable reference updated for instantaneous useFrame WebGL readers
    state.audioAnalysis = analysis;
    state.concertTime = currentTime;
    state.isConcertPlaying = isPlaying;

    // Throttle React state notification to ~6.5 Hz (Rule 26 & 28: no 60fps React state churn)
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    if (!this.lastUiSyncTime || now - this.lastUiSyncTime >= 150 || isPlaying !== this.lastIsPlaying) {
      this.lastUiSyncTime = now;
      this.lastIsPlaying = isPlaying;
      state.syncMasterClock(currentTime, isPlaying, analysis);
    }
  }
}

export const showDirector = new ShowDirector();

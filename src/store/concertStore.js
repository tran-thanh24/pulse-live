import { create } from 'zustand';
import { CONCERT_CONFIG } from '../data/concert';
import { MUSIC_MANIFEST } from '../data/musicManifest';
import { isSimulatedOnlineCount } from '../services/realtime';
import { PULSE_LIGHT_MODES } from '../systems/LightstickSystem';

export const useConcertStore = create((set, get) => ({
  // Journey screen: 'landing' | 'ticket' | 'avatar' | 'venue' | 'end'
  currentScreen: 'landing',

  // Audience Mode (default) vs Studio Mode (operator/creator)
  studioMode: false,

  // Online fan presence
  onlineCount: CONCERT_CONFIG.initialSimulatedOnlineCount,
  isSimulatedOnlineCount,

  // ShowDirector state: 'LOBBY' | 'PRE_SHOW' | 'INTRO' | 'PERFORMANCE' | 'MC' | 'INTERMISSION' | 'ENCORE' | 'FINALE' | 'POST_SHOW'
  showState: 'PRE_SHOW',
  preShowCountdown: 10,

  // Master Clock & MusicEngine state
  currentTrack: MUSIC_MANIFEST[0],
  concertTime: 0,
  isConcertPlaying: false,
  audioAnalysis: {
    bass: 0.15,
    mid: 0.12,
    treble: 0.08,
    kick: 0,
    energy: 0.2
  },

  // Lighting & Stage FX state
  lightingScene: 'INTRO',
  fxState: {
    laser: true,
    beam: true,
    co2: false,
    confetti: false,
    firework: false,
    blackout: false
  },

  // LED Engine state
  // Types: 'TEXT' | 'IMAGE' | 'VIDEO' | 'CANVAS' | 'SHADER' | 'AUDIO_REACTIVE' | 'COUNTDOWN' | 'ARTIST_NAME' | 'LYRIC_STYLE' | 'ABSTRACT' | 'PULSE_PATTERN'
  ledSceneType: 'AUDIO_REACTIVE',
  ledCustomText: 'FEEL THE SOUND // BECOME THE SHOW',
  localMedia: {
    mainLed: null, // { type: 'image'|'video', url, name }
    sideLed: null,
    pulseCore: null
  },

  // Signature Object: PULSE CORE state
  pulseCoreVisible: true,
  pulseCoreOverload: false,
  pulseCoreEnergyOverride: null,

  // Artist Performance state
  castMode: CONCERT_CONFIG.castMode || 'group',
  artistAnimation: 'SING', // 'IDLE' | 'WALK' | 'SING' | 'DANCE_A' | 'DANCE_B' | 'WAVE' | 'TALK' | 'RUNWAY' | 'FINAL_POSE'

  // PULSE LIGHT & PULSE WAVE state
  lightstickMode: 'ENERGY', // 'OFF' | 'STATIC' | 'BEAT' | 'SYNC' | 'WAVE' | 'ENERGY'
  pulseWaveState: {
    active: false,
    pattern: 'CENTER_OUT', // 'LEFT_TO_RIGHT' | 'CENTER_OUT' | 'STAGE_TO_BACK' | 'SPIRAL' | 'RANDOM_CLUSTER'
    color: '#22D3EE',
    speed: 5.2
  },
  crowdBehaviorOverride: null,

  // Audience Energy System state
  audienceEnergyState: {
    energy: 42,
    isCalloutActive: false,
    calloutPrompt: 'MAKE SOME NOISE',
    overloadActive: false
  },

  // Player spatial state
  playerPosition: [0, 0, 34],
  playerRotation: 0,
  isPlayerMoving: false,
  isPlayerRunning: false,
  isPlayerJumping: false,
  playerPose: 'idle',

  // CameraDirector state
  autoCamera: true,
  cameraMode: 'PLAYER', // 'PLAYER' | 'WIDE_STAGE' | 'ARTIST_CLOSE' | 'RUNWAY' | 'B_STAGE' | 'CROWD' | 'SIDE_STAGE' | 'CRANE' | 'DRONE' | 'ORBIT' | 'photo'
  cameraOrbitOffset: { yaw: 0, pitch: 0.28, distance: 6.8 },
  photoSettings: {
    zoom: 1.0,
    anglePreset: 'portrait', // 'portrait' | 'wide-stage' | 'low-hero' | 'runway'
    dofEnabled: true
  },

  // Mobile virtual joystick
  joystickVector: { x: 0, y: 0 },

  // Active zone near player
  activeZone: null,

  // Active modal: null | 'merch' | 'photo' | 'schedule' | 'settings' | 'venue-info'
  activeModal: null,

  // Cinema MV Picture-in-Picture state
  cinemaMvOpen: true,

  // Reactions & Moments
  reactions: [],
  lastReactionTime: 0,
  momentsCount: 0,

  //Adaptive FPS performance tier
  adaptiveTier: 'HIGH',
  currentFps: 60,
  devMode: false,

  // Actions
  setScreen: (screen) => set({ currentScreen: screen, activeModal: null }),
  setDevMode: (devMode) => set({ devMode }),
  setStudioMode: (studioMode) => set({ studioMode }),
  toggleStudioMode: () => set((s) => ({ studioMode: !s.studioMode })),
  setOnlineCount: (onlineCount) => set({ onlineCount }),

  setShowState: (showState) => set({ showState }),
  setPreShowCountdown: (preShowCountdown) => set({ preShowCountdown }),
  setCurrentTrack: (currentTrack) => set({ currentTrack }),

  syncMasterClock: (concertTime, isConcertPlaying, audioAnalysis) =>
    set({
      concertTime,
      isConcertPlaying,
      audioAnalysis: {
        bass: audioAnalysis.bass,
        mid: audioAnalysis.mid,
        treble: audioAnalysis.treble,
        kick: audioAnalysis.kick,
        energy: audioAnalysis.energy
      }
    }),

  setLightingScene: (sceneKey) => {
    const upper = String(sceneKey || 'INTRO').toUpperCase();
    if (CONCERT_CONFIG.stageColors[upper]) {
      set((s) => ({
        lightingScene: upper,
        fxState: {
          ...s.fxState,
          blackout: upper === 'BLACKOUT'
        }
      }));
    }
  },

  triggerFX: (fxKey, active) =>
    set((s) => {
      const nextVal = typeof active === 'boolean' ? active : !s.fxState[fxKey];
      const nextLighting =
        fxKey === 'blackout' && nextVal
          ? 'BLACKOUT'
          : fxKey === 'blackout' && !nextVal && s.lightingScene === 'BLACKOUT'
          ? 'INTRO'
          : s.lightingScene;
      return {
        lightingScene: nextLighting,
        fxState: {
          ...s.fxState,
          [fxKey]: nextVal
        }
      };
    }),

  setLedSceneType: (ledSceneType) => set({ ledSceneType }),
  setLedCustomText: (ledCustomText) => set({ ledCustomText }),

  assignLocalMedia: (target, mediaObj) =>
    set((s) => ({
      localMedia: {
        ...s.localMedia,
        [target]: mediaObj
      },
      ledSceneType:
        target === 'mainLed' && mediaObj?.type === 'video'
          ? 'VIDEO'
          : target === 'mainLed' && mediaObj?.type === 'image'
          ? 'IMAGE'
          : s.ledSceneType
    })),

  setPulseCoreVisible: (pulseCoreVisible) => set({ pulseCoreVisible }),
  setPulseCoreOverload: (pulseCoreOverload) => set({ pulseCoreOverload }),
  setPulseCoreEnergyOverride: (val) => set({ pulseCoreEnergyOverride: val }),

  setCastMode: (castMode) => set({ castMode }),
  setArtistAnimation: (artistAnimation) => set({ artistAnimation }),

  cycleLightstickMode: () => {
    const current = get().lightstickMode;
    const nextIndex = (PULSE_LIGHT_MODES.indexOf(current) + 1) % PULSE_LIGHT_MODES.length;
    const nextMode = PULSE_LIGHT_MODES[nextIndex];
    set((state) => ({
      lightstickMode: nextMode,
      momentsCount: nextMode !== 'OFF' ? state.momentsCount + 1 : state.momentsCount
    }));
    return nextMode;
  },

  setLightstickMode: (lightstickMode) => set({ lightstickMode }),

  triggerPulseWave: (pattern = 'CENTER_OUT', color = '#22D3EE') => {
    set({
      pulseWaveState: {
        active: true,
        pattern,
        color,
        speed: 5.4
      }
    });
  },

  stopPulseWave: () =>
    set((s) => ({
      pulseWaveState: { ...s.pulseWaveState, active: false }
    })),

  setCrowdBehaviorOverride: (crowdBehaviorOverride) => set({ crowdBehaviorOverride }),
  setAudienceEnergyState: (audienceEnergyState) => set({ audienceEnergyState }),

  setPlayerTransform: (position, rotation, moving = false, running = false, jumping = false) =>
    set((s) => ({
      playerPosition: position,
      playerRotation: rotation,
      isPlayerMoving: moving,
      isPlayerRunning: running,
      isPlayerJumping: jumping,
      // Smoothly return camera to PLAYER when user actively moves character with WASD/joystick
      cameraMode:
        moving && s.cameraMode !== 'PLAYER' && s.cameraMode !== 'photo'
          ? 'PLAYER'
          : s.cameraMode
    })),

  setPlayerPose: (playerPose) => set({ playerPose }),
  setAutoCamera: (autoCamera) =>
    set((s) => ({
      autoCamera,
      cameraMode: !autoCamera && s.cameraMode !== 'photo' ? 'PLAYER' : s.cameraMode
    })),
  setCameraMode: (cameraMode) => set({ cameraMode }),
  setCameraOrbitOffset: (partial) =>
    set((state) => ({
      cameraOrbitOffset: { ...state.cameraOrbitOffset, ...partial }
    })),
  updatePhotoSettings: (partial) =>
    set((state) => ({
      photoSettings: { ...state.photoSettings, ...partial }
    })),

  setJoystickVector: (x, y) => set({ joystickVector: { x, y } }),
  setActiveZone: (activeZone) => set({ activeZone }),

  setActiveModal: (modal) => {
    const currentCamera = get().cameraMode;
    if (modal === 'photo') {
      set({ activeModal: 'photo', cameraMode: 'photo', playerPose: 'pose1' });
    } else {
      set({
        activeModal: modal,
        cameraMode: currentCamera === 'photo' ? 'PLAYER' : currentCamera,
        playerPose: 'idle'
      });
    }
  },

  setCinemaMvOpen: (cinemaMvOpen) => set({ cinemaMvOpen }),

  triggerReaction: (type, emoji, label) => {
    const now = Date.now();
    if (now - get().lastReactionTime < 350) {
      return false;
    }
    const id = `react_${now}_${Math.random().toString(36).slice(2, 6)}`;
    const newReaction = {
      id,
      type,
      emoji,
      label,
      xOffset: (Math.random() - 0.5) * 90,
      createdAt: now
    };
    set((state) => ({
      lastReactionTime: now,
      momentsCount: state.momentsCount + 1,
      reactions: [...state.reactions.slice(-14), newReaction]
    }));
    return true;
  },

  setPerformanceMetrics: (currentFps, adaptiveTier) => set({ currentFps, adaptiveTier }),

  replayConcert: () => {
    set({
      currentScreen: 'venue',
      showState: 'PRE_SHOW',
      preShowCountdown: 10,
      lightingScene: 'INTRO',
      activeModal: null,
      cameraMode: 'WIDE_STAGE',
      playerPosition: [0, 0, 12]
    });
  }
}));

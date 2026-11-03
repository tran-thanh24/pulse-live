/**
 * LEDConstants.js — Centralized enums, types, and capability definitions for LED Media System
 */

export const LED_SCREENS = {
  MAIN_LED: 'MAIN_LED',
  LEFT_LED: 'LEFT_LED',
  RIGHT_LED: 'RIGHT_LED',
  B_STAGE_LED: 'B_STAGE_LED',
  PULSE_CORE: 'PULSE_CORE'
};

export const LED_SCREEN_LIST = [
  LED_SCREENS.MAIN_LED,
  LED_SCREENS.LEFT_LED,
  LED_SCREENS.RIGHT_LED,
  LED_SCREENS.B_STAGE_LED,
  LED_SCREENS.PULSE_CORE
];

export const LED_MEDIA_TYPES = {
  NONE: 'NONE',
  YOUTUBE: 'YOUTUBE',
  LOCAL_VIDEO: 'LOCAL_VIDEO',
  PROJECT_VIDEO: 'PROJECT_VIDEO',
  REMOTE_VIDEO: 'REMOTE_VIDEO',
  IMAGE: 'IMAGE',
  AUDIO_REACTIVE: 'AUDIO_REACTIVE',
  LIVE_CAMERA: 'LIVE_CAMERA'
};

export const FIT_MODES = {
  COVER: 'COVER',
  CONTAIN: 'CONTAIN',
  STRETCH: 'STRETCH'
};

export const YOUTUBE_PLAYER_STATES = {
  UNSTARTED: 'UNSTARTED',
  ENDED: 'ENDED',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  BUFFERING: 'BUFFERING',
  CUED: 'CUED',
  ERROR: 'ERROR'
};

export const SOURCE_CAPABILITIES = {
  [LED_MEDIA_TYPES.NONE]: {
    canPlay: false,
    canPause: false,
    canSeek: false,
    canLoop: false,
    canVolume: false,
    canMute: false,
    canBrightness: false,
    supportsNativeTexture: false,
    label: 'None',
    badge: 'INACTIVE'
  },
  [LED_MEDIA_TYPES.YOUTUBE]: {
    canPlay: true,
    canPause: true,
    canSeek: true,
    canLoop: true,
    canVolume: true,
    canMute: true,
    canBrightness: false,
    supportsNativeTexture: false,
    label: 'YOUTUBE',
    subLabel: 'Quick Link Mode',
    badge: 'YOUTUBE IFRAME'
  },
  [LED_MEDIA_TYPES.LOCAL_VIDEO]: {
    canPlay: true,
    canPause: true,
    canSeek: true,
    canLoop: true,
    canVolume: true,
    canMute: true,
    canBrightness: true,
    supportsNativeTexture: true,
    label: 'LOCAL VIDEO',
    subLabel: 'Native LED Mode (Device Only)',
    badge: 'NATIVE WEBGL'
  },
  [LED_MEDIA_TYPES.PROJECT_VIDEO]: {
    canPlay: true,
    canPause: true,
    canSeek: true,
    canLoop: true,
    canVolume: true,
    canMute: true,
    canBrightness: true,
    supportsNativeTexture: true,
    label: 'PROJECT VIDEO',
    subLabel: 'Native LED Mode (Asset Bundled)',
    badge: 'NATIVE WEBGL'
  },
  [LED_MEDIA_TYPES.REMOTE_VIDEO]: {
    canPlay: true,
    canPause: true,
    canSeek: true,
    canLoop: true,
    canVolume: true,
    canMute: true,
    canBrightness: true,
    supportsNativeTexture: true,
    label: 'VIDEO URL',
    subLabel: 'Native LED Mode (Direct MP4/WebM)',
    badge: 'NATIVE WEBGL'
  },
  [LED_MEDIA_TYPES.AUDIO_REACTIVE]: {
    canPlay: true,
    canPause: false,
    canSeek: false,
    canLoop: false,
    canVolume: false,
    canMute: false,
    canBrightness: true,
    supportsNativeTexture: true,
    label: 'AUDIO REACTIVE',
    subLabel: 'Stage Sync Visual Generator',
    badge: 'PROCEDURAL CANVAS'
  },
  [LED_MEDIA_TYPES.IMAGE]: {
    canPlay: false,
    canPause: false,
    canSeek: false,
    canLoop: false,
    canVolume: false,
    canMute: false,
    canBrightness: true,
    supportsNativeTexture: true,
    label: 'IMAGE',
    subLabel: 'Static Graphic Backdrop',
    badge: 'TEXTURE'
  },
  [LED_MEDIA_TYPES.LIVE_CAMERA]: {
    canPlay: true,
    canPause: false,
    canSeek: false,
    canLoop: false,
    canVolume: false,
    canMute: false,
    canBrightness: true,
    supportsNativeTexture: true,
    label: 'LIVE CAM',
    subLabel: 'Stage Close-Up Feed',
    badge: 'LIVE BROADCAST'
  }
};

/**
 * mediaManifest.js — Config-defined project video assets & presets for PULSE//LIVE 2026
 */
import { assetUrl } from '../utils/assetUrl';

export const PROJECT_VIDEOS = [
  {
    id: 'opening-visual',
    label: 'City of Sound // Opening Performance',
    type: 'PROJECT_VIDEO',
    source: 'videos/opening.mp4',
    url: assetUrl('videos/opening.mp4'),
    duration: 120,
    theme: 'INTRO'
  },
  {
    id: 'pulse-drop-tunnel',
    label: 'Pulse Core // Kinetic Drop Tunnel',
    type: 'PROJECT_VIDEO',
    source: 'videos/pulse_drop_tunnel.mp4',
    url: assetUrl('videos/pulse_drop_tunnel.mp4'),
    duration: 90,
    theme: 'DROP'
  },
  {
    id: 'encore-gold-horizon',
    label: 'Encore // Golden Horizon Finale',
    type: 'PROJECT_VIDEO',
    source: 'videos/encore_gold_horizon.mp4',
    url: assetUrl('videos/encore_gold_horizon.mp4'),
    duration: 75,
    theme: 'ENCORE'
  }
];

export const YOUTUBE_PRESETS = [
  {
    id: 'cortis-what-you-want',
    trackId: 'what_you_want',
    label: "Track 1: What You Want (Official MV)",
    url: 'https://youtu.be/e2OpbOv_JiQ',
    videoId: 'e2OpbOv_JiQ'
  },
  {
    id: 'cortis-acai',
    trackId: 'acai',
    label: "Track 2: ACAI (Official MV)",
    url: 'https://youtu.be/nCElUD0jvgo',
    videoId: 'nCElUD0jvgo'
  },
  {
    id: 'cortis-joyride',
    trackId: 'joyride',
    label: "Track 3: JoyRide (Official MV)",
    url: 'https://youtu.be/8QZeXvOjgGE',
    videoId: '8QZeXvOjgGE'
  },
  {
    id: 'cortis-moneymoneymoney',
    trackId: 'moneymoneymoney',
    label: "Track 4: MONEYMONEYMONEY (Official Visualizer)",
    url: 'https://youtu.be/OhdvNHmJDsw',
    videoId: 'OhdvNHmJDsw'
  }
];


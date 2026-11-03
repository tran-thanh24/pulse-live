import * as THREE from 'three';
import { CONCERT_CONFIG } from '../data/concert';

const tempColor = new THREE.Color();
const colorCyan = new THREE.Color('#22D3EE');
const colorViolet = new THREE.Color('#8B5CF6');
const colorPink = new THREE.Color('#EC4899');
const colorGold = new THREE.Color('#FACC15');

/**
 * PULSE LIGHT & PULSE WAVE Engine for PULSE//LIVE 2026
 * Modes: OFF | STATIC | BEAT | SYNC | WAVE | ENERGY (Signature Mode: ENERGY SYNC)
 * Wave Patterns: LEFT_TO_RIGHT | CENTER_OUT | STAGE_TO_BACK | SPIRAL | RANDOM_CLUSTER
 */
export const PULSE_LIGHT_MODES = ['OFF', 'STATIC', 'BEAT', 'SYNC', 'WAVE', 'ENERGY'];
export const PULSE_WAVE_PATTERNS = [
  'LEFT_TO_RIGHT',
  'CENTER_OUT',
  'STAGE_TO_BACK',
  'SPIRAL',
  'RANDOM_CLUSTER'
];

export const lightstickSystem = {
  /**
   * Evaluates spatial wave intensity (0..1) at world position (x, z) for a given wave pattern
   */
  computeWaveCrest(x, z, elapsedTime, waveState) {
    const pattern = waveState?.pattern || 'CENTER_OUT';
    const speed = waveState?.speed || 5.2;

    switch (pattern) {
      case 'LEFT_TO_RIGHT': {
        return (Math.sin(elapsedTime * speed - x * 0.22) + 1) * 0.5;
      }
      case 'STAGE_TO_BACK': {
        // Propagates from Main Stage (z = -20) toward Back Arena (z = +30)
        return (Math.sin(elapsedTime * speed - (z + 20) * 0.2) + 1) * 0.5;
      }
      case 'SPIRAL': {
        const angle = Math.atan2(z - 2, x);
        const dist = Math.hypot(x, z - 2);
        return (Math.sin(elapsedTime * speed - dist * 0.25 + angle * 2.0) + 1) * 0.5;
      }
      case 'RANDOM_CLUSTER': {
        const clusterHash = Math.sin(x * 0.45) * Math.cos(z * 0.45);
        return (Math.sin(elapsedTime * (speed * 1.2) + clusterHash * 6.0) + 1) * 0.5;
      }
      case 'CENTER_OUT':
      default: {
        // Radial energy ring expanding from B-Stage / Center Arena (0, 2)
        const radius = Math.hypot(x, z - 2);
        return (Math.sin(elapsedTime * speed - radius * 0.28) + 1) * 0.5;
      }
    }
  },

  getPlayerLightstickState({
    mode = 'ENERGY',
    userColor = '#22D3EE',
    lightingScene = 'INTRO',
    elapsedTime = 0,
    pulseWaveState = null,
    audioAnalysis = { energy: 0.4, bass: 0.4, kick: 0 },
    playerX = 0,
    playerZ = 0,
    disableFlashingLights = false
  }) {
    if (mode === 'OFF') {
      return {
        isOn: false,
        color: '#27272A',
        emissive: '#000000',
        intensity: 0
      };
    }

    const energy = audioAnalysis?.energy ?? 0.4;
    const bass = audioAnalysis?.bass ?? 0.4;
    const kick = disableFlashingLights ? 0 : audioAnalysis?.kick ?? 0;
    const sceneColors =
      CONCERT_CONFIG.stageColors[lightingScene] || CONCERT_CONFIG.stageColors.INTRO;

    // 1. Signature Mode: ENERGY (ENERGY SYNC — color & brightness react to real-time song energy)
    if (mode === 'ENERGY') {
      if (energy > 0.72) {
        tempColor.copy(colorPink).lerp(colorGold, (energy - 0.72) / 0.28);
      } else if (energy > 0.4) {
        tempColor.copy(colorCyan).lerp(colorViolet, (energy - 0.4) / 0.32);
      } else {
        tempColor.set(userColor).lerp(colorCyan, 0.4);
      }
      const hex = `#${tempColor.getHexString()}`;
      return {
        isOn: true,
        color: hex,
        emissive: hex,
        intensity: 1.4 + energy * 2.4 + kick * 1.2
      };
    }

    // 2. WAVE Mode or active Arena Pulse Wave
    if (mode === 'WAVE' || pulseWaveState?.active) {
      const crest = this.computeWaveCrest(playerX, playerZ, elapsedTime, pulseWaveState);
      tempColor.copy(colorCyan).lerp(colorPink, crest);
      const hex = `#${tempColor.getHexString()}`;
      return {
        isOn: true,
        color: hex,
        emissive: hex,
        intensity: 1.4 + crest * 2.2
      };
    }

    // 3. SYNC Mode (locked to current stage lighting scene)
    if (mode === 'SYNC') {
      tempColor.set(sceneColors.primary).lerp(new THREE.Color(sceneColors.accent), bass);
      const hex = `#${tempColor.getHexString()}`;
      return {
        isOn: true,
        color: hex,
        emissive: hex,
        intensity: 1.8 + bass * 1.6
      };
    }

    // 4. BEAT Mode (pulses on bass & kick)
    if (mode === 'BEAT') {
      const boost = disableFlashingLights ? bass * 0.8 : bass * 1.8 + kick * 1.8;
      return {
        isOn: true,
        color: userColor,
        emissive: userColor,
        intensity: 1.2 + boost
      };
    }

    // 5. STATIC Mode
    return {
      isOn: true,
      color: userColor,
      emissive: userColor,
      intensity: 2.0
    };
  },

  /**
   * Computes RGB color & wave crest boost for an NPC in the crowd at (npcX, npcZ)
   */
  getCrowdLightstickColor(
    npcX,
    npcZ,
    npcBaseColor,
    elapsedTime,
    lightingScene,
    pulseWaveState,
    playerLightstickMode,
    audioAnalysis,
    targetThreeColor
  ) {
    const waveActive =
      Boolean(pulseWaveState?.active) ||
      playerLightstickMode === 'WAVE' ||
      playerLightstickMode === 'SYNC';

    if (waveActive) {
      const crest = this.computeWaveCrest(npcX, npcZ, elapsedTime, pulseWaveState);
      if (crest > 0.65) {
        targetThreeColor.copy(colorCyan).lerp(colorGold, (crest - 0.65) / 0.35);
      } else if (crest > 0.3) {
        targetThreeColor.copy(colorViolet).lerp(colorCyan, (crest - 0.3) / 0.35);
      } else {
        targetThreeColor.copy(colorPink).lerp(colorViolet, crest / 0.3);
      }
      return { color: targetThreeColor, crest };
    }

    // Energy-reactive crowd colors
    const energy = audioAnalysis?.energy ?? 0.35;
    const scenePalette =
      CONCERT_CONFIG.stageColors[lightingScene] || CONCERT_CONFIG.stageColors.INTRO;
    const beat = (Math.sin(elapsedTime * 3.5 + npcX * 0.14) + 1) * 0.5;
    targetThreeColor
      .set(npcBaseColor)
      .lerp(new THREE.Color(scenePalette.primary), 0.5 + energy * 0.45 * beat);
    return { color: targetThreeColor, crest: energy * 0.5 };
  }
};

export function computePulseLightVisual({
  mode = 'ENERGY',
  userColor = '#22D3EE',
  lightingScene = 'INTRO',
  audioAnalysis = { energy: 0.4, bass: 0.4, kick: 0 },
  pulseWaveState = null,
  worldPosition = [0, 0, 0],
  elapsedTime = 0
}) {
  return lightstickSystem.getPlayerLightstickState({
    mode,
    userColor,
    lightingScene,
    elapsedTime,
    pulseWaveState,
    audioAnalysis,
    playerX: worldPosition[0] || 0,
    playerZ: worldPosition[2] || 0
  });
}

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useConcertStore } from '../store/concertStore';
import { useUserStore } from '../store/userStore';
import { CONCERT_CONFIG } from '../data/concert';
import { performanceManager } from '../systems/PerformanceManager';

const tempPrimary = new THREE.Color();
const tempSecondary = new THREE.Color();
const tempAccent = new THREE.Color();

/**
 * LightingManager: Audio-reactive & Timeline-driven Concert Lighting Controller
 * Supports scenes: BLACKOUT, INTRO, VERSE, CHORUS, DROP, BALLAD, ENCORE
 * Strictly respects Accessibility settings `reduceFlash` and `disableFlashingLights` (No Strobe).
 */
export function LightingManager() {
  const ambientRef = useRef();
  const mainSpotLeftRef = useRef();
  const mainSpotRightRef = useRef();
  const stageBacklightRef = useRef();
  const plazaLightRef = useRef();

  const disableFlashingLights = useUserStore((s) => s.settings.disableFlashingLights);
  const reduceFlash = useUserStore((s) => s.settings.reduceFlash);
  const graphicsQuality = useUserStore((s) => s.settings.graphicsQuality);
  const adaptiveTier = useConcertStore((s) => s.adaptiveTier);

  const noStrobe = disableFlashingLights || reduceFlash;
  const enableShadows =
    graphicsQuality === 'HIGH' || (graphicsQuality === 'AUTO' && adaptiveTier === 'HIGH');

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    const cStore = useConcertStore.getState();
    const lightingScene = cStore.lightingScene || 'INTRO';
    const { bass, kick } = cStore.audioAnalysis;

    const sceneConfig =
      CONCERT_CONFIG.stageColors[lightingScene] || CONCERT_CONFIG.stageColors.INTRO;

    tempPrimary.set(sceneConfig.primary);
    tempSecondary.set(sceneConfig.secondary);
    tempAccent.set(sceneConfig.accent);

    const lerpSpeed = Math.min(1, delta * 4.0);

    if (ambientRef.current) {
      ambientRef.current.intensity = THREE.MathUtils.lerp(
        ambientRef.current.intensity,
        sceneConfig.ambientIntensity + bass * 0.15,
        lerpSpeed
      );
    }

    let pulse = 1.0 + bass * 0.25;
    if (!noStrobe) {
      if (lightingScene === 'DROP') {
        pulse = 0.8 + kick * 0.85 + Math.abs(Math.sin(t * 8.5)) * 0.45;
      } else if (lightingScene === 'CHORUS' || lightingScene === 'ENCORE') {
        pulse = 0.88 + bass * 0.45;
      }
    }

    if (mainSpotLeftRef.current) {
      mainSpotLeftRef.current.color.lerp(tempPrimary, lerpSpeed);
      mainSpotLeftRef.current.intensity = sceneConfig.spotIntensity * pulse;
      mainSpotLeftRef.current.position.x = -9 + Math.sin(t * sceneConfig.speed) * 4;
    }

    if (mainSpotRightRef.current) {
      mainSpotRightRef.current.color.lerp(tempSecondary, lerpSpeed);
      mainSpotRightRef.current.intensity = sceneConfig.spotIntensity * pulse;
      mainSpotRightRef.current.position.x = 9 - Math.sin(t * sceneConfig.speed) * 4;
    }

    if (stageBacklightRef.current) {
      stageBacklightRef.current.color.lerp(tempAccent, lerpSpeed);
      stageBacklightRef.current.intensity = sceneConfig.spotIntensity * 1.1;
    }
  });

  const spec = performanceManager.getQualitySpec();
  const isLow = performanceManager.getEffectiveTier() === 'LOW';

  return (
    <group>
      <ambientLight ref={ambientRef} intensity={isLow ? 0.65 : 0.5} color="#BAE6FD" />

      <hemisphereLight args={['#22D3EE', '#070816', 0.55]} />

      <directionalLight
        position={[8, 22, 16]}
        intensity={1.05}
        color="#F8FAFC"
        castShadow={spec.shadows}
        shadow-mapSize={[spec.shadowMapSize, spec.shadowMapSize]}
        shadow-camera-near={1}
        shadow-camera-far={60}
        shadow-camera-left={-22}
        shadow-camera-right={22}
        shadow-camera-top={22}
        shadow-camera-bottom={-22}
      />

      <pointLight
        ref={mainSpotLeftRef}
        position={[-8, 11, -16]}
        intensity={isLow ? 2.0 : 2.8}
        distance={isLow ? 24 : 32}
        decay={1.8}
        color="#22D3EE"
      />

      <pointLight
        ref={mainSpotRightRef}
        position={[8, 11, -16]}
        intensity={isLow ? 2.0 : 2.8}
        distance={isLow ? 24 : 32}
        decay={1.8}
        color="#8B5CF6"
      />

      {!isLow && (
        <>
          <pointLight
            ref={stageBacklightRef}
            position={[0, 7, -12]}
            intensity={2.6}
            distance={28}
            decay={1.8}
            color="#EC4899"
          />

          <pointLight
            ref={plazaLightRef}
            position={[0, 9, 24]}
            intensity={1.2}
            distance={28}
            decay={2}
            color="#22D3EE"
          />
        </>
      )}
    </group>
  );
}

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useConcertStore } from '../store/concertStore';
import { useUserStore } from '../store/userStore';
import { CONCERT_CONFIG } from '../data/concert';
import { ledMediaManager } from '../systems/LEDMediaManager';

/**
 * PULSE CORE — The Signature Architectural Energy & Frequency Ring of PULSE//LIVE 2026
 * Reacts in real time to Web Audio API AnalyserNode:
 * - LOW BASS: Ring expands
 * - KICK: Energy shockwave pulse
 * - MID: Architectural LED ring texture movement
 * - TREBLE: High-frequency particle ring response
 * - CHORUS: Larger multi-ring animation
 * - DROP: Full energy release
 * - ENCORE: Gold/White emotional resonance
 */
export function PulseCore() {
  const outerRingRef = useRef();
  const midRingRef = useRef();
  const innerKickRingRef = useRef();
  const frequencySpokesRef = useRef();
  const trebleParticlesRef = useRef();
  const coreLightRef = useRef();

  const pulseCoreVisible = useConcertStore((s) => s.pulseCoreVisible);
  const reduceMotion = useUserStore((s) => s.settings.reduceMotion);
  const disableFlashingLights = useUserStore((s) => s.settings.disableFlashingLights);

  // Treble frequency particles orbiting the Pulse Core
  const particleCount = 64;
  const particleData = useMemo(() => {
    const arr = [];
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const baseRadius = 4.6 + (i % 3) * 0.45;
      arr.push({
        angle,
        baseRadius,
        speed: 0.6 + (i % 5) * 0.15,
        zOffset: ((i % 4) - 1.5) * 0.25
      });
    }
    return arr;
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const tempColor = useMemo(() => new THREE.Color(), []);

  useFrame((state, delta) => {
    if (!outerRingRef.current || !midRingRef.current || !innerKickRingRef.current) return;

    const t = state.clock.getElapsedTime();
    const cStore = useConcertStore.getState();
    const { bass, mid, treble, kick, energy } = cStore.audioAnalysis;
    const lightingScene = cStore.lightingScene;
    const overload = cStore.pulseCoreOverload;
    const override = cStore.pulseCoreEnergyOverride;

    const effectiveEnergy = override !== null ? override : overload ? 1.0 : energy;
    const effectiveBass = override !== null ? override * 0.9 : overload ? 0.95 : bass;
    const effectiveKick = disableFlashingLights ? 0 : overload ? 0.9 : kick;
    const motionMult = reduceMotion ? 0.25 : 1.0;

    // Determine scene colors (ENCORE uses Gold + White emotional palette)
    const palette =
      lightingScene === 'ENCORE'
        ? { primary: '#FACC15', secondary: '#FFFFFF', accent: '#FEF08A' }
        : overload
        ? { primary: '#FACC15', secondary: '#22D3EE', accent: '#EC4899' }
        : CONCERT_CONFIG.stageColors[lightingScene] || CONCERT_CONFIG.stageColors.INTRO;

    // Scene scale multiplier (CHORUS & DROP expand the Pulse Core further)
    const sceneScaleBoost =
      lightingScene === 'DROP' || overload
        ? 1.24
        : lightingScene === 'CHORUS' || lightingScene === 'ENCORE'
        ? 1.14
        : 1.0;

    // 1. LOW BASS -> Outer Architectural Ring Expands
    const bassScale = (1.0 + effectiveBass * 0.36 * motionMult) * sceneScaleBoost;
    outerRingRef.current.scale.lerp(new THREE.Vector3(bassScale, bassScale, 1), Math.min(1, delta * 12));
    outerRingRef.current.rotation.z += delta * (0.25 + mid * 1.4) * motionMult;
    outerRingRef.current.material.color.set(palette.primary);
    outerRingRef.current.material.emissive.set(palette.primary);
    outerRingRef.current.material.emissiveIntensity =
      1.6 + effectiveEnergy * 2.2 + effectiveKick * 1.5;

    // 2. MID -> Architectural Gyroscopic LED Ring Movement
    const midScale = (1.0 + mid * 0.28 * motionMult) * sceneScaleBoost;
    midRingRef.current.scale.lerp(new THREE.Vector3(midScale, midScale, midScale), Math.min(1, delta * 10));
    midRingRef.current.rotation.x = Math.sin(t * 0.9 * motionMult) * 0.45 * (0.4 + mid);
    midRingRef.current.rotation.y = Math.cos(t * 0.7 * motionMult) * 0.45 * (0.4 + mid);
    midRingRef.current.rotation.z -= delta * (0.4 + mid * 2.0) * motionMult;
    midRingRef.current.material.color.set(palette.secondary);
    midRingRef.current.material.emissive.set(palette.secondary);
    midRingRef.current.material.emissiveIntensity = 1.4 + mid * 2.4;

    // 3. KICK -> Inner Energy Pulse Ring
    const kickScale = 0.85 + effectiveKick * 0.65 * motionMult + effectiveBass * 0.25;
    innerKickRingRef.current.scale.set(kickScale, kickScale, 1);
    innerKickRingRef.current.material.color.set(palette.accent);
    innerKickRingRef.current.material.emissive.set(palette.accent);
    innerKickRingRef.current.material.emissiveIntensity = 1.8 + effectiveKick * 3.2;

    // 4. Frequency Waveform Spokes
    if (frequencySpokesRef.current) {
      frequencySpokesRef.current.rotation.z = -t * 0.35 * motionMult;
    }

    // 5. TREBLE -> High-Frequency Orbiting Particle Response
    if (trebleParticlesRef.current) {
      for (let i = 0; i < particleCount; i++) {
        const p = particleData[i];
        const curAngle = p.angle + t * p.speed * (1 + treble * 2.2) * motionMult;
        const r =
          (p.baseRadius + Math.sin(t * 5 + i) * (0.15 + treble * 0.85) * motionMult) *
          sceneScaleBoost;

        dummy.position.set(
          Math.cos(curAngle) * r,
          Math.sin(curAngle) * r,
          p.zOffset + Math.cos(t * 3 + i) * 0.2
        );
        const s = 0.65 + treble * 1.4 + (i % 2 === 0 ? effectiveKick * 0.8 : 0);
        dummy.scale.set(s, s, s);
        dummy.rotation.set(t, curAngle, 0);
        dummy.updateMatrix();
        trebleParticlesRef.current.setMatrixAt(i, dummy.matrix);

        tempColor.set(i % 2 === 0 ? palette.primary : palette.accent);
        trebleParticlesRef.current.setColorAt(i, tempColor);
      }
      trebleParticlesRef.current.instanceMatrix.needsUpdate = true;
      if (trebleParticlesRef.current.instanceColor) {
        trebleParticlesRef.current.instanceColor.needsUpdate = true;
      }
    }

    if (coreLightRef.current) {
      coreLightRef.current.color.set(palette.primary);
      coreLightRef.current.intensity =
        lightingScene === 'BLACKOUT' ? 0.1 : 2.5 + effectiveEnergy * 4.0;
    }
  });

  if (!pulseCoreVisible) return null;

  return (
    <group position={[0, 6.8, -3.4]}>
      {/* 1. Outer Low-Bass Architectural Torus Ring */}
      <mesh ref={outerRingRef}>
        <torusGeometry args={[4.2, 0.22, 20, 64]} />
        <meshStandardMaterial
          color="#22D3EE"
          emissive="#22D3EE"
          emissiveIntensity={2.0}
          roughness={0.15}
          metalness={0.8}
        />
      </mesh>

      {/* 2. Mid-Frequency Gyroscopic Segmented LED Ring */}
      <mesh ref={midRingRef}>
        <torusGeometry args={[3.25, 0.14, 16, 48]} />
        <meshStandardMaterial
          color="#8B5CF6"
          emissive="#8B5CF6"
          emissiveIntensity={1.8}
          wireframe
        />
      </mesh>

      {/* 3. Inner Kick Shockwave Energy Ring */}
      <mesh ref={innerKickRingRef}>
        <torusGeometry args={[2.1, 0.1, 16, 48]} />
        <meshStandardMaterial
          color="#EC4899"
          emissive="#EC4899"
          emissiveIntensity={2.4}
          roughness={0.1}
        />
      </mesh>

      {/* Center Circular Video / Resonance Disc for PULSE_CORE LED Channel */}
      <mesh position={[0, 0, -0.08]}>
        <circleGeometry args={[1.95, 48]} />
        <meshBasicMaterial
          map={ledMediaManager.getChannel('PULSE_CORE')?.videoTexture || null}
          color="#090D24"
          transparent
          opacity={0.75}
          toneMapped={false}
        />
      </mesh>

      {/* 4. Architectural Radial Sound Bars around Core */}
      <group ref={frequencySpokesRef}>
        {Array.from({ length: 16 }).map((_, idx) => {
          const angle = (idx / 16) * Math.PI * 2;
          return (
            <mesh
              key={idx}
              position={[Math.cos(angle) * 3.7, Math.sin(angle) * 3.7, 0]}
              rotation={[0, 0, angle]}
            >
              <boxGeometry args={[0.55, 0.07, 0.08]} />
              <meshBasicMaterial color="#FFFFFF" />
            </mesh>
          );
        })}
      </group>

      {/* 5. Treble Frequency Particle Ring (InstancedMesh) */}
      <instancedMesh
        ref={trebleParticlesRef}
        args={[null, null, particleCount]}
        frustumCulled={false}
      >
        <octahedronGeometry args={[0.11, 0]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>

      {/* Core Point Light Illuminating Artists & Stage */}
      <pointLight
        ref={coreLightRef}
        position={[0, 0, 1.5]}
        intensity={3.5}
        distance={28}
        decay={1.8}
        color="#22D3EE"
      />
    </group>
  );
}


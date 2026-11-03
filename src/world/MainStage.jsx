import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useConcertStore } from '../store/concertStore';
import { useUserStore } from '../store/userStore';
import { CONCERT_CONFIG } from '../data/concert';
import { PulseCore } from './PulseCore';
import { LEDVideoPlayer } from './LEDVideoPlayer';

/**
 * MainStage: Architectural Sound Stage of PULSE//LIVE 2026 — CITY OF SOUND
 * Features:
 * - Signature PULSE CORE behind performers
 * - Multi-Channel LED Video Engine (`LEDVideoPlayer` for `MAIN_LED`, `LEFT_LED`, `RIGHT_LED`, `B_STAGE_LED`)
 * - Physical Stage Deck (`MAIN_STAGE`), Left/Right Wings, Central `RUNWAY`, Backstage, and Security Barrier
 * - Stage FX: Laser, Beam, CO2, Confetti, Firework, Blackout
 */
export function MainStage() {
  const laserGroupLeftRef = useRef();
  const laserGroupRightRef = useRef();
  const movingHeadsRef = useRef();
  const co2JetsRef = useRef();
  const confettiMeshRef = useRef();
  const fireworkMeshRef = useRef();

  const disableFlashingLights = useUserStore((s) => s.settings.disableFlashingLights);
  const reduceMotion = useUserStore((s) => s.settings.reduceMotion);

  const confettiCount = 160;
  const confettiData = useMemo(() => {
    const arr = [];
    const palette = ['#22D3EE', '#8B5CF6', '#EC4899', '#FACC15', '#FFFFFF'];
    for (let i = 0; i < confettiCount; i++) {
      arr.push({
        x: (Math.random() - 0.5) * 34,
        y: Math.random() * 18,
        z: -22 + Math.random() * 26,
        speedY: 1.8 + Math.random() * 2.2,
        rotSpeed: 1.5 + Math.random() * 3,
        color: palette[i % palette.length],
        phase: Math.random() * Math.PI * 2
      });
    }
    return arr;
  }, []);

  const fireworkCount = 90;
  const fireworkData = useMemo(() => {
    const arr = [];
    const palette = ['#FACC15', '#22D3EE', '#EC4899', '#FFFFFF'];
    for (let i = 0; i < fireworkCount; i++) {
      const burstCenter = i < 30 ? -9 : i < 60 ? 0 : 9;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      arr.push({
        cx: burstCenter,
        cy: 14.5,
        cz: -5,
        vx: Math.sin(phi) * Math.cos(theta) * (2.5 + Math.random() * 3.5),
        vy: Math.cos(phi) * (2.5 + Math.random() * 3.5),
        vz: Math.sin(phi) * Math.sin(theta) * (2.5 + Math.random() * 3.5),
        color: palette[i % palette.length]
      });
    }
    return arr;
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const tempColor = useMemo(() => new THREE.Color(), []);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    const cStore = useConcertStore.getState();
    const lightingScene = cStore.lightingScene || 'INTRO';
    const fxState = cStore.fxState;
    const { energy } = cStore.audioAnalysis;
    const palette =
      CONCERT_CONFIG.stageColors[lightingScene] || CONCERT_CONFIG.stageColors.INTRO;

    // 1. Laser & Moving Beam Animation
    const speedMult = reduceMotion ? 0.2 : (palette.speed || 1.2) * (0.8 + energy * 0.8);
    if (laserGroupLeftRef.current && laserGroupRightRef.current) {
      const showLasers = Boolean(fxState.laser && !fxState.blackout);
      laserGroupLeftRef.current.visible = showLasers;
      laserGroupRightRef.current.visible = showLasers;
      if (showLasers) {
        laserGroupLeftRef.current.rotation.z = Math.sin(t * speedMult) * 0.48;
        laserGroupLeftRef.current.rotation.x = 0.35 + Math.cos(t * speedMult * 0.7) * 0.2;

        laserGroupRightRef.current.rotation.z = -Math.sin(t * speedMult) * 0.48;
        laserGroupRightRef.current.rotation.x = 0.35 + Math.sin(t * speedMult * 0.7) * 0.2;
      }
    }

    if (movingHeadsRef.current) {
      movingHeadsRef.current.visible = Boolean(fxState.beam && !fxState.blackout);
      movingHeadsRef.current.rotation.x = Math.sin(t * speedMult * 1.3) * 0.35;
    }

    // 2. CO2 Cryo Burst
    if (co2JetsRef.current) {
      const co2Active = Boolean(fxState.co2 && !fxState.blackout);
      co2JetsRef.current.visible = co2Active;
      if (co2Active) {
        const scaleY = 0.8 + Math.abs(Math.sin(t * 7)) * 0.65;
        co2JetsRef.current.scale.set(1, scaleY, 1);
      }
    }

    // 3. Confetti Simulation
    if (confettiMeshRef.current) {
      const showConfetti = Boolean(fxState.confetti);
      confettiMeshRef.current.visible = showConfetti;
      if (showConfetti) {
        for (let i = 0; i < confettiCount; i++) {
          const c = confettiData[i];
          c.y -= c.speedY * delta;
          if (c.y < 0.2) c.y = 17.5;

          dummy.position.set(
            c.x + Math.sin(t * 2 + c.phase) * 0.6,
            c.y,
            c.z + Math.cos(t * 1.5 + c.phase) * 0.6
          );
          dummy.rotation.set(t * c.rotSpeed, t * c.rotSpeed * 0.8, c.phase);
          dummy.scale.set(1, 1, 1);
          dummy.updateMatrix();
          confettiMeshRef.current.setMatrixAt(i, dummy.matrix);
          confettiMeshRef.current.setColorAt(i, tempColor.set(c.color));
        }
        confettiMeshRef.current.instanceMatrix.needsUpdate = true;
        if (confettiMeshRef.current.instanceColor) {
          confettiMeshRef.current.instanceColor.needsUpdate = true;
        }
      }
    }

    // 4. Aerial Firework Simulation
    if (fireworkMeshRef.current) {
      const showFirework = Boolean(fxState.firework);
      fireworkMeshRef.current.visible = showFirework;
      if (showFirework) {
        const burstCycle = (t * 0.85) % 1;
        for (let i = 0; i < fireworkCount; i++) {
          const fw = fireworkData[i];
          dummy.position.set(
            fw.cx + fw.vx * burstCycle * 2.2,
            fw.cy + fw.vy * burstCycle * 2.2 - burstCycle * burstCycle * 3.5,
            fw.cz + fw.vz * burstCycle * 2.2
          );
          const s = Math.max(0.1, (1 - burstCycle) * 1.4);
          dummy.scale.set(s, s, s);
          dummy.updateMatrix();
          fireworkMeshRef.current.setMatrixAt(i, dummy.matrix);
          fireworkMeshRef.current.setColorAt(i, tempColor.set(fw.color));
        }
        fireworkMeshRef.current.instanceMatrix.needsUpdate = true;
        if (fireworkMeshRef.current.instanceColor) {
          fireworkMeshRef.current.instanceColor.needsUpdate = true;
        }
      }
    }
  });

  const lightingScene = useConcertStore((s) => s.lightingScene);
  const palette =
    CONCERT_CONFIG.stageColors[lightingScene] || CONCERT_CONFIG.stageColors.INTRO;

  return (
    <group position={[0, 0, -22]}>
      {/* ==========================================
          1. SIGNATURE OBJECT: PULSE CORE
          ========================================== */}
      <PulseCore />

      {/* ==========================================
          2. MAIN ARCHITECTURAL STAGE DECK & RISERS
          ========================================== */}
      <mesh position={[0, 0.7, 0]} receiveShadow>
        <boxGeometry args={[30, 1.4, 12]} />
        <meshStandardMaterial color="#0A0D1E" metalness={0.75} roughness={0.22} />
      </mesh>

      {/* Architectural Frequency Trim along Stage Edge */}
      <mesh position={[0, 1.38, 6.02]}>
        <boxGeometry args={[30, 0.12, 0.1]} />
        <meshBasicMaterial color={palette.primary} />
      </mesh>

      {/* Elevated Synth / Controller Riser */}
      <mesh position={[0, 1.85, -1.8]}>
        <boxGeometry args={[11, 0.9, 4.5]} />
        <meshStandardMaterial color="#111530" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Backstage & FOH Production Deck behind Main Stage */}
      <mesh position={[0, 0.7, -9.0]} receiveShadow>
        <boxGeometry args={[28, 1.4, 6]} />
        <meshStandardMaterial color="#060812" metalness={0.7} roughness={0.4} />
      </mesh>

      {/* ==========================================
          3. CENTRAL RUNWAY & B-STAGE CONNECTION
          ========================================== */}
      <group position={[0, 0, 12.2]}>
        <mesh position={[0, 0.6, 0]} receiveShadow>
          <boxGeometry args={[4.6, 1.2, 13.5]} />
          <meshStandardMaterial color="#0D1128" metalness={0.75} roughness={0.2} />
        </mesh>
        <mesh position={[-2.28, 1.22, 0]}>
          <boxGeometry args={[0.1, 0.06, 13.5]} />
          <meshBasicMaterial color={palette.primary} />
        </mesh>
        <mesh position={[2.28, 1.22, 0]}>
          <boxGeometry args={[0.1, 0.06, 13.5]} />
          <meshBasicMaterial color={palette.primary} />
        </mesh>
      </group>

      {/* ==========================================
          4. MULTI-CHANNEL LED VIDEO ENGINE SCREENS
          ========================================== */}
      {/* Channel 1: MAIN_LED (Center Giant 16:9 Architectural Screen) */}
      <LEDVideoPlayer
        channelId="MAIN_LED"
        width={19.5}
        height={9.4}
        position={[0, 7.2, -5.4]}
      />

      {/* Channel 2: LEFT_LED (Left Wing Screen — defaults to LIVE_CAM broadcast feed!) */}
      <LEDVideoPlayer
        channelId="LEFT_LED"
        width={7.4}
        height={7.0}
        position={[-13.8, 6.6, -2.5]}
        rotation={[0, 0.42, 0]}
      />

      {/* Channel 3: RIGHT_LED (Right Wing Screen) */}
      <LEDVideoPlayer
        channelId="RIGHT_LED"
        width={7.4}
        height={7.0}
        position={[13.8, 6.6, -2.5]}
        rotation={[0, -0.42, 0]}
      />

      {/* Channel 4: B_STAGE_LED (Overhead Halo Banner at B-Stage z = +6 world / +28 local) */}
      <LEDVideoPlayer
        channelId="B_STAGE_LED"
        width={4.6}
        height={2.2}
        position={[0, 7.2, 28.0]}
      />

      {/* ==========================================
          5. ARCHITECTURAL LIGHTING RIG, BEAMS & LASERS
          ========================================== */}
      <mesh position={[0, 13.0, -1.5]}>
        <boxGeometry args={[30, 0.55, 0.55]} />
        <meshStandardMaterial color="#18181B" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[-14.6, 6.5, -1.5]}>
        <boxGeometry args={[0.6, 13.0, 0.6]} />
        <meshStandardMaterial color="#18181B" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[14.6, 6.5, -1.5]}>
        <boxGeometry args={[0.6, 13.0, 0.6]} />
        <meshStandardMaterial color="#18181B" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Moving Head Beams */}
      <group ref={movingHeadsRef} position={[0, 12.7, -1.5]}>
        {[-10, -5, 0, 5, 10].map((xPos, idx) => (
          <group key={xPos} position={[xPos, 0, 0]}>
            <mesh>
              <boxGeometry args={[0.6, 0.6, 0.6]} />
              <meshBasicMaterial color="#FFFFFF" />
            </mesh>
            <mesh position={[0, -6.2, 3.2]} rotation={[0.45, 0, 0]}>
              <coneGeometry args={[2.6, 13, 16, 1, true]} />
              <meshBasicMaterial
                color={idx % 2 === 0 ? palette.primary : palette.secondary}
                transparent
                opacity={disableFlashingLights ? 0.08 : 0.16}
                side={THREE.DoubleSide}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
          </group>
        ))}
      </group>

      {/* Sweeping Laser Arrays */}
      <group ref={laserGroupLeftRef} position={[-9.0, 12.0, -1.2]}>
        {[-0.35, -0.15, 0.05, 0.25].map((angle, i) => (
          <mesh key={i} position={[0, -4, 14]} rotation={[Math.PI / 2.2, 0, angle]}>
            <cylinderGeometry args={[0.02, 0.08, 32, 8]} />
            <meshBasicMaterial
              color={palette.primary}
              transparent
              opacity={disableFlashingLights ? 0.2 : 0.52}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        ))}
      </group>

      <group ref={laserGroupRightRef} position={[9.0, 12.0, -1.2]}>
        {[-0.25, -0.05, 0.15, 0.35].map((angle, i) => (
          <mesh key={i} position={[0, -4, 14]} rotation={[Math.PI / 2.2, 0, angle]}>
            <cylinderGeometry args={[0.02, 0.08, 32, 8]} />
            <meshBasicMaterial
              color={palette.accent}
              transparent
              opacity={disableFlashingLights ? 0.2 : 0.52}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        ))}
      </group>

      {/* ==========================================
          6. ACOUSTIC LINE-ARRAY TOWERS & SECURITY BARRIER
          ========================================== */}
      {[-10.8, 10.8].map((xSide) => (
        <group key={xSide} position={[xSide, 9.2, 1.5]}>
          {[0, -0.7, -1.4, -2.1, -2.8].map((yOff, idx) => (
            <mesh key={idx} position={[0, yOff, idx * 0.12]} rotation={[0.15, 0, 0]}>
              <boxGeometry args={[1.8, 0.58, 1.1]} />
              <meshStandardMaterial color="#111827" metalness={0.8} roughness={0.3} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Security Barrier at z = -13.8 world (local z = +8.2) */}
      <group position={[0, 0, 8.2]}>
        <mesh position={[-9.5, 0.6, 0]}>
          <boxGeometry args={[12, 1.2, 0.25]} />
          <meshStandardMaterial color="#1F2937" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[-9.5, 1.22, 0]}>
          <boxGeometry args={[12, 0.05, 0.28]} />
          <meshBasicMaterial color="#EF4444" />
        </mesh>
        <mesh position={[9.5, 0.6, 0]}>
          <boxGeometry args={[12, 1.2, 0.25]} />
          <meshStandardMaterial color="#1F2937" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[9.5, 1.22, 0]}>
          <boxGeometry args={[12, 0.05, 0.28]} />
          <meshBasicMaterial color="#EF4444" />
        </mesh>
      </group>

      {/* ==========================================
          7. CO2 JETS, CONFETTI & AERIAL FIREWORKS
          ========================================== */}
      <group ref={co2JetsRef} position={[0, 1.4, 5.2]}>
        {[-8.5, -4.2, 4.2, 8.5].map((xJet) => (
          <mesh key={xJet} position={[xJet, 3.2, 0]}>
            <coneGeometry args={[1.1, 6.5, 12, 1, true]} />
            <meshBasicMaterial
              color="#E2E8F0"
              transparent
              opacity={0.42}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        ))}
      </group>

      <instancedMesh
        ref={confettiMeshRef}
        args={[null, null, confettiCount]}
        position={[0, 0, 22]}
        frustumCulled={false}
      >
        <planeGeometry args={[0.22, 0.12]} />
        <meshBasicMaterial side={THREE.DoubleSide} toneMapped={false} />
      </instancedMesh>

      <instancedMesh
        ref={fireworkMeshRef}
        args={[null, null, fireworkCount]}
        frustumCulled={false}
      >
        <octahedronGeometry args={[0.18, 0]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
    </group>
  );
}

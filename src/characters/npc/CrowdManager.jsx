import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useConcertStore } from '../../store/concertStore';
import { useUserStore } from '../../store/userStore';
import { CONCERT_CONFIG } from '../../data/concert';
import { SECURITY_POSTS } from '../../data/stageConfig';
import { MALE_PRESETS } from '../presets/malePresets';
import { FEMALE_PRESETS } from '../presets/femalePresets';
import { computePulseLightVisual } from '../../systems/LightstickSystem';
import { realtimeService } from '../../services/realtime';
import { CrowdCharacter } from './CrowdCharacter';
import { CharacterFactory } from '../CharacterFactory';

/**
 * CrowdManager (`src/characters/npc/CrowdManager.jsx`)
 * Renders:
 * 1. Security NPCs along the Stage Barrier & VIP Gate (turn toward player on approach)
 * 2. High-detail Male & Female Front-Row Hero Fans (`CrowdCharacter`)
 * 3. GPU-Instanced Male & Female Crowd Fans across GA, VIP, B-Stage 360°, and Seated Grandstands
 *    with distance-based LOD and synchronized PULSE WAVE lightsticks
 * 4. Real-time Multiplayer Peer Characters
 */
export function CrowdManager() {
  const bodyMeshRef = useRef();
  const headMeshRef = useRef();
  const stickMeshRef = useRef();

  const crowdDensity = useUserStore((s) => s.settings.crowdDensity);
  const reduceMotion = useUserStore((s) => s.settings.reduceMotion);
  const adaptiveTier = useConcertStore((s) => s.adaptiveTier);

  const [peers, setPeers] = useState([]);

  useEffect(() => {
    const unsub = realtimeService.onPeersUpdated((list) => {
      setPeers(list);
    });
    return unsub;
  }, []);

  const maxCount = 220;
  const activeCount = useMemo(() => {
    if (crowdDensity === 'LOW' || adaptiveTier === 'LOW') return 80;
    if (crowdDensity === 'MEDIUM' || adaptiveTier === 'MEDIUM') return 145;
    return 220;
  }, [crowdDensity, adaptiveTier]);

  // Security Guard Character Configs
  const securityGuards = useMemo(() => {
    return SECURITY_POSTS.map((post, idx) => ({
      ...post,
      config: {
        id: post.id,
        role: 'SECURITY',
        gender: idx % 2 === 0 ? 'male' : 'female',
        displayName: post.displayName,
        scalePreset: 'TALL',
        skinTone: idx % 2 === 0 ? '#E59866' : '#F5CBA7',
        facePreset: idx % 2 === 0 ? 'male-cool' : 'female-chic',
        hairStyle: idx % 2 === 0 ? 'slick-back' : 'high-ponytail',
        hairColor: '#18181B',
        outfitTop: 'tailored-blazer',
        outfitBottom: 'tailored-trousers',
        shoes: 'combat-boots',
        outfitColor: '#0F172A',
        accessory: 'shades',
        lightstick: '#EF4444'
      }
    }));
  }, []);

  // Front-Row Hero Male & Female Crowd Characters (8 expressive fans near the barrier & B-Stage)
  const heroFans = useMemo(() => {
    const positions = [
      [-6.2, 0, -11.4],
      [-4.4, 0, -11.2],
      [4.4, 0, -11.2],
      [6.2, 0, -11.4],
      [-3.5, 0, 4.2],
      [3.5, 0, 4.2]
    ];
    return positions.map((pos, idx) => {
      const isFemale = idx % 2 === 1;
      const preset = isFemale
        ? FEMALE_PRESETS[idx % FEMALE_PRESETS.length]
        : MALE_PRESETS[idx % MALE_PRESETS.length];
      return {
        id: `hero_fan_${idx}`,
        position: pos,
        rotation: pos[2] > 0 ? Math.atan2(-pos[0], -6 - pos[2]) : 0,
        phaseOffset: idx * 0.7,
        config: {
          ...preset,
          role: 'CROWD',
          displayName: ''
        }
      };
    });
  }, []);

  // Instanced Male & Female Crowd Data across GA, VIP, Seated, and B-Stage
  const crowdData = useMemo(() => {
    const items = [];
    const outfitPalette = ['#1E1B4B', '#311042', '#0F172A', '#1E293B', '#3B0764', '#111827'];
    const stickPalette = ['#22D3EE', '#8B5CF6', '#EC4899', '#FACC15', '#FFFFFF'];

    for (let i = 0; i < maxCount; i++) {
      let x = 0;
      let z = 0;
      const sectionRoll = i % 10;

      if (sectionRoll < 6) {
        // GA Standing Arena (avoiding Central Runway |x| < 3.2 and B-Stage radius < 3.4)
        const side = i % 2 === 0 ? -1 : 1;
        x = side * (3.6 + Math.random() * 10.5);
        z = -11.2 + Math.random() * 19.5;
      } else if (sectionRoll < 8) {
        // VIP Terrace Left
        x = -15.5 - Math.random() * 6.5;
        z = -12.0 + Math.random() * 8.5;
      } else {
        // Seated Grandstand Right
        x = 15.5 + Math.random() * 6.5;
        z = -12.0 + Math.random() * 8.5;
      }

      const isFemale = i % 2 === 1;
      const scaleKey = i % 3 === 0 ? 0.93 : i % 3 === 1 ? 1.0 : 1.07;

      items.push({
        x,
        y: 0,
        z,
        isFemale,
        scale: scaleKey,
        phase: Math.random() * Math.PI * 2,
        speed: 2.2 + Math.random() * 1.6,
        outfitColor: outfitPalette[i % outfitPalette.length],
        baseStickColor: stickPalette[i % stickPalette.length],
        rotY: Math.atan2(-x * 0.25, -22 - z)
      });
    }
    return items;
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const tempColor = useMemo(() => new THREE.Color(), []);

  useFrame((state) => {
    if (!bodyMeshRef.current || !headMeshRef.current || !stickMeshRef.current) return;

    const t = state.clock.getElapsedTime();
    const cStore = useConcertStore.getState();
    const lightingScene = cStore.lightingScene;
    const { bass, energy } = cStore.audioAnalysis;
    const pulseWaveState = cStore.pulseWaveState;
    const override = cStore.crowdBehaviorOverride;

    let jumpAmp = 0.06 + energy * 0.14;
    let jumpFreq = 1.4 + bass * 1.2;

    if (override === 'jump' || lightingScene === 'DROP') {
      jumpAmp = 0.28 + bass * 0.2;
      jumpFreq = 2.8;
    } else if (override === 'wave' || lightingScene === 'CHORUS') {
      jumpAmp = 0.14 + energy * 0.12;
      jumpFreq = 1.9;
    } else if (lightingScene === 'BLACKOUT') {
      jumpAmp = 0.015;
      jumpFreq = 0.6;
    }

    if (reduceMotion) {
      jumpAmp *= 0.25;
      jumpFreq *= 0.5;
    }

    for (let i = 0; i < maxCount; i++) {
      if (i >= activeCount) {
        dummy.position.set(0, -50, 0);
        dummy.scale.set(0, 0, 0);
        dummy.updateMatrix();
        bodyMeshRef.current.setMatrixAt(i, dummy.matrix);
        headMeshRef.current.setMatrixAt(i, dummy.matrix);
        stickMeshRef.current.setMatrixAt(i, dummy.matrix);
        continue;
      }

      const fan = crowdData[i];
      const bounce = Math.abs(Math.sin(t * fan.speed * jumpFreq + fan.phase)) * jumpAmp;
      const s = fan.scale;

      // 1. Body (Male broader vs Female slender silhouette)
      dummy.position.set(fan.x, (0.68 + bounce) * s, fan.z);
      dummy.rotation.set(0, fan.rotY, 0);
      dummy.scale.set(fan.isFemale ? 0.88 * s : 1.04 * s, s, s);
      dummy.updateMatrix();
      bodyMeshRef.current.setMatrixAt(i, dummy.matrix);
      bodyMeshRef.current.setColorAt(i, tempColor.set(fan.outfitColor));

      // 2. Head
      dummy.position.set(fan.x, (1.42 + bounce) * s, fan.z);
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      headMeshRef.current.setMatrixAt(i, dummy.matrix);

      // 3. Synchronized Pulse Lightstick
      const waveX = Math.sin(t * 4.2 + fan.phase) * (reduceMotion ? 0.08 : 0.28);
      dummy.position.set(
        fan.x + Math.cos(fan.rotY) * 0.3 + waveX * 0.25,
        (1.68 + bounce * 1.25) * s,
        fan.z + Math.sin(fan.rotY) * 0.25
      );
      dummy.rotation.set(0.35, fan.rotY, waveX);

      const visual = computePulseLightVisual({
        mode: pulseWaveState.active ? 'WAVE' : 'SYNC',
        userColor: fan.baseStickColor,
        lightingScene,
        audioAnalysis: cStore.audioAnalysis,
        pulseWaveState,
        worldPosition: [fan.x, 1.6, fan.z],
        elapsedTime: t
      });

      const orbScale = (0.85 + visual.intensity * 0.22) * s;
      dummy.scale.set(orbScale, orbScale, orbScale);
      dummy.updateMatrix();
      stickMeshRef.current.setMatrixAt(i, dummy.matrix);
      stickMeshRef.current.setColorAt(i, tempColor.set(visual.color));
    }

    bodyMeshRef.current.instanceMatrix.needsUpdate = true;
    if (bodyMeshRef.current.instanceColor) bodyMeshRef.current.instanceColor.needsUpdate = true;
    headMeshRef.current.instanceMatrix.needsUpdate = true;
    stickMeshRef.current.instanceMatrix.needsUpdate = true;
    if (stickMeshRef.current.instanceColor) stickMeshRef.current.instanceColor.needsUpdate = true;
  });

  return (
    <group>
      {/* 1. Security Guards stationed at Stage Barrier & VIP Gate */}
      {securityGuards.map((guard, idx) => (
        <CrowdCharacter
          key={guard.id}
          config={guard.config}
          position={guard.position}
          baseRotation={guard.baseRotation}
          isSecurity
          phaseOffset={idx * 0.5}
        />
      ))}

      {/* 2. Front-Row Male & Female Hero Crowd Characters */}
      {heroFans.map((hero) => (
        <CrowdCharacter
          key={hero.id}
          config={hero.config}
          position={hero.position}
          baseRotation={hero.rotation}
          isSecurity={false}
          phaseOffset={hero.phaseOffset}
        />
      ))}

      {/* 3. GPU-Instanced Crowd Fans (LOD Optimized) */}
      <instancedMesh ref={bodyMeshRef} args={[null, null, maxCount]} castShadow>
        <capsuleGeometry args={[0.21, 0.62, 6, 10]} />
        <meshStandardMaterial roughness={0.6} />
      </instancedMesh>

      <instancedMesh ref={headMeshRef} args={[null, null, maxCount]}>
        <sphereGeometry args={[0.17, 10, 10]} />
        <meshStandardMaterial color="#E59866" roughness={0.5} />
      </instancedMesh>

      <instancedMesh ref={stickMeshRef} args={[null, null, maxCount]}>
        <sphereGeometry args={[0.078, 8, 8]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>

      {/* 4. Real-Time Multiplayer Peers */}
      {peers.map((peer) => (
        <group
          key={peer.peerId || peer.userId}
          position={peer.position || [2, 0, 22]}
          rotation={[0, peer.rotation || 0, 0]}
        >
          <CharacterFactory
            config={{
              ...(peer.avatar || {}),
              role: 'PLAYER',
              displayName: peer.displayName || 'PULSE FAN'
            }}
            animationState="LIGHTSTICK_IDLE"
            lightstickMode={peer.lightstickMode || 'SYNC'}
            showLabel
            worldPosition={peer.position || [2, 0, 22]}
          />
        </group>
      ))}
    </group>
  );
}


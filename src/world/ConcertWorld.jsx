import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Entrance } from './Entrance';
import { ConcertPlaza } from './ConcertPlaza';
import { MainStage } from './MainStage';
import { FanZone } from './FanZone';
import { MerchZone } from './MerchZone';
import { PhotoZone } from './PhotoZone';
import { FoodZone } from './FoodZone';
import { CharacterManager } from '../characters/CharacterManager';
import { useConcertStore } from '../store/concertStore';

/**
 * Architectural City of Sound Perimeter Towers (No Starfield / No Galaxy Motif)
 * Surrounds the arena with audio-reactive vertical LED monoliths.
 */
function CityOfSoundArchitecture() {
  const towersRef = useRef();

  const towerPositions = [
    [-34, 0, -18],
    [-35, 0, -4],
    [-35, 0, 12],
    [-34, 0, 28],
    [34, 0, -18],
    [35, 0, -4],
    [35, 0, 12],
    [34, 0, 28]
  ];

  useFrame(() => {
    if (!towersRef.current) return;
    const { bass, energy } = useConcertStore.getState().audioAnalysis;
    towersRef.current.children.forEach((group, idx) => {
      const strip = group.children[1];
      if (strip) {
        strip.scale.y = 0.4 + bass * 0.65 + (idx % 2 === 0 ? energy * 0.25 : 0);
      }
    });
  });

  return (
    <group ref={towersRef}>
      {towerPositions.map(([x, y, z], idx) => (
        <group key={idx} position={[x, y, z]}>
          <mesh position={[0, 7, 0]}>
            <boxGeometry args={[1.6, 14, 1.6]} />
            <meshStandardMaterial color="#0A0D1C" metalness={0.85} roughness={0.2} />
          </mesh>
          <mesh position={[x < 0 ? 0.82 : -0.82, 7, 0]}>
            <boxGeometry args={[0.08, 12.5, 0.35]} />
            <meshBasicMaterial color={idx % 2 === 0 ? '#22D3EE' : '#8B5CF6'} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/**
 * ConcertWorld: Assembles the complete PULSE//LIVE 2026 — CITY OF SOUND Arena
 */
export function ConcertWorld() {
  return (
    <group>
      {/* Minimal Futuristic Dark Sound Dome Atmosphere (No Starfield / Cosmic Motifs) */}
      <color attach="background" args={['#070816']} />
      <fog attach="fog" args={['#070816', 30, 96]} />

      {/* City of Sound Architectural LED Monoliths */}
      <CityOfSoundArchitecture />

      {/* Venue Zones */}
      <Entrance />
      <ConcertPlaza />
      <FanZone />
      <MerchZone />
      <PhotoZone />
      <FoodZone />
      <MainStage />

      {/* Complete Character System: ArtistManager + CrowdManager (with Security Guards) + PlayerCharacter */}
      <CharacterManager />
    </group>
  );
}

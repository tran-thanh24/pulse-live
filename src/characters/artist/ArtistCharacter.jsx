import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { CharacterFactory } from '../CharacterFactory';
import { stageNavigationSystem } from '../../systems/StageNavigationSystem';

/**
 * ArtistCharacter (`src/characters/artist/ArtistCharacter.jsx`)
 * Renders an individual stage performer (ARTIST / DANCER / MC) with smooth StageNavigationSystem
 * interpolation across MAIN_STAGE, RUNWAY, B_STAGE, LEFT_WING, RIGHT_WING, and BACKSTAGE.
 */
export function ArtistCharacter({
  artist,
  artistIndex = 0,
  animationState = 'SING',
  showLabel = true
}) {
  const navGroupRef = useRef();

  const characterConfig = {
    id: artist.artistId,
    role: artist.role?.includes('DANCER') ? 'DANCER' : 'ARTIST',
    gender: artist.avatar?.gender || 'male',
    displayName: artist.displayName,
    scalePreset: artist.avatar?.scalePreset || (artistIndex === 0 ? 'TALL' : 'MEDIUM'),
    skinTone: artist.avatar?.skinTone || '#FDE7D6',
    facePreset: artist.avatar?.facePreset || 'male-sharp',
    hairStyle: artist.avatar?.hairStyle || 'cyber-crop',
    hairColor: artist.avatar?.hairColor || '#22D3EE',
    outfitTop: artist.avatar?.outfitTop || 'tailored-blazer',
    outfitBottom: artist.avatar?.outfitBottom || 'tailored-trousers',
    shoes: artist.avatar?.shoes || 'combat-boots',
    outfitColor: artist.avatar?.outfitColor || '#0F172A',
    accessory: artist.avatar?.accessory || 'iem-earpiece',
    lightstick: '#FACC15'
  };

  useFrame((_, delta) => {
    if (!navGroupRef.current) return;
    const targetPos = stageNavigationSystem.getArtistTargetPosition(
      artist,
      artistIndex,
      animationState
    );

    const cur = navGroupRef.current.position;
    const dx = targetPos[0] - cur.x;
    const dy = targetPos[1] - cur.y;
    const dz = targetPos[2] - cur.z;
    const dist = Math.hypot(dx, dz);

    const lerpSpeed = Math.min(1, delta * 2.8);
    cur.x += dx * lerpSpeed;
    cur.y += dy * Math.min(1, delta * 5.0);
    cur.z += dz * lerpSpeed;

    // Face movement direction when walking along runway/B-stage, otherwise face audience (+Z)
    if (dist > 0.35) {
      const moveAngle = Math.atan2(dx, dz);
      navGroupRef.current.rotation.y += (moveAngle - navGroupRef.current.rotation.y) * Math.min(1, delta * 6);
    } else {
      navGroupRef.current.rotation.y += (0 - navGroupRef.current.rotation.y) * Math.min(1, delta * 6);
    }
  });

  const initialPos = artist.stagePosition || [0, 1.4, -20.2];

  return (
    <group ref={navGroupRef} position={initialPos}>
      <CharacterFactory
        config={characterConfig}
        animationState={animationState}
        lightstickMode="OFF"
        showLabel={showLabel}
        labelBadge={artist.badge || (artistIndex === 0 ? 'LEADER' : null)}
        phaseOffset={artistIndex * 0.45}
      />
    </group>
  );
}


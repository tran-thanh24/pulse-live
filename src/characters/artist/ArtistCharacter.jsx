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
    gender: artistIndex % 2 === 1 ? 'female' : 'male',
    displayName: artist.displayName,
    scalePreset: artistIndex === 0 ? 'TALL' : 'MEDIUM',
    skinTone: artist.avatar?.skinTone || '#F5CBA7',
    facePreset: artistIndex % 2 === 1 ? 'female-idol' : 'male-sharp',
    hairStyle: artist.avatar?.hairStyle || (artistIndex % 2 === 1 ? 'high-ponytail' : 'cyber-crop'),
    hairColor: artist.avatar?.hairColor || '#22D3EE',
    outfitTop: artistIndex % 2 === 1 ? 'corset-stage-top' : 'tailored-blazer',
    outfitBottom: artistIndex % 2 === 1 ? 'pleated-stage-skirt' : 'tailored-trousers',
    shoes: artistIndex % 2 === 1 ? 'platform-idol-boots' : 'combat-boots',
    outfitColor: artist.avatar?.outfitColor || '#8B5CF6',
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
        labelBadge={artistIndex === 0 ? 'HEADLINER' : null}
        phaseOffset={artistIndex * 0.45}
      />
    </group>
  );
}


import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { CharacterFactory } from '../CharacterFactory';
import { useConcertStore } from '../../store/concertStore';

/**
 * CrowdCharacter (`src/characters/npc/CrowdCharacter.jsx`)
 * Renders high-detail hero NPC characters (Front-row Male/Female Fans, Security Guards, Staff).
 * Security Guards automatically turn toward the Player and switch to `SECURITY_ALERT`
 * when the Player approaches within 4.2m of a restricted stage barrier or VIP gate.
 */
export function CrowdCharacter({
  config,
  position = [0, 0, 0],
  baseRotation = 0,
  isSecurity = false,
  phaseOffset = 0
}) {
  const groupRef = useRef();
  const [securityAlert, setSecurityAlert] = useState(false);

  const lightingScene = useConcertStore((s) => s.lightingScene);
  const crowdBehaviorOverride = useConcertStore((s) => s.crowdBehaviorOverride);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    if (isSecurity) {
      const [px, , pz] = useConcertStore.getState().playerPosition;
      const dx = px - position[0];
      const dz = pz - position[2];
      const dist = Math.hypot(dx, dz);

      if (dist < 4.5) {
        const targetYaw = Math.atan2(dx, dz);
        groupRef.current.rotation.y +=
          (targetYaw - groupRef.current.rotation.y) * Math.min(1, delta * 6.5);
        const shouldAlert = dist < 3.2;
        if (shouldAlert !== securityAlert) {
          setSecurityAlert(shouldAlert);
        }
      } else {
        groupRef.current.rotation.y +=
          (baseRotation - groupRef.current.rotation.y) * Math.min(1, delta * 4.0);
        if (securityAlert) {
          setSecurityAlert(false);
        }
      }
    }
  });

  let animState = 'LIGHTSTICK_IDLE';
  if (isSecurity) {
    animState = securityAlert ? 'SECURITY_ALERT' : 'SECURITY_GUARD';
  } else if (crowdBehaviorOverride === 'jump' || lightingScene === 'DROP') {
    animState = 'CHEER';
  } else if (crowdBehaviorOverride === 'clap') {
    animState = 'CLAP';
  } else if (lightingScene === 'CHORUS' || lightingScene === 'ENCORE') {
    animState = 'LIGHTSTICK_WAVE';
  }

  return (
    <group ref={groupRef} position={position} rotation={[0, baseRotation, 0]}>
      <CharacterFactory
        config={config}
        animationState={animState}
        lightstickMode={isSecurity ? 'OFF' : 'SYNC'}
        showLabel={isSecurity}
        labelBadge={isSecurity ? (securityAlert ? 'RESTRICTED' : 'SECURITY') : null}
        phaseOffset={phaseOffset}
        worldPosition={position}
      />
    </group>
  );
}

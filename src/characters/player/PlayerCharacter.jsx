import React from 'react';
import { CharacterController } from '../CharacterController';
import { CharacterFactory } from '../CharacterFactory';
import { useConcertStore } from '../../store/concertStore';
import { useUserStore } from '../../store/userStore';

/**
 * PlayerCharacter (`src/characters/player/PlayerCharacter.jsx`)
 * Renders the user's customized Male or Female character inside the controllable CharacterController.
 */
export function PlayerCharacter() {
  const displayName = useUserStore((s) => s.displayName);
  const character = useUserStore((s) => s.character || s.avatar);
  const ticket = useUserStore((s) => s.ticket);

  const isMoving = useConcertStore((s) => s.isPlayerMoving);
  const isRunning = useConcertStore((s) => s.isPlayerRunning);
  const isJumping = useConcertStore((s) => s.isPlayerJumping);
  const playerPose = useConcertStore((s) => s.playerPose);
  const lightstickMode = useConcertStore((s) => s.lightstickMode);
  const playerPosition = useConcertStore((s) => s.playerPosition);

  let animationState = 'IDLE';
  if (playerPose && playerPose !== 'idle') {
    animationState = playerPose.toUpperCase();
  } else if (isJumping) {
    animationState = 'JUMP';
  } else if (isRunning) {
    animationState = 'RUN';
  } else if (isMoving) {
    animationState = 'WALK';
  } else if (lightstickMode !== 'OFF') {
    animationState = lightstickMode === 'WAVE' ? 'LIGHTSTICK_WAVE' : 'LIGHTSTICK_IDLE';
  }

  return (
    <CharacterController>
      <CharacterFactory
        config={{
          ...character,
          role: 'PLAYER',
          displayName
        }}
        animationState={animationState}
        lightstickMode={lightstickMode}
        showLabel
        labelBadge={ticket?.tier === 'VIP' ? 'VIP' : 'GA'}
        worldPosition={playerPosition}
      />
    </CharacterController>
  );
}

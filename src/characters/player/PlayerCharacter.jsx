import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { CharacterController } from '../CharacterController';
import { CharacterFactory } from '../CharacterFactory';
import { useConcertStore } from '../../store/concertStore';
import { useUserStore } from '../../store/userStore';
import { danceController } from '../DanceController';
import { animationRegistry } from '../AnimationRegistry';

/**
 * InnerPlayerMesh: Evaluates character animation priority and smoothly crossfades
 * between Movement (Walk, Run, Jump), Lightstick, and Dances.
 */
function InnerPlayerMesh() {
  const displayName = useUserStore((s) => s.displayName);
  const character = useUserStore((s) => s.character || s.avatar);
  const ticket = useUserStore((s) => s.ticket);

  const isMoving = useConcertStore((s) => s.isPlayerMoving);
  const isRunning = useConcertStore((s) => s.isPlayerRunning);
  const isJumping = useConcertStore((s) => s.isPlayerJumping);
  const playerPose = useConcertStore((s) => s.playerPose);
  const lightstickMode = useConcertStore((s) => s.lightstickMode);

  const animRef = useRef({
    currentState: 'IDLE',
    previousState: 'IDLE',
    crossfadeAlpha: 1.0,
    timeScale: 1.0
  });

  useFrame((_, delta) => {
    danceController.update(delta);

    let target = 'IDLE';
    if (isJumping) {
      target = 'JUMP';
    } else if (isRunning) {
      target = 'RUN';
    } else if (isMoving) {
      target = 'WALK';
    } else if (playerPose && playerPose !== 'idle') {
      const act = animationRegistry.getAction(playerPose);
      target = act ? act.clip : String(playerPose).toUpperCase();
    } else if (lightstickMode !== 'OFF') {
      target = lightstickMode === 'WAVE' ? 'LIGHTSTICK_WAVE' : 'LIGHTSTICK_IDLE';
    }

    if (target !== animRef.current.currentState) {
      animRef.current.previousState = animRef.current.currentState;
      animRef.current.currentState = target;
      danceController.startCrossfade(target, 0.25);
    }

    animRef.current.crossfadeAlpha = danceController.crossfadeAlpha;
    animRef.current.timeScale = danceController.calculateTimeScale(target);
  });

  let currentAnim = 'IDLE';
  if (isJumping) {
    currentAnim = 'JUMP';
  } else if (isRunning) {
    currentAnim = 'RUN';
  } else if (isMoving) {
    currentAnim = 'WALK';
  } else if (playerPose && playerPose !== 'idle') {
    const act = animationRegistry.getAction(playerPose);
    currentAnim = act ? act.clip : String(playerPose).toUpperCase();
  } else if (lightstickMode !== 'OFF') {
    currentAnim = lightstickMode === 'WAVE' ? 'LIGHTSTICK_WAVE' : 'LIGHTSTICK_IDLE';
  }

  return (
    <CharacterFactory
      config={{
        ...character,
        role: 'PLAYER',
        displayName
      }}
      animationState={currentAnim}
      previousState={animRef.current.previousState}
      crossfadeAlpha={animRef.current.crossfadeAlpha}
      timeScale={animRef.current.timeScale}
      lightstickMode={lightstickMode}
      showLabel
      labelBadge={ticket?.tier === 'VIP' ? 'VIP' : 'GA'}
    />
  );
}

/**
 * PlayerCharacter (`src/characters/player/PlayerCharacter.jsx`)
 * Renders the user's customized Male or Female character inside the controllable CharacterController.
 */
export function PlayerCharacter() {
  return (
    <CharacterController>
      <InnerPlayerMesh />
    </CharacterController>
  );
}

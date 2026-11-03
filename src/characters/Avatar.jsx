import React from 'react';
import { CharacterFactory } from './CharacterFactory';

/**
 * Avatar: Delegates to CharacterFactory so 3D previews and Booth NPCs
 * automatically render with the full Male/Female Character System.
 */
export function Avatar({
  avatar = {},
  displayName = '',
  isMoving = false,
  isRunning = false,
  isJumping = false,
  pose = 'idle',
  lightstickMode = 'OFF',
  showLabel = true,
  isPreview = false,
  worldPosition = [0, 0, 0]
}) {
  let animationState = 'IDLE';
  if (pose && pose !== 'idle') {
    animationState = pose.toUpperCase();
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
    <CharacterFactory
      config={{
        ...avatar,
        displayName
      }}
      animationState={animationState}
      lightstickMode={lightstickMode}
      showLabel={showLabel}
      isPreview={isPreview}
      worldPosition={worldPosition}
    />
  );
}

/**
 * CharacterAnimator.jsx: Procedural 3D Skeletal/Limb Animation Engine for PULSE//LIVE 2026
 * Supports complete suite of actions & dances with zero snapping (smooth crossfading),
 * role permissions, and dynamic BPM timescale adjustment.
 *
 * Supported Actions:
 *   - MOVEMENT: IDLE, WALK, RUN, JUMP
 *   - REACTION: CLAP, CHEER, WAVE, PHONE_RECORD, LIGHTSTICK_WAVE, LIGHTSTICK_IDLE
 *   - DANCES: DANCE_BASIC, DANCE_GROOVE, DANCE_POP, DANCE_HIPHOP, DANCE_KPOP,
 *             DANCE_FREESTYLE, DANCE_JUMP, DANCE_SIDE_STEP, DANCE_ARM_WAVE, DANCE_SPIN
 *   - POSES: FINAL_POSE, PHOTO_POSE, POSE1, POSE2, POSE3
 *   - ARTIST/STAGE: SING, TALK, RUNWAY
 *   - SECURITY: SECURITY_GUARD, SECURITY_ALERT
 */

/**
 * Computes unblended joint rotations and offsets for a specific animation state.
 */
function computePose({
  state = 'IDLE',
  time = 0,
  hasLightstick = false,
  speedMult = 1.0,
  timeScale = 1.0
}) {
  const upperState = String(state || 'IDLE').toUpperCase();
  const scaledTime = time * timeScale;

  let bobY = 0;
  let torsoRotZ = 0;
  let torsoRotX = 0;
  let headRotY = Math.sin(scaledTime * 1.4 * speedMult) * 0.08;
  let headRotX = Math.cos(scaledTime * 1.8 * speedMult) * 0.04;

  let leftArmX = 0;
  let leftArmZ = 0.08;
  let rightArmX = 0;
  let rightArmZ = -0.08;
  let leftLegX = 0;
  let rightLegX = 0;

  switch (upperState) {
    // --- MOVEMENT ---
    case 'WALK':
    case 'RUNWAY': {
      const freq = 7.8 * speedMult;
      bobY = Math.abs(Math.sin(scaledTime * freq)) * 0.07;
      leftLegX = Math.sin(scaledTime * freq) * 0.58;
      rightLegX = -Math.sin(scaledTime * freq) * 0.58;
      leftArmX = -Math.sin(scaledTime * freq) * 0.45;
      rightArmX = hasLightstick ? -0.95 + Math.sin(scaledTime * 5) * 0.25 : Math.sin(scaledTime * freq) * 0.45;
      torsoRotX = 0.04;
      break;
    }
    case 'RUN': {
      const freq = 12.2 * speedMult;
      bobY = Math.abs(Math.sin(scaledTime * freq)) * 0.12;
      leftLegX = Math.sin(scaledTime * freq) * 0.85;
      rightLegX = -Math.sin(scaledTime * freq) * 0.85;
      leftArmX = -Math.sin(scaledTime * freq) * 0.72;
      rightArmX = hasLightstick ? -1.15 + Math.sin(scaledTime * 8) * 0.35 : Math.sin(scaledTime * freq) * 0.72;
      torsoRotX = 0.1;
      break;
    }
    case 'JUMP': {
      bobY = 0.09;
      leftLegX = -0.28;
      rightLegX = 0.25;
      leftArmX = -2.35;
      rightArmX = -2.55;
      break;
    }

    // --- REACTIONS ---
    case 'CLAP': {
      bobY = Math.abs(Math.sin(scaledTime * 6 * speedMult)) * 0.05;
      const clapWave = Math.abs(Math.sin(scaledTime * 9 * speedMult));
      leftArmX = -1.15;
      rightArmX = -1.15;
      leftArmZ = -0.3 + clapWave * 0.25;
      rightArmZ = 0.3 - clapWave * 0.25;
      break;
    }
    case 'CHEER':
    case 'LIGHTSTICK_WAVE': {
      bobY = Math.abs(Math.sin(scaledTime * 6.5 * speedMult)) * 0.09;
      leftArmX = -2.2 + Math.sin(scaledTime * 5 * speedMult) * 0.35;
      rightArmX = -2.55 + Math.cos(scaledTime * 6.5 * speedMult) * 0.42;
      rightArmZ = Math.sin(scaledTime * 5 * speedMult) * 0.32;
      torsoRotZ = Math.sin(scaledTime * 3.5 * speedMult) * 0.06;
      break;
    }
    case 'LIGHTSTICK_IDLE': {
      bobY = Math.sin(scaledTime * 2.6 * speedMult) * 0.03;
      leftArmX = Math.sin(scaledTime * 1.8) * 0.06;
      rightArmX = -1.45 + Math.sin(scaledTime * 4.2 * speedMult) * 0.22;
      rightArmZ = -0.15 + Math.cos(scaledTime * 3.5 * speedMult) * 0.18;
      break;
    }
    case 'WAVE':
    case 'TALK': {
      bobY = Math.sin(scaledTime * 2.5) * 0.03;
      rightArmX = -2.25 + Math.sin(scaledTime * 6) * 0.25;
      rightArmZ = -0.35 + Math.cos(scaledTime * 6) * 0.28;
      leftArmX = -0.35;
      break;
    }
    case 'PHONE_RECORD': {
      bobY = Math.sin(scaledTime * 2.2) * 0.02;
      rightArmX = -1.65;
      leftArmX = -1.55;
      rightArmZ = 0.22;
      leftArmZ = -0.22;
      break;
    }

    // --- DANCE 1: BASIC DANCE ---
    case 'DANCE_BASIC':
    case 'DANCE_A': {
      const beat = scaledTime * 6.2 * speedMult;
      bobY = Math.abs(Math.sin(beat)) * 0.11;
      torsoRotZ = Math.sin(beat * 0.5) * 0.12;
      leftLegX = Math.sin(beat) * 0.35;
      rightLegX = -Math.sin(beat) * 0.35;
      leftArmX = -1.6 + Math.sin(beat) * 0.65;
      rightArmX = -1.8 + Math.cos(beat) * 0.65;
      leftArmZ = 0.25 + Math.cos(beat * 0.5) * 0.2;
      rightArmZ = -0.25 - Math.sin(beat * 0.5) * 0.2;
      break;
    }

    // --- DANCE 2: GROOVE ROLL ---
    case 'DANCE_GROOVE': {
      const beat = scaledTime * 5.8 * speedMult;
      bobY = Math.abs(Math.cos(beat)) * 0.09;
      torsoRotZ = Math.sin(beat * 0.7) * 0.18;
      torsoRotX = Math.cos(beat * 0.7) * 0.08;
      headRotY = Math.sin(beat * 0.7) * 0.16;
      headRotX = Math.cos(beat * 1.4) * 0.06;
      leftArmX = -1.2 + Math.sin(beat) * 0.45;
      rightArmX = -1.2 - Math.sin(beat) * 0.45;
      leftArmZ = 0.45 + Math.sin(beat * 0.7) * 0.22;
      rightArmZ = -0.45 + Math.sin(beat * 0.7) * 0.22;
      leftLegX = Math.sin(beat * 0.7) * 0.28;
      rightLegX = -Math.sin(beat * 0.7) * 0.28;
      break;
    }

    // --- DANCE 3: POP LOCK ---
    case 'DANCE_POP': {
      const beat = scaledTime * 7.2 * speedMult;
      const step = Math.sign(Math.sin(beat)) * Math.pow(Math.abs(Math.sin(beat)), 0.35);
      bobY = Math.abs(step) * 0.08;
      torsoRotX = step * 0.12;
      leftArmX = -1.57 + Math.sin(beat) * 0.4;
      rightArmX = -1.57 - Math.cos(beat) * 0.4;
      leftArmZ = 0.55;
      rightArmZ = -0.55;
      leftLegX = step * 0.22;
      rightLegX = -step * 0.22;
      break;
    }

    // --- DANCE 4: HIP-HOP BOUNCE ---
    case 'DANCE_HIPHOP':
    case 'DANCE_B': {
      const beat = scaledTime * 6.5 * speedMult;
      bobY = Math.abs(Math.sin(beat)) * 0.15;
      torsoRotX = 0.14 + Math.sin(beat) * 0.06;
      headRotX = Math.sin(beat) * 0.18;
      leftArmX = -1.4 + Math.sin(beat * 0.5) * 0.35;
      rightArmX = -1.45 - Math.sin(beat * 0.5) * 0.35;
      leftArmZ = -0.35;
      rightArmZ = 0.35;
      leftLegX = -0.15 + Math.cos(beat) * 0.38;
      rightLegX = 0.15 - Math.cos(beat) * 0.38;
      break;
    }

    // --- DANCE 5: K-POP IDOL ---
    case 'DANCE_KPOP': {
      const beat = scaledTime * 7.5 * speedMult;
      bobY = Math.abs(Math.sin(beat)) * 0.1;
      torsoRotZ = Math.sin(beat * 0.5) * 0.15;
      headRotY = Math.sin(beat * 0.5) * 0.2;
      rightArmX = -2.1 + Math.sin(beat) * 0.4;
      rightArmZ = -0.25;
      leftArmX = -1.4 + Math.cos(beat) * 0.3;
      leftArmZ = 0.38;
      leftLegX = Math.sin(beat * 0.5) * 0.42;
      rightLegX = -Math.sin(beat * 0.5) * 0.42;
      break;
    }

    // --- DANCE 6: FREESTYLE FLOW ---
    case 'DANCE_FREESTYLE': {
      const beat = scaledTime * 6.0 * speedMult;
      bobY = Math.abs(Math.sin(beat)) * 0.1;
      torsoRotZ = Math.sin(beat * 0.4) * 0.14;
      leftArmX = -1.8 + Math.sin(beat * 0.8) * 0.8;
      rightArmX = -1.8 + Math.cos(beat * 0.8) * 0.8;
      leftArmZ = 0.35 + Math.cos(beat * 0.4) * 0.25;
      rightArmZ = -0.35 - Math.sin(beat * 0.4) * 0.25;
      leftLegX = Math.sin(beat * 0.4) * 0.3;
      rightLegX = -Math.sin(beat * 0.4) * 0.3;
      break;
    }

    // --- DANCE 7: HYPE JUMP ---
    case 'DANCE_JUMP': {
      const beat = scaledTime * 8.5 * speedMult;
      bobY = Math.abs(Math.sin(beat)) * 0.22;
      leftArmX = -2.5 + Math.sin(beat) * 0.35;
      rightArmX = -2.55 + Math.cos(beat) * 0.35;
      leftArmZ = 0.28;
      rightArmZ = -0.28;
      leftLegX = -0.2 + Math.sin(beat) * 0.2;
      rightLegX = -0.2 + Math.cos(beat) * 0.2;
      break;
    }

    // --- DANCE 8: SIDE STEP SWAY ---
    case 'DANCE_SIDE_STEP': {
      const beat = scaledTime * 5.2 * speedMult;
      bobY = Math.abs(Math.sin(beat * 2)) * 0.07;
      torsoRotZ = Math.sin(beat) * 0.16;
      leftLegX = Math.sin(beat) * 0.38;
      rightLegX = -Math.sin(beat) * 0.38;
      leftArmX = -0.9 + Math.sin(beat) * 0.5;
      rightArmX = -0.9 - Math.sin(beat) * 0.5;
      leftArmZ = 0.45 + Math.sin(beat) * 0.3;
      rightArmZ = -0.45 + Math.sin(beat) * 0.3;
      break;
    }

    // --- DANCE 9: ARM WAVE RIPPLE ---
    case 'DANCE_ARM_WAVE': {
      const beat = scaledTime * 5.5 * speedMult;
      bobY = Math.sin(beat * 2) * 0.04;
      torsoRotZ = Math.sin(beat) * 0.1;
      leftArmX = -1.4 + Math.sin(beat) * 0.65;
      rightArmX = -1.4 + Math.sin(beat + Math.PI * 0.7) * 0.65;
      leftArmZ = 0.4 + Math.cos(beat) * 0.25;
      rightArmZ = -0.4 + Math.cos(beat + Math.PI * 0.7) * 0.25;
      leftLegX = Math.sin(beat * 0.5) * 0.15;
      rightLegX = -Math.sin(beat * 0.5) * 0.15;
      break;
    }

    // --- DANCE 10: SPIN FLOURISH ---
    case 'DANCE_SPIN': {
      const spinCycle = (scaledTime * 3.5 * speedMult) % (Math.PI * 2);
      bobY = Math.abs(Math.sin(spinCycle * 2)) * 0.1;
      torsoRotZ = Math.sin(spinCycle) * 0.12;
      leftArmX = -1.55;
      rightArmX = -1.55;
      leftArmZ = 0.75;
      rightArmZ = -0.75;
      leftLegX = Math.sin(spinCycle) * 0.4;
      rightLegX = -Math.sin(spinCycle) * 0.4;
      break;
    }

    // --- POSES ---
    case 'FINAL_POSE': {
      bobY = 0.02;
      rightArmX = -2.9;
      rightArmZ = -0.15;
      leftArmX = -0.5;
      leftArmZ = 0.3;
      torsoRotX = -0.06;
      headRotX = -0.18;
      leftLegX = -0.15;
      rightLegX = 0.15;
      break;
    }
    case 'PHOTO_POSE':
    case 'POSE1': {
      bobY = Math.sin(scaledTime * 3) * 0.04;
      leftArmX = -0.5;
      rightArmX = -2.55;
      rightArmZ = -0.25;
      break;
    }
    case 'POSE2': {
      bobY = Math.sin(scaledTime * 3) * 0.04;
      leftArmX = -2.35;
      rightArmX = -2.35;
      leftArmZ = 0.35;
      rightArmZ = -0.35;
      break;
    }
    case 'POSE3': {
      bobY = Math.abs(Math.sin(scaledTime * 6)) * 0.08;
      leftArmX = -1.8 + Math.sin(scaledTime * 6) * 0.4;
      rightArmX = -2.4 + Math.cos(scaledTime * 6) * 0.4;
      break;
    }

    // --- ARTIST / STAGE ---
    case 'SING': {
      const beat = scaledTime * 4.2 * speedMult;
      bobY = Math.abs(Math.sin(beat)) * 0.06;
      rightArmX = -1.38 + Math.sin(scaledTime * 3) * 0.08;
      rightArmZ = 0.28;
      leftArmX = -0.65 + Math.sin(scaledTime * 2.5) * 0.32;
      headRotY = Math.sin(scaledTime * 1.6) * 0.22;
      break;
    }

    // --- SECURITY ---
    case 'SECURITY_GUARD': {
      bobY = Math.sin(scaledTime * 1.5) * 0.012;
      leftArmX = -0.35;
      rightArmX = -0.35;
      leftArmZ = -0.18;
      rightArmZ = 0.18;
      headRotY = Math.sin(scaledTime * 0.8) * 0.32;
      break;
    }
    case 'SECURITY_ALERT': {
      bobY = 0.02;
      rightArmX = -1.55;
      leftArmX = -0.25;
      headRotY = 0;
      break;
    }

    // --- DEFAULT IDLE ---
    default: {
      bobY = Math.sin(scaledTime * 2.4 * speedMult) * 0.025;
      leftArmX = Math.sin(scaledTime * 1.8 * speedMult) * 0.06;
      rightArmX = hasLightstick
        ? -1.42 + Math.sin(scaledTime * 4.5 * speedMult) * 0.25
        : -Math.sin(scaledTime * 1.8 * speedMult) * 0.06;
      break;
    }
  }

  return {
    bobY,
    torsoRotZ,
    torsoRotX,
    headRotY,
    headRotX,
    leftArmX,
    leftArmZ,
    rightArmX,
    rightArmZ,
    leftLegX,
    rightLegX
  };
}

/**
 * Linearly interpolates two joint poses to prevent snapping.
 */
function blendPoses(poseA, poseB, alpha) {
  const t = Math.max(0, Math.min(1, alpha));
  const lerp = (a, b) => a * (1 - t) + b * t;

  return {
    bobY: lerp(poseA.bobY, poseB.bobY),
    torsoRotZ: lerp(poseA.torsoRotZ, poseB.torsoRotZ),
    torsoRotX: lerp(poseA.torsoRotX, poseB.torsoRotX),
    headRotY: lerp(poseA.headRotY, poseB.headRotY),
    headRotX: lerp(poseA.headRotX, poseB.headRotX),
    leftArmX: lerp(poseA.leftArmX, poseB.leftArmX),
    leftArmZ: lerp(poseA.leftArmZ, poseB.leftArmZ),
    rightArmX: lerp(poseA.rightArmX, poseB.rightArmX),
    rightArmZ: lerp(poseA.rightArmZ, poseB.rightArmZ),
    leftLegX: lerp(poseA.leftLegX, poseB.leftLegX),
    rightLegX: lerp(poseA.rightLegX, poseB.rightLegX)
  };
}

export function applyCharacterAnimation({
  t,
  groupRef,
  headRef,
  torsoRef,
  leftArmRef,
  rightArmRef,
  leftLegRef,
  rightLegRef,
  state = 'IDLE',
  previousState = null,
  crossfadeAlpha = 1.0,
  hasLightstick = false,
  reduceMotion = false,
  baseY = 0,
  phaseOffset = 0,
  timeScale = 1.0
}) {
  const time = t + phaseOffset;
  const speedMult = reduceMotion ? 0.35 : 1.0;

  const currentPose = computePose({
    state,
    time,
    hasLightstick,
    speedMult,
    timeScale
  });

  let finalPose = currentPose;

  if (previousState && previousState !== state && crossfadeAlpha < 1.0) {
    const prevPose = computePose({
      state: previousState,
      time,
      hasLightstick,
      speedMult,
      timeScale
    });
    finalPose = blendPoses(prevPose, currentPose, crossfadeAlpha);
  }

  if (groupRef?.current) {
    groupRef.current.position.y = baseY + finalPose.bobY;
  }
  if (torsoRef?.current) {
    torsoRef.current.rotation.z = finalPose.torsoRotZ;
    torsoRef.current.rotation.x = finalPose.torsoRotX;
  }
  if (headRef?.current) {
    headRef.current.rotation.y = finalPose.headRotY;
    headRef.current.rotation.x = finalPose.headRotX;
  }
  if (leftArmRef?.current) {
    leftArmRef.current.rotation.x = finalPose.leftArmX;
    leftArmRef.current.rotation.z = finalPose.leftArmZ;
  }
  if (rightArmRef?.current) {
    rightArmRef.current.rotation.x = finalPose.rightArmX;
    rightArmRef.current.rotation.z = finalPose.rightArmZ;
  }
  if (leftLegRef?.current) {
    leftLegRef.current.rotation.x = finalPose.leftLegX;
  }
  if (rightLegRef?.current) {
    rightLegRef.current.rotation.x = finalPose.rightLegX;
  }
}

/**
 * CharacterAnimator: Procedural 3D Skeletal/Limb Animation Engine for PULSE//LIVE 2026
 * Supports Player & Crowd states:
 *   IDLE, WALK, RUN, JUMP, CLAP, CHEER, LIGHTSTICK_IDLE, LIGHTSTICK_WAVE, DANCE_BASIC, PHONE_RECORD, PHOTO_POSE
 * Supports Artist states:
 *   IDLE, WALK, SING, DANCE_A, DANCE_B, WAVE, TALK, RUNWAY, FINAL_POSE
 * Supports Security states:
 *   SECURITY_GUARD, SECURITY_ALERT
 */
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
  hasLightstick = false,
  reduceMotion = false,
  baseY = 0,
  phaseOffset = 0
}) {
  const time = t + phaseOffset;
  const speedMult = reduceMotion ? 0.35 : 1.0;
  const upperState = String(state || 'IDLE').toUpperCase();

  let bobY = 0;
  let torsoRotZ = 0;
  let torsoRotX = 0;
  let headRotY = Math.sin(time * 1.4 * speedMult) * 0.08;
  let headRotX = Math.cos(time * 1.8 * speedMult) * 0.04;

  let leftArmX = 0;
  let leftArmZ = 0.08;
  let rightArmX = 0;
  let rightArmZ = -0.08;
  let leftLegX = 0;
  let rightLegX = 0;

  switch (upperState) {
    case 'WALK':
    case 'RUNWAY': {
      const freq = 7.8 * speedMult;
      bobY = Math.abs(Math.sin(time * freq)) * 0.07;
      leftLegX = Math.sin(time * freq) * 0.58;
      rightLegX = -Math.sin(time * freq) * 0.58;
      leftArmX = -Math.sin(time * freq) * 0.45;
      rightArmX = hasLightstick ? -0.95 + Math.sin(time * 5) * 0.25 : Math.sin(time * freq) * 0.45;
      torsoRotX = 0.04;
      break;
    }
    case 'RUN': {
      const freq = 12.2 * speedMult;
      bobY = Math.abs(Math.sin(time * freq)) * 0.12;
      leftLegX = Math.sin(time * freq) * 0.85;
      rightLegX = -Math.sin(time * freq) * 0.85;
      leftArmX = -Math.sin(time * freq) * 0.72;
      rightArmX = hasLightstick ? -1.15 + Math.sin(time * 8) * 0.35 : Math.sin(time * freq) * 0.72;
      torsoRotX = 0.1;
      break;
    }
    case 'JUMP': {
      bobY = 0.08;
      leftLegX = -0.25;
      rightLegX = 0.22;
      leftArmX = -2.3;
      rightArmX = -2.5;
      break;
    }
    case 'CLAP': {
      bobY = Math.abs(Math.sin(time * 6 * speedMult)) * 0.05;
      const clapWave = Math.abs(Math.sin(time * 9 * speedMult));
      leftArmX = -1.15;
      rightArmX = -1.15;
      leftArmZ = -0.3 + clapWave * 0.25;
      rightArmZ = 0.3 - clapWave * 0.25;
      break;
    }
    case 'CHEER':
    case 'LIGHTSTICK_WAVE': {
      bobY = Math.abs(Math.sin(time * 6.5 * speedMult)) * 0.09;
      leftArmX = -2.2 + Math.sin(time * 5 * speedMult) * 0.35;
      rightArmX = -2.55 + Math.cos(time * 6.5 * speedMult) * 0.42;
      rightArmZ = Math.sin(time * 5 * speedMult) * 0.32;
      torsoRotZ = Math.sin(time * 3.5 * speedMult) * 0.06;
      break;
    }
    case 'LIGHTSTICK_IDLE': {
      bobY = Math.sin(time * 2.6 * speedMult) * 0.03;
      leftArmX = Math.sin(time * 1.8) * 0.06;
      rightArmX = -1.45 + Math.sin(time * 4.2 * speedMult) * 0.22;
      rightArmZ = -0.15 + Math.cos(time * 3.5 * speedMult) * 0.18;
      break;
    }
    case 'DANCE_BASIC':
    case 'DANCE_A': {
      const beat = time * 6.2 * speedMult;
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
    case 'DANCE_B': {
      const beat = time * 8.4 * speedMult;
      bobY = Math.abs(Math.sin(beat)) * 0.16;
      torsoRotZ = Math.cos(beat * 0.5) * 0.16;
      leftLegX = Math.cos(beat) * 0.48;
      rightLegX = -Math.cos(beat) * 0.48;
      leftArmX = -2.35 + Math.sin(beat) * 0.72;
      rightArmX = -2.35 - Math.sin(beat) * 0.72;
      break;
    }
    case 'SING': {
      const beat = time * 4.2 * speedMult;
      bobY = Math.abs(Math.sin(beat)) * 0.06;
      rightArmX = -1.38 + Math.sin(time * 3) * 0.08; // Microphone hand near mouth
      rightArmZ = 0.28;
      leftArmX = -0.65 + Math.sin(time * 2.5) * 0.32;
      headRotY = Math.sin(time * 1.6) * 0.22;
      break;
    }
    case 'TALK':
    case 'WAVE': {
      bobY = Math.sin(time * 2.5) * 0.03;
      rightArmX = -2.25 + Math.sin(time * 6) * 0.25;
      rightArmZ = -0.35 + Math.cos(time * 6) * 0.28;
      leftArmX = -0.35;
      break;
    }
    case 'FINAL_POSE': {
      bobY = Math.sin(time * 2) * 0.02;
      rightArmX = -2.85; // Heroic raised arm toward sky
      leftArmX = -0.45;
      headRotX = -0.15;
      break;
    }
    case 'PHONE_RECORD': {
      bobY = Math.sin(time * 2.2) * 0.02;
      rightArmX = -1.65;
      leftArmX = -1.55;
      rightArmZ = 0.22;
      leftArmZ = -0.22;
      break;
    }
    case 'PHOTO_POSE':
    case 'POSE1': {
      bobY = Math.sin(time * 3) * 0.04;
      leftArmX = -0.5;
      rightArmX = -2.55;
      rightArmZ = -0.25;
      break;
    }
    case 'POSE2': {
      bobY = Math.sin(time * 3) * 0.04;
      leftArmX = -2.35;
      rightArmX = -2.35;
      leftArmZ = 0.35;
      rightArmZ = -0.35;
      break;
    }
    case 'POSE3': {
      bobY = Math.abs(Math.sin(time * 6)) * 0.08;
      leftArmX = -1.8 + Math.sin(time * 6) * 0.4;
      rightArmX = -2.4 + Math.cos(time * 6) * 0.4;
      break;
    }
    case 'SECURITY_GUARD': {
      bobY = Math.sin(time * 1.5) * 0.012;
      leftArmX = -0.35;
      rightArmX = -0.35;
      leftArmZ = -0.18;
      rightArmZ = 0.18;
      headRotY = Math.sin(time * 0.8) * 0.32;
      break;
    }
    case 'SECURITY_ALERT': {
      bobY = 0.02;
      rightArmX = -1.55; // Hand raised in "STOP / RESTRICTED AREA" gesture
      leftArmX = -0.25;
      headRotY = 0;
      break;
    }
    default: {
      // IDLE
      bobY = Math.sin(time * 2.4 * speedMult) * 0.025;
      leftArmX = Math.sin(time * 1.8 * speedMult) * 0.06;
      rightArmX = hasLightstick
        ? -1.42 + Math.sin(time * 4.5 * speedMult) * 0.25
        : -Math.sin(time * 1.8 * speedMult) * 0.06;
      break;
    }
  }

  if (groupRef?.current) {
    groupRef.current.position.y = baseY + bobY;
  }
  if (torsoRef?.current) {
    torsoRef.current.rotation.z = torsoRotZ;
    torsoRef.current.rotation.x = torsoRotX;
  }
  if (headRef?.current) {
    headRef.current.rotation.y = headRotY;
    headRef.current.rotation.x = headRotX;
  }
  if (leftArmRef?.current) {
    leftArmRef.current.rotation.x = leftArmX;
    leftArmRef.current.rotation.z = leftArmZ;
  }
  if (rightArmRef?.current) {
    rightArmRef.current.rotation.x = rightArmX;
    rightArmRef.current.rotation.z = rightArmZ;
  }
  if (leftLegRef?.current) {
    leftLegRef.current.rotation.x = leftLegX;
  }
  if (rightLegRef?.current) {
    rightLegRef.current.rotation.x = rightLegX;
  }
}


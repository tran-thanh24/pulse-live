import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';

/**
 * Stylized Performer & Booth Host NPC for PULSE//LIVE 2026
 * Supports timeline-driven Artist Performance states:
 * IDLE | WALK | SING | DANCE_A | DANCE_B | WAVE | TALK | RUNWAY | FINAL_POSE
 * Each artist uses an individual phase offset so they never animate identically.
 */
export function NPC({
  position = [0, 0, 0],
  runwayPosition = null,
  rotation = [0, 0, 0],
  name = 'HOST',
  role = '',
  outfitColor = '#0F172A',
  hairColor = '#22D3EE',
  skinTone = '#F5CBA7',
  isArtist = false,
  artistIndex = 0,
  animationState = 'SING'
}) {
  const groupRef = useRef();
  const headRef = useRef();
  const leftArmRef = useRef();
  const rightArmRef = useRef();
  const leftLegRef = useRef();
  const rightLegRef = useRef();

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    if (!groupRef.current) return;

    const offset = artistIndex * 1.35;
    const phase = t * 4.2 + offset;

    if (isArtist) {
      // Determine target stage vs runway position
      const targetPos =
        animationState === 'RUNWAY' && runwayPosition ? runwayPosition : position;

      groupRef.current.position.x +=
        (targetPos[0] - groupRef.current.position.x) * Math.min(1, delta * 3.0);
      groupRef.current.position.z +=
        (targetPos[2] - groupRef.current.position.z) * Math.min(1, delta * 3.0);

      switch (animationState) {
        case 'IDLE':
          groupRef.current.position.y = targetPos[1] + Math.sin(phase * 0.5) * 0.03;
          groupRef.current.rotation.y = rotation[1] + Math.sin(phase * 0.4) * 0.12;
          if (leftArmRef.current) leftArmRef.current.rotation.set(0.1, 0, 0.15);
          if (rightArmRef.current) rightArmRef.current.rotation.set(0.1, 0, -0.15);
          break;

        case 'WALK':
        case 'RUNWAY':
          groupRef.current.position.y = targetPos[1] + Math.abs(Math.sin(phase * 1.2)) * 0.08;
          groupRef.current.rotation.y = rotation[1] + Math.sin(phase * 0.6) * 0.25;
          if (leftLegRef.current) leftLegRef.current.rotation.x = Math.sin(phase * 1.4) * 0.45;
          if (rightLegRef.current) rightLegRef.current.rotation.x = -Math.sin(phase * 1.4) * 0.45;
          if (leftArmRef.current) leftArmRef.current.rotation.set(-Math.sin(phase * 1.4) * 0.4, 0, 0.2);
          if (rightArmRef.current) rightArmRef.current.rotation.set(-2.1 + Math.sin(phase) * 0.3, 0, -0.3);
          break;

        case 'SING':
          groupRef.current.position.y = targetPos[1] + Math.abs(Math.sin(phase * 0.8)) * 0.06;
          groupRef.current.rotation.y = rotation[1] + Math.sin(phase * 0.5) * 0.3;
          if (rightArmRef.current) {
            // Holding microphone near mouth
            rightArmRef.current.rotation.set(-1.95, 0.25, -0.25);
          }
          if (leftArmRef.current) {
            leftArmRef.current.rotation.set(-0.9 + Math.sin(phase * 0.8) * 0.45, 0, 0.35);
          }
          break;

        case 'DANCE_A':
          groupRef.current.position.y = targetPos[1] + Math.abs(Math.sin(phase * 1.3)) * 0.18;
          groupRef.current.rotation.y = rotation[1] + Math.sin(phase) * 0.55;
          if (leftArmRef.current) {
            leftArmRef.current.rotation.set(-1.8 + Math.sin(phase * 1.3) * 0.75, 0, 0.45);
          }
          if (rightArmRef.current) {
            rightArmRef.current.rotation.set(-1.8 + Math.cos(phase * 1.3) * 0.75, 0, -0.45);
          }
          if (leftLegRef.current) leftLegRef.current.rotation.x = Math.sin(phase * 1.3) * 0.35;
          if (rightLegRef.current) rightLegRef.current.rotation.x = -Math.sin(phase * 1.3) * 0.35;
          break;

        case 'DANCE_B':
          groupRef.current.position.y = targetPos[1] + Math.abs(Math.cos(phase * 1.6)) * 0.24;
          groupRef.current.rotation.y = rotation[1] + Math.cos(phase * 1.1) * 0.65;
          if (leftArmRef.current) {
            leftArmRef.current.rotation.set(-2.4 + Math.sin(phase * 2) * 0.5, 0, 0.6);
          }
          if (rightArmRef.current) {
            rightArmRef.current.rotation.set(-2.4 - Math.sin(phase * 2) * 0.5, 0, -0.6);
          }
          break;

        case 'WAVE':
        case 'TALK':
          groupRef.current.position.y = targetPos[1] + Math.sin(phase * 0.6) * 0.04;
          if (rightArmRef.current) {
            rightArmRef.current.rotation.set(-2.5, 0, -0.4 + Math.sin(phase * 1.5) * 0.35);
          }
          if (leftArmRef.current) {
            leftArmRef.current.rotation.set(-0.4, 0, 0.2);
          }
          break;

        case 'FINAL_POSE':
        default:
          groupRef.current.position.y = targetPos[1];
          groupRef.current.rotation.y = rotation[1];
          if (leftArmRef.current) leftArmRef.current.rotation.set(-2.6, 0, 0.45);
          if (rightArmRef.current) rightArmRef.current.rotation.set(-2.6, 0, -0.45);
          break;
      }

      if (headRef.current) {
        headRef.current.rotation.y = Math.sin(phase * 0.7) * 0.18;
      }
    } else {
      // Friendly Zone Host NPC
      groupRef.current.position.y = position[1] + Math.sin(t * 2.4 + position[0]) * 0.03;
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = -2.15;
        rightArmRef.current.rotation.z = -0.35 + Math.sin(t * 4.5) * 0.22;
      }
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      {/* Head */}
      <group ref={headRef} position={[0, 1.48, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.36, 0.38, 0.36]} />
          <meshStandardMaterial color={skinTone} roughness={0.4} />
        </mesh>
        {/* Hair */}
        <mesh position={[0, 0.2, 0]}>
          <boxGeometry args={[0.4, 0.14, 0.4]} />
          <meshStandardMaterial
            color={hairColor}
            emissive={isArtist ? hairColor : '#000000'}
            emissiveIntensity={isArtist ? 0.45 : 0}
          />
        </mesh>
        {/* Visor */}
        <mesh position={[0, 0.02, 0.19]}>
          <boxGeometry args={[0.38, 0.09, 0.03]} />
          <meshStandardMaterial color={hairColor} emissive={hairColor} emissiveIntensity={1.6} />
        </mesh>
      </group>

      {/* Torso */}
      <mesh position={[0, 0.92, 0]} castShadow>
        <boxGeometry args={[0.44, 0.62, 0.26]} />
        <meshStandardMaterial
          color={outfitColor}
          emissive={isArtist ? hairColor : '#000000'}
          emissiveIntensity={isArtist ? 0.3 : 0.1}
          metalness={0.55}
          roughness={0.28}
        />
      </mesh>

      {/* Left Arm */}
      <group ref={leftArmRef} position={[-0.3, 1.15, 0]}>
        <mesh position={[0, -0.22, 0]}>
          <boxGeometry args={[0.13, 0.48, 0.13]} />
          <meshStandardMaterial color={outfitColor} />
        </mesh>
      </group>

      {/* Right Arm */}
      <group ref={rightArmRef} position={[0.3, 1.15, 0]}>
        <mesh position={[0, -0.22, 0]}>
          <boxGeometry args={[0.13, 0.48, 0.13]} />
          <meshStandardMaterial color={outfitColor} />
        </mesh>
      </group>

      {/* Legs */}
      <group ref={leftLegRef} position={[-0.12, 0.6, 0]}>
        <mesh position={[0, -0.28, 0]}>
          <boxGeometry args={[0.16, 0.56, 0.16]} />
          <meshStandardMaterial color="#0F172A" />
        </mesh>
      </group>
      <group ref={rightLegRef} position={[0.12, 0.6, 0]}>
        <mesh position={[0, -0.28, 0]}>
          <boxGeometry args={[0.16, 0.56, 0.16]} />
          <meshStandardMaterial color="#0F172A" />
        </mesh>
      </group>

      {name && (
        <Html position={[0, 2.15, 0]} center distanceFactor={18} zIndexRange={[8, 3]}>
          <div className="px-2 py-0.5 rounded-md bg-[#070816]/85 border border-white/15 text-[10px] font-heading tracking-wider text-white/90 whitespace-nowrap pointer-events-none">
            <span className="text-[#22D3EE] font-bold">{name}</span>
            {role ? <span className="text-zinc-400 ml-1">· {role}</span> : null}
          </div>
        </Html>
      )}
    </group>
  );
}

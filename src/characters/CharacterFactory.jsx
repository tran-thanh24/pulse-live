import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { CharacterValidator } from './CharacterRules';
import { applyCharacterAnimation } from './CharacterAnimator';
import { computePulseLightVisual } from '../systems/LightstickSystem';
import { useConcertStore } from '../store/concertStore';
import { useUserStore } from '../store/userStore';

/**
 * CharacterFactory: Renders any character (PLAYER, ARTIST, DANCER, SECURITY, STAFF, CROWD)
 * from a validated CHARACTER CONFIG.
 * Distinguishes Male vs Female body proportions (shoulder width, torso taper, waist/hips, head/face styling),
 * hair styles, tops, bottoms, shoes, accessories, and hand items (Pulse Light or Stage Microphone).
 */
export function CharacterFactory({
  config,
  animationState = 'IDLE',
  previousState = null,
  crossfadeAlpha = 1.0,
  timeScale = 1.0,
  lightstickMode = 'OFF',
  showLabel = true,
  labelBadge = null,
  isPreview = false,
  phaseOffset = 0,
  worldPosition = [0, 0, 0]
}) {
  const groupRef = useRef();
  const torsoRef = useRef();
  const headRef = useRef();
  const leftArmRef = useRef();
  const rightArmRef = useRef();
  const leftLegRef = useRef();
  const rightLegRef = useRef();
  const pulseOrbMatRef = useRef();
  const pulsePointLightRef = useRef();

  const reduceMotion = useUserStore((s) => s.settings.reduceMotion);

  const char = useMemo(() => {
    return CharacterValidator.validate(config || {}).sanitized;
  }, [config]);

  const isFemale = char.gender === 'female';
  const isArtistRole = char.role === 'ARTIST' || char.role === 'MC';
  const isSecurityRole = char.role === 'SECURITY';
  const hasLightstick = char.permissions?.canUseLightstick && lightstickMode !== 'OFF';

  // Gender-distinct Body Proportions (Requirement 3: Male and Female have distinct body proportion)
  const bodyProps = useMemo(() => {
    if (isFemale) {
      return {
        shoulderW: 0.44,
        chestW: 0.42,
        chestD: 0.25,
        waistW: 0.34,
        hipW: 0.44,
        torsoH: 0.62,
        armOffsetX: 0.28,
        armRadius: 0.068,
        legOffsetX: 0.115,
        legRadius: 0.088,
        headScale: [0.95, 0.98, 0.95]
      };
    }
    return {
      shoulderW: 0.56,
      chestW: 0.52,
      chestD: 0.29,
      waistW: 0.45,
      hipW: 0.46,
      torsoH: 0.68,
      armOffsetX: 0.34,
      armRadius: 0.082,
      legOffsetX: 0.135,
      legRadius: 0.102,
      headScale: [1.0, 1.02, 1.0]
    };
  }, [isFemale]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    applyCharacterAnimation({
      t,
      groupRef,
      headRef,
      torsoRef,
      leftArmRef,
      rightArmRef,
      leftLegRef,
      rightLegRef,
      state: animationState,
      previousState,
      crossfadeAlpha,
      hasLightstick,
      reduceMotion,
      baseY: 0,
      phaseOffset,
      timeScale
    });

    if (isPreview && groupRef.current) {
      groupRef.current.rotation.y = Math.sin(t * 0.65) * 0.48;
    }

    if (hasLightstick && pulseOrbMatRef.current) {
      const cStore = useConcertStore.getState();
      const visual = computePulseLightVisual({
        mode: lightstickMode,
        userColor: char.lightstick || '#22D3EE',
        lightingScene: cStore.lightingScene,
        audioAnalysis: cStore.audioAnalysis,
        pulseWaveState: cStore.pulseWaveState,
        worldPosition,
        elapsedTime: t
      });

      pulseOrbMatRef.current.color.set(visual.color);
      if (pulsePointLightRef.current) {
        pulsePointLightRef.current.color.set(visual.color);
        pulsePointLightRef.current.intensity = visual.intensity * 1.4;
      }
    }
  });

  const scaleVal = char.scale || 1.0;

  return (
    <group ref={groupRef} scale={[scaleVal, scaleVal, scaleVal]}>
      {/* Ground Halo Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[0.42, 0.56, 32]} />
        <meshBasicMaterial
          color={
            isSecurityRole
              ? '#EF4444'
              : isArtistRole
              ? '#FACC15'
              : hasLightstick
              ? char.lightstick
              : char.outfitColor
          }
          transparent
          opacity={hasLightstick || isArtistRole ? 0.8 : 0.38}
        />
      </mesh>

      {/* ==========================================
          1. LEGS, BOTTOM OUTFIT & SHOES
          ========================================== */}
      {/* Hip / Pelvis Base */}
      <mesh position={[0, 0.72, 0]} castShadow>
        <boxGeometry args={[bodyProps.hipW, 0.18, bodyProps.chestD]} />
        <meshStandardMaterial
          color={
            char.outfitBottom === 'pleated-stage-skirt'
              ? char.outfitColor
              : char.outfitBottom === 'relaxed-denim'
              ? '#1E3A8A'
              : '#111827'
          }
          roughness={0.5}
        />
      </mesh>

      {/* Female Pleated Performance Skirt */}
      {char.outfitBottom === 'pleated-stage-skirt' && (
        <mesh position={[0, 0.66, 0]} castShadow>
          <cylinderGeometry args={[0.21, 0.31, 0.32, 18]} />
          <meshStandardMaterial color={char.outfitColor} roughness={0.35} metalness={0.2} />
        </mesh>
      )}

      {/* Left Leg */}
      <group position={[-bodyProps.legOffsetX, 0.7, 0]} ref={leftLegRef}>
        <mesh position={[0, -0.32, 0]} castShadow>
          <capsuleGeometry args={[bodyProps.legRadius, 0.42, 8, 12]} />
          <meshStandardMaterial
            color={
              char.outfitBottom === 'pleated-stage-skirt'
                ? char.skinTone
                : char.outfitBottom === 'relaxed-denim'
                ? '#1E3A8A'
                : char.outfitBottom === 'high-waist-flare'
                ? '#1E1B4B'
                : '#111827'
            }
            roughness={0.55}
          />
        </mesh>
        {/* Left Shoe */}
        <group position={[0, -0.62, 0.04]}>
          <mesh castShadow>
            <boxGeometry
              args={[
                0.15,
                char.shoes === 'platform-idol-boots' || char.shoes === 'combat-boots'
                  ? 0.16
                  : 0.11,
                0.26
              ]}
            />
            <meshStandardMaterial
              color={char.shoes === 'chunky-runners' ? '#F8FAFC' : '#0F172A'}
              metalness={0.35}
              roughness={0.3}
            />
          </mesh>
          {/* Neon Sole Accent */}
          <mesh position={[0, -0.055, 0]}>
            <boxGeometry args={[0.16, 0.025, 0.27]} />
            <meshBasicMaterial color={char.outfitColor} />
          </mesh>
        </group>
      </group>

      {/* Right Leg */}
      <group position={[bodyProps.legOffsetX, 0.7, 0]} ref={rightLegRef}>
        <mesh position={[0, -0.32, 0]} castShadow>
          <capsuleGeometry args={[bodyProps.legRadius, 0.42, 8, 12]} />
          <meshStandardMaterial
            color={
              char.outfitBottom === 'pleated-stage-skirt'
                ? char.skinTone
                : char.outfitBottom === 'relaxed-denim'
                ? '#1E3A8A'
                : char.outfitBottom === 'high-waist-flare'
                ? '#1E1B4B'
                : '#111827'
            }
            roughness={0.55}
          />
        </mesh>
        {/* Right Shoe */}
        <group position={[0, -0.62, 0.04]}>
          <mesh castShadow>
            <boxGeometry
              args={[
                0.15,
                char.shoes === 'platform-idol-boots' || char.shoes === 'combat-boots'
                  ? 0.16
                  : 0.11,
                0.26
              ]}
            />
            <meshStandardMaterial
              color={char.shoes === 'chunky-runners' ? '#F8FAFC' : '#0F172A'}
              metalness={0.35}
              roughness={0.3}
            />
          </mesh>
          <mesh position={[0, -0.055, 0]}>
            <boxGeometry args={[0.16, 0.025, 0.27]} />
            <meshBasicMaterial color={char.outfitColor} />
          </mesh>
        </group>
      </group>

      {/* ==========================================
          2. TORSO & TOP OUTFIT (Male vs Female Silhouette)
          ========================================== */}
      <group ref={torsoRef} position={[0, 1.08, 0]}>
        {/* Upper Chest */}
        <mesh position={[0, 0.06, 0]} castShadow>
          <boxGeometry args={[bodyProps.chestW, bodyProps.torsoH * 0.65, bodyProps.chestD]} />
          <meshStandardMaterial
            color={isSecurityRole ? '#0F172A' : char.outfitColor}
            roughness={0.32}
            metalness={char.outfitTop === 'corset-stage-top' ? 0.55 : 0.25}
          />
        </mesh>

        {/* Tapered Waist */}
        <mesh position={[0, -0.2, 0]} castShadow>
          <boxGeometry args={[bodyProps.waistW, bodyProps.torsoH * 0.42, bodyProps.chestD * 0.92]} />
          <meshStandardMaterial
            color={
              char.outfitTop === 'cropped-bomber'
                ? char.skinTone
                : isSecurityRole
                ? '#0F172A'
                : char.outfitColor
            }
            roughness={0.38}
          />
        </mesh>

        {/* Shoulder Pads / Tailored Structure */}
        {(char.outfitTop === 'techwear-jacket' || char.outfitTop === 'tailored-blazer') && (
          <mesh position={[0, 0.22, 0]} castShadow>
            <boxGeometry args={[bodyProps.shoulderW + 0.05, 0.11, bodyProps.chestD + 0.03]} />
            <meshStandardMaterial color="#0F172A" metalness={0.6} roughness={0.25} />
          </mesh>
        )}

        {/* PULSE Soundwave Chest Emblem */}
        <mesh position={[0, 0.08, bodyProps.chestD / 2 + 0.008]}>
          <planeGeometry args={[0.24, 0.06]} />
          <meshBasicMaterial color={isSecurityRole ? '#EF4444' : '#22D3EE'} />
        </mesh>

        {/* ==========================================
            3. ARMS & HAND ITEMS (Pulse Light / Mic)
            ========================================== */}
        {/* Left Arm */}
        <group position={[-bodyProps.armOffsetX, 0.18, 0]} ref={leftArmRef}>
          <mesh position={[0, -0.24, 0]} castShadow>
            <capsuleGeometry args={[bodyProps.armRadius, 0.36, 8, 12]} />
            <meshStandardMaterial
              color={
                char.outfitTop === 'sleeveless-vest' || char.outfitTop === 'corset-stage-top'
                  ? char.skinTone
                  : isSecurityRole
                  ? '#0F172A'
                  : char.outfitColor
              }
              roughness={0.4}
            />
          </mesh>
          <mesh position={[0, -0.46, 0]}>
            <sphereGeometry args={[bodyProps.armRadius * 0.95, 10, 10]} />
            <meshStandardMaterial color={char.skinTone} roughness={0.45} />
          </mesh>
        </group>

        {/* Right Arm + Hand Item */}
        <group position={[bodyProps.armOffsetX, 0.18, 0]} ref={rightArmRef}>
          <mesh position={[0, -0.24, 0]} castShadow>
            <capsuleGeometry args={[bodyProps.armRadius, 0.36, 8, 12]} />
            <meshStandardMaterial
              color={
                char.outfitTop === 'sleeveless-vest' || char.outfitTop === 'corset-stage-top'
                  ? char.skinTone
                  : isSecurityRole
                  ? '#0F172A'
                  : char.outfitColor
              }
              roughness={0.4}
            />
          </mesh>
          <mesh position={[0, -0.46, 0]}>
            <sphereGeometry args={[bodyProps.armRadius * 0.95, 10, 10]} />
            <meshStandardMaterial color={char.skinTone} roughness={0.45} />
          </mesh>

          {/* Artist Wireless Microphone */}
          {isArtistRole && (
            <group position={[0, -0.5, 0.12]} rotation={[Math.PI / 2.2, 0, 0]}>
              <mesh>
                <cylinderGeometry args={[0.022, 0.018, 0.22, 10]} />
                <meshStandardMaterial color="#0F172A" metalness={0.9} roughness={0.2} />
              </mesh>
              <mesh position={[0, 0.13, 0]}>
                <sphereGeometry args={[0.042, 12, 12]} />
                <meshStandardMaterial color="#E2E8F0" metalness={0.9} roughness={0.15} />
              </mesh>
            </group>
          )}

          {/* Audience / Player PULSE LIGHT */}
          {hasLightstick && !isArtistRole && (
            <group position={[0, -0.52, 0.12]} rotation={[Math.PI / 3, 0, 0]}>
              <mesh>
                <cylinderGeometry args={[0.028, 0.032, 0.26, 12]} />
                <meshStandardMaterial color="#18181B" metalness={0.85} roughness={0.2} />
              </mesh>
              <mesh position={[0, 0.21, 0]}>
                <sphereGeometry args={[0.095, 16, 16]} />
                <meshBasicMaterial
                  ref={pulseOrbMatRef}
                  color={char.lightstick || '#22D3EE'}
                  toneMapped={false}
                />
              </mesh>
              <mesh position={[0, 0.21, 0]}>
                <torusGeometry args={[0.12, 0.014, 12, 24]} />
                <meshBasicMaterial color="#FFFFFF" />
              </mesh>
              {/* Only local controllable player on High quality gets a subtle proximity glow; NPCs use emissive material (Rule 40) */}
              {char.role === 'PLAYER' && !isPreview && (
                <pointLight
                  ref={pulsePointLightRef}
                  position={[0, 0.24, 0]}
                  color={char.lightstick || '#22D3EE'}
                  intensity={1.5}
                  distance={4.0}
                  decay={2}
                />
              )}
            </group>
          )}
        </group>

        {/* ==========================================
            4. HEAD, FACE PRESET, HAIR & ACCESSORY
            ========================================== */}
        <group ref={headRef} position={[0, 0.56, 0]} scale={bodyProps.headScale}>
          {/* Head Sculpt */}
          <mesh castShadow>
            <sphereGeometry args={[0.25, 24, 24]} />
            <meshStandardMaterial color={char.skinTone} roughness={0.42} />
          </mesh>

          {/* Distinct Face Features (Eyes + Brows + Expression) */}
          <mesh position={[-0.085, 0.02, 0.22]}>
            <sphereGeometry args={[isFemale ? 0.03 : 0.026, 10, 10]} />
            <meshBasicMaterial color="#090D16" />
          </mesh>
          <mesh position={[0.085, 0.02, 0.22]}>
            <sphereGeometry args={[isFemale ? 0.03 : 0.026, 10, 10]} />
            <meshBasicMaterial color="#090D16" />
          </mesh>

          {/* Eye Catchlight / Eyelashes for Female Face Presets */}
          {isFemale && (
            <>
              <mesh position={[-0.095, 0.042, 0.222]} rotation={[0, 0, 0.18]}>
                <boxGeometry args={[0.065, 0.012, 0.01]} />
                <meshBasicMaterial color="#090D16" />
              </mesh>
              <mesh position={[0.095, 0.042, 0.222]} rotation={[0, 0, -0.18]}>
                <boxGeometry args={[0.065, 0.012, 0.01]} />
                <meshBasicMaterial color="#090D16" />
              </mesh>
            </>
          )}

          {/* Eyebrows */}
          <mesh position={[-0.085, 0.075, 0.215]} rotation={[0, 0, isFemale ? 0.06 : -0.08]}>
            <boxGeometry args={[0.07, isFemale ? 0.014 : 0.022, 0.015]} />
            <meshBasicMaterial color={char.hairColor} />
          </mesh>
          <mesh position={[0.085, 0.075, 0.215]} rotation={[0, 0, isFemale ? -0.06 : 0.08]}>
            <boxGeometry args={[0.07, isFemale ? 0.014 : 0.022, 0.015]} />
            <meshBasicMaterial color={char.hairColor} />
          </mesh>

          {/* Hair Styles */}
          <group>
            {/* Base Crown Hair */}
            <mesh position={[0, 0.08, -0.02]} castShadow>
              <sphereGeometry args={[0.265, 20, 20, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
              <meshStandardMaterial color={char.hairColor} roughness={0.35} metalness={0.15} />
            </mesh>

            {/* Male Undercut / Spiky Fade */}
            {char.hairStyle === 'undercut-fade' && (
              <mesh position={[0, 0.24, 0.04]} rotation={[0.25, 0, 0]}>
                <coneGeometry args={[0.19, 0.22, 8]} />
                <meshStandardMaterial color={char.hairColor} roughness={0.35} />
              </mesh>
            )}

            {/* Curtain Flow / Wolf Cut */}
            {(char.hairStyle === 'curtain-flow' || char.hairStyle === 'wolf-cut') && (
              <>
                <mesh position={[-0.18, 0.02, 0.05]}>
                  <capsuleGeometry args={[0.065, 0.18, 8, 8]} />
                  <meshStandardMaterial color={char.hairColor} roughness={0.35} />
                </mesh>
                <mesh position={[0.18, 0.02, 0.05]}>
                  <capsuleGeometry args={[0.065, 0.18, 8, 8]} />
                  <meshStandardMaterial color={char.hairColor} roughness={0.35} />
                </mesh>
              </>
            )}

            {/* Female Sleek Bob */}
            {char.hairStyle === 'neon-bob' && (
              <>
                <mesh position={[-0.21, -0.02, 0]}>
                  <boxGeometry args={[0.08, 0.3, 0.34]} />
                  <meshStandardMaterial color={char.hairColor} roughness={0.3} />
                </mesh>
                <mesh position={[0.21, -0.02, 0]}>
                  <boxGeometry args={[0.08, 0.3, 0.34]} />
                  <meshStandardMaterial color={char.hairColor} roughness={0.3} />
                </mesh>
              </>
            )}

            {/* Female Long Silk Waves */}
            {char.hairStyle === 'long-wave' && (
              <mesh position={[0, -0.18, -0.14]} castShadow>
                <boxGeometry args={[0.46, 0.56, 0.16]} />
                <meshStandardMaterial color={char.hairColor} roughness={0.35} />
              </mesh>
            )}

            {/* Female High Stage Ponytail */}
            {char.hairStyle === 'high-ponytail' && (
              <mesh position={[0, 0.12, -0.28]} rotation={[-0.55, 0, 0]} castShadow>
                <coneGeometry args={[0.13, 0.48, 14]} />
                <meshStandardMaterial color={char.hairColor} roughness={0.3} />
              </mesh>
            )}

            {/* Female Idol Twin Tails */}
            {char.hairStyle === 'twin-tails' && (
              <>
                <mesh position={[-0.26, -0.05, -0.1]} rotation={[0, 0, 0.25]} castShadow>
                  <coneGeometry args={[0.1, 0.46, 12]} />
                  <meshStandardMaterial color={char.hairColor} roughness={0.3} />
                </mesh>
                <mesh position={[0.26, -0.05, -0.1]} rotation={[0, 0, -0.25]} castShadow>
                  <coneGeometry args={[0.1, 0.46, 12]} />
                  <meshStandardMaterial color={char.hairColor} roughness={0.3} />
                </mesh>
              </>
            )}
          </group>

          {/* Accessories */}
          {char.accessory === 'visor' && (
            <mesh position={[0, 0.03, 0.22]}>
              <boxGeometry args={[0.38, 0.09, 0.1]} />
              <meshStandardMaterial
                color="#22D3EE"
                emissive="#22D3EE"
                emissiveIntensity={1.2}
                transparent
                opacity={0.88}
              />
            </mesh>
          )}

          {char.accessory === 'shades' && (
            <mesh position={[0, 0.03, 0.23]}>
              <boxGeometry args={[0.36, 0.08, 0.06]} />
              <meshStandardMaterial color="#090D16" metalness={0.95} roughness={0.1} />
            </mesh>
          )}

          {char.accessory === 'headphones' && (
            <group>
              <mesh position={[-0.27, 0.02, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.09, 0.09, 0.06, 16]} />
                <meshStandardMaterial
                  color="#EC4899"
                  emissive="#EC4899"
                  emissiveIntensity={0.65}
                />
              </mesh>
              <mesh position={[0.27, 0.02, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.09, 0.09, 0.06, 16]} />
                <meshStandardMaterial
                  color="#EC4899"
                  emissive="#EC4899"
                  emissiveIntensity={0.65}
                />
              </mesh>
              <mesh position={[0, 0.14, 0]}>
                <torusGeometry args={[0.27, 0.024, 12, 24, Math.PI]} />
                <meshStandardMaterial color="#18181B" metalness={0.8} />
              </mesh>
            </group>
          )}

          {char.accessory === 'street-cap' && (
            <group position={[0, 0.15, 0.04]}>
              <mesh>
                <sphereGeometry args={[0.268, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
                <meshStandardMaterial color="#0F172A" roughness={0.4} />
              </mesh>
              <mesh position={[0, -0.02, 0.22]} rotation={[0.15, 0, 0]}>
                <boxGeometry args={[0.34, 0.025, 0.22]} />
                <meshStandardMaterial color={char.outfitColor} roughness={0.4} />
              </mesh>
            </group>
          )}

          {char.accessory === 'crystal-tiara' && (
            <group position={[0, 0.25, 0.08]}>
              <mesh rotation={[-0.2, 0, 0]}>
                <torusGeometry args={[0.18, 0.018, 12, 24, Math.PI]} />
                <meshStandardMaterial
                  color="#FACC15"
                  emissive="#FACC15"
                  emissiveIntensity={0.9}
                  metalness={0.9}
                />
              </mesh>
            </group>
          )}
        </group>
      </group>

      {/* ==========================================
          5. FLOATING NAME TAG & ROLE BADGE
          ========================================== */}
      {showLabel && !isPreview && char.displayName && (
        <Html position={[0, 2.22, 0]} center distanceFactor={14} zIndexRange={[9, 3]}>
          <div className="px-2.5 py-0.5 rounded-full bg-[#070816]/85 border border-white/15 backdrop-blur-md text-[11px] font-semibold text-white whitespace-nowrap flex items-center gap-1.5 shadow-lg pointer-events-none select-none">
            <span
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor: isSecurityRole
                  ? '#EF4444'
                  : isArtistRole
                  ? '#FACC15'
                  : char.lightstick || '#22D3EE'
              }}
            />
            <span>{char.displayName}</span>
            {labelBadge && (
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/10 text-cyan-300 uppercase tracking-wider">
                {labelBadge}
              </span>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}


import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { NPC } from '../characters/NPC';

/**
 * MerchZone: MERCH LAB at [-22, 0, 22]
 */
export function MerchZone() {
  const holoRingRef = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (holoRingRef.current) {
      holoRingRef.current.rotation.y = t * 1.2;
      holoRingRef.current.position.y = 4.5 + Math.sin(t * 2.5) * 0.15;
    }
  });

  return (
    <group position={[-22, 0, 22]} rotation={[0, Math.PI / 3.2, 0]}>
      <mesh position={[0, 0.12, 0]} receiveShadow>
        <boxGeometry args={[7.5, 0.24, 5.2]} />
        <meshStandardMaterial color="#14122E" metalness={0.7} roughness={0.3} />
      </mesh>

      <mesh position={[0, 1.8, -2.1]} castShadow>
        <boxGeometry args={[7.2, 3.4, 0.4]} />
        <meshStandardMaterial color="#0A0C1E" metalness={0.8} roughness={0.25} />
      </mesh>
      <mesh position={[0, 3.55, -0.4]}>
        <boxGeometry args={[7.6, 0.3, 4.2]} />
        <meshStandardMaterial color="#1E1B4B" metalness={0.8} roughness={0.2} />
      </mesh>

      <mesh position={[0, 3.55, 1.72]}>
        <boxGeometry args={[7.6, 0.14, 0.08]} />
        <meshBasicMaterial color="#EC4899" />
      </mesh>

      <mesh position={[0, 0.65, 1.1]}>
        <boxGeometry args={[5.4, 1.0, 0.9]} />
        <meshStandardMaterial color="#1E1B4B" metalness={0.6} roughness={0.3} />
      </mesh>

      <group ref={holoRingRef} position={[0, 4.5, 0]}>
        <mesh>
          <torusGeometry args={[0.6, 0.08, 16, 32]} />
          <meshStandardMaterial
            color="#EC4899"
            emissive="#EC4899"
            emissiveIntensity={1.8}
          />
        </mesh>
      </group>

      <Html position={[0, 4.1, 1.5]} center distanceFactor={20} zIndexRange={[8, 3]}>
        <div className="px-3.5 py-1.5 rounded-xl bg-[#070816]/90 border border-[#EC4899]/60 text-center pointer-events-none shadow-lg">
          <div className="text-[10px] tracking-[0.2em] text-[#EC4899] font-heading font-bold">
            OFFICIAL GEAR
          </div>
          <div className="text-xs font-heading font-bold text-white whitespace-nowrap">
            MERCH LAB · [E]
          </div>
        </div>
      </Html>

      <NPC
        position={[0, 0.24, 0.1]}
        rotation={[0, 0, 0]}
        name="MINA"
        role="MERCH LAB"
        outfitColor="#EC4899"
        hairColor="#FACC15"
      />
    </group>
  );
}

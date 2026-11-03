import React from 'react';
import { Html } from '@react-three/drei';
import { NPC } from '../characters/NPC';

/**
 * Entrance: ENTRY portal at [0, 0, 42]
 */
export function Entrance() {
  return (
    <group position={[0, 0, 42]}>
      <mesh position={[-5.2, 3.2, 0]} castShadow>
        <boxGeometry args={[0.9, 6.4, 0.9]} />
        <meshStandardMaterial color="#0F172A" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[5.2, 3.2, 0]} castShadow>
        <boxGeometry args={[0.9, 6.4, 0.9]} />
        <meshStandardMaterial color="#0F172A" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 6.2, 0]}>
        <boxGeometry args={[12.2, 1.1, 1.2]} />
        <meshStandardMaterial color="#0F172A" metalness={0.85} roughness={0.2} />
      </mesh>

      <mesh position={[0, 5.6, -0.62]}>
        <boxGeometry args={[11.2, 0.14, 0.08]} />
        <meshBasicMaterial color="#22D3EE" />
      </mesh>

      {[-2.4, 0, 2.4].map((xPos) => (
        <group key={xPos} position={[xPos, 0.55, 0]}>
          <mesh>
            <boxGeometry args={[0.35, 1.1, 0.9]} />
            <meshStandardMaterial color="#1E293B" metalness={0.7} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.56, 0]}>
            <boxGeometry args={[0.25, 0.04, 0.7]} />
            <meshBasicMaterial color="#22D3EE" />
          </mesh>
        </group>
      ))}

      <Html position={[0, 6.3, -0.7]} center distanceFactor={22} zIndexRange={[5, 0]}>
        <div className="px-4 py-1.5 rounded-xl bg-[#070816]/90 border border-[#22D3EE]/50 text-center pointer-events-none shadow-lg">
          <div className="text-[10px] tracking-[0.25em] text-[#22D3EE] font-heading font-bold">
            ENTRY // VERIFIED
          </div>
          <div className="text-sm font-heading font-bold text-white tracking-wider">
            PULSE//LIVE 2026 · CITY OF SOUND
          </div>
        </div>
      </Html>

      <NPC
        position={[3.9, 0, -1.2]}
        rotation={[0, -0.4, 0]}
        name="ENTRY HOST"
        role="CHECK-IN"
        outfitColor="#06B6D4"
        hairColor="#22D3EE"
      />
    </group>
  );
}

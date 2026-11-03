import React from 'react';
import { Html } from '@react-three/drei';
import { NPC } from '../characters/NPC';

/**
 * PhotoZone: MEMORY BOOTH at [22, 0, 22]
 */
export function PhotoZone() {
  return (
    <group position={[22, 0, 22]} rotation={[0, -Math.PI / 3.2, 0]}>
      <mesh position={[0, 0.12, 0]} receiveShadow>
        <boxGeometry args={[7.2, 0.24, 5.0]} />
        <meshStandardMaterial color="#111633" metalness={0.75} roughness={0.25} />
      </mesh>

      <mesh position={[0, 1.9, -1.8]}>
        <boxGeometry args={[6.4, 3.5, 0.3]} />
        <meshStandardMaterial color="#090D24" metalness={0.8} roughness={0.2} />
      </mesh>

      <mesh position={[0, 3.65, -1.62]}>
        <boxGeometry args={[6.5, 0.12, 0.1]} />
        <meshBasicMaterial color="#FACC15" />
      </mesh>
      <mesh position={[-3.2, 1.9, -1.62]}>
        <boxGeometry args={[0.12, 3.5, 0.1]} />
        <meshBasicMaterial color="#22D3EE" />
      </mesh>
      <mesh position={[3.2, 1.9, -1.62]}>
        <boxGeometry args={[0.12, 3.5, 0.1]} />
        <meshBasicMaterial color="#EC4899" />
      </mesh>

      {/* Architectural Pulse Ring Emblem on Photo Wall */}
      <mesh position={[0, 2.0, -1.55]}>
        <torusGeometry args={[1.05, 0.06, 16, 48]} />
        <meshBasicMaterial color="#22D3EE" />
      </mesh>

      <Html position={[0, 4.1, 0]} center distanceFactor={20} zIndexRange={[8, 3]}>
        <div className="px-3.5 py-1.5 rounded-xl bg-[#070816]/90 border border-[#FACC15]/60 text-center pointer-events-none shadow-lg">
          <div className="text-[10px] tracking-[0.2em] text-[#FACC15] font-heading font-bold">
            FRAME THE BEAT
          </div>
          <div className="text-xs font-heading font-bold text-white whitespace-nowrap">
            MEMORY BOOTH · [E] OR [P]
          </div>
        </div>
      </Html>

      <NPC
        position={[2.4, 0.24, 1.2]}
        rotation={[0, -0.4, 0]}
        name="JUN"
        role="PHOTO DIRECTOR"
        outfitColor="#FACC15"
        hairColor="#18181B"
      />
    </group>
  );
}

import React from 'react';
import { Html } from '@react-three/drei';
import { NPC } from '../characters/NPC';

/**
 * FoodZone: FOOD STREET at [-24, 0, 6]
 */
export function FoodZone() {
  return (
    <group position={[-24, 0, 6]} rotation={[0, Math.PI / 2, 0]}>
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[6.2, 0.2, 4.2]} />
        <meshStandardMaterial color="#0F172A" metalness={0.7} roughness={0.3} />
      </mesh>

      <mesh position={[0, 0.65, 0.9]}>
        <boxGeometry args={[4.8, 1.0, 0.8]} />
        <meshStandardMaterial color="#16213E" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 1.16, 0.9]}>
        <boxGeometry args={[4.9, 0.06, 0.85]} />
        <meshBasicMaterial color="#22D3EE" />
      </mesh>

      <mesh position={[0, 1.8, -1.6]}>
        <boxGeometry args={[5.8, 3.2, 0.35]} />
        <meshStandardMaterial color="#090D1E" />
      </mesh>

      <Html position={[0, 3.7, 0]} center distanceFactor={20} zIndexRange={[5, 0]}>
        <div className="px-3.5 py-1 rounded-xl bg-[#070816]/90 border border-[#22D3EE]/60 text-center pointer-events-none">
          <div className="text-[10px] tracking-[0.2em] text-[#22D3EE] font-heading font-bold">
            ACOUSTIC LOUNGE
          </div>
          <div className="text-xs font-heading font-bold text-white whitespace-nowrap">
            FOOD STREET · [E]
          </div>
        </div>
      </Html>

      <NPC
        position={[0, 0.2, 0]}
        rotation={[0, 0, 0]}
        name="RIO"
        role="FOOD STREET"
        outfitColor="#06B6D4"
        hairColor="#8B5CF6"
      />
    </group>
  );
}

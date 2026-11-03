import React from 'react';
import { Html } from '@react-three/drei';

/**
 * FanZone: MAIN ARENA & GA STANDING floor rings in front of the stage
 */
export function FanZone() {
  return (
    <group position={[0, 0, -2]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, 0]}>
        <ringGeometry args={[8.5, 8.75, 48]} />
        <meshBasicMaterial color="#22D3EE" transparent opacity={0.55} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[13.0, 13.25, 48]} />
        <meshBasicMaterial color="#8B5CF6" transparent opacity={0.4} />
      </mesh>

      {[-12.0, 12.0].map((xPos) => (
        <group key={xPos} position={[xPos, 0, 2]}>
          <mesh position={[0, 1.8, 0]}>
            <cylinderGeometry args={[0.22, 0.28, 3.6, 12]} />
            <meshStandardMaterial color="#0F172A" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[0, 3.7, 0]}>
            <torusGeometry args={[0.3, 0.05, 12, 24]} />
            <meshBasicMaterial color="#22D3EE" />
          </mesh>
        </group>
      ))}

      <Html position={[-9, 0.4, -2]} center distanceFactor={18} zIndexRange={[5, 0]}>
        <div className="px-3 py-1 rounded-full bg-[#070816]/80 border border-[#8B5CF6]/50 text-[10px] font-heading font-bold tracking-widest text-[#C4B5FD] whitespace-nowrap pointer-events-none">
          MAIN ARENA // GA STANDING
        </div>
      </Html>
    </group>
  );
}

import React from 'react';
import { Html } from '@react-three/drei';
import { NPC } from '../characters/NPC';

/**
 * ConcertPlaza: Includes PULSE PLAZA (0, 0, 25), B-STAGE (0, 0, 6),
 * VIP (-19, 0, -10), SEATED (19, 0, -10), and FAN HUB (24, 0, 6).
 */
export function ConcertPlaza() {
  return (
    <group>
      {/* Main Architectural Arena Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 10]} receiveShadow>
        <planeGeometry args={[96, 96]} />
        <meshStandardMaterial color="#070816" roughness={0.62} metalness={0.38} />
      </mesh>

      {/* Architectural Acoustic Grid */}
      <gridHelper args={[84, 42, '#22D3EE', '#13172E']} position={[0, 0.01, 10]} />

      {/* Walkway from ENTRY (z=42) to B-STAGE (z=6) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 24]}>
        <planeGeometry args={[5.5, 34]} />
        <meshStandardMaterial color="#0D122A" roughness={0.4} metalness={0.5} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-2.8, 0.02, 24]}>
        <planeGeometry args={[0.12, 34]} />
        <meshBasicMaterial color="#22D3EE" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[2.8, 0.02, 24]}>
        <planeGeometry args={[0.12, 34]} />
        <meshBasicMaterial color="#22D3EE" />
      </mesh>

      {/* ==========================================
          PULSE PLAZA SOUND MONUMENT AT [0, 0, 25]
          ========================================== */}
      <group position={[0, 0, 25]}>
        <mesh position={[0, 0.25, 0]}>
          <cylinderGeometry args={[2.3, 2.6, 0.5, 24]} />
          <meshStandardMaterial color="#111536" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.52, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2.0, 2.25, 32]} />
          <meshBasicMaterial color="#22D3EE" />
        </mesh>
        <mesh position={[0, 2.2, 0]}>
          <torusGeometry args={[0.95, 0.08, 16, 48]} />
          <meshStandardMaterial
            color="#22D3EE"
            emissive="#22D3EE"
            emissiveIntensity={1.6}
          />
        </mesh>
        <Html position={[0, 3.6, 0]} center distanceFactor={20} zIndexRange={[5, 0]}>
          <div className="px-3 py-1 rounded-full bg-[#070816]/85 border border-[#22D3EE]/50 text-[10px] font-heading font-bold tracking-widest text-white whitespace-nowrap pointer-events-none">
            PULSE PLAZA · [E] SETLIST
          </div>
        </Html>
      </group>

      {/* ==========================================
          B-STAGE 360° SOUND RING AT [0, 0, 6]
          ========================================== */}
      <group position={[0, 0, 6]}>
        <mesh position={[0, 0.22, 0]}>
          <cylinderGeometry args={[2.1, 2.3, 0.44, 32]} />
          <meshStandardMaterial color="#0F172A" metalness={0.85} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.46, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.85, 2.08, 32]} />
          <meshBasicMaterial color="#EC4899" />
        </mesh>
        <Html position={[0, 1.8, 0]} center distanceFactor={18} zIndexRange={[5, 0]}>
          <div className="px-2.5 py-0.5 rounded-full bg-[#070816]/85 border border-[#EC4899]/50 text-[9px] font-heading font-bold tracking-widest text-[#EC4899] whitespace-nowrap pointer-events-none">
            B-STAGE // 360° RING
          </div>
        </Html>
      </group>

      {/* ==========================================
          VIP TERRACE AT [-19, 0, -10]
          ========================================== */}
      <group position={[-19, 0, -10]}>
        <mesh position={[0, 0.32, 0]} receiveShadow>
          <boxGeometry args={[8.5, 0.65, 9.5]} />
          <meshStandardMaterial color="#171332" metalness={0.7} roughness={0.25} />
        </mesh>
        <mesh position={[4.2, 0.9, 0]}>
          <boxGeometry args={[0.12, 0.6, 9.5]} />
          <meshStandardMaterial
            color="#FACC15"
            emissive="#FACC15"
            emissiveIntensity={1.1}
          />
        </mesh>
        <Html position={[0, 2.8, 0]} center distanceFactor={22} zIndexRange={[5, 0]}>
          <div className="px-3 py-1 rounded-lg bg-[#070816]/90 border border-[#FACC15]/60 text-[11px] font-heading font-bold text-[#FACC15] tracking-wider whitespace-nowrap pointer-events-none">
            ★ VIP TERRACE
          </div>
        </Html>
      </group>

      {/* ==========================================
          SEATED GRANDSTAND AT [19, 0, -10]
          ========================================== */}
      <group position={[19, 0, -10]}>
        <mesh position={[0, 0.32, 0]} receiveShadow>
          <boxGeometry args={[8.5, 0.65, 9.5]} />
          <meshStandardMaterial color="#0E172E" metalness={0.7} roughness={0.25} />
        </mesh>
        <mesh position={[-4.2, 0.9, 0]}>
          <boxGeometry args={[0.12, 0.6, 9.5]} />
          <meshStandardMaterial
            color="#22D3EE"
            emissive="#22D3EE"
            emissiveIntensity={1.1}
          />
        </mesh>
        <Html position={[0, 2.8, 0]} center distanceFactor={22} zIndexRange={[5, 0]}>
          <div className="px-3 py-1 rounded-lg bg-[#070816]/90 border border-[#22D3EE]/60 text-[11px] font-heading font-bold text-[#22D3EE] tracking-wider whitespace-nowrap pointer-events-none">
            SEATED GRANDSTAND
          </div>
        </Html>
      </group>

      {/* ==========================================
          FAN HUB AT [24, 0, 6]
          ========================================== */}
      <group position={[24, 0, 6]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh position={[0, 1.5, 0]}>
          <boxGeometry args={[5.2, 3.0, 3.2]} />
          <meshStandardMaterial color="#0F172A" metalness={0.6} roughness={0.4} />
        </mesh>
        <mesh position={[0, 3.1, 1.62]}>
          <boxGeometry args={[5.2, 0.14, 0.08]} />
          <meshBasicMaterial color="#A855F7" />
        </mesh>
        <Html position={[0, 3.7, 0]} center distanceFactor={20} zIndexRange={[5, 0]}>
          <div className="px-3 py-1 rounded-lg bg-[#070816]/85 border border-[#A855F7]/50 text-[10px] font-heading font-bold text-zinc-200 tracking-wider whitespace-nowrap pointer-events-none">
            FAN HUB · [E] LAUNCH WAVE
          </div>
        </Html>
        <NPC
          position={[0, 0, 2.4]}
          rotation={[0, 0, 0]}
          name="WAVE LEADER"
          role="FAN HUB"
          outfitColor="#3B0764"
          hairColor="#A855F7"
        />
      </group>
    </group>
  );
}

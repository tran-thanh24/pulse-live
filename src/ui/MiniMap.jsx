import React from 'react';
import { useConcertStore } from '../store/concertStore';
import { audioManager } from '../core/AudioManager';

const MAP_MARKERS = [
  { id: 'stage', label: 'STAGE', x: 0, z: -22, color: '#EC4899' },
  { id: 'bstage', label: 'B-STAGE', x: 0, z: 6, color: '#22D3EE' },
  { id: 'merch', label: 'MERCH', x: -22, z: 22, color: '#F472B6' },
  { id: 'photo', label: 'MEMORY', x: 22, z: 22, color: '#FACC15' },
  { id: 'food', label: 'FOOD', x: -24, z: 6, color: '#22D3EE' },
  { id: 'fanhub', label: 'FAN HUB', x: 24, z: 6, color: '#A855F7' },
  { id: 'entry', label: 'ENTRY', x: 0, z: 42, color: '#38BDF8' }
];

/**
 * Circular MiniMap (Bottom-Left HUD) for PULSE//LIVE 2026
 */
export function MiniMap() {
  const playerPosition = useConcertStore((s) => s.playerPosition);
  const playerRotation = useConcertStore((s) => s.playerRotation);
  const setPlayerTransform = useConcertStore((s) => s.setPlayerTransform);

  const worldToMap = (wx, wz) => {
    const normX = (wx + 38) / 76;
    const normZ = (wz + 30) / 78;
    return {
      left: `${Math.max(10, Math.min(90, normX * 100))}%`,
      top: `${Math.max(10, Math.min(90, normZ * 100))}%`
    };
  };

  const playerCoords = worldToMap(playerPosition[0], playerPosition[2]);

  const handleQuickTeleport = (marker) => {
    audioManager.playUISound('click');
    if (marker.id === 'stage') {
      // Place player at front barrier beside the central runway (outside RUNWAY_COLLIDER)
      setPlayerTransform([4.8, 0, -10.8], 0, false, false, false);
    } else if (marker.id === 'bstage') {
      setPlayerTransform([0, 0, 10.2], 0, false, false, false);
    } else {
      setPlayerTransform([marker.x * 0.72, 0, marker.z - 2], 0, false, false, false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-1 select-none">
      <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full glass-panel border border-white/20 overflow-hidden shadow-[0_12px_34px_rgba(0,0,0,0.65)]">
        <div className="absolute inset-3 rounded-full border border-white/10 pointer-events-none" />
        <div className="absolute inset-8 rounded-full border border-[#22D3EE]/20 pointer-events-none" />
        <div className="absolute inset-x-0 top-1/2 h-[1px] bg-white/10 pointer-events-none" />
        <div className="absolute inset-y-0 left-1/2 w-[1px] bg-white/10 pointer-events-none" />

        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-5 rounded-b-full opacity-55 pointer-events-none"
          style={{
            background: 'radial-gradient(circle, #22D3EE 0%, transparent 75%)'
          }}
        />

        {MAP_MARKERS.map((m) => {
          const pos = worldToMap(m.x, m.z);
          return (
            <button
              key={m.id}
              onClick={() => handleQuickTeleport(m)}
              style={{ left: pos.left, top: pos.top }}
              title={`Warp to ${m.label}`}
              className="absolute -translate-x-1/2 -translate-y-1/2 group flex flex-col items-center cursor-pointer"
            >
              <span
                className="w-2 h-2 rounded-full border border-white/60 transition-transform group-hover:scale-125"
                style={{
                  backgroundColor: m.color,
                  boxShadow: `0 0 8px ${m.color}`
                }}
              />
              <span className="text-[7px] font-heading font-bold tracking-wider text-white/80 group-hover:text-white mt-0.5 drop-shadow">
                {m.label}
              </span>
            </button>
          );
        })}

        <div
          style={{ left: playerCoords.left, top: playerCoords.top }}
          className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10"
        >
          <div className="relative flex items-center justify-center">
            <span className="w-3.5 h-3.5 rounded-full bg-white/30 animate-ping absolute" />
            <span
              className="w-2.5 h-2.5 rounded-full bg-white border-2 border-[#22D3EE] shadow-[0_0_10px_#FFFFFF] block"
              style={{ transform: `rotate(${-playerRotation}rad)` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import {
  X,
  Music,
  ShoppingBag,
  Heart,
  Box,
  Sparkles,
  Play,
  Sliders
} from 'lucide-react';
import { CONCERT_CONFIG } from '../data/concert';
import { useConcertStore } from '../store/concertStore';
import { useUserStore } from '../store/userStore';
import { musicEngine } from '../core/MusicEngine';
import { showDirector } from '../systems/ShowDirector';
import { audioManager } from '../core/AudioManager';

function MerchItem3DModel({ item }) {
  const { shape, color, secondaryColor } = item;

  return (
    <group>
      {shape === 'lightstick' && (
        <group position={[0, -0.2, 0]}>
          <mesh position={[0, -0.35, 0]}>
            <cylinderGeometry args={[0.09, 0.12, 0.9, 20]} />
            <meshStandardMaterial color="#18181B" metalness={0.85} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.35, 0]}>
            <torusGeometry args={[0.38, 0.06, 16, 36]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={1.8}
              roughness={0.15}
            />
          </mesh>
          <mesh position={[0, 0.35, 0]}>
            <octahedronGeometry args={[0.22, 1]} />
            <meshStandardMaterial
              color={secondaryColor}
              emissive={secondaryColor}
              emissiveIntensity={1.4}
            />
          </mesh>
        </group>
      )}

      {(shape === 'tshirt' || shape === 'hoodie') && (
        <group>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[1.05, 1.25, 0.36]} />
            <meshStandardMaterial color={color} roughness={0.5} />
          </mesh>
          <mesh position={[-0.68, 0.25, 0]} rotation={[0, 0, 0.45]}>
            <boxGeometry args={[0.45, 0.55, 0.32]} />
            <meshStandardMaterial color={color} roughness={0.5} />
          </mesh>
          <mesh position={[0.68, 0.25, 0]} rotation={[0, 0, -0.45]}>
            <boxGeometry args={[0.45, 0.55, 0.32]} />
            <meshStandardMaterial color={color} roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.12, 0.19]}>
            <planeGeometry args={[0.58, 0.58]} />
            <meshStandardMaterial
              color={secondaryColor}
              emissive={secondaryColor}
              emissiveIntensity={1.1}
            />
          </mesh>
        </group>
      )}

      {shape === 'cap' && (
        <group position={[0, -0.1, 0]}>
          <mesh position={[0, 0.1, 0]}>
            <sphereGeometry args={[0.55, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color={color} roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.12, 0.48]} rotation={[0.15, 0, 0]}>
            <boxGeometry args={[0.78, 0.06, 0.55]} />
            <meshStandardMaterial color={secondaryColor} roughness={0.3} />
          </mesh>
        </group>
      )}

      {shape === 'photocard' && (
        <group>
          {[-0.25, 0, 0.25].map((xOff, i) => (
            <mesh
              key={i}
              position={[xOff, i * 0.06 - 0.05, i * 0.08]}
              rotation={[0, (i - 1) * 0.22, (i - 1) * -0.1]}
            >
              <boxGeometry args={[0.72, 1.08, 0.03]} />
              <meshStandardMaterial
                color={i === 1 ? color : secondaryColor}
                emissive={i === 1 ? color : secondaryColor}
                emissiveIntensity={0.45}
                metalness={0.8}
                roughness={0.15}
              />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
}

/**
 * ConcertSchedule: Renders MERCH LAB modal or PULSE//LIVE Setlist modal
 */
export function ConcertSchedule() {
  const activeModal = useConcertStore((s) => s.activeModal);
  const setActiveModal = useConcertStore((s) => s.setActiveModal);
  const currentTrack = useConcertStore((s) => s.currentTrack);
  const setStudioMode = useConcertStore((s) => s.setStudioMode);

  const favoriteMerch = useUserStore((s) => s.favoriteMerch);
  const toggleFavoriteMerch = useUserStore((s) => s.toggleFavoriteMerch);
  const showInfoToast = useUserStore((s) => s.showInfoToast);

  const [selectedMerch3D, setSelectedMerch3D] = useState(CONCERT_CONFIG.merch[0]);

  if (!['schedule', 'merch'].includes(activeModal)) return null;

  // 1. MERCH LAB MODAL
  if (activeModal === 'merch') {
    return (
      <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 select-none">
        <div className="glass-panel max-w-4xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto relative border border-white/20">
          <button
            onClick={() => {
              audioManager.playUISound('click');
              setActiveModal(null);
            }}
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 text-xs font-heading font-bold tracking-[0.25em] text-[#EC4899] uppercase">
            <ShoppingBag className="w-4 h-4" />
            <span>PULSE//LIVE 2026 · MERCH LAB</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-white mt-1">
            CITY OF SOUND OFFICIAL GEAR
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
            <div className="lg:col-span-5 rounded-2xl bg-gradient-to-b from-[#111738] to-[#08091A] border border-white/15 p-4 flex flex-col justify-between h-[320px] lg:h-auto">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-md bg-[#22D3EE]/20 border border-[#22D3EE]/40 text-[10px] font-heading font-bold text-[#22D3EE] tracking-wider">
                  {selectedMerch3D.badge}
                </span>
                <span className="text-xs font-heading text-zinc-400">3D LAB PREVIEW</span>
              </div>

              <div className="flex-1 w-full min-h-[190px]">
                <Canvas camera={{ position: [0, 0.3, 2.5], fov: 45 }}>
                  <ambientLight intensity={0.9} />
                  <directionalLight position={[3, 4, 3]} intensity={1.5} />
                  <pointLight position={[-2, 2, -2]} intensity={1.2} color="#22D3EE" />
                  <Suspense fallback={null}>
                    <MerchItem3DModel item={selectedMerch3D} />
                    <OrbitControls autoRotate autoRotateSpeed={3.2} enableZoom={false} />
                  </Suspense>
                </Canvas>
              </div>

              <div>
                <div className="text-sm font-heading font-bold text-white">
                  {selectedMerch3D.name}
                </div>
                <p className="text-xs text-zinc-400 mt-1">{selectedMerch3D.description}</p>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-3">
              {CONCERT_CONFIG.merch.map((item) => {
                const isFav = favoriteMerch.includes(item.id);
                const isViewing = selectedMerch3D.id === item.id;

                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isViewing
                        ? 'bg-white/10 border-[#22D3EE]'
                        : 'bg-white/[0.04] border-white/10 hover:bg-white/[0.07]'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border border-white/20"
                        style={{ backgroundColor: item.color }}
                      >
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-heading font-bold tracking-widest text-[#22D3EE]">
                            {item.category}
                          </span>
                          <span className="text-xs font-heading font-bold text-[#FACC15]">
                            {item.price}
                          </span>
                        </div>
                        <div className="text-sm font-heading font-bold text-white">
                          {item.name}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          audioManager.playUISound('click');
                          setSelectedMerch3D(item);
                        }}
                        className={`px-3.5 py-2 rounded-xl text-xs font-heading font-bold tracking-wider flex items-center gap-1.5 transition cursor-pointer ${
                          isViewing
                            ? 'bg-[#22D3EE] text-[#070816]'
                            : 'bg-white/10 hover:bg-white/20 text-white'
                        }`}
                      >
                        <Box className="w-3.5 h-3.5" />
                        <span>VIEW 3D</span>
                      </button>

                      <button
                        onClick={() => {
                          audioManager.playUISound('click');
                          toggleFavoriteMerch(item.id);
                          showInfoToast(
                            isFav ? 'REMOVED FROM SAVED' : 'SAVED TO COLLECTION ❤️',
                            item.name,
                            '#EC4899'
                          );
                        }}
                        className={`px-3.5 py-2 rounded-xl text-xs font-heading font-bold tracking-wider flex items-center gap-1.5 border transition cursor-pointer ${
                          isFav
                            ? 'bg-[#EC4899]/25 border-[#EC4899] text-[#F472B6]'
                            : 'bg-white/5 border-white/15 hover:bg-white/15 text-white'
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-[#EC4899]' : ''}`} />
                        <span>{isFav ? 'SAVED' : 'SAVE'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. CONCERT SETLIST & TRACK SELECTOR MODAL
  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="glass-panel max-w-2xl w-full p-6 sm:p-8 relative border border-white/20">
        <button
          onClick={() => setActiveModal(null)}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 text-xs font-heading font-bold tracking-[0.25em] text-[#22D3EE] uppercase">
          <Music className="w-4 h-4" />
          <span>PULSE//LIVE 2026 · OFFICIAL SETLIST</span>
        </div>
        <h2 className="text-2xl font-heading font-bold text-white mt-1">
          CITY OF SOUND PERFORMANCES
        </h2>

        <div className="mt-5 space-y-2.5">
          {musicEngine.tracks.map((track) => {
            const isActive = currentTrack?.id === track.id;
            return (
              <button
                key={track.id}
                onClick={() => {
                  audioManager.playUISound('click');
                  showDirector.changeTrack(track.id, useConcertStore, true);
                  setActiveModal(null);
                }}
                className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between gap-4 transition cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-[#22D3EE]/25 to-[#8B5CF6]/25 border-[#22D3EE]'
                    : 'bg-white/[0.04] border-white/10 hover:bg-white/[0.09]'
                }`}
              >
                <div>
                  <div className="text-xs font-heading text-[#22D3EE] font-bold">
                    {track.artist} · {track.bpm} BPM
                  </div>
                  <div className="text-base font-heading font-bold text-white mt-0.5">
                    {track.title}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded bg-white/10 text-[10px] font-heading text-zinc-200">
                    {track.ledVisual}
                  </span>
                  <Play className="w-4 h-4 text-[#22D3EE]" />
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
          <span className="text-xs text-zinc-400">
            Want to import your own MP3/WAV/OGG or edit timeline cues?
          </span>
          <button
            onClick={() => {
              setActiveModal(null);
              setStudioMode(true);
            }}
            className="px-4 py-2 rounded-xl bg-[#22D3EE] text-[#070816] font-heading font-bold text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>OPEN STUDIO MODE</span>
          </button>
        </div>
      </div>
    </div>
  );
}

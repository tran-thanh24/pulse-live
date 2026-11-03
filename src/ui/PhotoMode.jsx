import React, { useState } from 'react';
import { Camera, Sparkles, X, Check, Download, Eye, EyeOff, ZoomIn } from 'lucide-react';
import { useConcertStore } from '../store/concertStore';
import { useUserStore } from '../store/userStore';
import { achievementSystem } from '../systems/AchievementSystem';
import { audioManager } from '../core/AudioManager';

const POSES = [
  { id: 'pose1', label: 'Pose 1' },
  { id: 'pose2', label: 'Pose 2' },
  { id: 'pose3', label: 'Pose 3' }
];

const ANGLE_PRESETS = [
  { id: 'portrait', label: 'Portrait' },
  { id: 'wide-stage', label: 'Wide Stage' },
  { id: 'low-hero', label: 'Low Hero' },
  { id: 'runway', label: 'Runway' }
];

const FILTERS = [
  { id: 'Normal', label: 'Normal', overlayClass: '' },
  {
    id: 'Concert',
    label: 'City of Sound',
    overlayClass: 'bg-gradient-to-tr from-[#22D3EE]/20 via-transparent to-[#EC4899]/20 mix-blend-screen'
  },
  {
    id: 'Purple Glow',
    label: 'Pulse Glow',
    overlayClass: 'bg-gradient-to-b from-[#8B5CF6]/25 via-transparent to-[#22D3EE]/25'
  }
];

/**
 * PhotoMode: Studio-grade Concert Photo Booth for PULSE//LIVE 2026
 * Supports camera orbit, zoom slider, preset angle, avatar pose, depth of field, UI hidden toggle,
 * PULSE//LIVE 2026 frame, and local Save Image.
 */
export function PhotoMode() {
  const activeModal = useConcertStore((s) => s.activeModal);
  const setActiveModal = useConcertStore((s) => s.setActiveModal);
  const playerPose = useConcertStore((s) => s.playerPose);
  const setPlayerPose = useConcertStore((s) => s.setPlayerPose);
  const lightstickMode = useConcertStore((s) => s.lightstickMode);
  const setLightstickMode = useConcertStore((s) => s.setLightstickMode);
  const photoSettings = useConcertStore((s) => s.photoSettings);
  const updatePhotoSettings = useConcertStore((s) => s.updatePhotoSettings);

  const addPhoto = useUserStore((s) => s.addPhoto);
  const displayName = useUserStore((s) => s.displayName);
  const ticket = useUserStore((s) => s.ticket);

  const [selectedFilter, setSelectedFilter] = useState('Normal');
  const [flashEffect, setFlashEffect] = useState(false);
  const [lastCapturedPhoto, setLastCapturedPhoto] = useState(null);
  const [hideControls, setHideControls] = useState(false);

  if (activeModal !== 'photo') return null;

  const currentFilterObj = FILTERS.find((f) => f.id === selectedFilter) || FILTERS[0];
  const isLightstickOn = lightstickMode !== 'OFF';

  const handleTakePhoto = () => {
    audioManager.playCameraShutter();
    setFlashEffect(true);
    setTimeout(() => setFlashEffect(false), 240);

    try {
      const glCanvas = document.querySelector('#nova-canvas-container canvas');
      if (!glCanvas) return;

      const outCanvas = document.createElement('canvas');
      outCanvas.width = 1280;
      outCanvas.height = 720;
      const ctx = outCanvas.getContext('2d');

      ctx.drawImage(glCanvas, 0, 0, outCanvas.width, outCanvas.height);

      // Optional Depth of Field radial vignette effect
      if (photoSettings.dofEnabled) {
        const radGrad = ctx.createRadialGradient(
          outCanvas.width / 2,
          outCanvas.height / 2,
          outCanvas.height * 0.28,
          outCanvas.width / 2,
          outCanvas.height / 2,
          outCanvas.width * 0.65
        );
        radGrad.addColorStop(0, 'rgba(7, 8, 22, 0)');
        radGrad.addColorStop(1, 'rgba(7, 8, 22, 0.55)');
        ctx.fillStyle = radGrad;
        ctx.fillRect(0, 0, outCanvas.width, outCanvas.height);
      }

      if (selectedFilter === 'Concert') {
        const grad = ctx.createLinearGradient(0, 0, outCanvas.width, outCanvas.height);
        grad.addColorStop(0, 'rgba(34, 211, 238, 0.18)');
        grad.addColorStop(1, 'rgba(236, 72, 153, 0.18)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, outCanvas.width, outCanvas.height);
      } else if (selectedFilter === 'Purple Glow') {
        ctx.fillStyle = 'rgba(139, 92, 246, 0.22)';
        ctx.fillRect(0, 0, outCanvas.width, outCanvas.height);
      }

      // PULSE//LIVE 2026 Architectural Frame & Footer
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.45)';
      ctx.lineWidth = 3;
      ctx.strokeRect(20, 20, outCanvas.width - 40, outCanvas.height - 40);

      const barGrad = ctx.createLinearGradient(0, outCanvas.height - 110, 0, outCanvas.height);
      barGrad.addColorStop(0, 'rgba(7, 8, 22, 0)');
      barGrad.addColorStop(1, 'rgba(7, 8, 22, 0.92)');
      ctx.fillStyle = barGrad;
      ctx.fillRect(0, outCanvas.height - 110, outCanvas.width, 110);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 28px "Space Grotesk", sans-serif';
      ctx.fillText('PULSE//LIVE 2026', 40, outCanvas.height - 52);

      ctx.fillStyle = '#22D3EE';
      ctx.font = '600 16px "Inter", sans-serif';
      ctx.fillText(
        `FEEL THE SOUND. BECOME THE SHOW.  ·  ${displayName}  ·  ${ticket?.zone || 'GA STANDING'}  ·  03.11.2026`,
        40,
        outCanvas.height - 26
      );

      const dataUrl = outCanvas.toDataURL('image/png');
      const saved = addPhoto(dataUrl, {
        pose: playerPose,
        filter: selectedFilter
      });
      setLastCapturedPhoto(saved);
      achievementSystem.unlock('MEMORY_MAKER');
    } catch (err) {
      console.warn('[PULSE PhotoMode] Failed to capture canvas screenshot:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-40 pointer-events-none flex flex-col justify-between p-5 select-none">
      {/* Live Filter & Depth of Field Preview Overlay */}
      {currentFilterObj.overlayClass && (
        <div className={`fixed inset-0 pointer-events-none ${currentFilterObj.overlayClass}`} />
      )}
      {photoSettings.dofEnabled && (
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at 50% 50%, transparent 45%, rgba(7, 8, 22, 0.55) 100%)'
          }}
        />
      )}

      {flashEffect && <div className="fixed inset-0 bg-white z-50 pointer-events-none" />}

      {/* Top Viewfinder Header */}
      <div className="relative z-10 flex items-center justify-between pointer-events-auto max-w-5xl mx-auto w-full">
        {!hideControls ? (
          <div className="glass-pill px-4 py-2 flex items-center gap-2.5 border border-[#22D3EE]/50">
            <Camera className="w-4 h-4 text-[#22D3EE]" />
            <span className="text-xs font-heading font-bold tracking-[0.2em] text-white">
              PULSE//LIVE 2026 · MEMORY BOOTH
            </span>
          </div>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={() => setHideControls(!hideControls)}
            className="glass-pill px-3.5 py-2 flex items-center gap-1.5 text-xs font-heading font-bold text-zinc-200 hover:text-white cursor-pointer"
          >
            {hideControls ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>{hideControls ? 'SHOW UI' : 'HIDE UI'}</span>
          </button>

          <button
            onClick={() => {
              audioManager.playUISound('click');
              setActiveModal(null);
            }}
            className="glass-pill px-4 py-2 flex items-center gap-2 text-xs font-heading font-bold text-white hover:bg-white/15 cursor-pointer"
          >
            <X className="w-4 h-4" />
            <span>EXIT [P]</span>
          </button>
        </div>
      </div>

      {/* Captured Photo Card Preview */}
      {!hideControls && (
        <div className="relative z-10 flex-1 flex items-center justify-end pointer-events-none px-4">
          {lastCapturedPhoto && (
            <div className="pointer-events-auto glass-panel p-3 w-68 border border-[#22D3EE]/50 shadow-2xl animate-float-slow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-heading font-bold text-[#22D3EE] tracking-wider flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> SAVED TO LOCAL DEVICE
                </span>
                <a
                  href={lastCapturedPhoto.url}
                  download={`PULSE-LIVE-2026-${lastCapturedPhoto.id}.png`}
                  className="px-2.5 py-1 rounded bg-[#22D3EE] text-[#070816] text-[10px] font-heading font-bold flex items-center gap-1"
                >
                  <Download className="w-3 h-3" /> SAVE IMAGE
                </a>
              </div>
              <img
                src={lastCapturedPhoto.url}
                alt="Captured PULSE//LIVE 2026 Memory"
                className="w-full h-36 object-cover rounded-lg border border-white/15"
              />
            </div>
          )}
        </div>
      )}

      {/* Bottom Studio Camera Controls */}
      {!hideControls && (
        <div className="relative z-10 pointer-events-auto max-w-4xl mx-auto w-full glass-panel p-4 sm:p-5 border border-white/20 flex flex-wrap items-center justify-between gap-4">
          {/* Angle Preset */}
          <div>
            <div className="text-[10px] font-heading font-bold tracking-[0.18em] text-[#A1A1AA] uppercase mb-1.5">
              CAMERA ANGLE
            </div>
            <div className="flex items-center gap-1">
              {ANGLE_PRESETS.map((ang) => (
                <button
                  key={ang.id}
                  onClick={() => updatePhotoSettings({ anglePreset: ang.id })}
                  className={`px-2.5 py-1.5 rounded-xl text-[11px] font-heading font-bold transition cursor-pointer ${
                    photoSettings.anglePreset === ang.id
                      ? 'bg-[#22D3EE] text-[#070816]'
                      : 'bg-white/5 text-zinc-300 hover:bg-white/15'
                  }`}
                >
                  {ang.label}
                </button>
              ))}
            </div>
          </div>

          {/* Zoom Slider & DOF Toggle */}
          <div className="w-36">
            <div className="flex items-center justify-between text-[10px] font-heading font-bold text-[#A1A1AA] uppercase mb-1.5">
              <span className="flex items-center gap-1">
                <ZoomIn className="w-3 h-3 text-[#22D3EE]" /> ZOOM
              </span>
              <button
                onClick={() => updatePhotoSettings({ dofEnabled: !photoSettings.dofEnabled })}
                className={`px-1.5 py-0.5 rounded text-[9px] cursor-pointer ${
                  photoSettings.dofEnabled ? 'bg-[#8B5CF6] text-white' : 'bg-white/10 text-zinc-400'
                }`}
              >
                DOF: {photoSettings.dofEnabled ? 'ON' : 'OFF'}
              </button>
            </div>
            <input
              type="range"
              min="0.65"
              max="1.75"
              step="0.05"
              value={photoSettings.zoom || 1.0}
              onChange={(e) => updatePhotoSettings({ zoom: parseFloat(e.target.value) })}
              className="w-full accent-[#22D3EE] cursor-pointer"
            />
          </div>

          {/* Avatar Pose */}
          <div>
            <div className="text-[10px] font-heading font-bold tracking-[0.18em] text-[#A1A1AA] uppercase mb-1.5">
              POSE
            </div>
            <div className="flex items-center gap-1">
              {POSES.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPlayerPose(p.id)}
                  className={`px-2.5 py-1.5 rounded-xl text-[11px] font-heading font-bold transition cursor-pointer ${
                    playerPose === p.id
                      ? 'bg-[#8B5CF6] text-white'
                      : 'bg-white/5 text-zinc-300 hover:bg-white/15'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Filter & Pulse Light */}
          <div className="flex items-center gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedFilter(f.id)}
                className={`px-2.5 py-1.5 rounded-xl text-[11px] font-heading font-bold transition cursor-pointer ${
                  selectedFilter === f.id
                    ? 'bg-[#EC4899] text-white'
                    : 'bg-white/5 text-zinc-300 hover:bg-white/15'
                }`}
              >
                {f.label}
              </button>
            ))}

            <button
              onClick={() => setLightstickMode(isLightstickOn ? 'OFF' : 'ENERGY')}
              className={`p-2 rounded-xl border transition cursor-pointer ${
                isLightstickOn
                  ? 'bg-[#22D3EE]/20 border-[#22D3EE] text-[#22D3EE]'
                  : 'bg-white/5 border-white/10 text-zinc-400'
              }`}
              title="Toggle Pulse Light"
            >
              <Sparkles className="w-4 h-4" />
            </button>
          </div>

          {/* CAPTURE PHOTO */}
          <button
            onClick={handleTakePhoto}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#22D3EE] via-[#8B5CF6] to-[#EC4899] text-white font-heading font-bold text-xs tracking-[0.18em] shadow-[0_0_25px_rgba(34,211,238,0.5)] hover:brightness-110 active:scale-95 flex items-center gap-2 transition cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            <span>TAKE PHOTO</span>
          </button>
        </div>
      )}
    </div>
  );
}

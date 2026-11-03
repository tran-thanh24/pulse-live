import React from 'react';
import {
  X,
  Sliders,
  Volume2,
  Eye,
  Maximize2,
  Globe,
  Cpu,
  Users
} from 'lucide-react';
import { useUserStore } from '../store/userStore';
import { useConcertStore } from '../store/concertStore';
import { audioManager } from '../core/AudioManager';
import { musicEngine } from '../core/MusicEngine';

export function SettingsPanel() {
  const activeModal = useConcertStore((s) => s.activeModal);
  const setActiveModal = useConcertStore((s) => s.setActiveModal);
  const currentFps = useConcertStore((s) => s.currentFps);
  const adaptiveTier = useConcertStore((s) => s.adaptiveTier);

  const settings = useUserStore((s) => s.settings);
  const updateSettings = useUserStore((s) => s.updateSettings);

  if (activeModal !== 'settings') return null;

  const isVi = settings.language === 'vi';

  const handleVolumeChange = (partial) => {
    updateSettings(partial);
    const next = { ...settings, ...partial };
    audioManager.updateVolumes({
      musicVolume: next.musicVolume,
      sfxVolume: next.sfxVolume,
      musicEnabled: next.musicEnabled,
      sfxEnabled: next.sfxEnabled
    });
    musicEngine.updateVolumes({
      musicVolume: next.musicVolume,
      crowdVolume: next.crowdVolume,
      sfxVolume: next.sfxVolume,
      musicEnabled: next.musicEnabled,
      sfxEnabled: next.sfxEnabled
    });
  };

  const toggleFullscreen = () => {
    audioManager.playUISound('click');
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="glass-panel max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto relative border border-white/20">
        <button
          onClick={() => {
            audioManager.playUISound('click');
            setActiveModal(null);
          }}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 text-xs font-heading font-bold tracking-[0.25em] text-[#22D3EE] uppercase">
          <Sliders className="w-4 h-4" />
          <span>{isVi ? 'CÀI ĐẶT & TRỢ NĂNG' : 'PULSE//LIVE SETTINGS & ACCESSIBILITY'}</span>
        </div>
        <h2 className="text-2xl font-heading font-bold text-white mt-1">
          {isVi ? 'TÙY CHỈNH TRẢI NGHIỆM' : 'EXPERIENCE & COMFORT'}
        </h2>

        <div className="mt-6 space-y-6">
          {/* 1. Adaptive Quality Mode (LOW / MEDIUM / HIGH / AUTO) */}
          <div>
            <div className="flex items-center justify-between text-xs font-heading font-bold tracking-wider text-zinc-300 uppercase mb-2.5">
              <span className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#22D3EE]" />
                {isVi ? 'Chất lượng Đồ họa (Adaptive Quality)' : 'Adaptive Graphics Quality'}
              </span>
              <span className="text-[11px] text-[#22D3EE]">
                FPS: {currentFps} · ACTIVE TIER: {adaptiveTier}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {['LOW', 'MEDIUM', 'HIGH', 'AUTO'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => {
                    audioManager.playUISound('click');
                    updateSettings({ graphicsQuality: mode });
                  }}
                  className={`py-2.5 rounded-xl text-xs font-heading font-bold border transition cursor-pointer ${
                    settings.graphicsQuality === mode
                      ? 'bg-[#22D3EE] border-white text-[#070816] shadow-[0_0_15px_rgba(34,211,238,0.45)]'
                      : 'bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Audio Volumes: Music Volume, Crowd Volume, SFX Volume */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white/[0.03] p-4 rounded-2xl border border-white/10">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-heading font-bold text-white flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-[#22D3EE]" />
                  Music Volume
                </span>
                <span className="text-[10px] font-heading text-zinc-400">
                  {Math.round(settings.musicVolume * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.musicVolume}
                onChange={(e) => handleVolumeChange({ musicVolume: parseFloat(e.target.value) })}
                className="w-full accent-[#22D3EE] cursor-pointer"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-heading font-bold text-white flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#8B5CF6]" />
                  Crowd Volume
                </span>
                <span className="text-[10px] font-heading text-zinc-400">
                  {Math.round((settings.crowdVolume ?? 0.55) * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.crowdVolume ?? 0.55}
                onChange={(e) => handleVolumeChange({ crowdVolume: parseFloat(e.target.value) })}
                className="w-full accent-[#8B5CF6] cursor-pointer"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-heading font-bold text-white flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-[#FACC15]" />
                  SFX Volume
                </span>
                <span className="text-[10px] font-heading text-zinc-400">
                  {Math.round(settings.sfxVolume * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.sfxVolume}
                onChange={(e) => handleVolumeChange({ sfxVolume: parseFloat(e.target.value) })}
                className="w-full accent-[#FACC15] cursor-pointer"
              />
            </div>
          </div>

          {/* 3. Mandatory Accessibility Options */}
          <div>
            <div className="flex items-center gap-2 text-xs font-heading font-bold tracking-wider text-zinc-300 uppercase mb-2.5">
              <Eye className="w-4 h-4 text-[#22D3EE]" />
              <span>{isVi ? 'Trợ năng Bắt buộc (Accessibility)' : 'Accessibility Controls'}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Reduce Motion */}
              <button
                onClick={() => updateSettings({ reduceMotion: !settings.reduceMotion })}
                className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-between text-left hover:bg-white/[0.08] cursor-pointer"
              >
                <div>
                  <div className="text-xs font-heading font-bold text-white">Reduce Motion</div>
                  <div className="text-[11px] text-zinc-400">
                    Softens Pulse Core &amp; crowd movement
                  </div>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-md text-[10px] font-heading font-bold ${
                    settings.reduceMotion
                      ? 'bg-[#22D3EE] text-[#070816]'
                      : 'bg-white/10 text-zinc-400'
                  }`}
                >
                  {settings.reduceMotion ? 'ON' : 'OFF'}
                </span>
              </button>

              {/* Reduce Flash / No Strobe */}
              <button
                onClick={() =>
                  updateSettings({
                    reduceFlash: !settings.reduceFlash,
                    disableFlashingLights: !settings.disableFlashingLights
                  })
                }
                className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-between text-left hover:bg-white/[0.08] cursor-pointer"
              >
                <div>
                  <div className="text-xs font-heading font-bold text-white">
                    Reduce Flash / No Strobe
                  </div>
                  <div className="text-[11px] text-zinc-400">
                    Disables rapid strobe &amp; kick flashes
                  </div>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-md text-[10px] font-heading font-bold ${
                    settings.disableFlashingLights
                      ? 'bg-[#22D3EE] text-[#070816]'
                      : 'bg-white/10 text-zinc-400'
                  }`}
                >
                  {settings.disableFlashingLights ? 'ON' : 'OFF'}
                </span>
              </button>

              {/* Lower Crowd */}
              <button
                onClick={() => updateSettings({ lowerCrowd: !settings.lowerCrowd })}
                className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-between text-left hover:bg-white/[0.08] cursor-pointer"
              >
                <div>
                  <div className="text-xs font-heading font-bold text-white">Lower Crowd</div>
                  <div className="text-[11px] text-zinc-400">
                    Reduces NPC density for visual comfort &amp; FPS
                  </div>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-md text-[10px] font-heading font-bold ${
                    settings.lowerCrowd
                      ? 'bg-[#22D3EE] text-[#070816]'
                      : 'bg-white/10 text-zinc-400'
                  }`}
                >
                  {settings.lowerCrowd ? 'ON' : 'OFF'}
                </span>
              </button>

              {/* Subtitles */}
              <button
                onClick={() => updateSettings({ subtitles: !settings.subtitles })}
                className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-between text-left hover:bg-white/[0.08] cursor-pointer"
              >
                <div>
                  <div className="text-xs font-heading font-bold text-white">Subtitles</div>
                  <div className="text-[11px] text-zinc-400">
                    Display MC callouts &amp; stage captions
                  </div>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-md text-[10px] font-heading font-bold ${
                    settings.subtitles
                      ? 'bg-[#22D3EE] text-[#070816]'
                      : 'bg-white/10 text-zinc-400'
                  }`}
                >
                  {settings.subtitles ? 'ON' : 'OFF'}
                </span>
              </button>
            </div>
          </div>

          {/* Language & Fullscreen */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/10">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#22D3EE]" />
              <button
                onClick={() => updateSettings({ language: 'en' })}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-heading font-bold border cursor-pointer ${
                  settings.language === 'en'
                    ? 'bg-[#22D3EE] text-[#070816] border-white'
                    : 'bg-white/5 border-white/10 text-zinc-400'
                }`}
              >
                English
              </button>
              <button
                onClick={() => updateSettings({ language: 'vi' })}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-heading font-bold border cursor-pointer ${
                  settings.language === 'vi'
                    ? 'bg-[#22D3EE] text-[#070816] border-white'
                    : 'bg-white/5 border-white/10 text-zinc-400'
                }`}
              >
                Tiếng Việt
              </button>
            </div>

            <button
              onClick={toggleFullscreen}
              className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-heading font-bold text-white flex items-center gap-1.5 cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5 text-[#22D3EE]" />
              <span>FULLSCREEN</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  X,
  Play,
  Square,
  Shuffle,
  Star,
  Flame,
  Music2,
  Smile,
  Camera,
  Layers
} from 'lucide-react';
import { useConcertStore } from '../store/concertStore';
import { animationRegistry, ACTION_CATEGORIES } from '../characters/AnimationRegistry';
import { danceController } from '../characters/DanceController';
import { audioManager } from '../core/AudioManager';

export function ActionMenu() {
  const actionMenuOpen = useConcertStore((s) => s.actionMenuOpen);
  const setActionMenuOpen = useConcertStore((s) => s.setActionMenuOpen);
  const playerPose = useConcertStore((s) => s.playerPose);

  const [selectedCategory, setSelectedCategory] = useState(ACTION_CATEGORIES.DANCE);
  const [favorites, setFavorites] = useState(() => danceController.getFavorites());

  useEffect(() => {
    const unsub = () => {};
    return unsub;
  }, []);

  if (!actionMenuOpen) return null;

  const currentPlayingId = playerPose && playerPose !== 'idle' ? playerPose.toLowerCase() : null;

  const categories = [
    { id: ACTION_CATEGORIES.DANCE, label: 'Dance', icon: Flame },
    { id: ACTION_CATEGORIES.REACTION, label: 'Reaction', icon: Smile },
    { id: ACTION_CATEGORIES.LIGHTSTICK, label: 'Lightstick', icon: Sparkles },
    { id: ACTION_CATEGORIES.POSE, label: 'Pose', icon: Camera }
  ];

  const actions = animationRegistry.getActionsByCategory(selectedCategory, 'PLAYER');

  const handleActionClick = (actionId) => {
    try {
      audioManager.playUISound('click');
    } catch {}
    danceController.playAction(actionId, 'PLAYER');
  };

  const handleStopAction = () => {
    try {
      audioManager.playUISound('click');
    } catch {}
    danceController.stopAction();
  };

  const handleRandomDance = () => {
    danceController.playRandomDance('PLAYER');
  };

  const handleToggleFavorite = (e, actionId) => {
    e.stopPropagation();
    try {
      audioManager.playUISound('click');
    } catch {}
    const idx = favorites.indexOf(actionId);
    if (idx !== -1) {
      // already favorite
      return;
    }
    // replace slot 2 or 3
    danceController.setFavorite(2, actionId);
    setFavorites(danceController.getFavorites());
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-auto flex items-end sm:items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-[2px] animate-fade-in">
      <div className="w-full max-w-md bg-[#080B18]/95 border border-cyan-500/30 rounded-2xl p-4 shadow-[0_0_35px_rgba(34,211,238,0.25)] flex flex-col gap-3.5 max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center shadow-[0_0_10px_rgba(34,211,238,0.5)]">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-heading font-bold text-white tracking-wider uppercase flex items-center gap-2">
                Action & Dance Menu
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                  [B / M]
                </span>
              </h3>
              <p className="text-[11px] text-zinc-400">Perform movements, sync dances & poses</p>
            </div>
          </div>
          <button
            onClick={() => {
              try {
                audioManager.playUISound('click');
              } catch {}
              setActionMenuOpen(false);
            }}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/15 text-zinc-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="grid grid-cols-4 gap-1.5 p-1 bg-white/5 rounded-xl border border-white/10">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  try {
                    audioManager.playUISound('click');
                  } catch {}
                  setSelectedCategory(cat.id);
                }}
                className={`py-2 px-1 rounded-lg text-xs font-heading font-semibold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition ${
                  isSelected
                    ? 'bg-gradient-to-r from-cyan-500/90 to-blue-600/90 text-white shadow-md'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Quick Actions Bar (Slots 1 to 4) */}
        <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
            <span className="font-mono text-cyan-400 font-bold">QUICK [1-4]:</span>
          </div>
          <div className="flex items-center gap-1.5">
            {favorites.map((favId, slotIdx) => {
              const act = animationRegistry.getAction(favId);
              const isPlayingThis = currentPlayingId === act.clip.toLowerCase();
              return (
                <button
                  key={slotIdx}
                  onClick={() => danceController.playQuickAction(slotIdx)}
                  title={`Slot ${slotIdx + 1}: ${act.label}`}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 transition border ${
                    isPlayingThis
                      ? 'bg-cyan-500/30 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.4)]'
                      : 'bg-black/40 border-white/15 text-zinc-300 hover:border-white/30'
                  }`}
                >
                  <span className="text-cyan-400">{slotIdx + 1}</span>
                  <span className="truncate max-w-[60px]">{act.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Grid */}
        <div className="overflow-y-auto max-h-[42vh] pr-1 space-y-1.5 custom-scrollbar">
          {selectedCategory === ACTION_CATEGORIES.DANCE && (
            <div className="grid grid-cols-2 gap-2 mb-2">
              <button
                onClick={handleRandomDance}
                className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-purple-600/40 to-pink-600/40 hover:from-purple-600/60 hover:to-pink-600/60 border border-purple-500/40 text-purple-200 text-xs font-heading font-bold flex items-center justify-center gap-2 transition"
              >
                <Shuffle className="w-4 h-4 text-pink-400 animate-spin-slow" />
                <span>Random Dance 🎲</span>
              </button>

              <button
                onClick={() =>
                  danceController.playCombo(
                    ['dance_basic', 'dance_arm_wave', 'dance_spin', 'final_pose'],
                    3200
                  )
                }
                className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-600/40 to-orange-600/40 hover:from-amber-600/60 hover:to-orange-600/60 border border-amber-500/40 text-amber-200 text-xs font-heading font-bold flex items-center justify-center gap-2 transition"
              >
                <Layers className="w-4 h-4 text-amber-400" />
                <span>Idol Combo Sequence</span>
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            {actions.map((act) => {
              const isPlaying =
                currentPlayingId === act.clip.toLowerCase() ||
                currentPlayingId === act.id.toLowerCase();
              const isFav = favorites.includes(act.id);

              return (
                <div
                  key={act.id}
                  onClick={() => handleActionClick(act.id)}
                  className={`group p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition select-none ${
                    isPlaying
                      ? 'bg-cyan-950/60 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.3)]'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex flex-col min-w-0 pr-1">
                    <span
                      className={`text-xs font-heading font-semibold truncate ${
                        isPlaying ? 'text-cyan-300 font-bold' : 'text-zinc-200 group-hover:text-white'
                      }`}
                    >
                      {act.label}
                    </span>
                    <span className="text-[10px] text-zinc-500 flex items-center gap-1.5">
                      <span>{act.energyLevel} NRG</span>
                      <span>•</span>
                      <span>{act.nativeBpm} BPM</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => handleToggleFavorite(e, act.id)}
                      title={isFav ? 'In Quick Actions' : 'Pin to Quick Actions'}
                      className={`p-1 rounded transition ${
                        isFav
                          ? 'text-amber-400'
                          : 'text-zinc-600 hover:text-zinc-400 opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      <Star className="w-3.5 h-3.5 fill-current" />
                    </button>

                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                        isPlaying ? 'bg-cyan-500 text-black' : 'bg-white/10 text-zinc-400'
                      }`}
                    >
                      {isPlaying ? (
                        <Square className="w-3 h-3 fill-current" />
                      ) : (
                        <Play className="w-3 h-3 fill-current ml-0.5" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer: Stop Action + Help */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[11px]">
          <span className="text-zinc-400">
            {currentPlayingId ? (
              <span className="text-cyan-400 font-mono flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                PLAYING: {currentPlayingId.toUpperCase()}
              </span>
            ) : (
              'Click an action or press WASD to walk'
            )}
          </span>

          {currentPlayingId && (
            <button
              onClick={handleStopAction}
              className="px-3 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 font-mono font-semibold flex items-center gap-1 transition"
            >
              <Square className="w-3 h-3 fill-current" />
              <span>STOP ACTION</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}


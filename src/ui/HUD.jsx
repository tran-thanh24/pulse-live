import React, { useEffect, useRef } from 'react';
import {
  Sparkles,
  Camera,
  Settings,
  Trophy,
  Sliders,
  Music,
  Flag,
  Video
} from 'lucide-react';
import { useConcertStore } from '../store/concertStore';
import { useUserStore } from '../store/userStore';
import { MiniMap } from './MiniMap';
import { InteractionPrompt } from './InteractionPrompt';
import { achievementSystem } from '../systems/AchievementSystem';
import { audienceEnergySystem } from '../systems/AudienceEnergySystem';
import { audioManager } from '../core/AudioManager';
import { presenceService } from '../services/realtime';

const REACTION_BUTTONS = [
  { id: 'CLAP', emoji: '👏', label: 'CLAP' },
  { id: 'HEART', emoji: '❤️', label: 'HEART' },
  { id: 'HYPE', emoji: '🔥', label: 'HYPE' },
  { id: 'PULSE', emoji: '⚡', label: 'PULSE' }
];

/**
 * AUDIENCE MODE HUD — Ultra-minimalist interface that keeps the 3D stage unobstructed.
 * Top-left: PULSE//LIVE + LIVE indicator + small Now Playing
 * Top-right: online count + ticket zone (+ discreet Studio/Settings icons)
 * Bottom-left: mini map
 * Bottom-center: interaction prompt (+ conditional MAKE SOME NOISE energy bar)
 * Bottom-right: reaction buttons
 */
export function HUD() {
  const onlineCount = useConcertStore((s) => s.onlineCount);
  const currentTrack = useConcertStore((s) => s.currentTrack);
  const lightstickMode = useConcertStore((s) => s.lightstickMode);
  const cycleLightstickMode = useConcertStore((s) => s.cycleLightstickMode);
  const activeModal = useConcertStore((s) => s.activeModal);
  const setActiveModal = useConcertStore((s) => s.setActiveModal);
  const reactions = useConcertStore((s) => s.reactions);
  const triggerReaction = useConcertStore((s) => s.triggerReaction);
  const setJoystickVector = useConcertStore((s) => s.setJoystickVector);
  const setScreen = useConcertStore((s) => s.setScreen);
  const studioMode = useConcertStore((s) => s.studioMode);
  const toggleStudioMode = useConcertStore((s) => s.toggleStudioMode);
  const autoCamera = useConcertStore((s) => s.autoCamera);
  const setAutoCamera = useConcertStore((s) => s.setAutoCamera);
  const audienceEnergyState = useConcertStore((s) => s.audienceEnergyState);
  const showState = useConcertStore((s) => s.showState);
  const preShowCountdown = useConcertStore((s) => s.preShowCountdown);

  const settings = useUserStore((s) => s.settings);
  const ticket = useUserStore((s) => s.ticket);
  const activeToast = useUserStore((s) => s.activeToast);
  const clearToast = useUserStore((s) => s.clearToast);
  const lightstickColor = useUserStore((s) => s.lightstickColor);
  const markConcertVisited = useUserStore((s) => s.markConcertVisited);

  const joystickBaseRef = useRef(null);
  const isTouchDraggingRef = useRef(false);

  useEffect(() => {
    if (!activeToast) return;
    const timer = setTimeout(() => {
      clearToast();
    }, 3800);
    return () => clearTimeout(timer);
  }, [activeToast, clearToast]);

  if (activeModal === 'photo') return null;

  const isVi = settings.language === 'vi';

  const handleReaction = (btn) => {
    const fired = triggerReaction(btn.id, btn.emoji, btn.label);
    if (!fired) return;

    audioManager.playUISound('click');
    presenceService.updateReaction(btn.id, 'local_player');
    audienceEnergySystem.addReactionEnergy(btn.id);
    achievementSystem.unlock('FAN_MOMENT');
  };

  const handleLightstickToggle = () => {
    const nextMode = cycleLightstickMode();
    presenceService.updateLightstick(nextMode, lightstickColor);
    audioManager.playLightstickActivation(nextMode);
    if (nextMode !== 'OFF') {
      achievementSystem.unlock('LIGHT_IT_UP');
    }
  };

  const updateJoystickFromEvent = (clientX, clientY) => {
    if (!joystickBaseRef.current) return;
    const rect = joystickBaseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const maxRadius = rect.width / 2;

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const dist = Math.hypot(dx, dy);
    const clampedDist = Math.min(dist, maxRadius);
    const angle = Math.atan2(dy, dx);

    const normX = (Math.cos(angle) * clampedDist) / maxRadius;
    const normY = (Math.sin(angle) * clampedDist) / maxRadius;
    setJoystickVector(normX, normY);
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-20 flex flex-col justify-between p-4 sm:p-5 select-none">
      {/* =====================================================
          TOP ROW: TOP-LEFT (PULSE//LIVE + NOW PLAYING) & TOP-RIGHT (ONLINE + ZONE)
          ===================================================== */}
      <div className="flex items-start justify-between gap-3">
        {/* TOP-LEFT: PULSE//LIVE + LIVE INDICATOR + SMALL NOW PLAYING */}
        <div className="pointer-events-auto flex flex-col gap-1.5">
          <div className="glass-pill px-4 py-1.5 flex items-center gap-2.5">
            <span className="font-heading font-bold text-sm tracking-wider text-white">
              PULSE<span className="text-[#22D3EE]">//</span>LIVE
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[#EC4899]/25 border border-[#EC4899]/60 flex items-center gap-1.5 text-[9px] font-heading font-bold tracking-widest text-[#EC4899]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#EC4899] animate-ping" />
              LIVE
            </span>
          </div>

          {/* Small subtle Now Playing indicator */}
          <button
            onClick={() => {
              audioManager.playUISound('click');
              setActiveModal('schedule');
            }}
            className="glass-pill px-3 py-1 flex items-center gap-1.5 text-left hover:border-[#22D3EE]/50 transition cursor-pointer w-fit"
          >
            <Music className="w-3 h-3 text-[#22D3EE]" />
            <span className="text-[10px] font-heading font-medium text-zinc-300 truncate max-w-[180px]">
              {showState === 'PRE_SHOW' && preShowCountdown > 0
                ? `PRE-SHOW // T-${preShowCountdown}S`
                : `${currentTrack?.title || 'What You Want'} — ${currentTrack?.artist || 'CORTIS'}`}
            </span>
          </button>
        </div>

        {/* ACHIEVEMENT / EVENT TOAST */}
        {activeToast && (
          <div className="pointer-events-auto glass-panel-sm px-4 py-2.5 border border-[#22D3EE]/60 shadow-[0_0_24px_rgba(34,211,238,0.25)] flex items-center gap-3 animate-float-slow">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${activeToast.badge.color}25` }}
            >
              <Trophy className="w-4 h-4" style={{ color: activeToast.badge.color }} />
            </div>
            <div>
              <div className="text-[9px] font-heading font-bold tracking-[0.2em] text-[#22D3EE] uppercase">
                {activeToast.type === 'achievement' ? 'UNLOCKED' : 'PULSE EVENT'}
              </div>
              <div className="text-xs font-heading font-bold text-white">
                {isVi ? activeToast.badge.titleVi : activeToast.badge.title}
              </div>
              <div className="text-[10px] text-zinc-300">
                {isVi ? activeToast.badge.descriptionVi : activeToast.badge.description}
              </div>
            </div>
          </div>
        )}

        {/* TOP-RIGHT: ONLINE COUNT + TICKET ZONE (+ DISCREET TOOLS) */}
        <div className="pointer-events-auto flex flex-col items-end gap-1.5">
          <div className="flex items-center gap-2">
            <div className="glass-pill px-3 py-1.5 text-xs font-heading font-bold text-white flex items-center gap-1.5" title="Connected to Realtime Arena">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>LIVE ROOM · {onlineCount.toLocaleString()}</span>
            </div>

            <div className="glass-pill px-3 py-1.5 text-xs font-heading font-bold text-[#FACC15]">
              {ticket?.zone || 'GA STANDING'}
            </div>

            <button
              onClick={() => {
                audioManager.playUISound('click');
                setActiveModal('settings');
              }}
              className="glass-pill p-2 text-zinc-300 hover:text-white transition cursor-pointer"
              title="Settings & Accessibility"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Discreet Operator / Camera / Photo pills */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                audioManager.playUISound('click');
                setAutoCamera(!autoCamera);
              }}
              className={`glass-pill px-2.5 py-1 text-[10px] font-heading font-semibold flex items-center gap-1 transition cursor-pointer ${
                autoCamera ? 'text-[#22D3EE] border-[#22D3EE]/40' : 'text-zinc-400'
              }`}
              title="Toggle CameraDirector Auto Camera"
            >
              <Video className="w-3 h-3" />
              <span>AUTO CAM: {autoCamera ? 'ON' : 'OFF'}</span>
            </button>

            <button
              onClick={() => {
                audioManager.playUISound('click');
                setActiveModal('photo');
              }}
              className="glass-pill px-2.5 py-1 text-[10px] font-heading font-semibold text-zinc-300 hover:text-white flex items-center gap-1 cursor-pointer"
              title="Photo Mode [P]"
            >
              <Camera className="w-3 h-3 text-[#FACC15]" />
              <span className="hidden sm:inline">[P]</span>
            </button>

            <button
              onClick={() => {
                audioManager.playUISound('click');
                toggleStudioMode();
              }}
              className={`glass-pill px-2.5 py-1 text-[10px] font-heading font-bold flex items-center gap-1 transition cursor-pointer ${
                studioMode
                  ? 'bg-[#22D3EE] text-[#070816] border-white'
                  : 'text-zinc-300 hover:text-white'
              }`}
              title="Toggle Studio Mode (`)"
            >
              <Sliders className="w-3 h-3" />
              <span>STUDIO</span>
            </button>

            <button
              onClick={() => {
                audioManager.playCheer();
                achievementSystem.unlock('NOVA_NIGHT');
                markConcertVisited();
                setScreen('end');
              }}
              className="glass-pill px-2.5 py-1 text-[10px] font-heading font-semibold text-[#FACC15] hover:border-[#FACC15] flex items-center gap-1 cursor-pointer"
              title="View Concert Memory Card"
            >
              <Flag className="w-3 h-3" />
              <span className="hidden md:inline">MEMORY</span>
            </button>
          </div>
        </div>
      </div>

      {/* FLOATING REACTION PARTICLES */}
      <div className="fixed bottom-24 right-10 pointer-events-none z-30">
        {reactions.map((r) => (
          <div
            key={r.id}
            style={{ left: `${r.xOffset}px` }}
            className="absolute bottom-0 animate-reaction-float flex flex-col items-center"
          >
            <span className="text-2xl drop-shadow-[0_0_12px_rgba(34,211,238,0.8)]">
              {r.emoji}
            </span>
          </div>
        ))}
      </div>

      {/* =====================================================
          BOTTOM ROW: MINI MAP (LEFT), INTERACTION + ENERGY CALLOUT (CENTER), REACTIONS (RIGHT)
          ===================================================== */}
      {!studioMode && (
        <div className="flex items-end justify-between gap-4">
          {/* BOTTOM-LEFT: MINI MAP + MOBILE JOYSTICK */}
          <div className="pointer-events-auto flex items-end gap-3">
            <MiniMap />

            <div
              ref={joystickBaseRef}
              onPointerDown={(e) => {
                isTouchDraggingRef.current = true;
                updateJoystickFromEvent(e.clientX, e.clientY);
              }}
              onPointerMove={(e) => {
                if (!isTouchDraggingRef.current) return;
                updateJoystickFromEvent(e.clientX, e.clientY);
              }}
              onPointerUp={() => {
                isTouchDraggingRef.current = false;
                setJoystickVector(0, 0);
              }}
              onPointerCancel={() => {
                isTouchDraggingRef.current = false;
                setJoystickVector(0, 0);
              }}
              className="lg:hidden w-20 h-20 rounded-full glass-panel border border-white/25 flex items-center justify-center relative touch-none cursor-pointer"
              title="Touch Joystick"
            >
              <div className="w-8 h-8 rounded-full bg-[#22D3EE]/80 border border-white/60 shadow-[0_0_12px_#22D3EE]" />
            </div>
          </div>

          {/* BOTTOM-CENTER: CONDITIONAL AUDIENCE ENERGY CALLOUT + INTERACTION PROMPT */}
          <div className="flex-1 flex flex-col items-center gap-2 max-w-md mx-auto">
            {/* Audience Energy Meter ONLY appears during MAKE SOME NOISE callout */}
            {audienceEnergyState?.isCalloutActive && (
              <div className="w-full glass-panel-sm px-4 py-2.5 border border-[#22D3EE]/50 shadow-[0_0_25px_rgba(34,211,238,0.3)] animate-float-slow">
                <div className="flex items-center justify-between text-[10px] font-heading font-bold tracking-widest uppercase mb-1.5">
                  <span className="text-[#22D3EE]">{audienceEnergyState.calloutPrompt}</span>
                  <span className="text-[#FACC15]">
                    {Math.round(audienceEnergyState.energy)}% / 80% OVERLOAD
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#22D3EE] via-[#8B5CF6] to-[#EC4899] transition-all duration-200"
                    style={{ width: `${Math.min(100, audienceEnergyState.energy)}%` }}
                  />
                </div>
              </div>
            )}

            <InteractionPrompt />
          </div>

          {/* BOTTOM-RIGHT: PULSE LIGHT MODE + REACTION BUTTONS */}
          <div className="pointer-events-auto flex flex-col items-end gap-2">
            <button
              onClick={handleLightstickToggle}
              className="glass-pill px-3 py-1 text-[10px] font-heading font-bold flex items-center gap-1.5 border transition cursor-pointer"
              style={{
                borderColor:
                  lightstickMode !== 'OFF' ? lightstickColor : 'rgba(255,255,255,0.14)',
                boxShadow:
                  lightstickMode !== 'OFF' ? `0 0 12px ${lightstickColor}44` : 'none'
              }}
            >
              <Sparkles
                className="w-3 h-3"
                style={{ color: lightstickMode !== 'OFF' ? lightstickColor : '#A1A1AA' }}
              />
              <span>[F] PULSE LIGHT: {lightstickMode}</span>
            </button>

            <div className="glass-pill px-2.5 py-1.5 flex items-center gap-1.5">
              {REACTION_BUTTONS.map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => handleReaction(btn)}
                  title={btn.label}
                  className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/15 active:scale-90 border border-white/10 flex items-center justify-center text-base transition cursor-pointer"
                >
                  {btn.emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

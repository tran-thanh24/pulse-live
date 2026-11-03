import React, { useState } from 'react';
import {
  Sparkles,
  Trophy,
  Camera,
  Clock,
  RotateCcw,
  MapPin,
  Image,
  CheckCircle2,
  Download,
  Activity,
  X
} from 'lucide-react';
import { useUserStore } from '../store/userStore';
import { useConcertStore } from '../store/concertStore';
import { ACHIEVEMENTS } from '../data/achievements';
import { audioManager } from '../core/AudioManager';

/**
 * EndConcertScreen: YOUR PULSE NIGHT + Exportable PNG DIGITAL CONCERT CARD
 * Zero NFT / Zero blockchain — pure downloadable PNG commemorative card.
 */
export function EndConcertScreen() {
  const [showMemoriesModal, setShowMemoriesModal] = useState(false);

  const displayName = useUserStore((s) => s.displayName);
  const avatar = useUserStore((s) => s.avatar);
  const ticket = useUserStore((s) => s.ticket);
  const photos = useUserStore((s) => s.photos);
  const unlockedIds = useUserStore((s) => s.achievements);
  const lightstickColor = useUserStore((s) => s.lightstickColor);

  const momentsCount = useConcertStore((s) => s.momentsCount);
  const setScreen = useConcertStore((s) => s.setScreen);
  const replayConcert = useConcertStore((s) => s.replayConcert);

  const handleExportDigitalCardPng = () => {
    audioManager.playCameraShutter();
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 640;
    const ctx = canvas.getContext('2d');

    // Card Background
    const bgGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    bgGrad.addColorStop(0, '#070816');
    bgGrad.addColorStop(0.55, '#111636');
    bgGrad.addColorStop(1, '#090D20');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Architectural Sound Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 48) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    // Glowing PULSE CORE Ring on Right Side
    ctx.strokeStyle = lightstickColor || '#22D3EE';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(820, 320, 165, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#EC4899';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(820, 320, 125, 0, Math.PI * 2);
    ctx.stroke();

    // Stylized Avatar Emblem inside Pulse Core Ring
    ctx.fillStyle = avatar?.skinTone || '#F5CBA7';
    ctx.fillRect(790, 245, 60, 60);
    ctx.fillStyle = avatar?.hairColor || '#22D3EE';
    ctx.fillRect(785, 230, 70, 22);
    ctx.fillStyle = avatar?.outfitColor || '#06B6D4';
    ctx.fillRect(775, 310, 90, 95);

    // Outer Border
    ctx.strokeStyle = '#22D3EE';
    ctx.lineWidth = 4;
    ctx.strokeRect(28, 28, canvas.width - 56, canvas.height - 56);

    // Typography
    ctx.fillStyle = '#22D3EE';
    ctx.font = 'bold 20px "Space Grotesk", sans-serif';
    ctx.fillText('OFFICIAL COMMEMORATIVE DIGITAL CONCERT CARD', 68, 92);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 64px "Space Grotesk", sans-serif';
    ctx.fillText('PULSE//LIVE 2026', 68, 172);

    ctx.fillStyle = '#A1A1AA';
    ctx.font = '600 22px "Inter", sans-serif';
    ctx.fillText('FEEL THE SOUND. BECOME THE SHOW.  ·  CITY OF SOUND', 68, 212);

    // Attendee Details
    ctx.fillStyle = '#FACC15';
    ctx.font = 'bold 18px "Space Grotesk", sans-serif';
    ctx.fillText('ATTENDEE', 68, 295);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 36px "Space Grotesk", sans-serif';
    ctx.fillText(displayName || 'PULSE // FAN', 68, 338);

    ctx.fillStyle = '#22D3EE';
    ctx.font = 'bold 18px "Space Grotesk", sans-serif';
    ctx.fillText('DATE & VENUE', 68, 410);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 26px "Space Grotesk", sans-serif';
    ctx.fillText('03.11.2026  ·  PULSE SOUND DOME // SECTOR 01', 68, 445);

    ctx.fillStyle = '#EC4899';
    ctx.font = 'bold 18px "Space Grotesk", sans-serif';
    ctx.fillText('TICKET ZONE & PULSE LIGHT', 68, 515);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 26px "Space Grotesk", sans-serif';
    ctx.fillText(
      `${ticket?.zone || 'GA STANDING'}  ·  ${ticket?.ticketId || 'PL26-VERIFIED'}  ·  COLOR ${
        lightstickColor || '#22D3EE'
      }`,
      68,
      550
    );

    const link = document.createElement('a');
    link.download = `PULSE-LIVE-2026-CARD-${(displayName || 'FAN').replace(/\s+/g, '-')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="relative w-full h-full bg-[#070816] flex flex-col items-center justify-center p-4 sm:p-6 overflow-y-auto select-none">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 50% 30%, rgba(34, 211, 238, 0.16) 0%, rgba(139, 92, 246, 0.16) 40%, rgba(7, 8, 22, 0.98) 80%)'
        }}
      />

      <div className="relative z-10 max-w-3xl w-full glass-panel p-6 sm:p-9 text-center border border-white/20 shadow-[0_25px_80px_rgba(0,0,0,0.85)]">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#22D3EE]/15 border border-[#22D3EE]/40 text-xs font-heading font-bold tracking-[0.25em] text-[#22D3EE] uppercase">
          <Activity className="w-3.5 h-3.5" />
          <span>YOUR PULSE NIGHT // FINALE COMPLETE</span>
        </div>

        <h1 className="mt-3 font-heading font-bold text-3xl sm:text-5xl tracking-wider text-white">
          FEEL THE SOUND.
          <span className="block bg-gradient-to-r from-[#22D3EE] via-[#8B5CF6] to-[#EC4899] bg-clip-text text-transparent mt-1">
            BECOME THE SHOW.
          </span>
        </h1>

        {/* =====================================================
            DIGITAL CONCERT CARD (EXPORTABLE TO PNG)
            ===================================================== */}
        <div className="mt-6 p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#0D1330] via-[#090B1C] to-[#171132] border border-[#22D3EE]/40 text-left flex flex-col sm:flex-row items-center justify-between gap-5 shadow-[0_0_35px_rgba(34,211,238,0.2)]">
          <div className="space-y-2 flex-1">
            <div className="text-[10px] font-heading font-bold tracking-[0.25em] text-[#22D3EE] uppercase">
              DIGITAL CONCERT CARD · PULSE//LIVE 2026
            </div>
            <div className="text-xl sm:text-2xl font-heading font-bold text-white">
              {displayName}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs font-heading text-zinc-300">
              <span>DATE: 03.11.2026</span>
              <span>·</span>
              <span className="text-[#FACC15]">ZONE: {ticket?.zone || 'GA STANDING'}</span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                PULSE LIGHT:
                <span
                  className="w-3 h-3 rounded-full inline-block border border-white/50"
                  style={{ backgroundColor: lightstickColor }}
                />
              </span>
            </div>
            <div className="text-[11px] text-zinc-400">
              FAVORITE MOMENT: PULSE CORE OVERLOAD &amp; ARENA WAVE SYNC
            </div>
          </div>

          <div className="flex flex-col items-center gap-2.5 shrink-0">
            {/* Avatar & Pulse Ring Badge */}
            <div
              className="w-20 h-20 rounded-full border-4 flex items-center justify-center relative"
              style={{
                borderColor: lightstickColor || '#22D3EE',
                boxShadow: `0 0 22px ${lightstickColor || '#22D3EE'}66`
              }}
            >
              <div
                className="w-9 h-9 rounded-lg border border-white/30"
                style={{ backgroundColor: avatar?.outfitColor || '#06B6D4' }}
              />
            </div>

            <button
              onClick={handleExportDigitalCardPng}
              className="px-4 py-2 rounded-xl bg-[#22D3EE] hover:brightness-110 text-[#070816] font-heading font-bold text-[11px] tracking-wider flex items-center gap-1.5 cursor-pointer shadow-lg"
            >
              <Download className="w-3.5 h-3.5" />
              <span>EXPORT PNG CARD</span>
            </button>
          </div>
        </div>

        {/* STATS SUMMARY */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
          <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 text-center">
            <Clock className="w-4 h-4 text-[#22D3EE] mx-auto mb-1" />
            <div className="text-[10px] font-heading tracking-widest text-[#A1A1AA] uppercase">
              Duration
            </div>
            <div className="text-lg font-heading font-bold text-white">08:14</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 text-center">
            <Sparkles className="w-4 h-4 text-[#EC4899] mx-auto mb-1" />
            <div className="text-[10px] font-heading tracking-widest text-[#A1A1AA] uppercase">
              Reactions
            </div>
            <div className="text-lg font-heading font-bold text-white">
              {Math.max(9, momentsCount)}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 text-center">
            <Camera className="w-4 h-4 text-[#FACC15] mx-auto mb-1" />
            <div className="text-[10px] font-heading tracking-widest text-[#A1A1AA] uppercase">
              Photos
            </div>
            <div className="text-lg font-heading font-bold text-white">{photos.length}</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 text-center">
            <Trophy className="w-4 h-4 text-[#8B5CF6] mx-auto mb-1" />
            <div className="text-[10px] font-heading tracking-widest text-[#A1A1AA] uppercase">
              Achievements
            </div>
            <div className="text-lg font-heading font-bold text-white">
              {unlockedIds.length} / {ACHIEVEMENTS.length}
            </div>
          </div>
        </div>

        {/* Achievements Strip */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-2 text-left">
          {ACHIEVEMENTS.map((ach) => {
            const isUnlocked = unlockedIds.includes(ach.id);
            return (
              <div
                key={ach.id}
                className={`p-2.5 rounded-xl border flex items-center gap-2.5 ${
                  isUnlocked
                    ? 'bg-white/[0.07] border-white/20 text-white'
                    : 'bg-white/[0.02] border-white/5 text-zinc-500 opacity-60'
                }`}
              >
                <CheckCircle2
                  className="w-4 h-4 shrink-0"
                  style={{ color: isUnlocked ? ach.color : '#52525B' }}
                />
                <div className="truncate">
                  <div className="text-[11px] font-heading font-bold truncate">{ach.title}</div>
                  <div className="text-[10px] text-zinc-400 truncate">{ach.description}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTAs */}
        <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => {
              audioManager.playUISound('click');
              setShowMemoriesModal(true);
            }}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#22D3EE] to-[#8B5CF6] text-[#070816] font-heading font-bold text-xs tracking-[0.18em] flex items-center justify-center gap-2 cursor-pointer"
          >
            <Image className="w-4 h-4" />
            <span>VIEW PHOTO GALLERY</span>
          </button>

          <button
            onClick={() => {
              audioManager.playUISound('click');
              setScreen('venue');
            }}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-heading font-bold text-xs tracking-[0.18em] flex items-center justify-center gap-2 cursor-pointer"
          >
            <MapPin className="w-4 h-4 text-[#22D3EE]" />
            <span>RETURN TO VENUE</span>
          </button>

          <button
            onClick={() => {
              audioManager.playUISound('click');
              replayConcert();
            }}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-[#FACC15] font-heading font-bold text-xs tracking-[0.18em] flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>REPLAY CONCERT</span>
          </button>
        </div>
      </div>

      {/* PHOTO GALLERY MODAL */}
      {showMemoriesModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel max-w-3xl w-full p-6 sm:p-8 max-h-[88vh] overflow-y-auto relative border border-white/20">
            <button
              onClick={() => setShowMemoriesModal(false)}
              className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-xs font-heading font-bold tracking-[0.2em] text-[#22D3EE] uppercase">
              MEMORY BOOTH ARCHIVE
            </div>
            <h2 className="text-2xl font-heading font-bold text-white mt-1">
              {displayName}&apos;S PULSE//LIVE PHOTOS ({photos.length})
            </h2>

            <div className="mt-6">
              {photos.length === 0 ? (
                <div className="p-8 rounded-2xl bg-white/[0.03] border border-white/10 text-center text-xs text-zinc-400">
                  No photos captured yet. Click &ldquo;RETURN TO VENUE&rdquo; and press [P] or visit the
                  Memory Booth to frame your moment!
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {photos.map((p) => (
                    <div
                      key={p.id}
                      className="p-3 rounded-2xl bg-white/[0.04] border border-white/15"
                    >
                      <img
                        src={p.url}
                        alt="PULSE//LIVE Memory"
                        className="w-full h-44 object-cover rounded-xl"
                      />
                      <div className="mt-2 flex items-center justify-between text-xs text-zinc-300 font-heading">
                        <span>Filter: {p.filter}</span>
                        <a
                          href={p.url}
                          download={`PULSE-LIVE-2026-${p.id}.png`}
                          className="text-[#22D3EE] font-bold hover:underline"
                        >
                          Download PNG
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

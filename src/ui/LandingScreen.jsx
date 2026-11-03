import React, { useState } from 'react';
import { Play, Calendar, Radio, Users, X, Music, MapPin, ShieldCheck, Activity } from 'lucide-react';
import { CONCERT_CONFIG } from '../data/concert';
import { useConcertStore } from '../store/concertStore';
import { isSimulatedOnlineCount } from '../services/realtime';
import { audioManager } from '../core/AudioManager';

const LANDING_SIMULATED_FLAG = isSimulatedOnlineCount;

export function LandingScreen() {
  const [showEventDetails, setShowEventDetails] = useState(false);
  const onlineCount = useConcertStore((s) => s.onlineCount);
  const setScreen = useConcertStore((s) => s.setScreen);

  const handleEnterConcert = () => {
    audioManager.playUISound('click');
    setScreen('ticket');
  };

  const handleViewEvent = () => {
    audioManager.playUISound('click');
    setShowEventDetails(true);
  };

  const crowdLights = Array.from({ length: 72 }, (_, i) => ({
    id: i,
    left: `${4 + ((i * 19) % 92)}%`,
    bottom: `${6 + ((i * 13) % 22)}%`,
    color: ['#22D3EE', '#8B5CF6', '#EC4899', '#FACC15'][i % 4],
    delay: `${(i % 7) * 0.35}s`,
    size: i % 3 === 0 ? 5 : 3.5
  }));

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#070816] flex flex-col justify-between select-none">
      {/* =====================================================
          CITY OF SOUND ARCHITECTURAL STAGE & PULSE CORE BACKDROP
          ===================================================== */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 50% 42%, rgba(34, 211, 238, 0.2) 0%, rgba(139, 92, 246, 0.16) 34%, rgba(7, 8, 22, 0.98) 76%)'
          }}
        />

        {/* Sweeping Architectural Sound Beams */}
        <div
          className="absolute top-[16%] left-[30%] w-[2px] h-[65vh] origin-top animate-laser-left"
          style={{
            background: 'linear-gradient(to bottom, #22D3EE, rgba(34, 211, 238, 0))',
            boxShadow: '0 0 18px #22D3EE'
          }}
        />
        <div
          className="absolute top-[14%] left-[45%] w-[3px] h-[70vh] origin-top animate-laser-right"
          style={{
            background: 'linear-gradient(to bottom, #8B5CF6, rgba(139, 92, 246, 0))',
            boxShadow: '0 0 22px #8B5CF6'
          }}
        />
        <div
          className="absolute top-[14%] right-[45%] w-[3px] h-[70vh] origin-top animate-laser-left"
          style={{
            background: 'linear-gradient(to bottom, #EC4899, rgba(236, 72, 153, 0))',
            boxShadow: '0 0 22px #EC4899'
          }}
        />
        <div
          className="absolute top-[16%] right-[30%] w-[2px] h-[65vh] origin-top animate-laser-right"
          style={{
            background: 'linear-gradient(to bottom, #22D3EE, rgba(34, 211, 238, 0))',
            boxShadow: '0 0 18px #22D3EE'
          }}
        />

        {/* Distant Architectural Stage & Signature PULSE CORE Ring */}
        <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2 w-[560px] max-w-[92vw] h-[180px] flex items-end justify-center gap-3 opacity-85">
          <div className="w-20 h-24 rounded-md border border-[#22D3EE]/40 bg-gradient-to-br from-[#22D3EE]/25 to-[#070816] transform -skew-y-6" />
          <div className="w-72 h-40 rounded-xl border border-[#22D3EE]/50 bg-[#070816]/90 flex flex-col items-center justify-center shadow-[0_0_60px_rgba(34,211,238,0.35)] relative overflow-hidden">
            {/* Signature PULSE CORE Energy Ring Silhouette */}
            <div className="w-28 h-28 rounded-full border-4 border-[#22D3EE] shadow-[0_0_30px_#22D3EE] flex items-center justify-center animate-pulse">
              <div className="w-20 h-20 rounded-full border-2 border-[#EC4899] flex items-center justify-center">
                <Activity className="w-7 h-7 text-[#22D3EE]" />
              </div>
            </div>
          </div>
          <div className="w-20 h-24 rounded-md border border-[#EC4899]/40 bg-gradient-to-bl from-[#EC4899]/25 to-[#070816] transform skew-y-6" />
        </div>

        {/* Distant Crowd & Sea of Pulse Lights */}
        <div className="absolute inset-x-0 bottom-0 h-[30vh] bg-gradient-to-t from-[#070816] via-[#070816]/90 to-transparent">
          {crowdLights.map((dot) => (
            <span
              key={dot.id}
              className="absolute rounded-full animate-pulse"
              style={{
                left: dot.left,
                bottom: dot.bottom,
                width: `${dot.size}px`,
                height: `${dot.size}px`,
                backgroundColor: dot.color,
                boxShadow: `0 0 10px ${dot.color}, 0 0 20px ${dot.color}`,
                animationDelay: dot.delay
              }}
            />
          ))}
        </div>

        <div className="absolute inset-0 bg-gradient-to-b from-[#070816]/80 via-[#070816]/45 to-[#070816]/95" />
      </div>

      {/* =====================================================
          TOP HEADER BAR (PULSE//LIVE 2026)
          ===================================================== */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-7 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#22D3EE] via-[#8B5CF6] to-[#EC4899] flex items-center justify-center shadow-[0_0_25px_rgba(34,211,238,0.45)] border border-white/20">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-heading font-bold text-xl leading-none tracking-wider text-white">
              PULSE<span className="text-[#22D3EE]">//</span>LIVE 2026
            </div>
            <div className="text-[10px] font-heading tracking-[0.28em] text-[#A1A1AA] mt-1">
              CITY OF SOUND · {CONCERT_CONFIG.tag}
            </div>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 glass-pill px-4 py-1.5 text-xs text-zinc-300">
          <span className="w-2 h-2 rounded-full bg-[#22D3EE] animate-ping" />
          <span className="w-2 h-2 rounded-full bg-[#22D3EE] -ml-3.5" />
          <span className="font-heading tracking-wider text-white font-semibold">
            CITY OF SOUND // SECTOR 01
          </span>
        </div>
      </header>

      {/* =====================================================
          CENTER HERO CONTENT
          ===================================================== */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/15 backdrop-blur-md mb-6">
          <Radio className="w-3.5 h-3.5 text-[#22D3EE] animate-pulse" />
          <span className="text-[11px] font-heading font-semibold tracking-[0.25em] text-zinc-200 uppercase">
            PULSE//LIVE 2026 · CITY OF SOUND
          </span>
        </div>

        <h1 className="font-heading font-bold text-4xl sm:text-6xl md:text-7xl tracking-tight leading-[1.06] text-white">
          <span className="block">FEEL THE SOUND.</span>
          <span className="block bg-gradient-to-r from-[#22D3EE] via-[#8B5CF6] to-[#EC4899] bg-clip-text text-transparent">
            BECOME THE SHOW.
          </span>
        </h1>

        <p className="mt-5 text-base sm:text-lg text-[#A1A1AA] max-w-2xl font-normal">
          {CONCERT_CONFIG.heroSubtitle}
        </p>

        {/* Primary & Secondary CTAs */}
        <div className="mt-9 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <button
            onClick={handleEnterConcert}
            onMouseEnter={() => audioManager.playUISound('hover')}
            className="w-full sm:w-auto px-9 py-4 rounded-2xl bg-gradient-to-r from-[#22D3EE] via-[#8B5CF6] to-[#EC4899] hover:brightness-110 active:scale-[0.99] text-white font-heading font-bold text-sm tracking-[0.18em] shadow-[0_0_35px_rgba(34,211,238,0.45)] border border-white/25 transition-all flex items-center justify-center gap-3 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>ENTER CONCERT</span>
          </button>

          <button
            onClick={handleViewEvent}
            onMouseEnter={() => audioManager.playUISound('hover')}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl glass-panel-sm hover:bg-white/10 active:scale-[0.99] text-white font-heading font-semibold text-sm tracking-[0.18em] transition-all flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-[#22D3EE]" />
            <span>VIEW EVENT</span>
          </button>
        </div>
      </main>

      {/* =====================================================
          BOTTOM LIVE STATUS BAR
          ===================================================== */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 pb-7">
        <div className="glass-panel px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div>
              <div className="text-[11px] font-heading tracking-[0.2em] text-[#A1A1AA]">
                DATE & TIME
              </div>
              <div className="text-sm sm:text-base font-heading font-bold text-white mt-0.5">
                {CONCERT_CONFIG.date} <span className="text-[#22D3EE] mx-1.5">·</span>{' '}
                {CONCERT_CONFIG.showTime}
              </div>
            </div>

            <div className="h-8 w-[1px] bg-white/10 hidden sm:block" />

            <div className="hidden md:block">
              <div className="text-[11px] font-heading tracking-[0.2em] text-[#A1A1AA]">
                HEADLINER
              </div>
              <div className="text-sm sm:text-base font-heading font-bold text-white mt-0.5">
                {CONCERT_CONFIG.artist.name}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EC4899]/15 border border-[#EC4899]/40">
              <span className="w-2 h-2 rounded-full bg-[#EC4899] animate-ping" />
              <span className="text-xs font-heading font-bold tracking-widest text-[#EC4899]">
                LIVE EVENT
              </span>
            </div>

            <div
              className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10"
              data-simulated-online={String(LANDING_SIMULATED_FLAG)}
            >
              <Users className="w-4 h-4 text-[#22D3EE]" />
              <span className="text-xs sm:text-sm font-heading font-bold text-white tracking-wider">
                {onlineCount.toLocaleString()} FANS ONLINE
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* VIEW EVENT BRIEFING MODAL */}
      {showEventDetails && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel max-w-2xl w-full p-6 sm:p-8 max-h-[88vh] overflow-y-auto relative border border-white/20">
            <button
              onClick={() => setShowEventDetails(false)}
              className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-xs font-heading tracking-[0.25em] text-[#22D3EE] uppercase">
              CITY OF SOUND // BRIEFING
            </div>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-white mt-1">
              {CONCERT_CONFIG.concertName} — {CONCERT_CONFIG.venue}
            </h2>
            <p className="text-sm text-[#A1A1AA] mt-2">{CONCERT_CONFIG.artist.bio.en}</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                <Music className="w-4 h-4 text-[#22D3EE] mb-1.5" />
                <div className="text-xs font-heading font-bold text-white">MASTER AUDIO CLOCK</div>
                <div className="text-[11px] text-zinc-400 mt-0.5">
                  Pulse Core & 5-pattern Pulse Wave synced to audio.currentTime
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                <MapPin className="w-4 h-4 text-[#EC4899] mb-1.5" />
                <div className="text-xs font-heading font-bold text-white">11 SOUND ZONES</div>
                <div className="text-[11px] text-zinc-400 mt-0.5">
                  Pulse Plaza, Merch Lab, Memory Booth, B-Stage, Main Arena
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                <ShieldCheck className="w-4 h-4 text-[#FACC15] mb-1.5" />
                <div className="text-xs font-heading font-bold text-white">STUDIO CREATOR</div>
                <div className="text-[11px] text-zinc-400 mt-0.5">
                  Import custom MP3/WAV/OGG & Local Media Lab included
                </div>
              </div>
            </div>

            <div className="mt-7 flex justify-end gap-3">
              <button
                onClick={() => setShowEventDetails(false)}
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-heading font-semibold tracking-wider text-white cursor-pointer"
              >
                CLOSE
              </button>
              <button
                onClick={() => {
                  setShowEventDetails(false);
                  handleEnterConcert();
                }}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#22D3EE] to-[#8B5CF6] text-xs font-heading font-bold tracking-wider text-[#070816] cursor-pointer"
              >
                CLAIM DIGITAL TICKET →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

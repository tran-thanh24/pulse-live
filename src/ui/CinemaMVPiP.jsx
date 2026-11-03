import React, { useState, useEffect } from 'react';
import { Video, Maximize2, Minimize2, X, Volume2, VolumeX, Sparkles, ExternalLink } from 'lucide-react';
import { useConcertStore } from '../store/concertStore';
import { audioManager } from '../core/AudioManager';

export function CinemaMVPiP() {
  const currentTrack = useConcertStore((s) => s.currentTrack);
  const cinemaMvOpen = useConcertStore((s) => s.cinemaMvOpen ?? true);
  const setCinemaMvOpen = useConcertStore((s) => s.setCinemaMvOpen);

  const [isMinimized, setIsMinimized] = useState(false);
  const [sizeMode, setSizeMode] = useState('normal'); // 'compact' | 'normal' | 'theater'
  const [isMuted, setIsMuted] = useState(true);

  // Keyboard shortcut: 'V' toggles Cinema MV
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'v' || e.key === 'V') {
        e.preventDefault();
        try {
          audioManager.playUISound('click');
        } catch {}
        setCinemaMvOpen(!cinemaMvOpen);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cinemaMvOpen, setCinemaMvOpen]);

  if (!cinemaMvOpen) return null;

  const videoId = currentTrack?.youtubeVideoId || 'e2OpbOv_JiQ';
  const trackTitle = currentTrack?.title || 'What You Want';
  const trackArtist = currentTrack?.artist || 'CORTIS';

  const sizeClasses = {
    compact: 'w-[280px] sm:w-[320px] h-[160px] sm:h-[180px]',
    normal: 'w-[320px] sm:w-[390px] h-[180px] sm:h-[220px]',
    theater: 'w-[420px] sm:w-[540px] h-[236px] sm:h-[304px]'
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-20 right-4 z-40 pointer-events-auto select-none">
        <button
          onClick={() => {
            try {
              audioManager.playUISound('click');
            } catch {}
            setIsMinimized(false);
          }}
          className="glass-panel px-3.5 py-2 border border-[#EC4899]/50 hover:border-[#EC4899] text-white flex items-center gap-2 shadow-[0_0_25px_rgba(236,72,153,0.35)] transition cursor-pointer group animate-float-slow"
        >
          <span className="w-2 h-2 rounded-full bg-[#EC4899] animate-ping" />
          <Video className="w-4 h-4 text-[#EC4899]" />
          <span className="text-xs font-heading font-bold tracking-wider">
            CINEMA MV · {trackTitle.toUpperCase()}
          </span>
          <span className="text-[10px] text-zinc-400 group-hover:text-white">[EXPAND]</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-20 sm:bottom-22 right-3 sm:right-6 z-40 pointer-events-auto select-none transition-all duration-300">
      <div className="glass-panel overflow-hidden border border-[#EC4899]/40 shadow-[0_15px_45px_rgba(0,0,0,0.85)] flex flex-col">
        {/* Top Header Bar */}
        <div className="px-3 py-1.5 bg-gradient-to-r from-[#070816]/95 via-[#130D2E]/90 to-[#070816]/95 border-b border-white/10 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-[#EC4899] animate-pulse shrink-0" />
            <span className="text-[11px] font-heading font-bold text-white tracking-wider truncate">
              {trackTitle.toUpperCase()} — {trackArtist}
            </span>
            <span className="px-1.5 py-0.2 rounded bg-[#EC4899]/20 text-[9px] font-heading font-bold text-[#EC4899] uppercase tracking-wider shrink-0">
              MV
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* Toggle Size */}
            <button
              onClick={() => {
                try {
                  audioManager.playUISound('click');
                } catch {}
                setSizeMode((prev) =>
                  prev === 'compact' ? 'normal' : prev === 'normal' ? 'theater' : 'compact'
                );
              }}
              className="p-1 rounded text-zinc-400 hover:text-white transition cursor-pointer"
              title="Change Player Size"
            >
              {sizeMode === 'theater' ? (
                <Minimize2 className="w-3.5 h-3.5" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5" />
              )}
            </button>

            {/* Minimize */}
            <button
              onClick={() => {
                try {
                  audioManager.playUISound('click');
                } catch {}
                setIsMinimized(true);
              }}
              className="p-1 rounded text-zinc-400 hover:text-white transition cursor-pointer"
              title="Minimize to floating pill"
            >
              <Minimize2 className="w-3.5 h-3.5" />
            </button>

            {/* Close */}
            <button
              onClick={() => {
                try {
                  audioManager.playUISound('click');
                } catch {}
                setCinemaMvOpen(false);
              }}
              className="p-1 rounded text-zinc-400 hover:text-red-400 transition cursor-pointer"
              title="Close Cinema MV [V]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 16:9 YouTube Iframe Container */}
        <div className={`relative bg-black ${sizeClasses[sizeMode]} transition-all duration-300`}>
          <iframe
            key={videoId}
            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=${isMuted ? '1' : '0'}&controls=1&playsinline=1&modestbranding=1&rel=0`}
            title={`CORTIS - ${trackTitle} Official MV`}
            className="w-full h-full border-none"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        {/* Subtle Footer Bar */}
        <div className="px-3 py-1 bg-[#070816]/90 border-t border-white/5 flex items-center justify-between text-[10px] text-zinc-400 font-heading">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-[#22D3EE]" />
            <span>Master Audio via Stadium PA · Synced</span>
          </div>

          <button
            onClick={() => {
              setIsMuted(!isMuted);
            }}
            className="inline-flex items-center gap-1 text-[#22D3EE] hover:underline cursor-pointer"
            title={isMuted ? 'Unmute video audio' : 'Mute video audio'}
          >
            {isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
            <span>{isMuted ? 'MV SOUND MUTED' : 'MV SOUND ON'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}


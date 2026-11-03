import React, { useState } from 'react';
import { QrCode, CheckCircle2, Activity, ArrowLeft, Ticket, ShieldCheck, Crown } from 'lucide-react';
import { useUserStore } from '../store/userStore';
import { useConcertStore } from '../store/concertStore';
import { audioManager } from '../core/AudioManager';

export function TicketScreen() {
  const ticket = useUserStore((s) => s.ticket);
  const setTicketTier = useUserStore((s) => s.setTicketTier);
  const checkInTicket = useUserStore((s) => s.checkInTicket);
  const setScreen = useConcertStore((s) => s.setScreen);

  const [scanState, setScanState] = useState(ticket?.checkedIn ? 'success' : 'idle');
  const currentTier = String(ticket?.tier || 'VIP').toUpperCase();

  const handleCheckIn = () => {
    if (scanState === 'scanning') return;
    if (scanState === 'success') {
      audioManager.playUISound('click');
      setScreen('avatar');
      return;
    }

    setScanState('scanning');
    audioManager.playTicketScan();

    setTimeout(() => {
      checkInTicket();
      setScanState('success');
      setTimeout(() => {
        setScreen('avatar');
      }, 1100);
    }, 1200);
  };

  return (
    <div className="relative w-full h-full bg-[#070816] flex flex-col items-center justify-center p-4 sm:p-6 overflow-y-auto select-none">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 50% 45%, rgba(34, 211, 238, 0.2) 0%, rgba(139, 92, 246, 0.12) 40%, rgba(7, 8, 22, 0.98) 80%)'
        }}
      />

      <div className="relative z-10 w-full max-w-md mb-4 flex items-center justify-between">
        <button
          onClick={() => {
            audioManager.playUISound('click');
            setScreen('landing');
          }}
          className="inline-flex items-center gap-2 text-xs font-heading tracking-wider text-[#A1A1AA] hover:text-white transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>BACK TO LOBBY</span>
        </button>

        <span className="text-[11px] font-heading tracking-[0.2em] text-[#22D3EE] uppercase">
          STEP 1 OF 2 · DIGITAL TICKET
        </span>
      </div>

      <div className="relative z-10 w-full max-w-md glass-panel overflow-hidden border border-white/20 shadow-[0_25px_70px_rgba(0,0,0,0.75)]">
        <div className="p-6 bg-gradient-to-r from-[#22D3EE]/30 via-[#8B5CF6]/25 to-[#EC4899]/25 border-b border-white/15 relative">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#070816]/60 border border-white/15 text-[10px] font-heading font-bold tracking-[0.22em] text-[#22D3EE]">
              <Ticket className="w-3.5 h-3.5" />
              <span>{currentTier === 'VIP' ? 'VIP SOUND PASS' : 'GENERAL SOUND PASS'}</span>
            </div>
            <Activity className="w-5 h-5 text-[#22D3EE]" />
          </div>

          <h1 className="mt-4 font-heading font-bold text-2xl sm:text-3xl tracking-wider text-white">
            PULSE//LIVE 2026
          </h1>
          <div className="mt-1 text-xs font-heading font-semibold tracking-[0.25em] text-[#22D3EE]">
            FEEL THE SOUND. BECOME THE SHOW.
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* ACCESS CONTROL TIER SELECTOR: GENERAL vs VIP */}
          <div>
            <div className="text-[10px] font-heading font-bold tracking-[0.2em] text-[#A1A1AA] uppercase mb-2">
              SELECT TICKET TIER (ACCESS CONTROL)
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  audioManager.playUISound('click');
                  setTicketTier('VIP');
                }}
                className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-center gap-2.5 ${
                  currentTier === 'VIP'
                    ? 'bg-[#FACC15]/15 border-[#FACC15] text-white shadow-[0_0_20px_rgba(250,204,21,0.2)]'
                    : 'bg-white/[0.03] border-white/10 text-[#A1A1AA] hover:text-white'
                }`}
              >
                <Crown className="w-4 h-4 text-[#FACC15] shrink-0" />
                <div>
                  <div className="text-xs font-heading font-bold tracking-wider">VIP PASS</div>
                  <div className="text-[10px] opacity-80">Unlocks VIP Terrace + GA</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  audioManager.playUISound('click');
                  setTicketTier('GENERAL');
                }}
                className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-center gap-2.5 ${
                  currentTier === 'GENERAL'
                    ? 'bg-[#22D3EE]/15 border-[#22D3EE] text-white shadow-[0_0_20px_rgba(34,211,238,0.2)]'
                    : 'bg-white/[0.03] border-white/10 text-[#A1A1AA] hover:text-white'
                }`}
              >
                <Ticket className="w-4 h-4 text-[#22D3EE] shrink-0" />
                <div>
                  <div className="text-xs font-heading font-bold tracking-wider">GENERAL (GA)</div>
                  <div className="text-[10px] opacity-80">GA Floor & Plaza Only</div>
                </div>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 bg-white/[0.04] p-4 rounded-2xl border border-white/10">
            <div>
              <div className="text-[10px] font-heading tracking-[0.18em] text-[#A1A1AA] uppercase">
                Gate
              </div>
              <div className="text-lg font-heading font-bold text-white mt-0.5">
                {currentTier === 'VIP' ? 'VIP GATE' : 'SECTOR A'}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-heading tracking-[0.18em] text-[#A1A1AA] uppercase">
                Zone
              </div>
              <div className="text-sm sm:text-base font-heading font-bold text-[#22D3EE] mt-1">
                {currentTier === 'VIP' ? 'VIP + GA' : 'GA STANDING'}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-heading tracking-[0.18em] text-[#A1A1AA] uppercase">
                Access
              </div>
              <div className="text-xs sm:text-sm font-heading font-bold text-white mt-1.5">
                {currentTier === 'VIP' ? 'VIP TERRACE' : 'ARENA FLOOR'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-left">
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
              <div className="text-[10px] font-heading tracking-wider text-[#A1A1AA] uppercase">
                Date
              </div>
              <div className="text-sm font-heading font-bold text-white mt-1">
                {ticket?.date || '03.11.2026'}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
              <div className="text-[10px] font-heading tracking-wider text-[#A1A1AA] uppercase">
                Doors
              </div>
              <div className="text-sm font-heading font-bold text-white mt-1">
                {ticket?.gateOpen || '19:00'}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
              <div className="text-[10px] font-heading tracking-wider text-[#A1A1AA] uppercase">
                Show
              </div>
              <div className="text-sm font-heading font-bold text-[#FACC15] mt-1">
                {ticket?.showTime || '20:00'}
              </div>
            </div>
          </div>

          <div className="relative py-2 flex items-center">
            <div className="w-5 h-5 rounded-full bg-[#070816] -ml-8 border-r border-white/15" />
            <div className="flex-1 border-t-2 border-dashed border-white/15 mx-2" />
            <div className="w-5 h-5 rounded-full bg-[#070816] -mr-8 border-l border-white/15" />
          </div>

          <div className="relative rounded-2xl bg-[#070816]/90 border border-white/15 p-4 flex flex-col items-center justify-center overflow-hidden">
            {scanState === 'scanning' && (
              <div
                className="absolute inset-x-0 h-8 bg-gradient-to-b from-transparent via-[#22D3EE]/50 to-[#22D3EE] border-b-2 border-[#22D3EE] animate-scanline pointer-events-none z-20"
                style={{ boxShadow: '0 0 24px #22D3EE' }}
              />
            )}

            <div className="flex items-center gap-4 w-full justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-white text-[#070816]">
                  <QrCode className="w-11 h-11" />
                </div>
                <div>
                  <div className="text-[10px] font-heading tracking-[0.2em] text-[#A1A1AA]">
                    TICKET ID
                  </div>
                  <div className="text-sm sm:text-base font-heading font-bold tracking-widest text-white mt-0.5">
                    {ticket?.ticketId || 'PL26-8842SOUND'}
                  </div>
                  <div className="inline-flex items-center gap-1 text-[11px] text-[#22D3EE] mt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>VERIFIED {currentTier} PASS</span>
                  </div>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-[3px] h-12 opacity-80">
                {[3, 1, 4, 2, 1, 3, 2, 4, 1, 2, 3, 1, 2].map((w, idx) => (
                  <div
                    key={idx}
                    className="h-full bg-white rounded-full"
                    style={{ width: `${w * 1.5}px` }}
                  />
                ))}
              </div>
            </div>

            {scanState === 'success' && (
              <div className="mt-4 w-full p-3 rounded-xl bg-emerald-500/15 border border-emerald-400/40 flex items-center gap-3 text-left">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                <div>
                  <div className="text-xs font-heading font-bold tracking-wider text-emerald-300">
                    CHECK-IN SUCCESSFUL
                  </div>
                  <div className="text-xs text-white/90">
                    Welcome to PULSE//LIVE 2026.
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleCheckIn}
            disabled={scanState === 'scanning'}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#22D3EE] via-[#8B5CF6] to-[#EC4899] hover:brightness-110 active:scale-[0.99] text-white font-heading font-bold text-sm tracking-[0.22em] shadow-[0_0_30px_rgba(34,211,238,0.45)] transition-all cursor-pointer disabled:opacity-60"
          >
            {scanState === 'idle' && 'CHECK IN'}
            {scanState === 'scanning' && 'SCANNING TICKET...'}
            {scanState === 'success' && 'CREATE AVATAR →'}
          </button>
        </div>
      </div>
    </div>
  );
}

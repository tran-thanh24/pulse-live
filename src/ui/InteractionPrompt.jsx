import React from 'react';
import { useConcertStore } from '../store/concertStore';
import { useUserStore } from '../store/userStore';
import { interactionSystem } from '../systems/InteractionSystem';

/**
 * InteractionPrompt: Bottom-Center contextual prompt when near a booth or stage zone
 */
export function InteractionPrompt() {
  const activeZone = useConcertStore((s) => s.activeZone);
  const activeModal = useConcertStore((s) => s.activeModal);
  const language = useUserStore((s) => s.settings.language);

  if (!activeZone || activeModal) return null;

  const zoneName = language === 'vi' ? activeZone.nameVi : activeZone.name;
  const actionLabel =
    language === 'vi' ? activeZone.interactionLabelVi : activeZone.interactionLabel;

  const handleInteractClick = () => {
    interactionSystem.triggerZoneAction(
      activeZone,
      useConcertStore.getState(),
      useUserStore.getState()
    );
  };

  return (
    <div className="pointer-events-auto flex flex-col items-center animate-float-slow select-none">
      <button
        onClick={handleInteractClick}
        className="glass-pill px-5 py-2.5 flex items-center gap-3 border border-white/25 hover:border-[#22D3EE] hover:bg-white/10 transition shadow-[0_0_30px_rgba(0,0,0,0.65)] cursor-pointer group"
      >
        <span
          className="w-7 h-7 rounded-lg flex items-center justify-center font-heading font-bold text-xs text-[#070816] shadow-md transition-transform group-hover:scale-105"
          style={{ backgroundColor: activeZone.color || '#22D3EE' }}
        >
          E
        </span>
        <div className="text-left">
          <div className="text-[10px] font-heading font-bold tracking-[0.2em] text-[#22D3EE] uppercase">
            {zoneName}
          </div>
          <div className="text-xs sm:text-sm font-heading font-semibold text-white">
            {actionLabel}
          </div>
        </div>
      </button>
    </div>
  );
}


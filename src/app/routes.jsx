import React from 'react';
import { useConcertStore } from '../store/concertStore';
import { LandingScreen } from '../ui/LandingScreen';
import { TicketScreen } from '../ui/TicketScreen';
import { AvatarCreator } from '../ui/AvatarCreator';
import { SceneManager } from '../core/SceneManager';
import { HUD } from '../ui/HUD';
import { StudioPanel } from '../ui/StudioPanel';
import { ConcertSchedule } from '../ui/ConcertSchedule';
import { PhotoMode } from '../ui/PhotoMode';
import { SettingsPanel } from '../ui/SettingsPanel';
import { EndConcertScreen } from '../ui/EndConcertScreen';

export function AppRoutes() {
  const currentScreen = useConcertStore((s) => s.currentScreen);

  if (currentScreen === 'landing') {
    return <LandingScreen />;
  }

  if (currentScreen === 'ticket') {
    return <TicketScreen />;
  }

  if (currentScreen === 'avatar') {
    return <AvatarCreator />;
  }

  if (currentScreen === 'end') {
    return <EndConcertScreen />;
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#070816]">
      <SceneManager />
      <HUD />
      <StudioPanel />
      <ConcertSchedule />
      <PhotoMode />
      <SettingsPanel />
    </div>
  );
}

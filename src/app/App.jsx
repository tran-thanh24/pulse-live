import React, { useEffect } from 'react';
import { AppRoutes } from './routes';
import { presenceService } from '../services/realtime';
import { useConcertStore } from '../store/concertStore';
import { useUserStore } from '../store/userStore';
import { audioManager } from '../core/AudioManager';
import { musicEngine } from '../core/MusicEngine';

export function App() {
  const setOnlineCount = useConcertStore((s) => s.setOnlineCount);
  const settings = useUserStore((s) => s.settings);

  useEffect(() => {
    const unsubscribe = presenceService.subscribe((event) => {
      if (event.type === 'PRESENCE_UPDATE') {
        setOnlineCount(event.onlineCount);
      }
    });
    return () => unsubscribe();
  }, [setOnlineCount]);

  useEffect(() => {
    audioManager.updateVolumes({
      musicVolume: settings.musicVolume,
      sfxVolume: settings.sfxVolume,
      musicEnabled: settings.musicEnabled,
      sfxEnabled: settings.sfxEnabled
    });
    musicEngine.updateVolumes({
      musicVolume: settings.musicVolume,
      crowdVolume: settings.crowdVolume ?? 0.55,
      sfxVolume: settings.sfxVolume,
      musicEnabled: settings.musicEnabled,
      sfxEnabled: settings.sfxEnabled
    });
  }, [settings]);

  return (
    <div className="w-screen h-screen overflow-hidden bg-[#070816] text-white">
      <AppRoutes />
    </div>
  );
}

export default App;

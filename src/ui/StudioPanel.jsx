import React, { useEffect, useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Upload,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Sliders,
  Video,
  Camera,
  Sparkles,
  Users,
  Activity,
  X,
  ListMusic,
  Navigation,
  Square,
  Repeat
} from 'lucide-react';
import { useConcertStore } from '../store/concertStore';
import { useUserStore } from '../store/userStore';
import { musicEngine } from '../core/MusicEngine';
import { concertTimeline } from '../systems/ConcertTimeline';
import { showDirector } from '../systems/ShowDirector';
import { setlistManager } from '../systems/SetlistManager';
import { stageNavigationSystem } from '../systems/StageNavigationSystem';
import {
  ledMediaManager,
  LED_CHANNELS,
  BUILTIN_VIDEO_CLIPS
} from '../systems/LEDMediaManager';
import { StudioLEDControl } from './StudioLEDControl';
import { CAMERA_PRESETS } from '../systems/CameraDirector';
import { PULSE_WAVE_PATTERNS } from '../systems/LightstickSystem';
import { eventBus } from '../core/EventBus';
import { animationRegistry } from '../characters/AnimationRegistry';
import { danceController } from '../characters/DanceController';
import { CORTIS_MEMBERS } from '../data/artists';

/**
 * StudioPanel: Operator & Creator Console for PULSE//LIVE 2026
 * Includes:
 * 1. MUSIC LIBRARY & SETLIST MANAGER (Add/Remove/Reorder/Play/Pause/Next/Prev, Local MP3/WAV/OGG Import with Title/Artist/BPM edit & Add to Setlist, Waveform & Cue Editor)
 * 2. LED VIDEO ENGINE (5 Independent Channels: MAIN_LED, LEFT_LED, RIGHT_LED, PULSE_CORE, B_STAGE_LED with Local MP4/WebM load, Play/Pause/Stop/Loop/Seek, FitMode COVER|CONTAIN|STRETCH, Brightness, Live Camera Feed)
 * 3. STAGE, ARTIST & FX (Lighting Scenes, FX, Pulse Core, Artist Cast Size, Stage Navigation System across MAIN_STAGE, RUNWAY, B_STAGE, BACKSTAGE)
 * 4. CAMERA & CROWD (10 Broadcast Angles + Pulse Wave Patterns)
 */
export function StudioPanel() {
  const studioMode = useConcertStore((s) => s.studioMode);
  const setStudioMode = useConcertStore((s) => s.setStudioMode);

  const currentTrack = useConcertStore((s) => s.currentTrack);
  const concertTime = useConcertStore((s) => s.concertTime);
  const isConcertPlaying = useConcertStore((s) => s.isConcertPlaying);
  const audioAnalysis = useConcertStore((s) => s.audioAnalysis);

  const lightingScene = useConcertStore((s) => s.lightingScene);
  const setLightingScene = useConcertStore((s) => s.setLightingScene);
  const fxState = useConcertStore((s) => s.fxState);
  const triggerFX = useConcertStore((s) => s.triggerFX);

  const ledSceneType = useConcertStore((s) => s.ledSceneType);
  const setLedSceneType = useConcertStore((s) => s.setLedSceneType);
  const ledCustomText = useConcertStore((s) => s.ledCustomText);
  const setLedCustomText = useConcertStore((s) => s.setLedCustomText);

  const pulseCoreVisible = useConcertStore((s) => s.pulseCoreVisible);
  const setPulseCoreVisible = useConcertStore((s) => s.setPulseCoreVisible);
  const pulseCoreOverload = useConcertStore((s) => s.pulseCoreOverload);
  const setPulseCoreOverload = useConcertStore((s) => s.setPulseCoreOverload);

  const castMode = useConcertStore((s) => s.castMode);
  const setCastMode = useConcertStore((s) => s.setCastMode);
  const artistAnimation = useConcertStore((s) => s.artistAnimation);
  const setArtistAnimation = useConcertStore((s) => s.setArtistAnimation);

  const autoCamera = useConcertStore((s) => s.autoCamera);
  const setAutoCamera = useConcertStore((s) => s.setAutoCamera);
  const cameraMode = useConcertStore((s) => s.cameraMode);
  const setCameraMode = useConcertStore((s) => s.setCameraMode);

  const triggerPulseWave = useConcertStore((s) => s.triggerPulseWave);
  const stopPulseWave = useConcertStore((s) => s.stopPulseWave);
  const setCrowdBehaviorOverride = useConcertStore((s) => s.setCrowdBehaviorOverride);

  const showInfoToast = useUserStore((s) => s.showInfoToast);

  const [activeTab, setActiveTab] = useState('MUSIC');
  const [cues, setCues] = useState(() => concertTimeline.cues);
  const [newCueType, setNewCueType] = useState('scene');
  const [newCueValue, setNewCueValue] = useState('DROP');
  const [energySlider, setEnergySlider] = useState('');

  // Music Library & Setlist state
  const [libraryTracks, setLibraryTracks] = useState(() => [...musicEngine.tracks]);
  const [setlistState, setSetlistState] = useState(() => setlistManager.getState());
  const [importTitle, setImportTitle] = useState('');
  const [importArtist, setImportArtist] = useState('PULSE COLLECTIVE');
  const [importBpm, setImportBpm] = useState(128);
  const [lastImportedTrackId, setLastImportedTrackId] = useState(null);

  // LED Video Engine state
  const [selectedLedChannel, setSelectedLedChannel] = useState('MAIN_LED');
  const [ledChannelsState, setLedChannelsState] = useState(() =>
    ledMediaManager.getChannelStates()
  );

  // Artist Stage Navigation state
  const [artistTargetZone, setArtistTargetZone] = useState(
    () => stageNavigationSystem.currentTargetZone
  );

  // Character Action Studio state
  const [actionRole, setActionRole] = useState('ARTIST'); // 'PLAYER' | 'ARTIST' | 'CROWD'
  const [selectedArtistAction, setSelectedArtistAction] = useState('DANCE_KPOP');
  const [selectedCrowdAction, setSelectedCrowdAction] = useState('dance_jump');
  const [crowdIntensity, setCrowdIntensity] = useState(70);

  useEffect(() => {
    const unsubLoaded = eventBus.on('timeline:loaded', ({ cues: loaded }) =>
      setCues([...loaded])
    );
    const unsubUpdated = eventBus.on('timeline:updated', ({ cues: updated }) =>
      setCues([...updated])
    );
    const unsubLib = eventBus.on('music:libraryUpdated', ({ tracks }) =>
      setLibraryTracks([...tracks])
    );
    const unsubSetlist = setlistManager.subscribe((st) => setSetlistState(st));
    const unsubLed = ledMediaManager.subscribe((st) => setLedChannelsState(st));
    const unsubArtistZone = eventBus.on('artist:zoneChanged', ({ targetZone }) =>
      setArtistTargetZone(targetZone)
    );

    return () => {
      unsubLoaded();
      unsubUpdated();
      unsubLib();
      unsubSetlist();
      unsubLed();
      unsubArtistZone();
    };
  }, []);

  if (!studioMode) return null;

  const duration = musicEngine.getDuration();
  const peaks = musicEngine.waveformPeaks || [];
  const activeChannelObj =
    ledChannelsState[selectedLedChannel] || ledChannelsState.MAIN_LED;

  const handleAudioUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const defaultTitle = importTitle.trim() || file.name.replace(/\.[^/.]+$/, '');
    const customTrack = await musicEngine.importLocalAudioFile(file, {
      title: defaultTitle,
      artist: importArtist || 'LOCAL STUDIO ARTIST',
      bpm: Number(importBpm) || 128
    });
    useConcertStore.getState().setCurrentTrack(customTrack);
    setImportTitle(customTrack.title);
    setImportArtist(customTrack.artist);
    setImportBpm(customTrack.bpm);
    setLastImportedTrackId(customTrack.id);
    showInfoToast(
      'LOCAL AUDIO IMPORTED 🎵',
      `"${customTrack.title}" (${customTrack.bpm} BPM) loaded into Music Library.`,
      '#22D3EE'
    );
  };

  const handleSaveTrackMeta = () => {
    const targetId = lastImportedTrackId || currentTrack?.id;
    if (!targetId) return;
    const updated = musicEngine.updateTrackMetadata(targetId, {
      title: importTitle || currentTrack?.title,
      artist: importArtist || currentTrack?.artist,
      bpm: Number(importBpm) || 128
    });
    useConcertStore.getState().setCurrentTrack(updated);
    showInfoToast('TRACK METADATA UPDATED', `Saved ${updated.title} (${updated.bpm} BPM)`);
  };

  const handleLedVideoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    ledMediaManager.loadLocalVideoFile(selectedLedChannel, file);
    showInfoToast(
      `LOCAL VIDEO LOADED (${selectedLedChannel})`,
      'LOCAL VIDEO — This media stays on your device.',
      '#22D3EE'
    );
  };

  const handleAddCueAtCurrentTime = () => {
    const added = concertTimeline.addCue({
      time: Number(concertTime.toFixed(1)),
      type: newCueType,
      value: newCueValue
    });
    showInfoToast(
      'TIMELINE CUE ADDED',
      `@${added.time}s → ${added.type.toUpperCase()}: ${added.value}`,
      '#8B5CF6'
    );
  };

  return (
    <div className="fixed top-20 right-4 z-40 w-[390px] sm:w-[450px] max-h-[calc(100vh-120px)] glass-panel border border-cyan-400/30 shadow-[0_24px_80px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden pointer-events-auto select-none">
      {/* Studio Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-[#22D3EE]/20 via-[#8B5CF6]/20 to-[#EC4899]/20 border-b border-white/15 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[#22D3EE]" />
          <div>
            <div className="text-xs font-heading font-bold tracking-[0.2em] text-white">
              PULSE // STUDIO DIRECTOR
            </div>
            <div className="text-[10px] text-[#22D3EE]">
              MASTER CLOCK · SETLIST · LED VIDEO · STAGE NAV
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => useConcertStore.getState().setDevMode(!useConcertStore.getState().devMode)}
            className="px-2 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-[10px] font-heading font-bold text-cyan-300 transition cursor-pointer flex items-center gap-1"
            title="Toggle Performance Diagnostics HUD"
          >
            <Activity className="w-3 h-3 text-cyan-400" />
            <span>PERF</span>
          </button>
          <button
            onClick={() => setStudioMode(false)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-[#A1A1AA] hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Studio Navigation Tabs */}
      <div className="grid grid-cols-5 gap-1 p-2 bg-[#070816]/80 border-b border-white/10">
        {[
          { id: 'MUSIC', label: 'Setlist & Audio', icon: ListMusic },
          { id: 'LED_VIDEO', label: 'LED Video', icon: Video },
          { id: 'STAGE', label: 'Stage & Nav', icon: Sparkles },
          { id: 'CAMERA', label: 'Cam & Crowd', icon: Camera },
          { id: 'ACTIONS', label: 'Actions & Dance', icon: Activity }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-2 rounded-xl text-[11px] font-heading font-semibold flex items-center justify-center gap-1 transition cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#22D3EE] text-[#070816] font-bold shadow-[0_0_15px_rgba(34,211,238,0.4)]'
                  : 'text-[#A1A1AA] hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Studio Tab Content */}
      <div className="p-4 overflow-y-auto space-y-4 text-xs">
        {/* ============================================================
            TAB 1: MUSIC LIBRARY, SETLIST MANAGER & MASTER CLOCK
            ============================================================ */}
        {activeTab === 'MUSIC' && (
          <>
            {/* Transport & Master Clock */}
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-heading tracking-wider text-[#A1A1AA] uppercase block">
                    ACTIVE TRACK (MASTER CLOCK)
                  </span>
                  <span className="text-sm font-heading font-bold text-white">
                    {currentTrack?.title} ·{' '}
                    <span className="text-[#22D3EE]">{currentTrack?.bpm} BPM</span>
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => showDirector.playPreviousSetlistItem(useConcertStore)}
                    title="Previous Setlist Item"
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/15 text-white cursor-pointer"
                  >
                    <SkipBack className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() =>
                      isConcertPlaying ? musicEngine.pause() : musicEngine.play()
                    }
                    className="px-3 py-2 rounded-lg bg-[#22D3EE] text-[#070816] font-heading font-bold inline-flex items-center gap-1 cursor-pointer"
                  >
                    {isConcertPlaying ? (
                      <Pause className="w-3.5 h-3.5" />
                    ) : (
                      <Play className="w-3.5 h-3.5" />
                    )}
                    <span>{isConcertPlaying ? 'PAUSE' : 'PLAY'}</span>
                  </button>
                  <button
                    onClick={() =>
                      showDirector.playNextSetlistItem(useConcertStore, useUserStore)
                    }
                    title="Next Setlist Item (Crossfade)"
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/15 text-white cursor-pointer"
                  >
                    <SkipForward className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Waveform Seek Scrubber */}
              <div>
                <div className="flex justify-between text-[10px] font-heading text-[#A1A1AA] mb-1">
                  <span>{concertTime.toFixed(1)}s</span>
                  <span>SEEK TIMELINE</span>
                  <span>{duration.toFixed(1)}s</span>
                </div>
                <div
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const ratio = Math.max(
                      0,
                      Math.min(1, (e.clientX - rect.left) / rect.width)
                    );
                    musicEngine.seek(ratio * duration);
                  }}
                  className="relative h-11 rounded-xl bg-[#070816] border border-white/15 overflow-hidden flex items-end gap-[1px] p-1 cursor-pointer"
                >
                  {(peaks.length ? peaks.slice(0, 72) : new Array(72).fill(0.4)).map(
                    (p, i) => {
                      const pct = i / 72;
                      const active = pct <= concertTime / Math.max(1, duration);
                      return (
                        <div
                          key={i}
                          className="flex-1 rounded-full transition-colors"
                          style={{
                            height: `${Math.max(15, p * 100)}%`,
                            backgroundColor: active
                              ? '#22D3EE'
                              : 'rgba(255,255,255,0.18)'
                          }}
                        />
                      );
                    }
                  )}
                </div>
              </div>
            </div>

            {/* SETLIST MANAGER (ADD / REMOVE / REORDER / PLAY) */}
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-heading tracking-wider text-[#22D3EE] uppercase">
                  SETLIST MANAGER ({setlistState.setlist.length} ITEMS)
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() =>
                      setlistManager.addTrackToSetlist({
                        type: 'MC',
                        title: 'MC // Crowd Energy Break',
                        duration: 15
                      })
                    }
                    className="px-2 py-1 rounded bg-white/10 hover:bg-white/15 text-[10px] font-heading text-cyan-300 cursor-pointer"
                  >
                    + MC
                  </button>
                  <button
                    onClick={() =>
                      setlistManager.addTrackToSetlist({
                        type: 'INTERMISSION',
                        title: 'Intermission // Pulse Visual',
                        duration: 15
                      })
                    }
                    className="px-2 py-1 rounded bg-white/10 hover:bg-white/15 text-[10px] font-heading text-purple-300 cursor-pointer"
                  >
                    + INTERMISSION
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {setlistState.setlist.map((item, idx) => {
                  const isCurrent = idx === setlistState.currentIndex;
                  return (
                    <div
                      key={item.id}
                      className={`p-2 rounded-lg border flex items-center justify-between gap-2 ${
                        isCurrent
                          ? 'bg-[#22D3EE]/15 border-[#22D3EE] text-white'
                          : 'bg-white/[0.02] border-white/10 text-[#A1A1AA]'
                      }`}
                    >
                      <button
                        onClick={() => {
                          const selected = setlistManager.selectIndex(idx);
                          showDirector.executeSetlistItem(selected, useConcertStore, true);
                        }}
                        className="flex-1 text-left truncate cursor-pointer"
                      >
                        <span className="text-[10px] font-heading px-1.5 py-0.5 rounded bg-white/10 text-cyan-300 mr-1.5">
                          {item.type}
                        </span>
                        <span className="font-heading font-bold text-white">
                          {item.title}
                        </span>
                      </button>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => setlistManager.reorderItem(idx, -1)}
                          className="p-1 rounded hover:bg-white/10 text-[#A1A1AA] hover:text-white cursor-pointer"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => setlistManager.reorderItem(idx, 1)}
                          className="p-1 rounded hover:bg-white/10 text-[#A1A1AA] hover:text-white cursor-pointer"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => setlistManager.removeItem(item.id)}
                          className="p-1 rounded hover:bg-red-500/20 text-[#A1A1AA] hover:text-red-400 cursor-pointer"
                          title="Remove from Setlist"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* MUSIC LIBRARY & LOCAL IMPORT (MP3 / WAV / OGG) */}
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-heading tracking-wider text-[#A1A1AA] uppercase">
                  MUSIC LIBRARY & LOCAL AUDIO IMPORT
                </span>
                <label className="px-2.5 py-1 rounded-lg bg-[#8B5CF6]/25 hover:bg-[#8B5CF6]/40 border border-[#8B5CF6]/50 text-white font-heading font-semibold text-[10px] inline-flex items-center gap-1.5 cursor-pointer">
                  <Upload className="w-3 h-3 text-[#22D3EE]" />
                  <span>IMPORT MP3/WAV/OGG</span>
                  <input
                    type="file"
                    accept="audio/mp3,audio/mpeg,audio/wav,audio/ogg,audio/*"
                    onChange={handleAudioUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Editable Title, Artist & BPM for Imported / Active Track */}
              <div className="grid grid-cols-3 gap-1.5">
                <input
                  type="text"
                  value={importTitle}
                  onChange={(e) => setImportTitle(e.target.value)}
                  placeholder={currentTrack?.title || 'Track Title'}
                  className="px-2.5 py-1.5 rounded-lg bg-[#070816] border border-white/15 text-white text-[11px]"
                />
                <input
                  type="text"
                  value={importArtist}
                  onChange={(e) => setImportArtist(e.target.value)}
                  placeholder="Artist Name"
                  className="px-2.5 py-1.5 rounded-lg bg-[#070816] border border-white/15 text-white text-[11px]"
                />
                <div className="flex gap-1">
                  <input
                    type="number"
                    min={60}
                    max={200}
                    value={importBpm}
                    onChange={(e) => setImportBpm(e.target.value)}
                    className="w-14 px-2 py-1.5 rounded-lg bg-[#070816] border border-white/15 text-white text-[11px]"
                  />
                  <button
                    onClick={handleSaveTrackMeta}
                    className="flex-1 px-2 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-heading text-[10px] cursor-pointer"
                  >
                    SAVE
                  </button>
                </div>
              </div>

              {/* Library Track List with "+ ADD TO SETLIST" */}
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {libraryTracks.map((trk) => (
                  <div
                    key={trk.id}
                    className="p-2 rounded-lg bg-white/[0.02] border border-white/10 flex items-center justify-between gap-2"
                  >
                    <button
                      onClick={() => showDirector.changeTrack(trk.id, useConcertStore, true)}
                      className="text-left truncate flex-1 cursor-pointer"
                    >
                      <div className="text-xs font-heading font-bold text-white truncate">
                        {trk.title}
                      </div>
                      <div className="text-[10px] text-[#A1A1AA]">
                        {trk.artist} · {trk.bpm} BPM
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        setlistManager.addTrackToSetlist(trk, 'MUSIC');
                        showInfoToast(
                          'ADDED TO SETLIST',
                          `"${trk.title}" appended to active concert setlist.`
                        );
                      }}
                      className="px-2.5 py-1 rounded-lg bg-[#22D3EE]/20 hover:bg-[#22D3EE]/30 border border-[#22D3EE]/40 text-[#22D3EE] font-heading font-bold text-[10px] cursor-pointer shrink-0"
                    >
                      + ADD TO SETLIST
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Real-time Audio Analyser Bars + Timeline Cue Inserter */}
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
              <div className="flex justify-between text-[10px] font-heading text-[#A1A1AA]">
                <span>BASS {(audioAnalysis.bass * 100).toFixed(0)}%</span>
                <span>MID {(audioAnalysis.mid * 100).toFixed(0)}%</span>
                <span>TREBLE {(audioAnalysis.treble * 100).toFixed(0)}%</span>
                <span>ENERGY {(audioAnalysis.energy * 100).toFixed(0)}%</span>
              </div>

              <div className="flex gap-1.5 pt-1">
                <select
                  value={newCueType}
                  onChange={(e) => setNewCueType(e.target.value)}
                  className="px-2 py-1.5 rounded-lg bg-[#070816] border border-white/15 text-white text-[11px]"
                >
                  <option value="scene">scene</option>
                  <option value="drop">drop</option>
                  <option value="led">led</option>
                  <option value="ledVideo">ledVideo</option>
                  <option value="camera">camera</option>
                  <option value="artist">artist</option>
                  <option value="artistMove">artistMove</option>
                  <option value="pulseWave">pulseWave</option>
                </select>
                <input
                  type="text"
                  value={newCueValue}
                  onChange={(e) => setNewCueValue(e.target.value)}
                  placeholder="Value (e.g. DROP, RUNWAY)"
                  className="flex-1 px-2.5 py-1.5 rounded-lg bg-[#070816] border border-white/15 text-white text-[11px]"
                />
                <button
                  onClick={handleAddCueAtCurrentTime}
                  className="px-2.5 py-1.5 rounded-lg bg-[#8B5CF6] text-white font-heading font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>CUE</span>
                </button>
              </div>
            </div>
          </>
        )}

        {/* ============================================================
            TAB 2: DUAL LED MEDIA ENGINE (YOUTUBE + NATIVE + MULTI-SCREEN)
            ============================================================ */}
        {activeTab === 'LED_VIDEO' && (
          <StudioLEDControl />
        )}

        {/* ============================================================
            TAB 3: STAGE, ARTIST NAVIGATION & FX
            ============================================================ */}
        {activeTab === 'STAGE' && (
          <>
            {/* Stage Navigation System (Move Artist to MAIN_STAGE, RUNWAY, B_STAGE, WINGS, BACKSTAGE) */}
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-heading tracking-wider text-[#22D3EE] uppercase flex items-center gap-1">
                  <Navigation className="w-3.5 h-3.5" />
                  <span>ARTIST STAGE NAVIGATION SYSTEM</span>
                </span>
                <span className="text-[10px] font-heading text-white">
                  ACTIVE: {artistTargetZone}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  'MAIN_STAGE',
                  'RUNWAY',
                  'B_STAGE',
                  'LEFT_WING',
                  'RIGHT_WING',
                  'BACKSTAGE'
                ].map((zKey) => (
                  <button
                    key={zKey}
                    onClick={() => stageNavigationSystem.moveArtistToZone(zKey, 3.5)}
                    className={`py-2 px-2 rounded-lg font-heading text-[10px] font-bold border transition cursor-pointer ${
                      artistTargetZone === zKey
                        ? 'bg-[#22D3EE]/25 border-[#22D3EE] text-white'
                        : 'bg-white/[0.03] border-white/10 text-[#A1A1AA] hover:text-white'
                    }`}
                  >
                    {zKey.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Artist Cast Size & Animation State */}
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-2.5">
              <div className="flex items-center gap-1.5 text-[10px] font-heading tracking-wider text-[#A1A1AA] uppercase">
                <Users className="w-3.5 h-3.5 text-[#22D3EE]" />
                <span>ARTIST CAST SIZE & PERFORMANCE STATE</span>
              </div>
              <div className="grid grid-cols-5 gap-1">
                {[
                  { id: 'solo', label: '1 Solo' },
                  { id: 'duo', label: '2 Duo' },
                  { id: 'group', label: '5 CORTIS' },
                  { id: 'ensemble10', label: '10 Unit' },
                  { id: 'mega20', label: '20 Mega' }
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setCastMode(c.id)}
                    className={`py-1.5 rounded-lg font-heading text-[10px] font-bold border cursor-pointer ${
                      castMode === c.id
                        ? 'bg-[#22D3EE] text-[#070816] border-[#22D3EE]'
                        : 'bg-white/[0.03] border-white/10 text-[#A1A1AA]'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                {[
                  'IDLE',
                  'WALK',
                  'SING',
                  'DANCE_A',
                  'DANCE_B',
                  'WAVE',
                  'TALK',
                  'RUNWAY',
                  'FINAL_POSE'
                ].map((anim) => (
                  <button
                    key={anim}
                    onClick={() => setArtistAnimation(anim)}
                    className={`py-1.5 rounded-lg font-heading text-[10px] font-semibold border cursor-pointer ${
                      artistAnimation === anim
                        ? 'bg-[#EC4899]/25 border-[#EC4899] text-white'
                        : 'bg-white/[0.02] border-white/10 text-[#A1A1AA]'
                    }`}
                  >
                    {anim}
                  </button>
                ))}
              </div>
            </div>

            {/* Lighting Scenes & Stage FX */}
            <div>
              <div className="text-[10px] font-heading tracking-wider text-[#A1A1AA] uppercase mb-1.5">
                LIGHTING SCENE PRESETS
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {['INTRO', 'VERSE', 'CHORUS', 'DROP', 'BALLAD', 'ENCORE', 'BLACKOUT'].map(
                  (sc) => (
                    <button
                      key={sc}
                      onClick={() => setLightingScene(sc)}
                      className={`py-1.5 rounded-lg font-heading font-bold text-[10px] border transition cursor-pointer ${
                        lightingScene === sc
                          ? 'bg-[#22D3EE]/25 border-[#22D3EE] text-white'
                          : 'bg-white/[0.03] border-white/10 text-[#A1A1AA] hover:text-white'
                      }`}
                    >
                      {sc}
                    </button>
                  )
                )}
              </div>
            </div>

            <div>
              <div className="text-[10px] font-heading tracking-wider text-[#A1A1AA] uppercase mb-1.5">
                STAGE FX TRIGGERS
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { key: 'laser', label: 'LASER RIG' },
                  { key: 'beam', label: 'MOVING BEAMS' },
                  { key: 'co2', label: 'CO2 CRYO' },
                  { key: 'confetti', label: 'CONFETTI' },
                  { key: 'firework', label: 'FIREWORKS' },
                  { key: 'blackout', label: 'BLACKOUT' }
                ].map((fx) => (
                  <button
                    key={fx.key}
                    onClick={() => triggerFX(fx.key)}
                    className={`py-2 rounded-lg font-heading font-bold text-[10px] border transition cursor-pointer ${
                      fxState[fx.key]
                        ? 'bg-[#EC4899]/25 border-[#EC4899] text-white'
                        : 'bg-white/[0.03] border-white/10 text-[#A1A1AA] hover:text-white'
                    }`}
                  >
                    {fx.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Signature Object: PULSE CORE Control */}
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-heading tracking-wider text-[#FACC15] uppercase">
                  SIGNATURE OBJECT: PULSE CORE
                </span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setPulseCoreVisible(!pulseCoreVisible)}
                    className="px-2 py-1 rounded bg-white/10 text-[10px] font-heading text-white cursor-pointer"
                  >
                    {pulseCoreVisible ? 'HIDE' : 'SHOW'}
                  </button>
                  <button
                    onClick={() => setPulseCoreOverload(!pulseCoreOverload)}
                    className={`px-2 py-1 rounded text-[10px] font-heading font-bold cursor-pointer ${
                      pulseCoreOverload
                        ? 'bg-[#FACC15] text-[#070816]'
                        : 'bg-white/10 text-[#FACC15]'
                    }`}
                  >
                    OVERLOAD
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ============================================================
            TAB 4: CAMERA DIRECTOR & CROWD / PULSE WAVE
            ============================================================ */}
        {activeTab === 'CAMERA' && (
          <>
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/10">
              <div>
                <div className="font-heading font-bold text-white">AUTO CAMERA DIRECTOR</div>
                <div className="text-[10px] text-[#A1A1AA]">
                  Syncs camera cuts with timeline cues
                </div>
              </div>
              <button
                onClick={() => setAutoCamera(!autoCamera)}
                className={`px-3 py-1.5 rounded-lg font-heading font-bold text-xs cursor-pointer ${
                  autoCamera
                    ? 'bg-[#22D3EE] text-[#070816]'
                    : 'bg-white/10 text-[#A1A1AA]'
                }`}
              >
                {autoCamera ? 'AUTO ON' : 'MANUAL'}
              </button>
            </div>

            <div>
              <div className="text-[10px] font-heading tracking-wider text-[#A1A1AA] uppercase mb-1.5">
                CAMERA VIEWPOINTS (10 BROADCAST ANGLES)
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {Object.values(CAMERA_PRESETS).map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => setCameraMode(preset.id)}
                    className={`py-2 px-3 rounded-xl font-heading text-left text-[11px] font-semibold border transition cursor-pointer ${
                      cameraMode === preset.id
                        ? 'bg-[#22D3EE]/25 border-[#22D3EE] text-white'
                        : 'bg-white/[0.03] border-white/10 text-[#A1A1AA] hover:text-white'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-heading tracking-wider text-[#22D3EE] uppercase">
                  PULSE WAVE // CROWD LIGHTSTICK PATTERNS
                </span>
                <button
                  onClick={() => stopPulseWave()}
                  className="text-[10px] text-[#A1A1AA] hover:text-white cursor-pointer"
                >
                  STOP WAVE
                </button>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {PULSE_WAVE_PATTERNS.map((pat) => (
                  <button
                    key={pat}
                    onClick={() => triggerPulseWave(pat, '#22D3EE')}
                    className="py-1.5 px-2 rounded-lg bg-white/[0.04] hover:bg-[#22D3EE]/20 border border-white/10 text-[10px] font-heading text-white cursor-pointer"
                  >
                    {pat.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-[10px] font-heading tracking-wider text-[#A1A1AA] uppercase mb-1.5">
                CROWD BEHAVIOR OVERRIDE
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: null, label: 'AUTO' },
                  { id: 'wave', label: 'WAVE' },
                  { id: 'jump', label: 'JUMP' },
                  { id: 'clap', label: 'CLAP' }
                ].map((b) => (
                  <button
                    key={String(b.id)}
                    onClick={() => setCrowdBehaviorOverride(b.id)}
                    className="py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/10 border border-white/10 font-heading text-[10px] text-white cursor-pointer"
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ============================================================
            TAB 5: CHARACTER ACTION CONTROL (PLAYER, ARTIST, CROWD)
            ============================================================ */}
        {activeTab === 'ACTIONS' && (
          <>
            {/* Sub-selector for Role */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-white/[0.04] rounded-xl border border-white/10">
              {['ARTIST', 'PLAYER', 'CROWD'].map((r) => (
                <button
                  key={r}
                  onClick={() => setActionRole(r)}
                  className={`py-1.5 rounded-lg font-heading text-[11px] font-bold transition cursor-pointer ${
                    actionRole === r
                      ? 'bg-cyan-500 text-black shadow-md'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {r} CONTROL
                </button>
              ))}
            </div>

            {/* 1. ARTIST ACTION CONTROL */}
            {actionRole === 'ARTIST' && (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
                  <div className="text-[10px] font-heading tracking-wider text-amber-400 uppercase">
                    CORTIS ARTIST DANCE & STAGE CHOREOGRAPHY
                  </div>
                  <div className="text-[11px] text-zinc-400">
                    Active Animation: <span className="font-mono text-cyan-300 font-bold">{useConcertStore.getState().artistAnimation}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                    {[
                      { id: 'DANCE_KPOP', label: 'K-Pop Wave' },
                      { id: 'DANCE_POP', label: 'Pop Lock' },
                      { id: 'DANCE_HIPHOP', label: 'Hip-Hop Bounce' },
                      { id: 'DANCE_BASIC', label: 'Basic Dance' },
                      { id: 'DANCE_SPIN', label: 'Spin Flourish' },
                      { id: 'FINAL_POSE', label: 'Climax Pose' },
                      { id: 'SING', label: 'Live Vocal' },
                      { id: 'TALK', label: 'MC Talk' },
                      { id: 'IDLE', label: 'Rest Idle' }
                    ].map((act) => (
                      <button
                        key={act.id}
                        onClick={() => {
                          setSelectedArtistAction(act.id);
                          useConcertStore.getState().setArtistAnimation(act.id);
                        }}
                        className={`py-2 px-1 rounded-lg font-heading font-semibold text-[10px] border transition cursor-pointer ${
                          useConcertStore.getState().artistAnimation === act.id
                            ? 'bg-amber-500/30 border-amber-400 text-amber-200'
                            : 'bg-white/[0.03] border-white/10 text-zinc-300 hover:text-white'
                        }`}
                      >
                        {act.label}
                      </button>
                    ))}
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-white/10">
                    <button
                      onClick={() => {
                        useConcertStore.getState().setArtistAnimation('DANCE_KPOP');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-black font-heading font-bold text-[10px] cursor-pointer"
                    >
                      TRIGGER SYNCHRONIZED WAVE
                    </button>
                    <button
                      onClick={() => useConcertStore.getState().setArtistAnimation('SING')}
                      className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-heading text-[10px] cursor-pointer"
                    >
                      RESET TO VOCAL
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 2. PLAYER ACTION CONTROL */}
            {actionRole === 'PLAYER' && (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
                  <div className="text-[10px] font-heading tracking-wider text-cyan-400 uppercase">
                    PLAYER AVATAR ACTION
                  </div>
                  <div className="text-[11px] text-zinc-400">
                    Current Pose: <span className="font-mono text-cyan-300 font-bold">{useConcertStore.getState().playerPose || 'idle'}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                    {[
                      { id: 'dance_basic', label: 'Basic Dance' },
                      { id: 'dance_groove', label: 'Groove Roll' },
                      { id: 'dance_pop', label: 'Pop Lock' },
                      { id: 'dance_hiphop', label: 'Hip-Hop' },
                      { id: 'dance_kpop', label: 'K-Pop' },
                      { id: 'dance_freestyle', label: 'Freestyle' },
                      { id: 'dance_jump', label: 'Hype Jump' },
                      { id: 'dance_side_step', label: 'Side Step' },
                      { id: 'final_pose', label: 'Hero Pose' }
                    ].map((act) => (
                      <button
                        key={act.id}
                        onClick={() => danceController.playAction(act.id, 'PLAYER')}
                        className={`py-2 px-1 rounded-lg font-heading font-semibold text-[10px] border transition cursor-pointer ${
                          useConcertStore.getState().playerPose?.toLowerCase() === act.id
                            ? 'bg-cyan-500/30 border-cyan-400 text-cyan-200'
                            : 'bg-white/[0.03] border-white/10 text-zinc-300 hover:text-white'
                        }`}
                      >
                        {act.label}
                      </button>
                    ))}
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-white/10">
                    <button
                      onClick={() => danceController.playRandomDance('PLAYER')}
                      className="px-3 py-1.5 rounded-lg bg-purple-600/40 border border-purple-500/50 text-purple-200 font-heading font-bold text-[10px] cursor-pointer"
                    >
                      RANDOM DANCE 🎲
                    </button>
                    <button
                      onClick={() => danceController.stopAction()}
                      className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 font-heading text-[10px] cursor-pointer"
                    >
                      STOP ACTION
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 3. CROWD ACTION CONTROL */}
            {actionRole === 'CROWD' && (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-2.5">
                  <div className="text-[10px] font-heading tracking-wider text-pink-400 uppercase">
                    CROWD DANCE & STADIUM ENERGY
                  </div>

                  <div>
                    <label className="text-[10px] text-zinc-400 uppercase block mb-1">
                      Crowd Action:
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: 'dance_jump', label: 'Hype Jump' },
                        { id: 'dance_basic', label: 'Basic Dance' },
                        { id: 'wave', label: 'Lightstick Wave' },
                        { id: 'clap', label: 'Stadium Clap' },
                        { id: 'auto', label: 'Dynamic Auto' }
                      ].map((act) => (
                        <button
                          key={act.id}
                          onClick={() => {
                            setSelectedCrowdAction(act.id);
                            useConcertStore.getState().setCrowdBehaviorOverride(act.id === 'auto' ? null : act.id);
                          }}
                          className={`py-1.5 px-1 rounded-lg font-heading text-[10px] border transition cursor-pointer ${
                            selectedCrowdAction === act.id
                              ? 'bg-pink-500/30 border-pink-400 text-pink-200'
                              : 'bg-white/[0.03] border-white/10 text-zinc-300 hover:text-white'
                          }`}
                        >
                          {act.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[10px] text-zinc-400">
                      <span>CROWD INTENSITY:</span>
                      <span className="font-mono text-pink-400 font-bold">{crowdIntensity}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={crowdIntensity}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setCrowdIntensity(val);
                        useConcertStore.getState().setAudienceEnergyState({
                          ...useConcertStore.getState().audienceEnergyState,
                          energy: val
                        });
                      }}
                      className="w-full accent-pink-500 cursor-pointer"
                    />
                  </div>

                  <button
                    onClick={() => {
                      useConcertStore.getState().setCrowdBehaviorOverride(selectedCrowdAction === 'auto' ? null : selectedCrowdAction);
                      useConcertStore.getState().setAudienceEnergyState({
                        ...useConcertStore.getState().audienceEnergyState,
                        energy: crowdIntensity
                      });
                      if (crowdIntensity > 80) {
                        useConcertStore.getState().triggerPulseWave('CENTER_OUT', '#EC4899');
                      }
                    }}
                    className="w-full py-2 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 text-white font-heading font-bold text-[10px] shadow-lg cursor-pointer"
                  >
                    TRIGGER CROWD SURGE
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

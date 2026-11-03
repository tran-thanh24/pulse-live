/**
 * StudioLEDControl.jsx — Professional Multi-Channel LED Media Operator Console
 * Supports independent per-screen control across MAIN_LED, LEFT_LED, and RIGHT_LED with:
 * - YOUTUBE MODE (Quick Link Mode via IFrame Player API)
 * - NATIVE VIDEO MODE (Local MP4, Project Video, Remote URL via THREE.VideoTexture)
 * - AUDIO REACTIVE (Master Clock Synthesizer Sync)
 */
import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  Square,
  Repeat,
  Volume2,
  VolumeX,
  Upload,
  Link,
  Film,
  Sparkles,
  Radio,
  Sliders,
  Sun,
  Clock,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { ledMediaManager } from '../systems/LEDMediaManager';
import {
  LED_SCREENS,
  LED_MEDIA_TYPES,
  FIT_MODES,
  SOURCE_CAPABILITIES
} from '../systems/led/LEDConstants';
import { PROJECT_VIDEOS, YOUTUBE_PRESETS } from '../data/mediaManifest';
import { audioManager } from '../core/AudioManager';

export function StudioLEDControl() {
  const [selectedScreen, setSelectedScreen] = useState(LED_SCREENS.MAIN_LED);
  const [allChannels, setAllChannels] = useState(() => ledMediaManager.getChannelStates());

  const [youtubeInput, setYoutubeInput] = useState('');
  const [remoteUrlInput, setRemoteUrlInput] = useState('');
  const [selectedProjectVideoId, setSelectedProjectVideoId] = useState(PROJECT_VIDEOS[0]?.id || '');
  const [actionNotice, setActionNotice] = useState(null);

  // Subscribe to channel updates
  useEffect(() => {
    const unsub = ledMediaManager.subscribe((states) => {
      setAllChannels(states);
    });
    return unsub;
  }, []);

  const activeChannel = allChannels[selectedScreen] || {};
  const currentSourceType = activeChannel.sourceType || LED_MEDIA_TYPES.AUDIO_REACTIVE;
  const capabilities = activeChannel.capabilities || SOURCE_CAPABILITIES[currentSourceType] || {};

  const showFeedback = (msg, isErr = false) => {
    setActionNotice({ msg, isErr });
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleSelectScreen = (screenId) => {
    audioManager.playUISound('click');
    setSelectedScreen(screenId);
  };

  // Switch Source Type for selected screen
  const handleSelectSourceType = async (newType) => {
    audioManager.playUISound('click');
    const ch = ledMediaManager.getChannel(selectedScreen);

    if (newType === LED_MEDIA_TYPES.AUDIO_REACTIVE) {
      await ch.setSource(newType, 'AUDIO_REACTIVE');
      showFeedback(`Switched ${selectedScreen} to Audio Reactive`);
    } else if (newType === LED_MEDIA_TYPES.PROJECT_VIDEO) {
      const vid = PROJECT_VIDEOS.find((v) => v.id === selectedProjectVideoId) || PROJECT_VIDEOS[0];
      await ch.setSource(newType, vid);
      showFeedback(`Switched ${selectedScreen} to Project Video: ${vid.label}`);
    } else if (newType === LED_MEDIA_TYPES.YOUTUBE) {
      // If channel already had a YouTube source, leave it; otherwise use default preset
      if (!ch.source?.videoId) {
        const preset = YOUTUBE_PRESETS[0];
        setYoutubeInput(preset.url);
        await ch.setSource(newType, preset.videoId);
      }
      showFeedback(`Switched ${selectedScreen} to YouTube Mode`);
    } else if (newType === LED_MEDIA_TYPES.LOCAL_VIDEO) {
      showFeedback(`Please select a local video file from your device.`);
    } else if (newType === LED_MEDIA_TYPES.REMOTE_VIDEO) {
      showFeedback(`Please paste a direct video URL.`);
    }
  };

  // Load YouTube Video
  const handleLoadYouTube = async (urlOrId) => {
    const input = urlOrId || youtubeInput;
    if (!input.trim()) return;
    audioManager.playUISound('click');
    try {
      const ch = ledMediaManager.getChannel(selectedScreen);
      await ch.setSource(LED_MEDIA_TYPES.YOUTUBE, input.trim(), { autoPlay: true });
      showFeedback(`Loaded YouTube video onto ${selectedScreen}!`);
    } catch (err) {
      showFeedback(`YouTube error: ${err.message}`, true);
    }
  };

  // Upload Local Video File
  const handleLocalVideoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    audioManager.playUISound('click');
    try {
      const blobUrl = URL.createObjectURL(file);
      const ch = ledMediaManager.getChannel(selectedScreen);
      await ch.setSource(LED_MEDIA_TYPES.LOCAL_VIDEO, blobUrl, {
        fileName: file.name,
        isLocalBlob: true,
        autoPlay: true
      });
      showFeedback(`Loaded local file: ${file.name}`);
    } catch (err) {
      showFeedback(`Failed to load video: ${err.message}`, true);
    }
    e.target.value = '';
  };

  // Load Project Video
  const handleLoadProjectVideo = async (vidId) => {
    const vid = PROJECT_VIDEOS.find((v) => v.id === vidId) || PROJECT_VIDEOS[0];
    if (!vid) return;
    audioManager.playUISound('click');
    setSelectedProjectVideoId(vid.id);
    const ch = ledMediaManager.getChannel(selectedScreen);
    await ch.setSource(LED_MEDIA_TYPES.PROJECT_VIDEO, vid, { autoPlay: true });
    showFeedback(`Loaded Project Video: ${vid.label}`);
  };

  // Load Remote Video URL
  const handleLoadRemoteUrl = async () => {
    if (!remoteUrlInput.trim()) return;
    audioManager.playUISound('click');
    try {
      const ch = ledMediaManager.getChannel(selectedScreen);
      await ch.setSource(LED_MEDIA_TYPES.REMOTE_VIDEO, remoteUrlInput.trim(), { autoPlay: true });
      showFeedback(`Loaded remote video onto ${selectedScreen}!`);
    } catch (err) {
      showFeedback(`Remote load failed: ${err.message}`, true);
    }
  };

  return (
    <div className="space-y-4 select-none">
      {/* ========================================================
          1. SCREEN SELECTOR: [ MAIN ] [ LEFT ] [ RIGHT ]
          ======================================================== */}
      <div>
        <div className="flex items-center justify-between text-[10px] font-heading tracking-wider text-[#A1A1AA] uppercase mb-1.5">
          <span>SELECT LED SCREEN DISPLAY</span>
          <span className="text-[#22D3EE] font-bold">INDEPENDENT CHANNELS</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: LED_SCREENS.MAIN_LED, label: 'MAIN LED', desc: 'Center Stage (19.5m)' },
            { id: LED_SCREENS.LEFT_LED, label: 'LEFT LED', desc: 'Left Wing (7.4m)' },
            { id: LED_SCREENS.RIGHT_LED, label: 'RIGHT LED', desc: 'Right Wing (7.4m)' }
          ].map((screen) => {
            const ch = allChannels[screen.id] || {};
            const isSelected = selectedScreen === screen.id;
            return (
              <button
                key={screen.id}
                onClick={() => handleSelectScreen(screen.id)}
                className={`p-2.5 rounded-xl text-left border transition cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-gradient-to-br from-[#22D3EE]/25 to-[#8B5CF6]/20 border-[#22D3EE] shadow-[0_0_15px_rgba(34,211,238,0.3)]'
                    : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06] text-zinc-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-heading font-bold ${isSelected ? 'text-white' : 'text-zinc-200'}`}>
                    {screen.label}
                  </span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      ch.blackout ? 'bg-red-500' : ch.sourceType === LED_MEDIA_TYPES.YOUTUBE ? 'bg-red-400' : 'bg-emerald-400'
                    }`}
                  />
                </div>
                <div className="text-[10px] font-heading font-semibold text-[#22D3EE] mt-1 truncate">
                  {ch.sourceType || 'AUDIO REACTIVE'}
                </div>
                <div className="text-[9px] text-zinc-500 truncate mt-0.5">{screen.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* FEEDBACK NOTICE BANNER */}
      {actionNotice && (
        <div
          className={`px-3 py-2 rounded-lg text-xs font-heading font-semibold flex items-center gap-2 ${
            actionNotice.isErr ? 'bg-red-500/20 text-red-300 border border-red-500/40' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
          }`}
        >
          {actionNotice.isErr ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          <span>{actionNotice.msg}</span>
        </div>
      )}

      {/* ========================================================
          2. SOURCE SELECTOR FOR ACTIVE SCREEN
          ======================================================== */}
      <div>
        <div className="flex items-center justify-between text-[10px] font-heading tracking-wider text-[#A1A1AA] uppercase mb-1.5">
          <span>MEDIA SOURCE FOR [{selectedScreen}]</span>
          <span className="text-zinc-400">{capabilities.subLabel}</span>
        </div>
        <div className="grid grid-cols-5 gap-1.5">
          {[
            { type: LED_MEDIA_TYPES.YOUTUBE, icon: Film, label: 'YOUTUBE' },
            { type: LED_MEDIA_TYPES.LOCAL_VIDEO, icon: Upload, label: 'LOCAL VIDEO' },
            { type: LED_MEDIA_TYPES.PROJECT_VIDEO, icon: Radio, label: 'PROJECT' },
            { type: LED_MEDIA_TYPES.REMOTE_VIDEO, icon: Link, label: 'VIDEO URL' },
            { type: LED_MEDIA_TYPES.AUDIO_REACTIVE, icon: Sparkles, label: 'REACTIVE' }
          ].map((item) => {
            const isCur = currentSourceType === item.type;
            const Icon = item.icon;
            return (
              <button
                key={item.type}
                onClick={() => handleSelectSourceType(item.type)}
                className={`py-2 px-1 rounded-xl text-center border font-heading text-[10px] font-bold transition cursor-pointer flex flex-col items-center gap-1 ${
                  isCur
                    ? 'bg-[#22D3EE] text-[#070816] border-[#22D3EE] shadow-md'
                    : 'bg-white/[0.04] border-white/10 text-zinc-300 hover:bg-white/[0.08]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================
          3. SOURCE-SPECIFIC INPUT & LOADERS
          ======================================================== */}
      <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3.5">
        {/* A. YOUTUBE SOURCE UI */}
        {currentSourceType === LED_MEDIA_TYPES.YOUTUBE && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-heading font-bold text-red-400 flex items-center gap-1.5">
                <Film className="w-4 h-4" /> YOUTUBE MODE (QUICK LINK)
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 font-heading font-bold">
                IFRAME 3D ALIGNED
              </span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Paste YouTube URL or Video ID (watch?v=, youtu.be, shorts)..."
                value={youtubeInput}
                onChange={(e) => setYoutubeInput(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-[#070816] border border-white/15 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#22D3EE]"
              />
              <button
                onClick={() => handleLoadYouTube()}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-heading font-bold text-xs tracking-wider cursor-pointer"
              >
                LOAD
              </button>
            </div>

            {/* Quick Presets */}
            <div>
              <div className="text-[9px] font-heading font-semibold text-[#A1A1AA] uppercase mb-1">
                QUICK CONCERT PRESETS:
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {YOUTUBE_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setYoutubeInput(p.url);
                      handleLoadYouTube(p.videoId);
                    }}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-left text-[10px] font-heading text-zinc-300 truncate cursor-pointer"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {activeChannel.source?.videoId && (
              <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-between text-[11px] font-heading text-zinc-300">
                <div className="truncate">
                  <span className="text-red-300 font-bold">NOW PLAYING:</span> {activeChannel.source.videoTitle || activeChannel.source.videoId}
                </div>
                <div className="text-zinc-400 shrink-0 ml-2">
                  ID: {activeChannel.source.videoId}
                </div>
              </div>
            )}
          </div>
        )}

        {/* B. LOCAL VIDEO SOURCE UI */}
        {currentSourceType === LED_MEDIA_TYPES.LOCAL_VIDEO && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-heading font-bold text-cyan-400 flex items-center gap-1.5">
                <Upload className="w-4 h-4" /> LOCAL VIDEO (NATIVE LED MODE)
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-heading font-bold">
                HIGH QUALITY WEBGL
              </span>
            </div>

            <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-400/30 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <div className="text-xs font-heading font-bold text-white">
                  {activeChannel.source?.fileName || 'No file selected'}
                </div>
                <div className="text-[10px] text-zinc-400 mt-0.5">
                  LOCAL MEDIA — This file stays 100% on this device.
                </div>
              </div>

              <label className="px-4 py-2 rounded-xl bg-[#22D3EE] text-[#070816] font-heading font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-md">
                <Upload className="w-3.5 h-3.5" />
                <span>CHOOSE MP4 / WEBM</span>
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/*"
                  onChange={handleLocalVideoUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        )}

        {/* C. PROJECT VIDEO SOURCE UI */}
        {currentSourceType === LED_MEDIA_TYPES.PROJECT_VIDEO && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-heading font-bold text-purple-400 flex items-center gap-1.5">
                <Radio className="w-4 h-4" /> PROJECT BUNDLED VIDEO
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 font-heading font-bold">
                GITHUB PAGES SAFE
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {PROJECT_VIDEOS.map((vid) => (
                <button
                  key={vid.id}
                  onClick={() => handleLoadProjectVideo(vid.id)}
                  className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                    activeChannel.source?.projectId === vid.id
                      ? 'bg-purple-600/30 border-purple-400 text-white'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 text-zinc-300'
                  }`}
                >
                  <div className="text-xs font-heading font-bold truncate">{vid.label}</div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">{vid.duration}s · {vid.theme}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* D. REMOTE VIDEO URL SOURCE UI */}
        {currentSourceType === LED_MEDIA_TYPES.REMOTE_VIDEO && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-heading font-bold text-amber-400 flex items-center gap-1.5">
                <Link className="w-4 h-4" /> DIRECT REMOTE VIDEO URL
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-heading font-bold">
                NATIVE STREAM
              </span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="https://cdn.example.com/video.mp4 (Auto-detects YouTube)..."
                value={remoteUrlInput}
                onChange={(e) => setRemoteUrlInput(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-[#070816] border border-white/15 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#22D3EE]"
              />
              <button
                onClick={handleLoadRemoteUrl}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-heading font-bold text-xs tracking-wider cursor-pointer"
              >
                LOAD
              </button>
            </div>
            <div className="text-[10px] text-zinc-500">
              * Direct MP4/WebM URL must support CORS. If you paste a YouTube URL, it will auto-switch to YouTube Mode.
            </div>
          </div>
        )}

        {/* E. AUDIO REACTIVE VISUALIZER UI */}
        {currentSourceType === LED_MEDIA_TYPES.AUDIO_REACTIVE && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-heading font-bold text-[#22D3EE] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> STAGE SYNC GENERATOR
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#22D3EE]/20 text-[#22D3EE] border border-[#22D3EE]/40 font-heading font-bold">
                PROCEDURAL CANVAS
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              {['AUDIO_REACTIVE', 'PULSE_PATTERN', 'SHADER', 'LYRIC_STYLE'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => {
                    const ch = ledMediaManager.getChannel(selectedScreen);
                    ch.source?.setVisualMode?.(mode);
                  }}
                  className="py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 font-heading text-[10px] font-bold text-zinc-300"
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            4. COMMON PLAYBACK CONTROLS (BASED ON CAPABILITIES)
            ======================================================== */}
        <div className="pt-2 border-t border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-heading tracking-wider text-[#A1A1AA] uppercase">
              TRANSPORT & PLAYBACK
            </span>
            <span className="text-[10px] font-heading text-zinc-400">
              STATE: <span className="text-[#22D3EE] font-bold">{activeChannel.state}</span>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {capabilities.canPlay && (
              <button
                onClick={() => ledMediaManager.getChannel(selectedScreen).play()}
                className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-heading font-bold text-[10px] inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" /> PLAY
              </button>
            )}

            {capabilities.canPause && (
              <button
                onClick={() => ledMediaManager.getChannel(selectedScreen).pause()}
                className="px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 font-heading font-bold text-[10px] inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Pause className="w-3.5 h-3.5" /> PAUSE
              </button>
            )}

            <button
              onClick={() => ledMediaManager.getChannel(selectedScreen).stop()}
              className="px-3 py-1.5 rounded-xl bg-red-500/20 border border-red-400/40 text-red-300 font-heading font-bold text-[10px] inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Square className="w-3.5 h-3.5" /> STOP
            </button>

            {capabilities.canLoop && (
              <button
                onClick={() => {
                  const ch = ledMediaManager.getChannel(selectedScreen);
                  ch.setLoop(!activeChannel.loop);
                }}
                className={`px-3 py-1.5 rounded-xl border font-heading font-bold text-[10px] inline-flex items-center gap-1.5 cursor-pointer ${
                  activeChannel.loop ? 'bg-[#22D3EE]/25 border-[#22D3EE] text-white' : 'bg-white/5 border-white/10 text-zinc-400'
                }`}
              >
                <Repeat className="w-3.5 h-3.5" /> LOOP: {activeChannel.loop ? 'ON' : 'OFF'}
              </button>
            )}

            {capabilities.canMute && (
              <button
                onClick={() => {
                  const ch = ledMediaManager.getChannel(selectedScreen);
                  ch.setMuted(!activeChannel.muted);
                }}
                className={`px-3 py-1.5 rounded-xl border font-heading font-bold text-[10px] inline-flex items-center gap-1.5 cursor-pointer ${
                  activeChannel.muted ? 'bg-amber-500/20 border-amber-400 text-amber-300' : 'bg-white/5 border-white/10 text-zinc-300'
                }`}
              >
                {activeChannel.muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                {activeChannel.muted ? 'MUTED' : 'UNMUTED'}
              </button>
            )}
          </div>

          {/* Seek Slider */}
          {capabilities.canSeek && (
            <div>
              <div className="flex justify-between text-[10px] font-heading text-zinc-400 mb-1">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> TIMELINE SEEK</span>
                <span>
                  {Math.floor(activeChannel.currentTime || 0)}s / {Math.floor(activeChannel.duration || 0)}s
                </span>
              </div>
              <input
                type="range"
                min="0"
                max={Math.max(1, activeChannel.duration || 100)}
                step="0.5"
                value={activeChannel.currentTime || 0}
                onChange={(e) => {
                  const ch = ledMediaManager.getChannel(selectedScreen);
                  ch.seek(Number(e.target.value));
                }}
                className="w-full accent-[#22D3EE] cursor-pointer"
              />
            </div>
          )}

          {/* Volume Slider if supported */}
          {capabilities.canVolume && (
            <div>
              <div className="flex justify-between text-[10px] font-heading text-zinc-400 mb-1">
                <span className="flex items-center gap-1"><Volume2 className="w-3 h-3" /> VOLUME</span>
                <span>{Math.round((activeChannel.volume || 1) * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={activeChannel.volume ?? 1}
                onChange={(e) => {
                  const ch = ledMediaManager.getChannel(selectedScreen);
                  ch.setVolume(Number(e.target.value));
                }}
                className="w-full accent-[#22D3EE] cursor-pointer"
              />
            </div>
          )}

          {/* Aspect Fit & Brightness (For Native Video & Reactive) */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <div className="text-[10px] font-heading text-[#A1A1AA] uppercase mb-1">
                ASPECT FIT MODE
              </div>
              <div className="grid grid-cols-3 gap-1">
                {['COVER', 'CONTAIN', 'STRETCH'].map((fm) => (
                  <button
                    key={fm}
                    onClick={() => {
                      const ch = ledMediaManager.getChannel(selectedScreen);
                      ch.setFitMode(fm);
                    }}
                    className={`py-1.5 rounded-lg font-heading text-[10px] font-bold border transition cursor-pointer ${
                      activeChannel.fitMode === fm
                        ? 'bg-[#8B5CF6] border-[#8B5CF6] text-white'
                        : 'bg-white/5 border-white/10 text-zinc-400'
                    }`}
                  >
                    {fm}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[10px] font-heading text-[#A1A1AA] uppercase mb-1">
                <span className="flex items-center gap-1"><Sun className="w-3 h-3" /> BRIGHTNESS</span>
                <span className="text-[#22D3EE]">{Math.round((activeChannel.brightness || 1) * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.5"
                step="0.05"
                value={activeChannel.brightness ?? 1.0}
                onChange={(e) => {
                  const ch = ledMediaManager.getChannel(selectedScreen);
                  ch.setBrightness(Number(e.target.value));
                }}
                className="w-full accent-[#22D3EE] cursor-pointer"
              />
            </div>
          </div>

          {/* ========================================================
              5. MUSIC SYNC & OFFSET
              ======================================================== */}
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-heading font-bold text-white">
                  SYNC TO MASTER CLOCK (MUSIC)
                </div>
                <div className="text-[10px] text-zinc-400">
                  {currentSourceType === LED_MEDIA_TYPES.YOUTUBE
                    ? 'SYNC: BEST EFFORT (±400ms)'
                    : 'SYNC: HIGH QUALITY (±150ms)'}
                </div>
              </div>

              <button
                onClick={() => {
                  const ch = ledMediaManager.getChannel(selectedScreen);
                  ch.setSyncToMusic(!activeChannel.syncToMusic);
                }}
                className={`px-3 py-1.5 rounded-xl border font-heading font-bold text-xs cursor-pointer ${
                  activeChannel.syncToMusic
                    ? 'bg-emerald-500/25 border-emerald-400 text-emerald-300'
                    : 'bg-white/5 border-white/15 text-zinc-500'
                }`}
              >
                {activeChannel.syncToMusic ? 'SYNC ON' : 'SYNC OFF'}
              </button>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] font-heading text-zinc-400">
                TIMELINE SYNC OFFSET: {activeChannel.syncOffset > 0 ? `+${activeChannel.syncOffset}s` : `${activeChannel.syncOffset || 0}s`}
              </span>
              <div className="flex items-center gap-1">
                {[-1.0, -0.25, 0, +0.25, +1.0].map((step) => (
                  <button
                    key={step}
                    onClick={() => {
                      const ch = ledMediaManager.getChannel(selectedScreen);
                      if (step === 0) ch.setSyncOffset(0);
                      else ch.setSyncOffset(Number(((activeChannel.syncOffset || 0) + step).toFixed(2)));
                    }}
                    className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-[9px] font-heading font-bold text-zinc-300 cursor-pointer"
                  >
                    {step === 0 ? 'RESET' : step > 0 ? `+${step}s` : `${step}s`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ========================================================
              6. SCREEN BLACKOUT & MASTER BLACKOUT
              ======================================================== */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => {
                const ch = ledMediaManager.getChannel(selectedScreen);
                ch.setBlackout(!activeChannel.blackout);
              }}
              className={`flex-1 py-2.5 rounded-xl border font-heading font-bold text-xs flex items-center justify-center gap-2 cursor-pointer ${
                activeChannel.blackout
                  ? 'bg-red-500 text-white border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                  : 'bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>BLACKOUT {selectedScreen}</span>
            </button>

            <button
              onClick={() => {
                const currentMb = ledMediaManager.masterBlackout;
                ledMediaManager.setMasterBlackout(!currentMb);
              }}
              className={`flex-1 py-2.5 rounded-xl border font-heading font-bold text-xs flex items-center justify-center gap-2 cursor-pointer ${
                ledMediaManager.masterBlackout
                  ? 'bg-red-600 text-white border-red-400 shadow-[0_0_20px_rgba(220,38,38,0.5)]'
                  : 'bg-red-950/40 border-red-800/40 text-red-300 hover:bg-red-900/40'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{ledMediaManager.masterBlackout ? 'LIFT ALL BLACKOUT' : 'MASTER BLACKOUT ALL'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


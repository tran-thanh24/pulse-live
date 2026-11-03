/**
 * PerformanceHUD.jsx — Development Diagnostics & Performance Monitoring HUD
 * Throttled to 3 Hz (Rule 2: 2–4 updates/sec) to avoid React re-render overhead.
 * Displays: FPS, Frame Time ms, Draw Calls, Triangles, Geometries, Textures,
 * Active Video/YouTube streams, Crowd count, Animated Character count, Shadow lights, DPR, Quality mode.
 */
import React, { useState, useEffect } from 'react';
import {
  Activity,
  Cpu,
  Layers,
  Video,
  Users,
  Sun,
  Eye,
  X,
  Play,
  RotateCcw,
  Sparkles,
  BarChart2
} from 'lucide-react';
import { performanceManager, QUALITY_TIERS } from '../systems/PerformanceManager';
import { useConcertStore } from '../store/concertStore';
import { useUserStore } from '../store/userStore';

export function PerformanceHUD() {
  const [metrics, setMetrics] = useState(() => performanceManager.getSnapshot());
  const [isOpen, setIsOpen] = useState(false);
  const [benchmarkLoading, setBenchmarkLoading] = useState(false);
  const [benchmarkReport, setBenchmarkReport] = useState(null);

  const devMode = useConcertStore((s) => s.devMode);
  const setDevMode = useConcertStore((s) => s.setDevMode);
  const studioMode = useConcertStore((s) => s.studioMode);

  // Throttled 3 Hz update (Rule 2)
  useEffect(() => {
    const timer = setInterval(() => {
      setMetrics(performanceManager.getSnapshot());
    }, 333);
    return () => clearInterval(timer);
  }, []);

  // Keyboard shortcut: Shift + P toggles HUD
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.shiftKey && (e.key === 'P' || e.key === 'p')) {
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isOpen && !devMode) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 px-2.5 py-1.5 rounded-lg bg-black/80 hover:bg-black/90 border border-cyan-400/40 text-[10px] font-heading font-bold text-cyan-300 shadow-lg cursor-pointer flex items-center gap-1.5 backdrop-blur-md"
        title="Open Performance Diagnostics (Shift + P)"
      >
        <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
        <span>{metrics.fps} FPS · {metrics.activeTier}</span>
      </button>
    );
  }

  const fpsColor =
    metrics.fps >= 52
      ? 'text-emerald-400'
      : metrics.fps >= 35
      ? 'text-yellow-400'
      : 'text-red-400';

  const handleRunBenchmark = async () => {
    setBenchmarkLoading(true);
    const results = await performanceManager.runBenchmarkSuite();
    setBenchmarkReport(results);
    setBenchmarkLoading(false);
  };

  return (
    <div className="fixed top-16 left-4 z-50 w-80 max-h-[85vh] overflow-y-auto glass-panel border border-cyan-400/40 rounded-2xl p-3.5 text-white shadow-2xl backdrop-blur-xl select-none text-xs font-mono">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2.5">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#22D3EE]" />
          <span className="font-heading font-bold text-xs tracking-wider text-white">
            PERFORMANCE HUD V1
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setDevMode(!devMode)}
            className={`px-1.5 py-0.5 rounded text-[9px] font-heading font-bold border ${
              devMode ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'bg-white/5 border-white/10 text-zinc-400'
            }`}
          >
            DEV
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Frame Rate & Time */}
      <div className="grid grid-cols-2 gap-2 mb-2.5">
        <div className="p-2 rounded-xl bg-white/[0.04] border border-white/10 flex flex-col justify-between">
          <span className="text-[10px] text-zinc-400 font-heading">FRAME RATE</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className={`text-xl font-bold font-heading ${fpsColor}`}>
              {metrics.fps}
            </span>
            <span className="text-[10px] text-zinc-400">FPS</span>
          </div>
          <span className="text-[9px] text-zinc-500">
            min: {metrics.minFps} · avg: {metrics.avgFps}
          </span>
        </div>

        <div className="p-2 rounded-xl bg-white/[0.04] border border-white/10 flex flex-col justify-between">
          <span className="text-[10px] text-zinc-400 font-heading">FRAME TIME</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-bold font-heading text-white">
              {metrics.frameTimeMs}
            </span>
            <span className="text-[10px] text-zinc-400">ms</span>
          </div>
          <span className="text-[9px] text-zinc-500">
            target: &lt;16.6ms
          </span>
        </div>
      </div>

      {/* WebGL Render Stats */}
      <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-1.5 mb-2.5 text-[11px]">
        <div className="flex justify-between">
          <span className="text-zinc-400">Draw Calls:</span>
          <span className="font-bold text-white">{metrics.drawCalls}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-400">Triangles:</span>
          <span className="font-bold text-white">
            {(metrics.triangles / 1000).toFixed(1)}k
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-400">Geometries / Textures:</span>
          <span className="font-bold text-white">
            {metrics.geometries} / {metrics.textures}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-400">Effective DPR:</span>
          <span className="font-bold text-cyan-300">
            {metrics.effectiveDpr}x {metrics.isMovingFast ? '(dynamic scale)' : ''}
          </span>
        </div>
      </div>

      {/* Media & Crowd Load */}
      <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-1.5 mb-2.5 text-[11px]">
        <div className="flex justify-between">
          <span className="text-zinc-400">Active Videos (Native):</span>
          <span className="font-bold text-emerald-400">{metrics.activeVideos}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-400">YouTube Players (3D):</span>
          <span className="font-bold text-red-400">{metrics.activeYouTubePlayers}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-400">Crowd Instances:</span>
          <span className="font-bold text-purple-300">{metrics.crowdCount}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-400">Stage Artists:</span>
          <span className="font-bold text-pink-300">{metrics.animatedCharacters}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-400">Shadow Lights:</span>
          <span className="font-bold text-yellow-300">{metrics.shadowLightCount}</span>
        </div>
      </div>

      {/* Quality Tier Switcher */}
      <div className="mb-2.5">
        <div className="flex justify-between text-[10px] font-heading text-zinc-400 uppercase mb-1">
          <span>GRAPHICS QUALITY</span>
          <span className="text-cyan-300 font-bold">{metrics.activeTier}</span>
        </div>
        <div className="grid grid-cols-4 gap-1">
          {Object.keys(QUALITY_TIERS).map((tier) => (
            <button
              key={tier}
              onClick={() => {
                performanceManager.setUserQualityMode(tier);
                useUserStore.getState().updateSettings({ graphicsQuality: tier });
              }}
              className={`py-1 rounded font-heading text-[10px] font-bold border cursor-pointer ${
                metrics.qualityMode === tier
                  ? 'bg-cyan-500/30 border-cyan-400 text-white'
                  : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white'
              }`}
            >
              {tier}
            </button>
          ))}
        </div>
      </div>

      {/* Benchmark Runner */}
      <div className="pt-1">
        <button
          onClick={handleRunBenchmark}
          disabled={benchmarkLoading}
          className="w-full py-2 rounded-xl bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 hover:from-cyan-500/30 hover:to-pink-500/30 border border-cyan-400/40 text-cyan-300 font-heading font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <BarChart2 className="w-3.5 h-3.5" />
          <span>{benchmarkLoading ? `PROFILING: ${metrics.benchmarkPhase || 'RUNNING...'}` : 'RUN 7-PHASE BENCHMARK'}</span>
        </button>

        {benchmarkReport && (
          <div className="mt-2.5 p-2 rounded-xl bg-black/60 border border-cyan-400/30 space-y-1.5 text-[10px]">
            <div className="font-heading font-bold text-cyan-300 text-center border-b border-white/10 pb-1">
              BENCHMARK SCENES REPORT (A–G)
            </div>
            {Object.entries(benchmarkReport).map(([key, data]) => (
              <div key={key} className="flex justify-between items-center py-0.5 border-b border-white/5">
                <span className="text-zinc-300 truncate max-w-[130px]">{key}. {data.name}</span>
                <span className="font-mono text-cyan-300 font-bold">{data.avgFps} FPS · {data.frameTimeMs}ms</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

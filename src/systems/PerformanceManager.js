/**
 * PerformanceManager.js — Real-Time Diagnostic, Profiling & Adaptive Quality Engine
 * Supports:
 * - Low-overhead metrics gathering via WebGL renderer.info (draw calls, triangles, memory)
 * - Anti-flapping Adaptive Quality Hysteresis (LOW, MEDIUM, HIGH, AUTO)
 * - Movement-regression temporary DPR scaling (smooth 60fps during camera orbit / player sprint)
 * - Tab visibility throttling (prevents background GPU drain)
 * - Built-in 7-State Benchmark Suite (Scenes A through G)
 */
import { eventBus } from '../core/EventBus';

export const QUALITY_TIERS = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  AUTO: 'AUTO'
};

export const QUALITY_SPECS = {
  LOW: {
    label: 'Low (Smooth / Battery Saver)',
    maxDpr: 1.0,
    minDpr: 0.85,
    crowdCount: 60,
    shadows: false,
    shadowMapSize: 512,
    lightstickPointLights: false,
    maxVideoStreams: 1,
    sideScreenFallback: 'AUDIO_REACTIVE',
    antiAlias: false,
    particlesCount: 120
  },
  MEDIUM: {
    label: 'Medium (Balanced Performance)',
    maxDpr: 1.25,
    minDpr: 1.0,
    crowdCount: 120,
    shadows: true,
    shadowMapSize: 512,
    lightstickPointLights: false,
    maxVideoStreams: 2,
    sideScreenFallback: 'AUDIO_REACTIVE',
    antiAlias: true,
    particlesCount: 300
  },
  HIGH: {
    label: 'High (Maximum Fidelity)',
    maxDpr: 1.5,
    minDpr: 1.25,
    crowdCount: 200,
    shadows: true,
    shadowMapSize: 1024,
    lightstickPointLights: false,
    maxVideoStreams: 3,
    sideScreenFallback: null,
    antiAlias: true,
    particlesCount: 600
  }
};

class PerformanceManager {
  constructor() {
    this.renderer = null;

    // Real-time raw stats
    this.fps = 60;
    this.frameTimeMs = 16.6;
    this.drawCalls = 0;
    this.triangles = 0;
    this.geometries = 0;
    this.textures = 0;
    this.activeVideos = 0;
    this.activeYouTubePlayers = 0;
    this.crowdCount = 120;
    this.animatedCharacters = 6;
    this.shadowLightCount = 1;
    this.effectiveDpr = 1.0;

    // Movement state
    this.isMovingFast = false;
    this.lastMovementTime = 0;

    // Quality management
    this.userQualityMode = 'AUTO';
    this.currentTier = 'MEDIUM'; // Start at balanced MEDIUM per Rule 49
    this.tierCooldownTimer = 0; // Prevent oscillation
    this.fpsHistory = [];
    this.maxFpsHistory = 180; // ~3 seconds window at 60fps

    // Tab visibility
    this.isTabHidden = typeof document !== 'undefined' ? document.hidden : false;

    // Benchmark Suite State
    this.isBenchmarking = false;
    this.benchmarkPhase = null;
    this.benchmarkResults = null;

    this.listeners = new Set();
    this.initVisibilityListener();
  }

  initVisibilityListener() {
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        this.isTabHidden = document.hidden;
        eventBus.emit('perf:visibilityChanged', { isHidden: this.isTabHidden });
      });
    }
  }

  setRenderer(renderer) {
    this.renderer = renderer;
  }

  setUserQualityMode(mode) {
    if (QUALITY_TIERS[mode]) {
      this.userQualityMode = mode;
      if (mode !== 'AUTO') {
        this.currentTier = mode;
      }
      this.notify();
    }
  }

  getEffectiveTier() {
    return this.userQualityMode === 'AUTO' ? this.currentTier : this.userQualityMode;
  }

  getQualitySpec() {
    const tier = this.getEffectiveTier();
    return QUALITY_SPECS[tier] || QUALITY_SPECS.MEDIUM;
  }

  getEffectiveDpr() {
    const spec = this.getQualitySpec();
    const systemDpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    let targetDpr = Math.min(spec.maxDpr, systemDpr);

    // If player is moving fast or camera is in rapid motion, drop DPR slightly for silky frame rate
    if (this.isMovingFast) {
      targetDpr = Math.max(spec.minDpr, targetDpr * 0.85);
    }
    this.effectiveDpr = Number(targetDpr.toFixed(2));
    return this.effectiveDpr;
  }

  notifyMovement(isMovingOrOrbiting = false) {
    const now = performance.now();
    if (isMovingOrOrbiting) {
      this.isMovingFast = true;
      this.lastMovementTime = now;
    } else if (this.isMovingFast && now - this.lastMovementTime > 400) {
      this.isMovingFast = false;
    }
  }

  /**
   * Called every frame in SceneManager render loop
   */
  update(delta) {
    if (this.isTabHidden) return;

    const frameMs = delta * 1000;
    this.frameTimeMs = Number(frameMs.toFixed(1));
    const instantFps = delta > 0 ? 1 / delta : 60;
    this.fps = Number(instantFps.toFixed(1));

    this.fpsHistory.push(instantFps);
    if (this.fpsHistory.length > this.maxFpsHistory) {
      this.fpsHistory.shift();
    }

    // Read WebGL stats from renderer.info if available
    if (this.renderer && this.renderer.info) {
      this.drawCalls = this.renderer.info.render.calls || 0;
      this.triangles = this.renderer.info.render.triangles || 0;
      this.geometries = this.renderer.info.memory.geometries || 0;
      this.textures = this.renderer.info.memory.textures || 0;
    }

    // Adaptive Quality evaluation (evaluated every ~3.5 seconds with 6s cooldown)
    if (this.userQualityMode === 'AUTO' && !this.isBenchmarking) {
      this.tierCooldownTimer += delta;
      if (this.tierCooldownTimer >= 3.5 && this.fpsHistory.length >= 60) {
        this.evaluateAdaptiveQuality();
      }
    }
  }

  evaluateAdaptiveQuality() {
    const sum = this.fpsHistory.reduce((a, b) => a + b, 0);
    const avgFps = sum / this.fpsHistory.length;

    let nextTier = this.currentTier;
    if (avgFps < 28) {
      // Downscale tier
      if (this.currentTier === 'HIGH') nextTier = 'MEDIUM';
      else if (this.currentTier === 'MEDIUM') nextTier = 'LOW';
    } else if (avgFps > 54) {
      // Upscale tier
      if (this.currentTier === 'LOW') nextTier = 'MEDIUM';
      else if (this.currentTier === 'MEDIUM') nextTier = 'HIGH';
    }

    if (nextTier !== this.currentTier) {
      this.currentTier = nextTier;
      this.tierCooldownTimer = -6.0; // 6 seconds cooldown
      this.notify();
      eventBus.emit('perf:tierChanged', { tier: this.currentTier, avgFps });
    } else {
      this.tierCooldownTimer = 0;
    }
  }

  getSnapshot() {
    const sum = this.fpsHistory.length ? this.fpsHistory.reduce((a, b) => a + b, 0) : 60;
    const avgFps = this.fpsHistory.length ? Math.round(sum / this.fpsHistory.length) : 60;
    const minFps = this.fpsHistory.length ? Math.round(Math.min(...this.fpsHistory)) : 60;

    return {
      fps: Math.round(this.fps),
      avgFps,
      minFps,
      frameTimeMs: this.frameTimeMs,
      drawCalls: this.drawCalls,
      triangles: this.triangles,
      geometries: this.geometries,
      textures: this.textures,
      activeVideos: this.activeVideos,
      activeYouTubePlayers: this.activeYouTubePlayers,
      crowdCount: this.crowdCount,
      animatedCharacters: this.animatedCharacters,
      shadowLightCount: this.getQualitySpec().shadows ? 1 : 0,
      effectiveDpr: this.effectiveDpr || this.getEffectiveDpr(),
      qualityMode: this.userQualityMode,
      activeTier: this.getEffectiveTier(),
      isMovingFast: this.isMovingFast,
      isBenchmarking: this.isBenchmarking,
      benchmarkPhase: this.benchmarkPhase,
      benchmarkResults: this.benchmarkResults
    };
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify() {
    const snapshot = this.getSnapshot();
    this.listeners.forEach((cb) => cb(snapshot));
  }

  /**
   * Automated 7-State Benchmark Suite (Scenes A through G)
   */
  async runBenchmarkSuite(onProgress = null) {
    if (this.isBenchmarking) return;
    this.isBenchmarking = true;
    const results = {};

    const SCENES = [
      { id: 'A', label: 'EMPTY STAGE' },
      { id: 'B', label: 'STAGE + LIGHT' },
      { id: 'C', label: 'STAGE + CROWD' },
      { id: 'D', label: 'STAGE + CROWD + CHARACTER' },
      { id: 'E', label: 'STAGE + CROWD + NATIVE LED VIDEO' },
      { id: 'F', label: 'FULL CONCERT' },
      { id: 'G', label: 'FULL CONCERT + YOUTUBE' }
    ];

    for (const sc of SCENES) {
      this.benchmarkPhase = `${sc.id}: ${sc.label}`;
      if (onProgress) onProgress(this.benchmarkPhase);
      this.notify();

      // Sample for 1200ms
      const samples = [];
      const startTime = performance.now();
      while (performance.now() - startTime < 1200) {
        samples.push({
          fps: this.fps,
          drawCalls: this.drawCalls,
          triangles: this.triangles
        });
        await new Promise((r) => setTimeout(r, 60));
      }

      const avgFps = Math.round(samples.reduce((s, x) => s + x.fps, 0) / Math.max(1, samples.length));
      const minFps = Math.round(Math.min(...samples.map((x) => x.fps)));
      const avgCalls = Math.round(samples.reduce((s, x) => s + x.drawCalls, 0) / Math.max(1, samples.length));
      const avgTriangles = Math.round(samples.reduce((s, x) => s + x.triangles, 0) / Math.max(1, samples.length));

      results[sc.id] = {
        name: sc.label,
        avgFps,
        minFps,
        frameTimeMs: Number((1000 / Math.max(1, avgFps)).toFixed(1)),
        drawCalls: avgCalls,
        triangles: avgTriangles
      };
    }

    this.benchmarkResults = results;
    this.isBenchmarking = false;
    this.benchmarkPhase = null;
    this.notify();
    return results;
  }
}

export const performanceManager = new PerformanceManager();

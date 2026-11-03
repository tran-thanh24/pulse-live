import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { CameraController } from './CameraController';
import { LightingManager } from './LightingManager';
import { ConcertWorld } from '../world/ConcertWorld';
import { useConcertStore } from '../store/concertStore';
import { useUserStore } from '../store/userStore';
import { showDirector } from '../systems/ShowDirector';

/**
 * Master Clock Runner & Adaptive Quality FPS Monitor
 * Runs ShowDirector (driven by MusicEngine.getCurrentTime()) and tracks FPS for AUTO quality scaling.
 */
function ShowDirectorAndPerformanceRunner() {
  const frameCountRef = useRef(0);
  const elapsedRef = useRef(0);

  useFrame((_, delta) => {
    showDirector.update(delta, useConcertStore);

    frameCountRef.current += 1;
    elapsedRef.current += delta;

    if (elapsedRef.current >= 2.0) {
      const fps = Math.round(frameCountRef.current / elapsedRef.current);
      frameCountRef.current = 0;
      elapsedRef.current = 0;

      const cStore = useConcertStore.getState();
      const qualitySetting = useUserStore.getState().settings.graphicsQuality;

      let nextTier = cStore.adaptiveTier;
      if (qualitySetting === 'AUTO') {
        if (fps < 32) nextTier = 'LOW';
        else if (fps < 48) nextTier = 'MEDIUM';
        else nextTier = 'HIGH';
      } else {
        nextTier = qualitySetting;
      }

      if (Math.abs(fps - cStore.currentFps) >= 3 || nextTier !== cStore.adaptiveTier) {
        cStore.setPerformanceMetrics(fps, nextTier);
      }
    }
  });

  return null;
}

/**
 * SceneManager: Hosts the WebGL Three.js Canvas with adaptive DPR & preserveDrawingBuffer for Photo Mode
 */
export function SceneManager() {
  const graphicsQuality = useUserStore((s) => s.settings.graphicsQuality);
  const adaptiveTier = useConcertStore((s) => s.adaptiveTier);

  const effectiveQuality = graphicsQuality === 'AUTO' ? adaptiveTier : graphicsQuality;

  const dpr =
    effectiveQuality === 'LOW'
      ? [0.75, 1]
      : effectiveQuality === 'MEDIUM'
      ? [1, 1.25]
      : [1, 1.75];

  return (
    <div id="nova-canvas-container" className="w-full h-full relative bg-[#070816]">
      <Canvas
        shadows={effectiveQuality !== 'LOW'}
        dpr={dpr}
        camera={{ position: [0, 4.5, 41], fov: 55, near: 0.1, far: 160 }}
        gl={{
          preserveDrawingBuffer: true,
          antialias: effectiveQuality !== 'LOW',
          powerPreference: 'high-performance'
        }}
      >
        <Suspense fallback={null}>
          <ShowDirectorAndPerformanceRunner />
          <CameraController />
          <LightingManager />
          <ConcertWorld />
        </Suspense>
      </Canvas>
    </div>
  );
}

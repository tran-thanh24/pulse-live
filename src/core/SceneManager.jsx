import React, { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { CameraController } from './CameraController';
import { LightingManager } from './LightingManager';
import { ConcertWorld } from '../world/ConcertWorld';
import { useConcertStore } from '../store/concertStore';
import { useUserStore } from '../store/userStore';
import { showDirector } from '../systems/ShowDirector';
import { performanceManager } from '../systems/PerformanceManager';
import { PerformanceHUD } from '../ui/PerformanceHUD';

/**
 * Master Clock Runner & Performance Diagnostic Link
 */
function ShowDirectorAndPerformanceRunner() {
  const { gl } = useThree();

  useEffect(() => {
    performanceManager.setRenderer(gl);
  }, [gl]);

  useFrame((_, delta) => {
    // 1. Advance Master Show Clock
    showDirector.update(delta, useConcertStore);

    // 2. Measure performance metrics & adaptive tier
    performanceManager.update(delta);
  });

  return null;
}

/**
 * SceneManager: Hosts the WebGL Three.js Canvas with adaptive DPR & Performance Diagnostics
 */
export function SceneManager() {
  const graphicsQuality = useUserStore((s) => s.settings.graphicsQuality);
  const [dpr, setDpr] = useState(() => performanceManager.getEffectiveDpr());
  const [tier, setTier] = useState(() => performanceManager.getEffectiveTier());

  useEffect(() => {
    performanceManager.setUserQualityMode(graphicsQuality);
  }, [graphicsQuality]);

  useEffect(() => {
    const unsub = performanceManager.subscribe((metrics) => {
      setDpr(metrics.effectiveDpr);
      setTier(metrics.activeTier);
    });
    return unsub;
  }, []);

  const spec = performanceManager.getQualitySpec();

  return (
    <div id="nova-canvas-container" className="w-full h-full relative bg-[#070816]">
      <Canvas
        shadows={spec.shadows}
        dpr={dpr}
        camera={{ position: [0, 4.5, 41], fov: 55, near: 0.1, far: 160 }}
        gl={{
          preserveDrawingBuffer: true,
          antialias: spec.antiAlias,
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
      <PerformanceHUD />
    </div>
  );
}

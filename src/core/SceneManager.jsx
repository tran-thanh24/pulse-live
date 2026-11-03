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
import { eventBus } from './EventBus';

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
 * SceneManager: Hosts the WebGL Three.js Canvas with stable DPR to prevent WebGL Context Loss
 */
export function SceneManager() {
  const graphicsQuality = useUserStore((s) => s.settings.graphicsQuality);
  const [tier, setTier] = useState(() => performanceManager.getEffectiveTier());

  useEffect(() => {
    performanceManager.setUserQualityMode(graphicsQuality);
    setTier(performanceManager.getEffectiveTier());
  }, [graphicsQuality]);

  useEffect(() => {
    const unsub = eventBus.on('perf:tierChanged', ({ tier: newTier }) => {
      setTier(newTier);
    });
    return unsub;
  }, []);

  const dpr = tier === 'LOW' ? 1.0 : tier === 'MEDIUM' ? 1.25 : 1.5;
  const enableShadows = tier !== 'LOW';

  return (
    <div id="nova-canvas-container" className="w-full h-full relative bg-[#070816]">
      <Canvas
        shadows={enableShadows}
        dpr={dpr}
        camera={{ position: [0, 4.5, 41], fov: 55, near: 0.1, far: 160 }}
        gl={{
          preserveDrawingBuffer: true,
          antialias: tier !== 'LOW',
          powerPreference: 'high-performance'
        }}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener('webglcontextlost', (e) => {
            e.preventDefault();
            console.warn('[PULSE] WebGL context lost handled gracefully.');
          });
          gl.domElement.addEventListener('webglcontextrestored', () => {
            console.log('[PULSE] WebGL context restored.');
          });
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

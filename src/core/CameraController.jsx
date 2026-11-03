import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useConcertStore } from '../store/concertStore';
import { cameraDirector } from '../systems/CameraDirector';

/**
 * CameraController: Mouse drag to orbit camera around player + Scroll wheel zoom + CameraDirector presets
 */
export function CameraController() {
  const { camera, gl } = useThree();
  const isDraggingRef = useRef(false);
  const prevPointerRef = useRef({ x: 0, y: 0 });
  const currentLookAtRef = useRef(new THREE.Vector3(0, 1.8, 28));

  useEffect(() => {
    const domElement = gl.domElement;
    if (!domElement) return;

    const onPointerDown = (e) => {
      isDraggingRef.current = true;
      prevPointerRef.current = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - prevPointerRef.current.x;
      const dy = e.clientY - prevPointerRef.current.y;
      prevPointerRef.current = { x: e.clientX, y: e.clientY };

      const cStore = useConcertStore.getState();
      const { yaw, pitch } = cStore.cameraOrbitOffset;
      cStore.setCameraOrbitOffset({
        yaw: yaw - dx * 0.0065,
        pitch: Math.max(0.08, Math.min(1.05, pitch + dy * 0.0055))
      });
    };

    const onPointerUp = () => {
      isDraggingRef.current = false;
    };

    const onWheel = (e) => {
      const cStore = useConcertStore.getState();
      const { distance } = cStore.cameraOrbitOffset;
      const nextDist = Math.max(3.2, Math.min(14.5, distance + e.deltaY * 0.005));
      cStore.setCameraOrbitOffset({ distance: nextDist });
    };

    domElement.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    domElement.addEventListener('wheel', onWheel, { passive: true });

    return () => {
      domElement.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      domElement.removeEventListener('wheel', onWheel);
    };
  }, [gl]);

  useFrame((state, delta) => {
    const cStore = useConcertStore.getState();
    const t = state.clock.getElapsedTime();

    const { position, lookAt, lerpFactor } = cameraDirector.computeCameraTargets({
      cameraMode: cStore.cameraMode,
      playerPosition: cStore.playerPosition,
      playerRotation: cStore.playerRotation,
      cameraOrbitOffset: cStore.cameraOrbitOffset,
      elapsedTime: t,
      photoZoom: cStore.photoSettings?.zoom || 1,
      photoAnglePreset: cStore.photoSettings?.anglePreset || 'portrait'
    });

    const alpha = Math.min(1, delta * lerpFactor);
    camera.position.lerp(position, alpha);
    currentLookAtRef.current.lerp(lookAt, alpha);
    camera.lookAt(currentLookAtRef.current);
  });

  return null;
}

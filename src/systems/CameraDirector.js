import * as THREE from 'three';

const desiredPos = new THREE.Vector3();
const desiredLookAt = new THREE.Vector3();

/**
 * CameraDirector: Smooth, cinematic multi-camera director for PULSE//LIVE 2026
 * Supports all 10 required presets:
 * PLAYER, WIDE_STAGE, ARTIST_CLOSE, RUNWAY, B_STAGE, CROWD, SIDE_STAGE, CRANE, DRONE, ORBIT
 * Plus PHOTO mode for Memory Booth.
 */
export const CAMERA_PRESETS = [
  'PLAYER',
  'WIDE_STAGE',
  'ARTIST_CLOSE',
  'RUNWAY',
  'B_STAGE',
  'CROWD',
  'SIDE_STAGE',
  'CRANE',
  'DRONE',
  'ORBIT'
];

export const cameraDirector = {
  computeCameraTargets({
    cameraMode,
    playerPosition,
    playerRotation,
    cameraOrbitOffset,
    elapsedTime,
    photoZoom = 1,
    photoAnglePreset = 'portrait'
  }) {
    const [px, py, pz] = playerPosition;
    const t = elapsedTime;

    // Photo Mode custom angles
    if (cameraMode === 'photo') {
      const dist = 3.1 / Math.max(0.5, photoZoom);
      if (photoAnglePreset === 'wide-stage') {
        desiredPos.set(px + 1.8, py + 1.8, pz + dist * 1.45);
        desiredLookAt.set(px * 0.5, py + 1.9, -18);
      } else if (photoAnglePreset === 'low-hero') {
        desiredPos.set(px + Math.sin(playerRotation) * dist, py + 0.85, pz + Math.cos(playerRotation) * dist);
        desiredLookAt.set(px, py + 1.55, pz - 2);
      } else if (photoAnglePreset === 'runway') {
        desiredPos.set(px - 2.2, py + 1.6, pz + 2.4);
        desiredLookAt.set(0, 2.2, -16);
      } else {
        // Default portrait
        const angle = playerRotation;
        desiredPos.set(
          px + Math.sin(angle) * dist,
          py + 1.5,
          pz + Math.cos(angle) * dist
        );
        desiredLookAt.set(px, py + 1.38, pz);
      }
      return { position: desiredPos, lookAt: desiredLookAt, lerpFactor: 6.5 };
    }

    switch (cameraMode) {
      case 'WIDE_STAGE':
        desiredPos.set(Math.sin(t * 0.25) * 3.5, 5.2, 6.5);
        desiredLookAt.set(0, 4.8, -22);
        return { position: desiredPos, lookAt: desiredLookAt, lerpFactor: 2.8 };

      case 'ARTIST_CLOSE':
        desiredPos.set(Math.sin(t * 0.4) * 1.6, 2.6, -13.5);
        desiredLookAt.set(0, 2.4, -19.2);
        return { position: desiredPos, lookAt: desiredLookAt, lerpFactor: 3.2 };

      case 'RUNWAY':
        desiredPos.set(4.5 * Math.cos(t * 0.35), 2.8, -4.5);
        desiredLookAt.set(0, 2.0, -14.5);
        return { position: desiredPos, lookAt: desiredLookAt, lerpFactor: 3.0 };

      case 'B_STAGE':
        desiredPos.set(Math.sin(t * 0.5) * 6.5, 3.2, 6 + Math.cos(t * 0.5) * 6.5);
        desiredLookAt.set(0, 1.8, 6);
        return { position: desiredPos, lookAt: desiredLookAt, lerpFactor: 3.0 };

      case 'CROWD':
        desiredPos.set(-8.5 + Math.sin(t * 0.3) * 4, 2.5, -6.5);
        desiredLookAt.set(2, 2.2, 4);
        return { position: desiredPos, lookAt: desiredLookAt, lerpFactor: 2.8 };

      case 'SIDE_STAGE':
        desiredPos.set(-14.5, 4.2, -17.5 + Math.sin(t * 0.3) * 2);
        desiredLookAt.set(0, 3.2, -20.5);
        return { position: desiredPos, lookAt: desiredLookAt, lerpFactor: 3.0 };

      case 'CRANE':
        desiredPos.set(-15 + Math.sin(t * 0.35) * 5, 8.5 + Math.cos(t * 0.3) * 2.5, -2);
        desiredLookAt.set(0, 4.2, -21);
        return { position: desiredPos, lookAt: desiredLookAt, lerpFactor: 2.5 };

      case 'DRONE':
        desiredPos.set(Math.sin(t * 0.28) * 18, 16.5, 22 + Math.cos(t * 0.28) * 8);
        desiredLookAt.set(0, 3.8, -18);
        return { position: desiredPos, lookAt: desiredLookAt, lerpFactor: 2.2 };

      case 'ORBIT':
        desiredPos.set(Math.sin(t * 0.45) * 16, 6.2, -8 + Math.cos(t * 0.45) * 14);
        desiredLookAt.set(0, 4.2, -20);
        return { position: desiredPos, lookAt: desiredLookAt, lerpFactor: 3.0 };

      case 'PLAYER':
      case 'follow':
      default: {
        const { yaw = 0, pitch = 0.28, distance = 6.8 } = cameraOrbitOffset;
        const clampedPitch = Math.max(0.08, Math.min(1.05, pitch));
        const horizontalDist = distance * Math.cos(clampedPitch);
        const verticalDist = distance * Math.sin(clampedPitch);

        desiredPos.set(
          px + Math.sin(yaw) * horizontalDist,
          Math.max(1.2, py + 1.6 + verticalDist),
          pz + Math.cos(yaw) * horizontalDist
        );
        desiredLookAt.set(px, py + 1.65, pz - 1.2);
        return { position: desiredPos, lookAt: desiredLookAt, lerpFactor: 8.5 };
      }
    }
  }
};


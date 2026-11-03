import * as THREE from 'three';

const desiredPos = new THREE.Vector3();
const desiredLookAt = new THREE.Vector3();

/**
 * CameraSystem: Smooth 3rd-person follow camera + Photo booth close-up + VIP / Panoramic / Entry cinematic views.
 */
export const cameraSystem = {
  entryTimer: 0,

  computeCameraTargets({
    cameraMode,
    playerPosition,
    playerRotation,
    cameraOrbitOffset,
    elapsedTime
  }) {
    const [px, py, pz] = playerPosition;

    if (cameraMode === 'photo') {
      // Front-facing portrait angle showing player avatar and NOVA LIVE stage / photo backdrop behind
      const dist = 3.2;
      const angle = playerRotation;
      desiredPos.set(
        px + Math.sin(angle) * dist,
        py + 1.55,
        pz + Math.cos(angle) * dist
      );
      desiredLookAt.set(px, py + 1.35, pz);
      return { position: desiredPos, lookAt: desiredLookAt, lerpFactor: 8 };
    }

    if (cameraMode === 'vip') {
      desiredPos.set(-19, 6.5, -8);
      desiredLookAt.set(0, 4.2, -24);
      return { position: desiredPos, lookAt: desiredLookAt, lerpFactor: 4 };
    }

    if (cameraMode === 'panoramic') {
      desiredPos.set(0, 14, 28 + Math.sin(elapsedTime * 0.25) * 3);
      desiredLookAt.set(0, 3.5, -20);
      return { position: desiredPos, lookAt: desiredLookAt, lerpFactor: 3.5 };
    }

    if (cameraMode === 'stage-focus') {
      desiredPos.set(px * 0.4, py + 3.4, Math.min(pz + 4.5, 4));
      desiredLookAt.set(0, 4.5, -24);
      return { position: desiredPos, lookAt: desiredLookAt, lerpFactor: 5 };
    }

    // Default 3rd-person follow camera controlled by mouse orbit yaw/pitch
    const { yaw = 0, pitch = 0.28, distance = 6.8 } = cameraOrbitOffset;
    const clampedPitch = Math.max(0.08, Math.min(1.05, pitch));
    const horizontalDist = distance * Math.cos(clampedPitch);
    const verticalDist = distance * Math.sin(clampedPitch);

    desiredPos.set(
      px + Math.sin(yaw) * horizontalDist,
      Math.max(1.2, py + 1.6 + verticalDist),
      pz + Math.cos(yaw) * horizontalDist
    );

    // Look slightly above the player's shoulders towards the stage/horizon
    desiredLookAt.set(px, py + 1.65, pz - 1.2);
    return { position: desiredPos, lookAt: desiredLookAt, lerpFactor: 10 };
  }
};


import React, { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { movementSystem } from '../systems/MovementSystem';
import { zoneManager } from '../systems/ZoneManager';
import { interactionSystem } from '../systems/InteractionSystem';
import { achievementSystem } from '../systems/AchievementSystem';
import { audienceEnergySystem } from '../systems/AudienceEnergySystem';
import { audioManager } from '../core/AudioManager';
import { realtimeService, presenceService } from '../services/realtime';
import { useConcertStore } from '../store/concertStore';
import { useUserStore } from '../store/userStore';
import { performanceManager } from '../systems/PerformanceManager';

/**
 * CharacterController: Handles keyboard/joystick movement (WASD / Arrows / Shift / Space),
 * concert hotkeys ([E] Interact, [F] Pulse Light, [P] Photo Mode, [`] Studio Mode, [1-4] Reactions, [Esc] Close Modal),
 * CollisionSystem + AccessControlSystem feedback, zone proximity detection, and multiplayer broadcast.
 */
export function CharacterController({ children }) {
  const groupRef = useRef();

  useEffect(() => {
    const onKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;

      movementSystem.handleKeyDown(e.code);
      const cStore = useConcertStore.getState();
      const uStore = useUserStore.getState();

      if (e.code === 'Escape') {
        if (cStore.activeModal) {
          audioManager.playUISound('click');
          cStore.setActiveModal(null);
        } else if (cStore.studioMode) {
          cStore.setStudioMode(false);
        }
        return;
      }

      if (e.code === 'KeyE') {
        if (!cStore.activeModal && cStore.activeZone) {
          interactionSystem.triggerZoneAction(
            cStore.activeZone,
            useConcertStore,
            useUserStore
          );
        }
      } else if (e.code === 'KeyF') {
        const nextMode = cStore.cycleLightstickMode();
        presenceService.updateLightstick(nextMode, uStore.lightstickColor);
        audioManager.playLightstickActivation(nextMode);
        if (nextMode !== 'OFF') {
          achievementSystem.unlock('LIGHT_IT_UP');
        }
      } else if (e.code === 'KeyP') {
        audioManager.playUISound('click');
        cStore.setActiveModal(cStore.activeModal === 'photo' ? null : 'photo');
      } else if (e.code === 'Backquote') {
        audioManager.playUISound('click');
        cStore.toggleStudioMode();
      } else if (e.code === 'Digit1') {
        if (cStore.triggerReaction('CLAP', '👏', 'CLAP')) {
          audioManager.playUISound('click');
          audienceEnergySystem.addReactionEnergy('CLAP');
          achievementSystem.unlock('FAN_MOMENT');
        }
      } else if (e.code === 'Digit2') {
        if (cStore.triggerReaction('HEART', '❤️', 'HEART')) {
          audioManager.playUISound('click');
          audienceEnergySystem.addReactionEnergy('HEART');
          achievementSystem.unlock('FAN_MOMENT');
        }
      } else if (e.code === 'Digit3') {
        if (cStore.triggerReaction('HYPE', '🔥', 'HYPE')) {
          audioManager.playUISound('click');
          audienceEnergySystem.addReactionEnergy('HYPE');
          achievementSystem.unlock('FAN_MOMENT');
        }
      } else if (e.code === 'Digit4') {
        if (cStore.triggerReaction('PULSE', '⚡', 'PULSE')) {
          audioManager.playUISound('click');
          audienceEnergySystem.addReactionEnergy('PULSE');
          achievementSystem.unlock('FAN_MOMENT');
        }
      }
    };

    const onKeyUp = (e) => {
      movementSystem.handleKeyUp(e.code);
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      movementSystem.resetKeys();
    };
  }, []);

  useFrame((state, delta) => {
    const cStore = useConcertStore.getState();
    const uStore = useUserStore.getState();
    const isBlockedByModal = Boolean(cStore.activeModal);

    const result = movementSystem.update(
      delta,
      cStore.playerPosition,
      cStore.playerRotation,
      cStore.cameraOrbitOffset.yaw,
      cStore.joystickVector,
      isBlockedByModal,
      uStore.character || uStore.avatar,
      uStore.ticket,
      (restrictedTitle, restrictedMessage) => {
        uStore.showInfoToast(restrictedTitle, restrictedMessage, '#EF4444');
      }
    );

    if (groupRef.current) {
      groupRef.current.position.set(
        result.position[0],
        result.position[1],
        result.position[2]
      );
      groupRef.current.rotation.y = result.rotation;
    }

    // Keep store mutable reference updated without triggering 60fps React render (Rule 26 & 27)
    cStore.playerPosition = result.position;
    cStore.playerRotation = result.rotation;

    performanceManager.notifyMovement(result.isMoving || result.isJumping);

    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const boolChanged =
      result.isRunning !== cStore.isPlayerRunning ||
      result.isMoving !== cStore.isPlayerMoving ||
      result.isJumping !== cStore.isPlayerJumping;

    if (
      boolChanged ||
      (result.isMoving && (!groupRef.current.lastTransformSync || now - groupRef.current.lastTransformSync >= 120))
    ) {
      groupRef.current.lastTransformSync = now;
      cStore.setPlayerTransform(
        result.position,
        result.rotation,
        result.isMoving,
        result.isRunning,
        result.isJumping
      );
    }

    // Detect nearest interactive zone via ZoneManager
    const nearestZone = zoneManager.detectNearestInteractiveZone(result.position);
    if (nearestZone?.id !== cStore.activeZone?.id) {
      cStore.setActiveZone(nearestZone);
      if (nearestZone?.id === 'MAIN_ARENA' || nearestZone?.id === 'GA') {
        achievementSystem.unlock('STAGE_EXPLORER');
      }
    }

    // Broadcast state for real-time multiplayer (rate-limited in realtimeService)
    const tick = Math.floor(state.clock.elapsedTime * 6);
    if ((result.isMoving && tick % 2 === 0) || tick % 6 === 0) {
      realtimeService.broadcastState({
        position: result.position,
        rotation: result.rotation,
        displayName: uStore.displayName,
        avatar: uStore.character || uStore.avatar,
        lightstickMode: cStore.lightstickMode
      });
    }
  });

  const initialPos = useConcertStore.getState().playerPosition;

  return (
    <group ref={groupRef} position={initialPos}>
      {children}
    </group>
  );
}

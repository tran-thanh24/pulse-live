import { ZONES } from '../data/zones';
import { achievementSystem } from './AchievementSystem';
import { audienceEnergySystem } from './AudienceEnergySystem';
import { accessControlSystem } from './AccessControlSystem';
import { audioManager } from '../core/AudioManager';

/**
 * InteractionSystem: Detects nearest interactive zone and triggers context actions on 'E'
 * while enforcing AccessControlSystem permissions (e.g. VIP Pass check for VIP Terrace).
 */
export const interactionSystem = {
  findNearestZone(playerPosition) {
    const [px, , pz] = playerPosition;
    let closest = null;
    let minDistance = Infinity;

    for (const zone of ZONES) {
      if (!zone.interaction) continue;
      const [zx, , zz] = zone.position;
      const dist = Math.hypot(px - zx, pz - zz);
      if (dist <= zone.radius && dist < minDistance) {
        minDistance = dist;
        closest = zone;
      }
    }

    if (pz <= -9.5 || closest?.id === 'MAIN_ARENA') {
      achievementSystem.unlock('FRONT_ROW');
    }

    return closest;
  },

  triggerZoneAction(zone, concertStoreOrHook, userStoreOrHook) {
    if (!zone) return;
    const cState =
      typeof concertStoreOrHook?.getState === 'function'
        ? concertStoreOrHook.getState()
        : concertStoreOrHook;
    const uState =
      typeof userStoreOrHook?.getState === 'function'
        ? userStoreOrHook.getState()
        : userStoreOrHook;

    if (!cState || !uState) return;
    audioManager.playUISound('click');

    // Enforce AccessControlSystem check before triggering zone action
    const access = accessControlSystem.canEnterZone(
      uState.character || { role: 'PLAYER' },
      zone,
      uState.ticket
    );
    if (!access.allowed) {
      uState.showInfoToast(access.title, access.message, '#EF4444');
      return;
    }

    switch (zone.interaction) {
      case 'merch':
        cState.setActiveModal('merch');
        break;
      case 'photo':
        cState.setActiveModal('photo');
        break;
      case 'schedule':
      case 'info':
        cState.setActiveModal('schedule');
        break;
      case 'food':
        audienceEnergySystem.addReactionEnergy('PULSE', 15);
        uState.showInfoToast(
          'FREQUENCY TONIC ACQUIRED ⚡',
          'Energy boosted! Ready to resonate in the Main Arena.',
          '#22D3EE'
        );
        cState.triggerReaction('PULSE', '⚡', 'ENERGY BOOST');
        break;
      case 'fanhub':
        cState.triggerPulseWave('SPIRAL');
        audioManager.playLightstickActivation('WAVE');
        achievementSystem.unlock('LIGHT_IT_UP');
        uState.showInfoToast(
          'FAN HUB // SPIRAL WAVE LAUNCHED ✨',
          'A spiral Pulse Wave is sweeping across the entire arena!',
          '#A855F7'
        );
        break;
      case 'bstage':
        cState.setCameraMode(cState.cameraMode === 'B_STAGE' ? 'PLAYER' : 'B_STAGE');
        uState.showInfoToast(
          'B-STAGE 360° SOUND RING',
          'Camera locked to Center Arena B-Stage.',
          '#22D3EE'
        );
        break;
      case 'ga':
        cState.setLightstickMode('ENERGY');
        audioManager.playLightstickActivation('ENERGY');
        achievementSystem.unlock('LIGHT_IT_UP');
        uState.showInfoToast(
          'PULSE LIGHT // ENERGY SYNC',
          'Your Pulse Light is now reacting directly to the master audio frequency!',
          '#8B5CF6'
        );
        break;
      case 'vip':
        cState.setCameraMode(cState.cameraMode === 'CRANE' ? 'PLAYER' : 'CRANE');
        uState.showInfoToast(
          cState.cameraMode === 'CRANE' ? 'VIP CRANE CAMERA ON' : 'PLAYER CAMERA RESTORED',
          'Elevated VIP terrace angle focusing on PULSE CORE.',
          '#FACC15'
        );
        break;
      case 'seated':
        cState.setCameraMode(cState.cameraMode === 'DRONE' ? 'PLAYER' : 'DRONE');
        uState.showInfoToast(
          cState.cameraMode === 'DRONE'
            ? 'GRANDSTAND DRONE VIEW'
            : 'PLAYER CAMERA RESTORED',
          'Panoramic view of the City of Sound arena.',
          '#22D3EE'
        );
        break;
      case 'stage':
        achievementSystem.unlock('FRONT_ROW');
        audienceEnergySystem.addReactionEnergy('HYPE', 20);
        cState.setCameraMode(
          cState.cameraMode === 'ARTIST_CLOSE' ? 'PLAYER' : 'ARTIST_CLOSE'
        );
        audioManager.playCheer();
        cState.triggerReaction('HYPE', '🔥', 'BARRIER HYPE!');
        break;
      default:
        break;
    }
  }
};

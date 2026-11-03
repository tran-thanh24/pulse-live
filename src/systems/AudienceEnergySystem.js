import { eventBus } from '../core/EventBus';
import { audioManager } from '../core/AudioManager';

/**
 * AudienceEnergySystem: Tracks collective energy (0 -> 100) from CLAP, HEART, HYPE, PULSE reactions + Crowd.
 * Meter only appears when MC/Artist calls "MAKE SOME NOISE".
 * Crossing 80% threshold triggers PULSE CORE overload, crowd cheer, LED animation, and special lighting!
 */
class AudienceEnergySystem {
  constructor() {
    this.energy = 42;
    this.isCalloutActive = false;
    this.calloutPrompt = 'MAKE SOME NOISE';
    this.overloadActive = false;
    this.calloutTimer = null;
  }

  startCallout(promptText = 'MAKE SOME NOISE', durationMs = 14000) {
    this.isCalloutActive = true;
    this.calloutPrompt = promptText;
    this.energy = Math.max(45, this.energy);
    this.overloadActive = false;

    eventBus.emit('energy:stateChanged', {
      energy: this.energy,
      isCalloutActive: this.isCalloutActive,
      calloutPrompt: this.calloutPrompt,
      overloadActive: this.overloadActive
    });

    if (this.calloutTimer) clearTimeout(this.calloutTimer);
    this.calloutTimer = setTimeout(() => {
      this.isCalloutActive = false;
      eventBus.emit('energy:stateChanged', {
        energy: this.energy,
        isCalloutActive: false,
        calloutPrompt: this.calloutPrompt,
        overloadActive: this.overloadActive
      });
    }, durationMs);
  }

  addReactionEnergy(reactionType = 'PULSE', amount = 12) {
    const boostMap = {
      CLAP: 10,
      HEART: 12,
      HYPE: 15,
      PULSE: 18
    };
    const gain = boostMap[reactionType] || amount;
    this.energy = Math.min(100, this.energy + gain);

    if (this.energy >= 80 && !this.overloadActive) {
      this.triggerOverload();
    } else {
      eventBus.emit('energy:stateChanged', {
        energy: this.energy,
        isCalloutActive: this.isCalloutActive,
        calloutPrompt: this.calloutPrompt,
        overloadActive: this.overloadActive
      });
    }
  }

  triggerOverload() {
    this.overloadActive = true;
    this.energy = 100;
    audioManager.playCheer();

    eventBus.emit('energy:overload', { energy: 100 });
    eventBus.emit('energy:stateChanged', {
      energy: 100,
      isCalloutActive: true,
      calloutPrompt: 'PULSE CORE OVERLOAD // 100%',
      overloadActive: true
    });

    setTimeout(() => {
      this.overloadActive = false;
      this.energy = 55;
      eventBus.emit('energy:stateChanged', {
        energy: this.energy,
        isCalloutActive: this.isCalloutActive,
        calloutPrompt: this.calloutPrompt,
        overloadActive: false
      });
    }, 8000);
  }

  updatePassiveCrowdEnergy(delta, audioEnergy = 0.3) {
    if (this.isCalloutActive && !this.overloadActive) {
      // Crowd naturally contributes subtle energy during callout
      this.energy = Math.min(99, this.energy + delta * (1.8 + audioEnergy * 2.5));
      if (this.energy >= 80 && !this.overloadActive) {
        this.triggerOverload();
      }
    }
  }
}

export const audienceEnergySystem = new AudienceEnergySystem();


import { audioManager } from '../core/AudioManager';
import { achievementSystem } from './AchievementSystem';

/**
 * ConcertSystem: Coordinates the 8-minute timeline, audio phase transitions, and finale completion.
 */
export const concertSystem = {
  lastPhaseId: null,

  update(delta, concertStore, userStore) {
    const result = concertStore.advanceConcertTime(delta);
    const currentItem = concertStore.currentScheduleItem;

    if (currentItem && currentItem.id !== this.lastPhaseId) {
      this.lastPhaseId = currentItem.id;
      audioManager.setConcertPhase(currentItem.id, currentItem.bpm || 124);

      if (currentItem.id === 'artist-entrance') {
        audioManager.playCheer();
      } else if (currentItem.id === 'lightstick-event') {
        userStore.showInfoToast(
          'PURPLE WAVE LIGHTSTICK EVENT 💜',
          'All stadium lightsticks are now sweeping in a synchronized Purple Wave!',
          '#8B5CF6'
        );
      } else if (currentItem.id === 'confetti') {
        audioManager.playCheer();
      }
    }

    if (result === 'CONCERT_FINISHED') {
      achievementSystem.unlock('NOVA_NIGHT');
      userStore.markConcertVisited();
      audioManager.playCheer();
      concertStore.setScreen('end');
    }
  },

  formatTime(seconds) {
    const total = Math.max(0, Math.floor(seconds));
    const mins = Math.floor(total / 60);
    const secs = total % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
};


import { useUserStore } from '../store/userStore';
import { audioManager } from '../core/AudioManager';

/**
 * AchievementSystem: Unlocks achievements and plays celebration chime without intrusive competitive leaderboards.
 */
export const achievementSystem = {
  unlock(achievementId) {
    const store = useUserStore.getState();
    const newlyUnlocked = store.unlockAchievement(achievementId);
    if (newlyUnlocked) {
      audioManager.playCheer();
    }
    return newlyUnlocked;
  }
};


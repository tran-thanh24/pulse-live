import { create } from 'zustand';
import { authService } from '../services/auth';
import { storageService } from '../services/storage';
import { ACHIEVEMENTS } from '../data/achievements';
import { characterAppearance } from '../characters/CharacterAppearance';
import { CharacterValidator } from '../characters/CharacterRules';

const initialProfile = authService.getOrCreateSession();
const initialCharacter = characterAppearance.loadCharacter(initialProfile.avatar);

export const useUserStore = create((set, get) => ({
  displayName: initialProfile.displayName || initialCharacter.displayName || 'PULSE // FAN',
  character: initialCharacter,
  avatar: initialCharacter, // Synced alias for backward compatibility
  ticket: initialProfile.ticket || {
    id: 'PULSE-2026-8841',
    tier: 'VIP', // 'VIP' | 'GENERAL'
    seatZone: 'PULSE ARENA // GA & VIP',
    checkedIn: false
  },
  concertVisited: initialProfile.concertVisited || false,
  achievements: initialProfile.achievements || [],
  favoriteMerch: initialProfile.favoriteMerch || [],
  photos: initialProfile.photos || [],
  lightstickColor: initialCharacter.lightstick || initialProfile.lightstickColor || '#22D3EE',

  activeToast: null,

  // Settings & Accessibility
  settings: {
    graphicsQuality: 'AUTO', // LOW | MEDIUM | HIGH | AUTO
    musicVolume: 0.78,
    crowdVolume: 0.55,
    sfxVolume: 0.85,
    musicEnabled: true,
    sfxEnabled: true,
    crowdDensity: 'HIGH', // LOW | MEDIUM | HIGH
    lowerCrowd: false,
    motionEffects: true,
    reduceMotion: false,
    reduceFlash: false,
    disableFlashingLights: false, // No Strobe
    subtitles: true,
    language: 'en',
    ...(initialProfile.settings || {})
  },

  setDisplayName: (displayName) => {
    const updatedChar = characterAppearance.saveCharacter({
      ...get().character,
      displayName
    });
    set({ displayName, character: updatedChar, avatar: updatedChar });
    storageService.saveUserProfile({ displayName, avatar: updatedChar });
  },

  updateAvatar: (partialConfig) => {
    const current = get().character;
    const merged = {
      ...current,
      ...partialConfig,
      displayName: get().displayName
    };
    const saved = characterAppearance.saveCharacter(merged);
    const lightstickColor = saved.lightstick || get().lightstickColor;
    set({ character: saved, avatar: saved, lightstickColor });
    storageService.saveUserProfile({ avatar: saved, lightstickColor });
  },

  applyCharacterPreset: (presetConfig) => {
    const saved = characterAppearance.saveCharacter({
      ...presetConfig,
      displayName: get().displayName
    });
    set({
      character: saved,
      avatar: saved,
      lightstickColor: saved.lightstick || '#22D3EE'
    });
    storageService.saveUserProfile({
      avatar: saved,
      lightstickColor: saved.lightstick || '#22D3EE'
    });
  },

  randomizeAvatar: (genderOverride = null) => {
    const gender = genderOverride || get().character?.gender || 'male';
    const randomized = CharacterValidator.randomize(gender);
    const saved = characterAppearance.saveCharacter({
      ...randomized,
      displayName: get().displayName
    });
    set({
      character: saved,
      avatar: saved,
      lightstickColor: saved.lightstick
    });
    storageService.saveUserProfile({
      avatar: saved,
      lightstickColor: saved.lightstick
    });
  },

  resetAvatar: (genderOverride = null) => {
    const gender = genderOverride || get().character?.gender || 'male';
    const resetChar = characterAppearance.resetCharacter(gender);
    const saved = characterAppearance.saveCharacter({
      ...resetChar,
      displayName: get().displayName
    });
    set({
      character: saved,
      avatar: saved,
      lightstickColor: saved.lightstick
    });
    storageService.saveUserProfile({
      avatar: saved,
      lightstickColor: saved.lightstick
    });
  },

  setTicketTier: (tier) => {
    const normalizedTier = String(tier || 'VIP').toUpperCase();
    const ticket = {
      ...get().ticket,
      tier: normalizedTier,
      seatZone: normalizedTier === 'VIP' ? 'VIP TERRACE & FRONT ARENA' : 'GENERAL ADMISSION (GA)'
    };
    set({ ticket });
    storageService.saveUserProfile({ ticket });
  },

  checkInTicket: () => {
    const ticket = {
      ...get().ticket,
      checkedIn: true,
      checkedInAt: new Date().toISOString()
    };
    set({ ticket });
    storageService.saveUserProfile({ ticket });
  },

  markConcertVisited: () => {
    set({ concertVisited: true });
    storageService.saveUserProfile({ concertVisited: true });
  },

  unlockAchievement: (achievementId) => {
    const current = get().achievements;
    if (current.includes(achievementId)) return false;

    const badge = ACHIEVEMENTS.find((a) => a.id === achievementId);
    const updated = [...current, achievementId];
    set({
      achievements: updated,
      activeToast: badge
        ? {
            id: `${achievementId}_${Date.now()}`,
            type: 'achievement',
            badge
          }
        : null
    });
    storageService.saveUserProfile({ achievements: updated });
    return true;
  },

  clearToast: () => set({ activeToast: null }),

  showInfoToast: (title, subtitle, color = '#22D3EE') => {
    set({
      activeToast: {
        id: `info_${Date.now()}`,
        type: 'info',
        badge: {
          title,
          titleVi: title,
          description: subtitle,
          descriptionVi: subtitle,
          icon: 'Sparkles',
          color
        }
      }
    });
  },

  toggleFavoriteMerch: (merchId) => {
    const favs = get().favoriteMerch;
    const exists = favs.includes(merchId);
    const updated = exists ? favs.filter((id) => id !== merchId) : [...favs, merchId];
    set({ favoriteMerch: updated });
    storageService.saveUserProfile({ favoriteMerch: updated });
  },

  addPhoto: (photoDataUrl, meta = {}) => {
    const newPhoto = {
      id: `photo_${Date.now()}`,
      url: photoDataUrl,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      pose: meta.pose || 'Pose 1',
      filter: meta.filter || 'Normal'
    };
    const updated = [newPhoto, ...get().photos].slice(0, 12);
    set({ photos: updated });
    storageService.saveUserProfile({ photos: updated });
    return newPhoto;
  },

  updateSettings: (partialSettings) => {
    const current = get().settings;
    const updated = { ...current, ...partialSettings };
    if ('reduceMotion' in partialSettings) {
      updated.motionEffects = !partialSettings.reduceMotion;
    } else if ('motionEffects' in partialSettings) {
      updated.reduceMotion = !partialSettings.motionEffects;
    }
    if ('reduceFlash' in partialSettings) {
      updated.disableFlashingLights = Boolean(partialSettings.reduceFlash);
    } else if ('disableFlashingLights' in partialSettings) {
      updated.reduceFlash = Boolean(partialSettings.disableFlashingLights);
    }
    if ('lowerCrowd' in partialSettings) {
      updated.crowdDensity = partialSettings.lowerCrowd ? 'LOW' : 'HIGH';
    }
    set({ settings: updated });
    storageService.saveUserProfile({ settings: updated });
  }
}));

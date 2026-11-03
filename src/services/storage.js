const STORAGE_KEY = 'nova_live_2026_user_profile_v1';

export const storageService = {
  loadUserProfile() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (err) {
      console.warn('[NOVA Storage] Failed to read profile from localStorage:', err);
      return null;
    }
  },

  saveUserProfile(profileData) {
    try {
      const existing = this.loadUserProfile() || {};
      const merged = {
        ...existing,
        ...profileData,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      return merged;
    } catch (err) {
      console.warn('[NOVA Storage] Failed to write profile to localStorage:', err);
      return profileData;
    }
  },

  clearUserProfile() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.warn('[NOVA Storage] Failed to clear profile:', err);
    }
  }
};


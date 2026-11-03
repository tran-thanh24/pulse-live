import { CharacterValidator } from './CharacterRules';
import { MALE_PRESETS } from './presets/malePresets';
import { FEMALE_PRESETS } from './presets/femalePresets';

const CHARACTER_STORAGE_KEY = 'pulse_character';
const CURRENT_CHARACTER_VERSION = 1;

/**
 * CharacterAppearance: Manages persistence (`pulse_character`), schema version (`characterVersion: 1`),
 * and automatic migration + validation through `CharacterValidator`.
 */
export const characterAppearance = {
  getDefaultCharacter(gender = 'male') {
    const preset = gender === 'female' ? FEMALE_PRESETS[0] : MALE_PRESETS[0];
    return CharacterValidator.validate(preset).sanitized;
  },

  loadCharacter(fallbackLegacyAvatar = null) {
    try {
      const raw = localStorage.getItem(CHARACTER_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return this.migrateAndValidate(parsed);
      }
      if (fallbackLegacyAvatar) {
        return this.migrateAndValidate(fallbackLegacyAvatar);
      }
    } catch (err) {
      console.warn('[PULSE CharacterAppearance] Failed to load pulse_character:', err);
    }
    const def = this.getDefaultCharacter('male');
    this.saveCharacter(def);
    return def;
  },

  migrateAndValidate(data = {}) {
    // Migrate from v0 legacy avatar config if characterVersion !== 1
    const migrated = {
      ...data,
      characterVersion: CURRENT_CHARACTER_VERSION,
      gender: data.gender === 'female' ? 'female' : 'male',
      outfitTop: data.outfitTop || data.outfit || 'techwear-jacket',
      outfitBottom:
        data.outfitBottom ||
        (data.gender === 'female' ? 'pleated-stage-skirt' : 'cargo-tech-pants'),
      shoes:
        data.shoes || (data.gender === 'female' ? 'platform-idol-boots' : 'chunky-runners'),
      lightstick: data.lightstick || data.lightstickColor || '#22D3EE'
    };

    const { sanitized } = CharacterValidator.validate(migrated);
    return sanitized;
  },

  saveCharacter(config) {
    const { sanitized } = CharacterValidator.validate(config);
    try {
      localStorage.setItem(CHARACTER_STORAGE_KEY, JSON.stringify(sanitized));
    } catch (err) {
      console.warn('[PULSE CharacterAppearance] Failed to save pulse_character:', err);
    }
    return sanitized;
  },

  resetCharacter(gender = 'male') {
    const def = this.getDefaultCharacter(gender);
    this.saveCharacter(def);
    return def;
  }
};


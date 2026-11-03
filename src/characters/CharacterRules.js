import { HAIR_PRESETS, HAIR_COLORS } from './presets/hairPresets';
import {
  SKIN_TONES,
  FACE_PRESETS,
  TOP_PRESETS,
  BOTTOM_PRESETS,
  SHOE_PRESETS,
  OUTFIT_COLORS
} from './presets/outfitPresets';
import { ACCESSORY_PRESETS, PULSE_LIGHT_COLORS } from './presets/accessoryPresets';
import { MALE_PRESETS } from './presets/malePresets';
import { FEMALE_PRESETS } from './presets/femalePresets';

/**
 * SCALE RULES (Section 5)
 * Only 3 valid scale presets: SHORT (0.93), MEDIUM (1.0), TALL (1.07)
 */
export const SCALE_PRESETS = {
  SHORT: 0.93,
  MEDIUM: 1.0,
  TALL: 1.07
};

/**
 * ROLE PERMISSION MATRIX (Section 2 & 12)
 */
export const ROLE_PERMISSIONS = {
  PLAYER: {
    allowedZones: ['ZONE_ENTRY', 'ZONE_PLAZA', 'ZONE_GA', 'ZONE_SEATED', 'ZONE_BARRIER'],
    canAccessStage: false,
    canAccessBackstage: false,
    canUseLightstick: true
  },
  CROWD: {
    allowedZones: ['ZONE_GA', 'ZONE_VIP', 'ZONE_SEATED', 'ZONE_PLAZA'],
    canAccessStage: false,
    canAccessBackstage: false,
    canUseLightstick: true
  },
  ARTIST: {
    allowedZones: [
      'ZONE_MAIN_STAGE',
      'ZONE_RUNWAY',
      'ZONE_B_STAGE',
      'ZONE_BACKSTAGE',
      'ZONE_ARTIST_WAITING'
    ],
    canAccessStage: true,
    canAccessBackstage: true,
    canUseLightstick: false
  },
  DANCER: {
    allowedZones: ['ZONE_MAIN_STAGE', 'ZONE_RUNWAY', 'ZONE_B_STAGE', 'ZONE_BACKSTAGE'],
    canAccessStage: true,
    canAccessBackstage: true,
    canUseLightstick: false
  },
  MC: {
    allowedZones: ['ZONE_MAIN_STAGE', 'ZONE_RUNWAY', 'ZONE_B_STAGE', 'ZONE_BACKSTAGE'],
    canAccessStage: true,
    canAccessBackstage: true,
    canUseLightstick: false
  },
  STAFF: {
    allowedZones: ['ZONE_BACKSTAGE', 'ZONE_TECH', 'ZONE_LED_CONTROL', 'ZONE_BARRIER', 'ZONE_PLAZA'],
    canAccessStage: true,
    canAccessBackstage: true,
    canUseLightstick: false
  },
  SECURITY: {
    allowedZones: ['ZONE_BARRIER', 'ZONE_VIP', 'ZONE_GA', 'ZONE_BACKSTAGE'],
    canAccessStage: false,
    canAccessBackstage: true,
    canUseLightstick: false
  },
  CAMERA_OPERATOR: {
    allowedZones: ['ZONE_BARRIER', 'ZONE_MAIN_STAGE', 'ZONE_RUNWAY', 'ZONE_TECH'],
    canAccessStage: true,
    canAccessBackstage: true,
    canUseLightstick: false
  }
};

/**
 * CharacterRules & CharacterValidator Engine
 * Enforces:
 * 1. Gender-specific Face, Hair, Top, Bottom, Shoes, and Accessory rules
 * 2. Accessory + Hair conflict rule (e.g. `street-cap` conflicts with `blocksCap` high ponytail / twin-tails)
 * 3. Scale rules (SHORT: 0.93, MEDIUM: 1.0, TALL: 1.07)
 */
export class CharacterValidator {
  static isGenderCompatible(itemGender, characterGender) {
    if (!itemGender || itemGender === 'unisex') return true;
    const g = String(characterGender || 'male').toLowerCase();
    if (g === 'male') {
      return itemGender === 'male' || itemGender === 'maleOnly';
    }
    if (g === 'female') {
      return itemGender === 'female' || itemGender === 'femaleOnly';
    }
    return true;
  }

  static getCompatibleFaces(gender) {
    return FACE_PRESETS.filter((f) => this.isGenderCompatible(f.gender, gender));
  }

  static getCompatibleHairs(gender) {
    return HAIR_PRESETS.filter((h) => this.isGenderCompatible(h.gender, gender));
  }

  static getCompatibleTops(gender) {
    return TOP_PRESETS.filter((t) => this.isGenderCompatible(t.gender, gender));
  }

  static getCompatibleBottoms(gender) {
    return BOTTOM_PRESETS.filter((b) => this.isGenderCompatible(b.gender, gender));
  }

  static getCompatibleShoes(gender) {
    return SHOE_PRESETS.filter((s) => this.isGenderCompatible(s.gender, gender));
  }

  static getCompatibleAccessories(gender, hairStyleId = null) {
    const hairObj = HAIR_PRESETS.find((h) => h.id === hairStyleId);
    return ACCESSORY_PRESETS.filter((acc) => {
      if (!this.isGenderCompatible(acc.gender, gender)) return false;
      // ACCESSORY CONFLICT RULE: Cap cannot be worn simultaneously with high ponytail / twin-tails that block caps
      if (acc.isCap && hairObj?.blocksCap) return false;
      return true;
    });
  }

  /**
   * Validates a full character config and returns `{ valid, errors, sanitized }`
   */
  static validate(config = {}) {
    const errors = [];
    const gender = config.gender === 'female' ? 'female' : 'male';
    const role = ROLE_PERMISSIONS[config.role] ? config.role : 'PLAYER';

    // Scale validation
    let scalePreset = config.scalePreset || 'MEDIUM';
    if (!SCALE_PRESETS[scalePreset]) {
      if (config.scale <= 0.95) scalePreset = 'SHORT';
      else if (config.scale >= 1.04) scalePreset = 'TALL';
      else scalePreset = 'MEDIUM';
    }
    const scale = SCALE_PRESETS[scalePreset];

    // Face validation
    const compatibleFaces = this.getCompatibleFaces(gender);
    let facePreset = config.facePreset;
    if (!compatibleFaces.some((f) => f.id === facePreset)) {
      errors.push(`Face preset "${facePreset}" is not compatible with ${gender}.`);
      facePreset = compatibleFaces[0].id;
    }

    // Hair validation
    const compatibleHairs = this.getCompatibleHairs(gender);
    let hairStyle = config.hairStyle;
    if (!compatibleHairs.some((h) => h.id === hairStyle)) {
      errors.push(`Hair style "${hairStyle}" is not compatible with ${gender}.`);
      hairStyle = compatibleHairs[0].id;
    }

    // Top validation
    const compatibleTops = this.getCompatibleTops(gender);
    let outfitTop = config.outfitTop || config.outfit;
    if (!compatibleTops.some((t) => t.id === outfitTop)) {
      errors.push(`Top "${outfitTop}" is not compatible with ${gender}.`);
      outfitTop = compatibleTops[0].id;
    }

    // Bottom validation
    const compatibleBottoms = this.getCompatibleBottoms(gender);
    let outfitBottom = config.outfitBottom;
    if (!compatibleBottoms.some((b) => b.id === outfitBottom)) {
      errors.push(`Bottom "${outfitBottom}" is not compatible with ${gender}.`);
      outfitBottom = compatibleBottoms[0].id;
    }

    // Shoes validation
    const compatibleShoes = this.getCompatibleShoes(gender);
    let shoes = config.shoes;
    if (!compatibleShoes.some((s) => s.id === shoes)) {
      errors.push(`Shoes "${shoes}" are not compatible with ${gender}.`);
      shoes = compatibleShoes[0].id;
    }

    // Accessory + Cap/Hair conflict validation
    const compatibleAccessories = this.getCompatibleAccessories(gender, hairStyle);
    let accessory = config.accessory || 'visor';
    if (!compatibleAccessories.some((a) => a.id === accessory)) {
      errors.push(`Accessory "${accessory}" conflicts with ${gender} or hair "${hairStyle}".`);
      accessory = compatibleAccessories[0]?.id || 'none';
    }

    const skinTone = SKIN_TONES.some((s) => s.color === config.skinTone)
      ? config.skinTone
      : SKIN_TONES[1].color;
    const hairColor = HAIR_COLORS.some((c) => c.color === config.hairColor)
      ? config.hairColor
      : HAIR_COLORS[2].color;
    const outfitColor = OUTFIT_COLORS.some((c) => c.color === config.outfitColor)
      ? config.outfitColor
      : OUTFIT_COLORS[0].color;
    const lightstick = config.lightstick || config.lightstickColor || PULSE_LIGHT_COLORS[0].color;

    const sanitized = {
      characterVersion: 1,
      id: config.id || `char_${gender}_01`,
      role,
      gender,
      displayName: config.displayName || 'PULSE // FAN',
      bodyPreset: gender === 'female' ? 'female-slender' : 'male-athletic',
      scalePreset,
      scale,
      skinTone,
      facePreset,
      hairStyle,
      hairColor,
      outfitTop,
      outfitBottom,
      shoes,
      outfit: outfitTop, // Legacy backward-compatible alias
      outfitColor,
      accessory,
      lightstick,
      lightstickColor: lightstick, // Legacy backward-compatible alias
      movementSpeed: config.movementSpeed || 6.8,
      runSpeed: config.runSpeed || 11.8,
      animations: config.animations || [
        'IDLE',
        'WALK',
        'RUN',
        'JUMP',
        'CLAP',
        'CHEER',
        'LIGHTSTICK_IDLE',
        'LIGHTSTICK_WAVE',
        'DANCE_BASIC',
        'PHONE_RECORD',
        'PHOTO_POSE'
      ],
      permissions: ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.PLAYER,
      spawnZone: config.spawnZone || 'ZONE_ENTRY'
    };

    return {
      valid: errors.length === 0,
      errors,
      sanitized
    };
  }

  /**
   * Generates a 100% rule-compliant random character for the specified gender
   */
  static randomize(genderInput = null) {
    const gender =
      genderInput === 'male' || genderInput === 'female'
        ? genderInput
        : Math.random() > 0.5
        ? 'female'
        : 'male';

    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const scaleKey = pick(['SHORT', 'MEDIUM', 'TALL']);
    const hair = pick(this.getCompatibleHairs(gender));
    const acc = pick(this.getCompatibleAccessories(gender, hair.id));

    const draft = {
      gender,
      scalePreset: scaleKey,
      scale: SCALE_PRESETS[scaleKey],
      skinTone: pick(SKIN_TONES).color,
      facePreset: pick(this.getCompatibleFaces(gender)).id,
      hairStyle: hair.id,
      hairColor: pick(HAIR_COLORS).color,
      outfitTop: pick(this.getCompatibleTops(gender)).id,
      outfitBottom: pick(this.getCompatibleBottoms(gender)).id,
      shoes: pick(this.getCompatibleShoes(gender)).id,
      outfitColor: pick(OUTFIT_COLORS).color,
      accessory: acc.id,
      lightstick: pick(PULSE_LIGHT_COLORS).color
    };

    return this.validate(draft).sanitized;
  }

  static getPresetsByGender(gender) {
    return gender === 'female' ? FEMALE_PRESETS : MALE_PRESETS;
  }
}


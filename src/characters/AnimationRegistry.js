/**
 * AnimationRegistry.js — Central Catalog of Actions & Dances for PULSE//LIVE 2026
 * Governs metadata, categories, allowed roles, crossfading parameters, movement locks, and role validation.
 */

export const ACTION_CATEGORIES = {
  MOVEMENT: 'MOVEMENT',
  REACTION: 'REACTION',
  DANCE: 'DANCE',
  LIGHTSTICK: 'LIGHTSTICK',
  POSE: 'POSE',
  PHONE: 'PHONE',
  SPECIAL: 'SPECIAL'
};

export const ENERGY_LEVELS = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH'
};

export const CHARACTER_ROLES = {
  PLAYER: 'PLAYER',
  ARTIST: 'ARTIST',
  DANCER: 'DANCER',
  CROWD: 'CROWD',
  SECURITY: 'SECURITY'
};

export const ANIMATION_ACTIONS = [
  // --- MOVEMENT ---
  {
    id: 'idle',
    label: 'Idle',
    category: ACTION_CATEGORIES.MOVEMENT,
    clip: 'IDLE',
    loop: true,
    fadeIn: 0.3,
    fadeOut: 0.3,
    movementLock: false,
    interruptible: true,
    allowedRoles: [CHARACTER_ROLES.PLAYER, CHARACTER_ROLES.ARTIST, CHARACTER_ROLES.DANCER, CHARACTER_ROLES.CROWD, CHARACTER_ROLES.SECURITY],
    energyLevel: ENERGY_LEVELS.LOW,
    nativeBpm: 120
  },
  {
    id: 'walk',
    label: 'Walk',
    category: ACTION_CATEGORIES.MOVEMENT,
    clip: 'WALK',
    loop: true,
    fadeIn: 0.2,
    fadeOut: 0.2,
    movementLock: false,
    interruptible: true,
    allowedRoles: [CHARACTER_ROLES.PLAYER, CHARACTER_ROLES.ARTIST, CHARACTER_ROLES.DANCER, CHARACTER_ROLES.CROWD, CHARACTER_ROLES.SECURITY],
    energyLevel: ENERGY_LEVELS.LOW,
    nativeBpm: 120
  },
  {
    id: 'run',
    label: 'Run',
    category: ACTION_CATEGORIES.MOVEMENT,
    clip: 'RUN',
    loop: true,
    fadeIn: 0.2,
    fadeOut: 0.2,
    movementLock: false,
    interruptible: true,
    allowedRoles: [CHARACTER_ROLES.PLAYER, CHARACTER_ROLES.ARTIST, CHARACTER_ROLES.DANCER, CHARACTER_ROLES.CROWD],
    energyLevel: ENERGY_LEVELS.MEDIUM,
    nativeBpm: 128
  },
  {
    id: 'jump',
    label: 'Jump',
    category: ACTION_CATEGORIES.MOVEMENT,
    clip: 'JUMP',
    loop: false,
    fadeIn: 0.15,
    fadeOut: 0.25,
    movementLock: false,
    interruptible: true,
    allowedRoles: [CHARACTER_ROLES.PLAYER, CHARACTER_ROLES.ARTIST, CHARACTER_ROLES.DANCER, CHARACTER_ROLES.CROWD],
    energyLevel: ENERGY_LEVELS.HIGH,
    nativeBpm: 128
  },

  // --- REACTIONS ---
  {
    id: 'clap',
    label: 'Clap',
    category: ACTION_CATEGORIES.REACTION,
    clip: 'CLAP',
    loop: true,
    fadeIn: 0.25,
    fadeOut: 0.25,
    movementLock: false,
    interruptible: true,
    allowedRoles: [CHARACTER_ROLES.PLAYER, CHARACTER_ROLES.CROWD, CHARACTER_ROLES.ARTIST],
    energyLevel: ENERGY_LEVELS.LOW,
    nativeBpm: 120
  },
  {
    id: 'cheer',
    label: 'Cheer',
    category: ACTION_CATEGORIES.REACTION,
    clip: 'CHEER',
    loop: true,
    fadeIn: 0.25,
    fadeOut: 0.25,
    movementLock: false,
    interruptible: true,
    allowedRoles: [CHARACTER_ROLES.PLAYER, CHARACTER_ROLES.CROWD, CHARACTER_ROLES.ARTIST],
    energyLevel: ENERGY_LEVELS.MEDIUM,
    nativeBpm: 124
  },
  {
    id: 'wave',
    label: 'Wave',
    category: ACTION_CATEGORIES.REACTION,
    clip: 'WAVE',
    loop: true,
    fadeIn: 0.3,
    fadeOut: 0.3,
    movementLock: false,
    interruptible: true,
    allowedRoles: [CHARACTER_ROLES.PLAYER, CHARACTER_ROLES.ARTIST, CHARACTER_ROLES.CROWD],
    energyLevel: ENERGY_LEVELS.LOW,
    nativeBpm: 110
  },
  {
    id: 'lightstick_wave',
    label: 'Lightstick Wave',
    category: ACTION_CATEGORIES.LIGHTSTICK,
    clip: 'LIGHTSTICK_WAVE',
    loop: true,
    fadeIn: 0.25,
    fadeOut: 0.25,
    movementLock: false,
    interruptible: true,
    allowedRoles: [CHARACTER_ROLES.PLAYER, CHARACTER_ROLES.CROWD],
    energyLevel: ENERGY_LEVELS.MEDIUM,
    nativeBpm: 124
  },
  {
    id: 'phone_record',
    label: 'Phone Record',
    category: ACTION_CATEGORIES.PHONE,
    clip: 'PHONE_RECORD',
    loop: true,
    fadeIn: 0.3,
    fadeOut: 0.3,
    movementLock: false,
    interruptible: true,
    allowedRoles: [CHARACTER_ROLES.PLAYER, CHARACTER_ROLES.CROWD],
    energyLevel: ENERGY_LEVELS.LOW,
    nativeBpm: 100
  },

  // --- DANCE SUITE (10 Distinct Dances) ---
  {
    id: 'dance_basic',
    label: 'Basic Dance',
    category: ACTION_CATEGORIES.DANCE,
    clip: 'DANCE_BASIC',
    loop: true,
    fadeIn: 0.3,
    fadeOut: 0.25,
    movementLock: true,
    interruptible: true,
    allowedRoles: [CHARACTER_ROLES.PLAYER, CHARACTER_ROLES.ARTIST, CHARACTER_ROLES.DANCER, CHARACTER_ROLES.CROWD],
    energyLevel: ENERGY_LEVELS.LOW,
    nativeBpm: 120
  },
  {
    id: 'dance_groove',
    label: 'Groove Roll',
    category: ACTION_CATEGORIES.DANCE,
    clip: 'DANCE_GROOVE',
    loop: true,
    fadeIn: 0.35,
    fadeOut: 0.3,
    movementLock: true,
    interruptible: true,
    allowedRoles: [CHARACTER_ROLES.PLAYER, CHARACTER_ROLES.ARTIST, CHARACTER_ROLES.DANCER],
    energyLevel: ENERGY_LEVELS.MEDIUM,
    nativeBpm: 118
  },
  {
    id: 'dance_pop',
    label: 'Pop Lock',
    category: ACTION_CATEGORIES.DANCE,
    clip: 'DANCE_POP',
    loop: true,
    fadeIn: 0.25,
    fadeOut: 0.25,
    movementLock: true,
    interruptible: true,
    allowedRoles: [CHARACTER_ROLES.PLAYER, CHARACTER_ROLES.ARTIST, CHARACTER_ROLES.DANCER],
    energyLevel: ENERGY_LEVELS.MEDIUM,
    nativeBpm: 124
  },
  {
    id: 'dance_hiphop',
    label: 'Hip-Hop Bounce',
    category: ACTION_CATEGORIES.DANCE,
    clip: 'DANCE_HIPHOP',
    loop: true,
    fadeIn: 0.3,
    fadeOut: 0.25,
    movementLock: true,
    interruptible: true,
    allowedRoles: [CHARACTER_ROLES.PLAYER, CHARACTER_ROLES.ARTIST, CHARACTER_ROLES.DANCER],
    energyLevel: ENERGY_LEVELS.HIGH,
    nativeBpm: 128
  },
  {
    id: 'dance_kpop',
    label: 'K-Pop Idol',
    category: ACTION_CATEGORIES.DANCE,
    clip: 'DANCE_KPOP',
    loop: true,
    fadeIn: 0.3,
    fadeOut: 0.25,
    movementLock: true,
    interruptible: true,
    allowedRoles: [CHARACTER_ROLES.PLAYER, CHARACTER_ROLES.ARTIST, CHARACTER_ROLES.DANCER],
    energyLevel: ENERGY_LEVELS.HIGH,
    nativeBpm: 126
  },
  {
    id: 'dance_freestyle',
    label: 'Freestyle Flow',
    category: ACTION_CATEGORIES.DANCE,
    clip: 'DANCE_FREESTYLE',
    loop: true,
    fadeIn: 0.35,
    fadeOut: 0.3,
    movementLock: true,
    interruptible: true,
    allowedRoles: [CHARACTER_ROLES.PLAYER, CHARACTER_ROLES.ARTIST, CHARACTER_ROLES.DANCER],
    energyLevel: ENERGY_LEVELS.MEDIUM,
    nativeBpm: 122
  },
  {
    id: 'dance_jump',
    label: 'Hype Jump',
    category: ACTION_CATEGORIES.DANCE,
    clip: 'DANCE_JUMP',
    loop: true,
    fadeIn: 0.2,
    fadeOut: 0.2,
    movementLock: true,
    interruptible: true,
    allowedRoles: [CHARACTER_ROLES.PLAYER, CHARACTER_ROLES.ARTIST, CHARACTER_ROLES.DANCER, CHARACTER_ROLES.CROWD],
    energyLevel: ENERGY_LEVELS.HIGH,
    nativeBpm: 132
  },
  {
    id: 'dance_side_step',
    label: 'Side Step Sway',
    category: ACTION_CATEGORIES.DANCE,
    clip: 'DANCE_SIDE_STEP',
    loop: true,
    fadeIn: 0.3,
    fadeOut: 0.25,
    movementLock: true,
    interruptible: true,
    allowedRoles: [CHARACTER_ROLES.PLAYER, CHARACTER_ROLES.ARTIST, CHARACTER_ROLES.DANCER],
    energyLevel: ENERGY_LEVELS.LOW,
    nativeBpm: 116
  },
  {
    id: 'dance_arm_wave',
    label: 'Arm Wave Ripple',
    category: ACTION_CATEGORIES.DANCE,
    clip: 'DANCE_ARM_WAVE',
    loop: true,
    fadeIn: 0.35,
    fadeOut: 0.3,
    movementLock: true,
    interruptible: true,
    allowedRoles: [CHARACTER_ROLES.PLAYER, CHARACTER_ROLES.ARTIST, CHARACTER_ROLES.DANCER],
    energyLevel: ENERGY_LEVELS.MEDIUM,
    nativeBpm: 120
  },
  {
    id: 'dance_spin',
    label: 'Spin Flourish',
    category: ACTION_CATEGORIES.DANCE,
    clip: 'DANCE_SPIN',
    loop: true,
    fadeIn: 0.25,
    fadeOut: 0.25,
    movementLock: true,
    interruptible: true,
    allowedRoles: [CHARACTER_ROLES.PLAYER, CHARACTER_ROLES.ARTIST, CHARACTER_ROLES.DANCER],
    energyLevel: ENERGY_LEVELS.HIGH,
    nativeBpm: 128
  },

  // --- POSES ---
  {
    id: 'final_pose',
    label: 'Final Climax Pose',
    category: ACTION_CATEGORIES.POSE,
    clip: 'FINAL_POSE',
    loop: true,
    fadeIn: 0.4,
    fadeOut: 0.3,
    movementLock: true,
    interruptible: true,
    allowedRoles: [CHARACTER_ROLES.PLAYER, CHARACTER_ROLES.ARTIST, CHARACTER_ROLES.DANCER],
    energyLevel: ENERGY_LEVELS.HIGH,
    nativeBpm: 120
  },
  {
    id: 'photo_pose',
    label: 'Peace Sign Pose',
    category: ACTION_CATEGORIES.POSE,
    clip: 'PHOTO_POSE',
    loop: true,
    fadeIn: 0.3,
    fadeOut: 0.3,
    movementLock: true,
    interruptible: true,
    allowedRoles: [CHARACTER_ROLES.PLAYER, CHARACTER_ROLES.CROWD],
    energyLevel: ENERGY_LEVELS.LOW,
    nativeBpm: 100
  }
];

export class AnimationRegistry {
  constructor() {
    this.actionsById = new Map();
    ANIMATION_ACTIONS.forEach((action) => {
      this.actionsById.set(action.id.toLowerCase(), action);
      this.actionsById.set(action.clip.toLowerCase(), action);
    });
    this.validateRegistry();
  }

  getAction(id) {
    if (!id) return this.actionsById.get('idle');
    const normalized = String(id).toLowerCase();
    return this.actionsById.get(normalized) || this.actionsById.get('idle');
  }

  hasAction(id) {
    if (!id) return false;
    return this.actionsById.has(String(id).toLowerCase());
  }

  getActionsByCategory(category, role = null) {
    return ANIMATION_ACTIONS.filter((act) => {
      const matchCat = act.category === category;
      if (!matchCat) return false;
      if (role && !act.allowedRoles.includes(role)) return false;
      return true;
    });
  }

  getActionsForRole(role) {
    return ANIMATION_ACTIONS.filter((act) => act.allowedRoles.includes(role));
  }

  getRandomDance(role = CHARACTER_ROLES.PLAYER) {
    const dances = this.getActionsByCategory(ACTION_CATEGORIES.DANCE, role);
    if (!dances.length) return this.getAction('dance_basic');
    const idx = Math.floor(Math.random() * dances.length);
    return dances[idx];
  }

  validateRegistry() {
    if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
      ANIMATION_ACTIONS.forEach((act) => {
        if (!act.id || !act.clip || !act.category) {
          console.warn(`[AnimationRegistry] Action missing mandatory fields:`, act);
        }
      });
    }
  }
}

export const animationRegistry = new AnimationRegistry();

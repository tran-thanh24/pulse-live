/**
 * DanceController.js — Character Action & Choreography State Manager for PULSE//LIVE 2026
 * Handles active action lifecycle, crossfade timing, BPM timeScale synchronization,
 * favorites persistence, combo queues, and movement lock / interrupt enforcement.
 */

import { animationRegistry, CHARACTER_ROLES } from './AnimationRegistry';
import { eventBus } from '../core/EventBus';
import { useConcertStore } from '../store/concertStore';
import { musicEngine } from '../core/MusicEngine';
import { audioManager } from '../core/AudioManager';

const FAVORITES_STORAGE_KEY = 'pulse_dance_favorites_v1';
const DEFAULT_FAVORITES = ['clap', 'cheer', 'dance_basic', 'lightstick_wave'];

export class DanceController {
  constructor() {
    this.currentActionId = 'idle';
    this.previousActionId = 'idle';
    this.crossfadeAlpha = 1.0;
    this.crossfadeDuration = 0.3;
    this.crossfadeElapsed = 0.3;
    this.isTransitioning = false;

    // Movement lock & interrupt state
    this.isMovementLocked = false;
    this.isInterruptible = true;

    // Favorites slots (1 to 4)
    this.favorites = this.loadFavorites();

    // Active combo queue
    this.comboQueue = [];
    this.comboTimer = null;

    // Listen to show timeline events
    eventBus.on('timeline:action', (data) => this.handleTimelineAction(data));
    eventBus.on('timeline:artistAction', (data) => this.handleArtistTimelineAction(data));
    eventBus.on('timeline:crowdAction', (data) => this.handleCrowdTimelineAction(data));
  }

  loadFavorites() {
    try {
      const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length === 4) {
          return parsed;
        }
      }
    } catch {}
    return [...DEFAULT_FAVORITES];
  }

  saveFavorites() {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(this.favorites));
    } catch {}
    eventBus.emit('dance:favoritesUpdated', this.favorites);
  }

  setFavorite(slotIndex, actionId) {
    if (slotIndex >= 0 && slotIndex < 4 && animationRegistry.hasAction(actionId)) {
      this.favorites[slotIndex] = actionId.toLowerCase();
      this.saveFavorites();
    }
  }

  getFavorites() {
    return [...this.favorites];
  }

  /**
   * Executes or toggles an action for the local player avatar.
   * If the action is already playing, pressing it again stops it.
   */
  playAction(actionId, role = CHARACTER_ROLES.PLAYER) {
    const action = animationRegistry.getAction(actionId);
    if (!action) return;

    // Role check
    if (!action.allowedRoles.includes(role)) {
      return;
    }

    // Toggle: if already active dance/action and user clicks it again, stop
    if (this.currentActionId === action.id && action.id !== 'idle') {
      this.stopAction();
      return;
    }

    // Clear active combo if manually triggered
    if (this.comboTimer) {
      clearTimeout(this.comboTimer);
      this.comboTimer = null;
      this.comboQueue = [];
    }

    this.startCrossfade(action.id, action.fadeIn || 0.3);
    this.isMovementLocked = Boolean(action.movementLock);
    this.isInterruptible = Boolean(action.interruptible !== false);

    // Update concert store for reactive rendering
    useConcertStore.getState().setPlayerPose(action.clip);
    eventBus.emit('character:actionChanged', {
      actionId: action.id,
      clip: action.clip,
      role
    });
  }

  stopAction() {
    if (this.currentActionId === 'idle') return;
    const idleAction = animationRegistry.getAction('idle');
    this.startCrossfade('idle', 0.25);
    this.isMovementLocked = false;
    this.isInterruptible = true;
    useConcertStore.getState().setPlayerPose('idle');
    eventBus.emit('character:actionChanged', {
      actionId: 'idle',
      clip: 'IDLE',
      role: CHARACTER_ROLES.PLAYER
    });
  }

  startCrossfade(newActionId, duration = 0.3) {
    this.previousActionId = this.currentActionId;
    this.currentActionId = newActionId;
    this.crossfadeDuration = Math.max(0.08, duration);
    this.crossfadeElapsed = 0;
    this.crossfadeAlpha = 0;
    this.isTransitioning = true;
  }

  /**
   * Called by MovementSystem / CharacterController when player moves with WASD or joystick.
   * If movement is locked and action is interruptible, automatically breaks dance and resumes walking.
   */
  onPlayerMove() {
    if (this.currentActionId !== 'idle' && this.isMovementLocked && this.isInterruptible) {
      this.stopAction();
    }
  }

  playQuickAction(slotIndex) {
    if (slotIndex >= 0 && slotIndex < this.favorites.length) {
      const actId = this.favorites[slotIndex];
      this.playAction(actId, CHARACTER_ROLES.PLAYER);
      try {
        audioManager.playUISound('click');
      } catch {}
    }
  }

  playRandomDance(role = CHARACTER_ROLES.PLAYER) {
    const dance = animationRegistry.getRandomDance(role);
    if (dance) {
      this.playAction(dance.id, role);
      try {
        audioManager.playUISound('click');
      } catch {}
    }
  }

  /**
   * Play a choreographed sequence of actions (DanceCombo)
   * e.g. ['dance_basic', 'dance_arm_wave', 'dance_spin', 'final_pose']
   */
  playCombo(sequence = [], intervalMs = 2800) {
    if (!sequence.length) return;
    this.comboQueue = [...sequence];
    const playNext = () => {
      if (!this.comboQueue.length) {
        this.comboTimer = null;
        return;
      }
      const nextAct = this.comboQueue.shift();
      this.playAction(nextAct);
      this.comboTimer = setTimeout(playNext, intervalMs);
    };
    playNext();
  }

  /**
   * Computes dynamic BPM timescale clamped between 0.8x and 1.25x.
   */
  calculateTimeScale(actionId) {
    const action = animationRegistry.getAction(actionId);
    const nativeBpm = action?.nativeBpm || 120;
    const currentTrack = useConcertStore.getState().currentTrack;
    const targetBpm = currentTrack?.bpm || 120;
    const ratio = targetBpm / nativeBpm;
    return Math.max(0.8, Math.min(1.25, ratio));
  }

  /**
   * Updates crossfade blend value per frame.
   */
  update(delta) {
    if (this.isTransitioning) {
      this.crossfadeElapsed += delta;
      this.crossfadeAlpha = Math.min(1.0, this.crossfadeElapsed / this.crossfadeDuration);
      if (this.crossfadeAlpha >= 1.0) {
        this.isTransitioning = false;
        this.previousActionId = this.currentActionId;
      }
    }
  }

  // --- SHOW TIMELINE INTEGRATION ---
  handleTimelineAction(cue) {
    if (!cue || !cue.action) return;
    if (cue.target === 'PLAYER' || !cue.target) {
      this.playAction(cue.action, CHARACTER_ROLES.PLAYER);
    }
  }

  handleArtistTimelineAction(cue) {
    if (!cue || !cue.action) return;
    const action = animationRegistry.getAction(cue.action);
    if (action) {
      useConcertStore.getState().setArtistAnimation(action.clip);
    }
  }

  handleCrowdTimelineAction(cue) {
    if (!cue || !cue.action) return;
    const action = animationRegistry.getAction(cue.action);
    if (action) {
      useConcertStore.getState().setCrowdBehaviorOverride(action.id);
    }
  }
}

export const danceController = new DanceController();


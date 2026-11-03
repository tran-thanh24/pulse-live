import { SHOW_MANIFEST } from '../data/showManifest';
import { MUSIC_MANIFEST } from '../data/musicManifest';
import { eventBus } from '../core/EventBus';

/**
 * SetlistManager (`src/systems/SetlistManager.js`)
 * Manages the active show setlist (`MUSIC | MC | VIDEO | INTERMISSION | ENCORE | FINALE`)
 * and Studio Mode Setlist operations:
 * - ADD TRACK / ITEM
 * - REMOVE
 * - REORDER (moveUp / moveDown)
 * - PLAY / PAUSE / NEXT / PREVIOUS
 */
class SetlistManager {
  constructor() {
    this.setlist = [...SHOW_MANIFEST.setlist];
    this.currentIndex = 0;
    this.listeners = new Set();
  }

  subscribe(cb) {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  notify() {
    const state = this.getState();
    this.listeners.forEach((cb) => cb(state));
    eventBus.emit('setlist:updated', state);
  }

  getState() {
    return {
      setlist: [...this.setlist],
      currentIndex: this.currentIndex,
      currentItem: this.setlist[this.currentIndex] || this.setlist[0]
    };
  }

  getCurrentItem() {
    return this.setlist[this.currentIndex] || this.setlist[0];
  }

  getNextItem() {
    if (this.currentIndex + 1 < this.setlist.length) {
      return this.setlist[this.currentIndex + 1];
    }
    return null;
  }

  addTrackToSetlist(trackOrItem, type = 'MUSIC') {
    const item =
      trackOrItem.type && !trackOrItem.audio
        ? {
            id: `set_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
            type: trackOrItem.type,
            trackId: trackOrItem.trackId || null,
            title: trackOrItem.title || `${trackOrItem.type} SEGMENT`,
            duration: Number(trackOrItem.duration) || 20
          }
        : {
            id: `set_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
            type,
            trackId: trackOrItem.id || trackOrItem.trackId || 'what_you_want',
            title: trackOrItem.title || 'Custom Track',
            artist: trackOrItem.artist || 'PULSE COLLECTIVE',
            duration: trackOrItem.duration || 120
          };

    this.setlist = [...this.setlist, item];
    this.notify();
    return item;
  }

  removeItem(itemId) {
    if (this.setlist.length <= 1) return; // Keep at least 1 item in setlist
    const idx = this.setlist.findIndex((i) => i.id === itemId);
    if (idx === -1) return;

    this.setlist = this.setlist.filter((i) => i.id !== itemId);
    if (this.currentIndex >= this.setlist.length) {
      this.currentIndex = Math.max(0, this.setlist.length - 1);
    }
    this.notify();
  }

  reorderItem(index, direction = -1) {
    const targetIdx = index + direction;
    if (
      index < 0 ||
      index >= this.setlist.length ||
      targetIdx < 0 ||
      targetIdx >= this.setlist.length
    ) {
      return;
    }
    const copy = [...this.setlist];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIdx, 0, moved);
    this.setlist = copy;

    if (this.currentIndex === index) {
      this.currentIndex = targetIdx;
    } else if (this.currentIndex === targetIdx) {
      this.currentIndex = index;
    }
    this.notify();
  }

  selectIndex(index) {
    if (index >= 0 && index < this.setlist.length) {
      this.currentIndex = index;
      this.notify();
      return this.setlist[this.currentIndex];
    }
    return null;
  }

  advanceNext() {
    if (this.currentIndex + 1 < this.setlist.length) {
      this.currentIndex += 1;
      this.notify();
      return this.setlist[this.currentIndex];
    }
    return null;
  }

  advancePrevious() {
    if (this.currentIndex - 1 >= 0) {
      this.currentIndex -= 1;
      this.notify();
      return this.setlist[this.currentIndex];
    }
    return this.setlist[0];
  }
}

export const setlistManager = new SetlistManager();


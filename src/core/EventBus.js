/**
 * EventBus: Central synchronous pub/sub dispatcher connecting ConcertTimeline & ShowDirector
 * to LED, Lighting, Crowd, CameraDirector, FX, Artist, PulseLight, and PulseCore.
 */
class EventBus {
  constructor() {
    this.listeners = new Map();
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    const set = this.listeners.get(event);
    if (set) {
      set.delete(callback);
    }
  }

  emit(event, payload) {
    const set = this.listeners.get(event);
    if (set) {
      set.forEach((cb) => {
        try {
          cb(payload);
        } catch (err) {
          console.error(`[PULSE EventBus] Error in listener for ${event}:`, err);
        }
      });
    }
  }
}

export const eventBus = new EventBus();


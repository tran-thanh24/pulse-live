import { DEFAULT_TIMELINES } from '../data/musicManifest';
import { eventBus } from '../core/EventBus';
import { assetUrl } from '../utils/assetUrl';

/**
 * ConcertTimeline: Evaluates JSON cues strictly against `musicEngine.getCurrentTime()` (`audio.currentTime`).
 * Supports seamless seek, pause/resume, and real-time custom cue insertion in Studio Mode.
 */
class ConcertTimeline {
  constructor() {
    this.cues = [];
    this.firedIndices = new Set();
    this.lastTime = 0;
  }

  async loadTimeline(timelinePath) {
    let loaded = DEFAULT_TIMELINES[timelinePath] || DEFAULT_TIMELINES['/timelines/afterglow.json'] || [];
    try {
      const res = await fetch(assetUrl(timelinePath));
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json)) {
          loaded = json;
        }
      }
    } catch {
      // Fallback to bundled DEFAULT_TIMELINES
    }

    this.cues = loaded
      .map((c, idx) => ({ ...c, id: c.id || `cue_${idx}_${c.time}` }))
      .sort((a, b) => a.time - b.time);
    this.firedIndices.clear();
    this.lastTime = 0;
    eventBus.emit('timeline:loaded', { cues: this.cues });
    return this.cues;
  }

  /**
   * Add a cue dynamically from Studio Mode Timeline Editor
   */
  addCue(newCue) {
    const cue = {
      id: `custom_cue_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
      time: Number(newCue.time || 0),
      type: newCue.type || 'scene',
      value: newCue.value || 'DROP',
      target: newCue.target || 'all'
    };
    this.cues = [...this.cues, cue].sort((a, b) => a.time - b.time);
    eventBus.emit('timeline:updated', { cues: this.cues, addedCue: cue });
    return cue;
  }

  /**
   * Resyncs timeline state when user seeks to a new timestamp in the audio track
   */
  syncToTime(targetTime) {
    this.firedIndices.clear();
    let latestScene = null;
    let latestLed = null;
    let latestCamera = null;
    let latestArtist = null;

    this.cues.forEach((cue, index) => {
      if (cue.time <= targetTime) {
        this.firedIndices.add(index);
        if (cue.type === 'scene' || cue.type === 'drop') latestScene = cue;
        if (cue.type === 'led') latestLed = cue;
        if (cue.type === 'camera') latestCamera = cue;
        if (cue.type === 'artist') latestArtist = cue;
      }
    });

    if (latestScene) eventBus.emit('timeline:cue', latestScene);
    if (latestLed) eventBus.emit('timeline:cue', latestLed);
    if (latestCamera) eventBus.emit('timeline:cue', latestCamera);
    if (latestArtist) eventBus.emit('timeline:cue', latestArtist);

    this.lastTime = targetTime;
  }

  /**
   * Called every frame by ShowDirector with `audio.currentTime`
   */
  update(currentTime) {
    // Detect backward seek or large jump (> 1.5s)
    if (currentTime < this.lastTime - 0.25 || Math.abs(currentTime - this.lastTime) > 1.8) {
      this.syncToTime(currentTime);
      return;
    }

    for (let i = 0; i < this.cues.length; i++) {
      const cue = this.cues[i];
      if (!this.firedIndices.has(i) && currentTime >= cue.time) {
        this.firedIndices.add(i);
        eventBus.emit('timeline:cue', cue);
      }
    }

    this.lastTime = currentTime;
  }
}

export const concertTimeline = new ConcertTimeline();


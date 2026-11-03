import { musicEngine } from '../core/MusicEngine';
import { concertTimeline } from './ConcertTimeline';
import { setlistManager } from './SetlistManager';

/**
 * MediaPreloader (`src/systems/MediaPreloader.js`)
 * Preloads the opening track + timeline before the show begins,
 * and preloads the next track in the setlist in the background while the current track plays.
 */
class MediaPreloader {
  constructor() {
    this.preloadedTrackIds = new Set();
  }

  async preloadOpeningShow() {
    const firstItem = setlistManager.getCurrentItem();
    const trackId = firstItem?.trackId || 'what_you_want';
    await this.preloadTrackById(trackId);
    this.preloadNextSetlistTrack();
  }

  async preloadTrackById(trackId) {
    if (!trackId || this.preloadedTrackIds.has(trackId)) return;
    const track = musicEngine.tracks.find((t) => t.id === trackId);
    if (!track) return;

    // Warm up MusicEngine audio buffer cache for this track
    musicEngine.warmTrackCache(track);
    if (track.timeline) {
      await concertTimeline.loadTimeline(track.timeline);
    }
    this.preloadedTrackIds.add(trackId);
  }

  preloadNextSetlistTrack() {
    const nextItem = setlistManager.getNextItem();
    if (nextItem?.trackId && !this.preloadedTrackIds.has(nextItem.trackId)) {
      const nextTrack = musicEngine.tracks.find((t) => t.id === nextItem.trackId);
      if (nextTrack) {
        setTimeout(() => {
          musicEngine.warmTrackCache(nextTrack);
          this.preloadedTrackIds.add(nextTrack.id);
        }, 150);
      }
    }
  }
}

export const mediaPreloader = new MediaPreloader();


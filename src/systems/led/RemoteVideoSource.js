/**
 * RemoteVideoSource.js — Handles direct HTTP/HTTPS video streaming URLs (e.g. MP4/WebM from CDN)
 */
import { NativeVideoSource } from './NativeVideoSource';
import { LED_MEDIA_TYPES } from './LEDConstants';
import { parseYouTubeVideoId } from './YouTubeMediaSource';

export class RemoteVideoSource extends NativeVideoSource {
  constructor(screenId) {
    super(screenId, LED_MEDIA_TYPES.REMOTE_VIDEO);
  }

  async load(url, options = {}) {
    const cleanUrl = String(url || '').trim();
    if (!cleanUrl) throw new Error('Remote video URL is empty');

    // Auto-detect YouTube domain
    if (parseYouTubeVideoId(cleanUrl)) {
      throw new Error('YOUTUBE_URL_DETECTED');
    }

    try {
      new URL(cleanUrl);
    } catch {
      throw new Error('Invalid Remote Video URL');
    }

    return super.load(cleanUrl, {
      ...options,
      fileName: cleanUrl.split('/').pop().split('?')[0] || 'Remote Video',
      isLocalBlob: false
    });
  }
}

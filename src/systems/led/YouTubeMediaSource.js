/**
 * YouTubeMediaSource.js — Manages YouTube IFrame Player API integration
 */
import { MediaSource } from './MediaSource';
import { LED_MEDIA_TYPES, YOUTUBE_PLAYER_STATES } from './LEDConstants';

let ytApiLoadingPromise = null;

export function loadYouTubeIframeApi() {
  if (typeof window === 'undefined') return Promise.reject(new Error('Window not available'));
  if (window.YT && window.YT.Player) {
    return Promise.resolve(window.YT);
  }

  if (ytApiLoadingPromise) {
    return ytApiLoadingPromise;
  }

  ytApiLoadingPromise = new Promise((resolve) => {
    const existingScript = document.getElementById('youtube-iframe-api');
    if (!existingScript) {
      const tag = document.createElement('script');
      tag.id = 'youtube-iframe-api';
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScript = document.getElementsByTagName('script')[0];
      firstScript.parentNode.insertBefore(tag, firstScript);
    }

    const prevOnReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (typeof prevOnReady === 'function') prevOnReady();
      resolve(window.YT);
    };
  });

  return ytApiLoadingPromise;
}

export function parseYouTubeVideoId(input) {
  if (!input) return null;
  const str = String(input).trim();

  // If already a clean 11-char video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(str)) {
    return str;
  }

  try {
    const url = new URL(str.startsWith('http') ? str : `https://${str}`);

    // youtu.be/ID
    if (url.hostname.includes('youtu.be')) {
      const id = url.pathname.slice(1).split('/')[0].split('?')[0];
      if (/^[a-zA-Z0-9_-]{11}$/.test(id)) return id;
    }

    // youtube.com/watch?v=ID
    const vParam = url.searchParams.get('v');
    if (vParam && /^[a-zA-Z0-9_-]{11}$/.test(vParam)) {
      return vParam;
    }

    // youtube.com/shorts/ID or youtube.com/embed/ID
    const parts = url.pathname.split('/').filter(Boolean);
    const keyIdx = parts.findIndex((p) => p === 'shorts' || p === 'embed' || p === 'v');
    if (keyIdx !== -1 && parts[keyIdx + 1]) {
      const id = parts[keyIdx + 1].split('?')[0];
      if (/^[a-zA-Z0-9_-]{11}$/.test(id)) return id;
    }
  } catch {
    // Non-standard fallback regex
    const match = str.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/))([a-zA-Z0-9_-]{11})/);
    if (match && match[1]) return match[1];
  }

  return null;
}

export class YouTubeMediaSource extends MediaSource {
  constructor(screenId) {
    super(LED_MEDIA_TYPES.YOUTUBE);
    this.screenId = screenId;
    this.videoId = null;
    this.rawUrl = '';
    this.videoTitle = '';
    this.player = null;
    this.containerId = `yt-embed-${this.screenId}`;
    this.containerEl = null;
    this.timePollTimer = null;
    this.volume = 0.85;
    this.muted = false;
    this.loop = true;
  }

  async load(inputUrlOrId, options = {}) {
    const vidId = parseYouTubeVideoId(inputUrlOrId);
    if (!vidId) {
      this.state = YOUTUBE_PLAYER_STATES.ERROR;
      this.error = 'Invalid YouTube URL or Video ID';
      this.notify();
      throw new Error(this.error);
    }

    this.rawUrl = inputUrlOrId;
    this.videoId = vidId;
    this.error = null;
    this.state = YOUTUBE_PLAYER_STATES.BUFFERING;
    this.notify();

    const YT = await loadYouTubeIframeApi();

    return new Promise((resolve) => {
      this.destroyPlayer();

      // Ensure container element exists in DOM
      let container = document.getElementById(this.containerId);
      if (!container) {
        container = document.createElement('div');
        container.id = this.containerId;
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.pointerEvents = 'auto';
      }
      this.containerEl = container;

      // Temporary holder to be replaced by YT.Player iframe
      const placeholder = document.createElement('div');
      placeholder.id = `${this.containerId}-inner`;
      placeholder.style.width = '100%';
      placeholder.style.height = '100%';
      container.innerHTML = '';
      container.appendChild(placeholder);

      this.player = new YT.Player(placeholder.id, {
        videoId: this.videoId,
        width: '100%',
        height: '100%',
        playerVars: {
          autoplay: options.autoPlay ? 1 : 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          enablejsapi: 1,
          origin: typeof window !== 'undefined' ? window.location.origin : undefined
        },
        events: {
          onReady: (event) => {
            try {
              this.duration = this.player.getDuration() || 0;
              this.videoTitle = this.player.getVideoData?.()?.title || `YouTube (${this.videoId})`;
              this.player.setVolume(Math.round(this.volume * 100));
              if (this.muted) this.player.mute();
              else this.player.unMute();

              if (options.autoPlay) {
                event.target.playVideo();
                this.state = YOUTUBE_PLAYER_STATES.PLAYING;
              } else {
                this.state = YOUTUBE_PLAYER_STATES.CUED;
              }
            } catch (err) {
              console.warn('[YouTubeMediaSource] onReady init error:', err);
            }
            this.startTimePolling();
            this.notify();
            resolve(this);
          },
          onStateChange: (event) => {
            this.handleStateChange(event.data);
          },
          onError: (event) => {
            this.handleError(event.data);
          }
        }
      });
    });
  }

  handleStateChange(ytState) {
    switch (ytState) {
      case -1:
        this.state = YOUTUBE_PLAYER_STATES.UNSTARTED;
        break;
      case 0: // ENDED
        this.state = YOUTUBE_PLAYER_STATES.ENDED;
        if (this.loop && this.player) {
          try {
            this.player.seekTo(0, true);
            this.player.playVideo();
          } catch {}
        }
        break;
      case 1:
        this.state = YOUTUBE_PLAYER_STATES.PLAYING;
        break;
      case 2:
        this.state = YOUTUBE_PLAYER_STATES.PAUSED;
        break;
      case 3:
        this.state = YOUTUBE_PLAYER_STATES.BUFFERING;
        break;
      case 5:
        this.state = YOUTUBE_PLAYER_STATES.CUED;
        break;
      default:
        break;
    }
    this.notify();
  }

  handleError(errorCode) {
    this.state = YOUTUBE_PLAYER_STATES.ERROR;
    let msg = 'YOUTUBE VIDEO UNAVAILABLE';
    if (errorCode === 2) msg = 'Invalid YouTube video ID parameter';
    else if (errorCode === 5) msg = 'HTML5 player error on YouTube';
    else if (errorCode === 100) msg = 'Video not found or removed';
    else if (errorCode === 101 || errorCode === 150) {
      msg = 'Video owner does not allow embedding outside YouTube';
    }
    this.error = msg;
    this.notify();
  }

  startTimePolling() {
    if (this.timePollTimer) clearInterval(this.timePollTimer);
    this.timePollTimer = setInterval(() => {
      if (this.player && typeof this.player.getCurrentTime === 'function') {
        try {
          this.currentTime = this.player.getCurrentTime() || 0;
          if (!this.duration) this.duration = this.player.getDuration() || 0;
        } catch {}
      }
    }, 250);
  }

  play() {
    if (this.player && typeof this.player.playVideo === 'function') {
      try {
        this.player.playVideo();
        this.state = YOUTUBE_PLAYER_STATES.PLAYING;
        this.notify();
      } catch (err) {
        console.warn('[YouTubeMediaSource] play error:', err);
      }
    }
  }

  pause() {
    if (this.player && typeof this.player.pauseVideo === 'function') {
      try {
        this.player.pauseVideo();
        this.state = YOUTUBE_PLAYER_STATES.PAUSED;
        this.notify();
      } catch (err) {
        console.warn('[YouTubeMediaSource] pause error:', err);
      }
    }
  }

  stop() {
    if (this.player && typeof this.player.stopVideo === 'function') {
      try {
        this.player.stopVideo();
        this.state = YOUTUBE_PLAYER_STATES.ENDED;
        this.currentTime = 0;
        this.notify();
      } catch (err) {
        console.warn('[YouTubeMediaSource] stop error:', err);
      }
    }
  }

  seek(timeSeconds) {
    if (this.player && typeof this.player.seekTo === 'function') {
      try {
        this.currentTime = Math.max(0, Number(timeSeconds) || 0);
        this.player.seekTo(this.currentTime, true);
        this.notify();
      } catch (err) {
        console.warn('[YouTubeMediaSource] seek error:', err);
      }
    }
  }

  setVolume(value) {
    super.setVolume(value);
    if (this.player && typeof this.player.setVolume === 'function') {
      try {
        this.player.setVolume(Math.round(this.volume * 100));
      } catch {}
    }
  }

  setMuted(value) {
    super.setMuted(value);
    if (this.player) {
      try {
        if (this.muted && typeof this.player.mute === 'function') {
          this.player.mute();
        } else if (!this.muted && typeof this.player.unMute === 'function') {
          this.player.unMute();
        }
      } catch {}
    }
  }

  destroyPlayer() {
    if (this.timePollTimer) {
      clearInterval(this.timePollTimer);
      this.timePollTimer = null;
    }
    if (this.player && typeof this.player.destroy === 'function') {
      try {
        this.player.destroy();
      } catch {}
      this.player = null;
    }
  }

  destroy() {
    super.destroy();
    this.destroyPlayer();
    if (this.containerEl && this.containerEl.parentNode) {
      this.containerEl.parentNode.removeChild(this.containerEl);
    }
    this.containerEl = null;
  }
}

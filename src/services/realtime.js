/**
 * PresenceService Architecture for PULSE//LIVE 2026
 * Defines the required interface:
 * - joinConcert(userProfile)
 * - leaveConcert(userId)
 * - updatePosition(position, rotation)
 * - updateReaction(reactionType)
 * - updateLightstick(mode, color)
 * - subscribePlayers(callback)
 *
 * Phase 1: MockPresenceService (spawns simulated real-player avatars in the arena + live presence count).
 * Phase 2: SupabaseRealtimePresenceService (ready to connect without modifying World components).
 */
export const isSimulatedOnlineCount = true;

const SIMULATED_PEERS = [
  {
    userId: 'peer_1',
    peerId: 'peer_1',
    displayName: 'MINH // 08',
    position: [-5.2, 0, -6.5],
    rotation: 0.1,
    avatar: {
      gender: 'male',
      skinTone: '#F5CBA7',
      hairStyle: 'cyber-crop',
      hairColor: '#22D3EE',
      outfitTop: 'techwear-jacket',
      outfitBottom: 'cargo-tech-pants',
      outfitColor: '#06B6D4',
      accessory: 'visor',
      lightstick: '#22D3EE'
    },
    lightstickMode: 'ENERGY'
  },
  {
    userId: 'peer_2',
    peerId: 'peer_2',
    displayName: 'LINH // SOUND',
    position: [5.4, 0, -5.8],
    rotation: -0.15,
    avatar: {
      gender: 'female',
      skinTone: '#FDEBD0',
      hairStyle: 'long-wave',
      hairColor: '#EC4899',
      outfitTop: 'cropped-bomber',
      outfitBottom: 'pleated-stage-skirt',
      outfitColor: '#EC4899',
      accessory: 'headphones',
      lightstick: '#EC4899'
    },
    lightstickMode: 'ENERGY'
  },
  {
    userId: 'peer_3',
    peerId: 'peer_3',
    displayName: 'ALEX // KINETIC',
    position: [-3.8, 0, 3.2],
    rotation: 0.05,
    avatar: {
      gender: 'male',
      skinTone: '#E59866',
      hairStyle: 'wolf-cut',
      hairColor: '#8B5CF6',
      outfitTop: 'oversized-hoodie',
      outfitBottom: 'relaxed-denim',
      outfitColor: '#8B5CF6',
      accessory: 'shades',
      lightstick: '#FACC15'
    },
    lightstickMode: 'SYNC'
  },
  {
    userId: 'peer_4',
    peerId: 'peer_4',
    displayName: 'HANA // PULSE',
    position: [4.2, 0, 2.5],
    rotation: -0.1,
    avatar: {
      gender: 'female',
      skinTone: '#F5CBA7',
      hairStyle: 'neon-bob',
      hairColor: '#E2E8F0',
      outfitTop: 'corset-stage-top',
      outfitBottom: 'high-waist-flare',
      outfitColor: '#1E293B',
      accessory: 'visor',
      lightstick: '#8B5CF6'
    },
    lightstickMode: 'WAVE'
  }
];

export class MockPresenceService {
  constructor() {
    this.isSimulatedOnlineCount = isSimulatedOnlineCount;
    this.currentOnlineCount = 1420;
    this.listeners = new Set();
    this.playerSubscribers = new Set();
    this.intervalId = null;
    this.peers = [...SIMULATED_PEERS];
    this.localPlayer = null;
  }

  joinConcert(userProfile = {}) {
    this.localPlayer = {
      userId: userProfile.userId || 'local_player',
      displayName: userProfile.displayName || 'PULSE FAN',
      position: [0, 0, 34],
      rotation: 0,
      lightstickMode: 'ENERGY',
      lightstickColor: userProfile.lightstickColor || '#22D3EE'
    };
    this.startPresenceSimulation();
    this.notifyPlayerSubscribers();
    return this.localPlayer;
  }

  leaveConcert() {
    this.localPlayer = null;
    this.stopPresenceSimulation();
  }

  updatePosition(position, rotation = 0) {
    if (this.localPlayer) {
      this.localPlayer.position = position;
      this.localPlayer.rotation = rotation;
    }
  }

  updateReaction(reactionType, userId = 'local_player') {
    this.notifyListeners({
      type: 'REACTION_BROADCAST',
      reactionType,
      userId,
      timestamp: Date.now()
    });
  }

  updateLightstick(mode, color) {
    if (this.localPlayer) {
      this.localPlayer.lightstickMode = mode;
      if (color) this.localPlayer.lightstickColor = color;
    }
  }

  subscribePlayers(callback) {
    this.playerSubscribers.add(callback);
    callback(this.peers);
    return () => {
      this.playerSubscribers.delete(callback);
    };
  }

  onPeersUpdated(callback) {
    return this.subscribePlayers(callback);
  }

  broadcastState(state = {}) {
    if (state.position) {
      this.updatePosition(state.position, state.rotation || 0);
    }
    if (state.lightstickMode) {
      this.updateLightstick(state.lightstickMode);
    }
  }

  notifyPlayerSubscribers() {
    this.playerSubscribers.forEach((cb) => cb(this.peers));
  }

  startPresenceSimulation() {
    if (this.intervalId) return;
    this.intervalId = setInterval(() => {
      if (this.isSimulatedOnlineCount) {
        const delta = Math.floor(Math.random() * 13) - 5;
        this.currentOnlineCount = Math.max(1320, Math.min(2450, this.currentOnlineCount + delta));
        this.notifyListeners({
          type: 'PRESENCE_UPDATE',
          onlineCount: this.currentOnlineCount,
          isSimulated: this.isSimulatedOnlineCount
        });
      }
    }, 3200);
  }

  stopPresenceSimulation() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  subscribe(callback) {
    this.listeners.add(callback);
    this.startPresenceSimulation();
    return () => {
      this.listeners.delete(callback);
      if (this.listeners.size === 0) {
        this.stopPresenceSimulation();
      }
    };
  }

  broadcastReaction(reactionType, userId) {
    this.updateReaction(reactionType, userId);
  }

  notifyListeners(payload) {
    this.listeners.forEach((cb) => cb(payload));
  }
}

/**
 * Phase 2 Adapter Stub: Drop-in replacement using Supabase Realtime Channels
 */
export class SupabaseRealtimePresenceService extends MockPresenceService {
  constructor(supabaseClient) {
    super();
    this.supabase = supabaseClient;
  }
}

export const presenceService = new MockPresenceService();
export const realtimeService = presenceService;

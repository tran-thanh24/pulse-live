import { ARTISTS } from './artists';
import { ZONES } from './zones';
import { MUSIC_MANIFEST } from './musicManifest';

export const CONCERT_CONFIG = {
  concertName: 'PULSE//LIVE 2026',
  concept: 'CITY OF SOUND',
  tag: 'VIRTUAL CONCERT EXPERIENCE',
  tagline: ['FEEL THE SOUND.', 'BECOME THE SHOW.'],
  heroTitle: ['FEEL THE SOUND.', 'BECOME THE SHOW.'],
  heroSubtitle:
    'Step inside the City of Sound — an architectural live music arena driven by real-time audio frequencies and collective crowd energy.',
  artist: {
    id: 'cortis',
    name: 'CORTIS',
    role: 'LIVE ACT / HIP-HOP & ELECTRONIC',
    members: ARTISTS,
    bio: {
      en: 'CORTIS delivers explosive live performances with driving beats, kinetic stage lighting, and crowd-resonating anthems.',
      vi: 'CORTIS mang đến màn trình diễn bùng nổ với các giai điệu đầy năng lượng, ánh sáng động học và kết nối hàng ngàn khán giả.'
    }
  },
  castMode: 'group', // 'solo' | 'duo' | 'group' | 'fullCast12' | 'fullCast24'
  date: '03 NOV 2026',
  ticketDate: '03.11.2026',
  gateOpen: '19:00',
  showTime: '20:00 ICT',
  showTimeShort: '20:00',
  venue: 'PULSE SOUND DOME // SECTOR 01',
  initialSimulatedOnlineCount: 1420,
  totalDurationSeconds: 120,
  theme: {
    background: '#070816',
    primary: '#22D3EE',
    secondary: '#8B5CF6',
    accent: '#EC4899',
    highlight: '#FACC15',
    text: '#FFFFFF',
    secondaryText: '#A1A1AA',
    glassBg: 'rgba(12, 14, 35, 0.72)'
  },
  stageColors: {
    BLACKOUT: {
      primary: '#090D16',
      secondary: '#111827',
      accent: '#22D3EE',
      ambientIntensity: 0.08,
      spotIntensity: 0.2,
      speed: 0.2,
      label: 'BLACKOUT — SILENCE BEFORE THE PULSE'
    },
    INTRO: {
      primary: '#22D3EE',
      secondary: '#8B5CF6',
      accent: '#38BDF8',
      ambientIntensity: 0.45,
      spotIntensity: 2.4,
      speed: 0.9,
      label: 'INTRO — FREQUENCY IGNITION'
    },
    VERSE: {
      primary: '#8B5CF6',
      secondary: '#22D3EE',
      accent: '#A855F7',
      ambientIntensity: 0.55,
      spotIntensity: 2.8,
      speed: 1.1,
      label: 'VERSE — HARMONIC ARCHITECTURE'
    },
    CHORUS: {
      primary: '#EC4899',
      secondary: '#8B5CF6',
      accent: '#22D3EE',
      ambientIntensity: 0.72,
      spotIntensity: 3.6,
      speed: 1.9,
      label: 'CHORUS — RESONANCE PEAK'
    },
    DROP: {
      primary: '#22D3EE',
      secondary: '#EC4899',
      accent: '#FACC15',
      ambientIntensity: 0.88,
      spotIntensity: 4.8,
      speed: 3.6,
      label: 'DROP — FULL KINETIC RELEASE'
    },
    BALLAD: {
      primary: '#F59E0B',
      secondary: '#38BDF8',
      accent: '#FDE047',
      ambientIntensity: 0.48,
      spotIntensity: 2.1,
      speed: 0.5,
      label: 'BALLAD — ACOUSTIC HORIZON'
    },
    ENCORE: {
      primary: '#FACC15',
      secondary: '#FFFFFF',
      accent: '#22D3EE',
      ambientIntensity: 0.92,
      spotIntensity: 4.4,
      speed: 2.2,
      label: 'ENCORE — GOLDEN FREQUENCY'
    }
  },
  songs: MUSIC_MANIFEST,
  zones: ZONES,
  merch: [
    {
      id: 'pulse-light-pro',
      name: 'PULSE LIGHT // MK-II CONTROLLER',
      category: 'PULSE LIGHT',
      price: '$62.00',
      badge: 'SIGNATURE',
      color: '#22D3EE',
      secondaryColor: '#8B5CF6',
      shape: 'lightstick',
      description: 'Acoustic-reactive hand controller with dual energy rings and sub-millisecond arena wave sync.'
    },
    {
      id: 'city-of-sound-tee',
      name: 'CITY OF SOUND ARCHITECTURAL TEE',
      category: 'T-SHIRT',
      price: '$45.00',
      badge: 'TOUR 2026',
      color: '#0F172A',
      secondaryColor: '#22D3EE',
      shape: 'tshirt',
      description: 'Heavyweight matte black jersey tee with reflective waveform frequency diagram across the back.'
    },
    {
      id: 'pulse-core-hoodie',
      name: 'PULSE CORE TECH FLEECE HOODIE',
      category: 'HOODIE',
      price: '$88.00',
      badge: 'LIMITED',
      color: '#1E1B4B',
      secondaryColor: '#EC4899',
      shape: 'hoodie',
      description: 'Structured acoustic-weave pullover featuring high-density PULSE//LIVE emblem.'
    },
    {
      id: 'frequency-cap',
      name: 'FREQUENCY ZERO TACTICAL CAP',
      category: 'CAP',
      price: '$36.00',
      badge: 'EDITION 01',
      color: '#090D16',
      secondaryColor: '#FACC15',
      shape: 'cap',
      description: 'Minimalist 6-panel architectural cap with anodized aluminum waveform clasp.'
    },
    {
      id: 'pulse-pass-set',
      name: 'METAL SOUNDWAVE COLLECTOR PASS SET',
      category: 'COLLECTIBLE',
      price: '$28.00',
      badge: 'COLLECTOR',
      color: '#8B5CF6',
      secondaryColor: '#22D3EE',
      shape: 'photocard',
      description: 'Laser-etched collector cards featuring the acoustic schematics of PULSE//LIVE 2026.'
    }
  ],
  avatarOptions: {
    skinTones: [
      { id: 'porcelain', name: 'Porcelain', color: '#FDE7D6' },
      { id: 'warm-ivory', name: 'Warm Ivory', color: '#F5CBA7' },
      { id: 'honey-tan', name: 'Honey Tan', color: '#E0AC69' },
      { id: 'amber-bronze', name: 'Amber Bronze', color: '#C68642' },
      { id: 'rich-espresso', name: 'Espresso', color: '#6E473B' }
    ],
    hairStyles: [
      { id: 'cyber-crop', name: 'Kinetic Crop' },
      { id: 'twin-wave', name: 'Frequency Twin' },
      { id: 'sleek-bob', name: 'Studio Bob' },
      { id: 'spiky-wolf', name: 'Apex Cut' }
    ],
    hairColors: [
      { id: 'obsidian', name: 'Obsidian Black', color: '#18181B' },
      { id: 'pulse-cyan', name: 'Pulse Cyan', color: '#22D3EE' },
      { id: 'sonic-violet', name: 'Sonic Violet', color: '#8B5CF6' },
      { id: 'signal-pink', name: 'Signal Magenta', color: '#EC4899' },
      { id: 'platinum-ice', name: 'Platinum Silver', color: '#E2E8F0' }
    ],
    outfits: [
      { id: 'techwear-jacket', name: 'Acoustic Shell Jacket' },
      { id: 'idol-blazer', name: 'Harmonic Tailor Blazer' },
      { id: 'oversized-hoodie', name: 'Sub-Bass Street Hoodie' },
      { id: 'holo-vest', name: 'Frequency Utility Vest' }
    ],
    outfitColors: [
      { id: 'cyan', name: 'Pulse Cyan', color: '#06B6D4' },
      { id: 'violet', name: 'Sonic Violet', color: '#8B5CF6' },
      { id: 'midnight', name: 'Stealth Slate', color: '#1E293B' },
      { id: 'magenta', name: 'Signal Pink', color: '#EC4899' },
      { id: 'gold', name: 'Encore Gold', color: '#EAB308' }
    ],
    accessories: [
      { id: 'none', name: 'None' },
      { id: 'visor', name: 'Frequency Visor' },
      { id: 'headphones', name: 'Studio Monitors' },
      { id: 'crown', name: 'Pulse Ring Halo' }
    ],
    lightstickColors: [
      { id: 'cyan', name: 'Pulse Cyan', color: '#22D3EE' },
      { id: 'purple', name: 'Sonic Violet', color: '#8B5CF6' },
      { id: 'pink', name: 'Signal Pink', color: '#EC4899' },
      { id: 'gold', name: 'Encore Gold', color: '#FACC15' },
      { id: 'white', name: 'Pure Acoustic White', color: '#FFFFFF' }
    ]
  }
};

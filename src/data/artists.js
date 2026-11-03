/**
 * Configurable Artist Roster for PULSE//LIVE 2026
 * Supports solo (1), duo (2), group (4), or full cast (12 / 24) dynamically via concert config.
 */
export const ARTIST_CAST_PRESETS = {
  solo: 1,
  duo: 2,
  group: 4,
  fullCast12: 12,
  fullCast24: 24
};

const BASE_PERFORMERS = [
  {
    artistId: 'vortex',
    displayName: 'KAI // VORTEX',
    role: 'Lead Vocal & Synth Architect',
    model: 'stylized-performer',
    stagePosition: [0, 1.4, -18.5],
    runwayPosition: [0, 1.22, -10.2],
    avatar: {
      skinTone: '#F5CBA7',
      hairColor: '#22D3EE',
      outfitColor: '#0F172A',
      accentColor: '#22D3EE'
    },
    animations: ['IDLE', 'WALK', 'SING', 'DANCE_A', 'DANCE_B', 'WAVE', 'TALK', 'RUNWAY', 'FINAL_POSE'],
    defaultAnimation: 'SING'
  },
  {
    artistId: 'echo',
    displayName: 'SORA // ECHO',
    role: 'Main Vocal & High-Frequency Lead',
    model: 'stylized-performer',
    stagePosition: [-3.2, 1.4, -19.5],
    runwayPosition: [-1.4, 1.22, -12.0],
    avatar: {
      skinTone: '#FDE7D6',
      hairColor: '#EC4899',
      outfitColor: '#1E1B4B',
      accentColor: '#EC4899'
    },
    animations: ['IDLE', 'WALK', 'SING', 'DANCE_A', 'DANCE_B', 'WAVE', 'TALK', 'RUNWAY', 'FINAL_POSE'],
    defaultAnimation: 'DANCE_A'
  },
  {
    artistId: 'kilo',
    displayName: 'RAY // KILO',
    role: 'Sub-Bass & Live Percussion',
    model: 'stylized-performer',
    stagePosition: [3.2, 1.4, -19.5],
    runwayPosition: [1.4, 1.22, -12.0],
    avatar: {
      skinTone: '#E0AC69',
      hairColor: '#FACC15',
      outfitColor: '#18181B',
      accentColor: '#FACC15'
    },
    animations: ['IDLE', 'WALK', 'SING', 'DANCE_A', 'DANCE_B', 'WAVE', 'TALK', 'RUNWAY', 'FINAL_POSE'],
    defaultAnimation: 'DANCE_B'
  },
  {
    artistId: 'zenith',
    displayName: 'NOAH // ZENITH',
    role: 'Modular Controller & Visual Sync',
    model: 'stylized-performer',
    stagePosition: [0, 2.3, -24.5],
    runwayPosition: [0, 1.4, -17.0],
    avatar: {
      skinTone: '#C68642',
      hairColor: '#E2E8F0',
      outfitColor: '#311042',
      accentColor: '#8B5CF6'
    },
    animations: ['IDLE', 'WALK', 'SING', 'DANCE_A', 'DANCE_B', 'WAVE', 'TALK', 'RUNWAY', 'FINAL_POSE'],
    defaultAnimation: 'IDLE'
  }
];

/**
 * Generates an arbitrary cast size (1, 2, 4, 12, 24) with non-overlapping stage formations
 */
export function getArtistRoster(castMode = 'group') {
  const count =
    typeof castMode === 'number'
      ? castMode
      : ARTIST_CAST_PRESETS[castMode] || 4;

  if (count <= 4) {
    return BASE_PERFORMERS.slice(0, count);
  }

  const expanded = [];
  const palette = ['#22D3EE', '#8B5CF6', '#EC4899', '#FACC15'];
  for (let i = 0; i < count; i++) {
    const base = BASE_PERFORMERS[i % BASE_PERFORMERS.length];
    const row = Math.floor(i / 6);
    const col = i % 6;
    const xSpread = (col - 2.5) * 3.4;
    const zSpread = -18.5 - row * 2.2;

    expanded.push({
      ...base,
      artistId: `${base.artistId}_${i + 1}`,
      displayName: i < 4 ? base.displayName : `UNIT // ${String(i + 1).padStart(2, '0')}`,
      stagePosition: [xSpread, 1.4, zSpread],
      runwayPosition: [(col - 2.5) * 1.1, 1.22, -10.5 - row * 1.8],
      avatar: {
        ...base.avatar,
        accentColor: palette[i % palette.length]
      }
    });
  }
  return expanded;
}

export const ARTISTS = BASE_PERFORMERS;

/**
 * Configurable Artist Roster for PULSE//LIVE 2026 — CORTIS
 * Official 5-Member Formation:
 * 1. MARTIN (Leader, Producer, Lead Vocal)
 * 2. JAMES (Main Dancer, Vocal)
 * 3. JUHOON (Main Vocal)
 * 4. SEONGHYEON (Rapper, Producer)
 * 5. KEONHO (Vocal, Maknae)
 */

export const ARTIST_CAST_PRESETS = {
  solo: 1,
  duo: 2,
  cortis5: 5,
  group: 5,
  ensemble10: 10,
  mega20: 20
};

export const CORTIS_MEMBERS = [
  {
    artistId: 'cortis_martin',
    name: 'Martin',
    displayName: 'MARTIN',
    koreanName: '마틴',
    role: 'Leader · Producer · Lead Vocal',
    badge: 'LEADER',
    model: 'stylized-performer',
    stagePosition: [0, 1.45, -16.5],
    runwayPosition: [0, 1.25, -8.0],
    bStagePosition: [0, 1.15, 6.4],
    avatar: {
      gender: 'male',
      facePreset: 'male-sharp',
      skinTone: '#FDE7D6',
      hairStyle: 'curtain-flow',
      hairColor: '#E2E8F0', // Platinum Silver
      outfitTop: 'tailored-blazer',
      outfitBottom: 'tailored-trousers',
      shoes: 'combat-boots',
      outfitColor: '#0F172A',
      accentColor: '#22D3EE',
      accessory: 'iem-earpiece',
      scalePreset: 'TALL'
    },
    animations: ['IDLE', 'WALK', 'SING', 'DANCE_A', 'DANCE_B', 'WAVE', 'TALK', 'RUNWAY', 'FINAL_POSE'],
    defaultAnimation: 'SING'
  },
  {
    artistId: 'cortis_james',
    name: 'James',
    displayName: 'JAMES',
    koreanName: '제임스',
    role: 'Main Dancer · Vocal',
    badge: 'DANCE',
    model: 'stylized-performer',
    stagePosition: [-1.75, 1.45, -17.0],
    runwayPosition: [-1.0, 1.25, -9.6],
    bStagePosition: [-1.0, 1.15, 5.8],
    avatar: {
      gender: 'male',
      facePreset: 'male-sharp',
      skinTone: '#F5CBA7',
      hairStyle: 'undercut-fade',
      hairColor: '#FACC15', // Warm Golden Blonde
      outfitTop: 'neon-accent-harness-vest',
      outfitBottom: 'cargo-joggers',
      shoes: 'chunky-cyber-sneakers',
      outfitColor: '#18181B',
      accentColor: '#FACC15',
      accessory: 'iem-earpiece',
      scalePreset: 'MEDIUM'
    },
    animations: ['IDLE', 'WALK', 'SING', 'DANCE_A', 'DANCE_B', 'WAVE', 'TALK', 'RUNWAY', 'FINAL_POSE'],
    defaultAnimation: 'DANCE_A'
  },
  {
    artistId: 'cortis_juhoon',
    name: 'Juhoon',
    displayName: 'JUHOON',
    koreanName: '주훈',
    role: 'Main Vocal',
    badge: 'VOCAL',
    model: 'stylized-performer',
    stagePosition: [1.75, 1.45, -17.0],
    runwayPosition: [1.0, 1.25, -9.6],
    bStagePosition: [1.0, 1.15, 5.8],
    avatar: {
      gender: 'male',
      facePreset: 'male-sharp',
      skinTone: '#FDE7D6',
      hairStyle: 'slick-back',
      hairColor: '#38BDF8', // Electric Sky Blue
      outfitTop: 'cyber-bomber-jacket',
      outfitBottom: 'tailored-trousers',
      shoes: 'combat-boots',
      outfitColor: '#1E1B4B',
      accentColor: '#38BDF8',
      accessory: 'iem-earpiece',
      scalePreset: 'MEDIUM'
    },
    animations: ['IDLE', 'WALK', 'SING', 'DANCE_A', 'DANCE_B', 'WAVE', 'TALK', 'RUNWAY', 'FINAL_POSE'],
    defaultAnimation: 'SING'
  },
  {
    artistId: 'cortis_seonghyeon',
    name: 'Seonghyeon',
    displayName: 'SEONGHYEON',
    koreanName: '성현',
    role: 'Rapper · Producer',
    badge: 'RAPPER',
    model: 'stylized-performer',
    stagePosition: [-3.2, 1.45, -17.6],
    runwayPosition: [-1.0, 1.25, -11.2],
    bStagePosition: [-0.7, 1.15, 5.0],
    avatar: {
      gender: 'male',
      facePreset: 'male-sharp',
      skinTone: '#E0AC69',
      hairStyle: 'wolf-cut',
      hairColor: '#EC4899', // Cyber Magenta Flare
      outfitTop: 'tactical-vest',
      outfitBottom: 'distressed-denim',
      shoes: 'chunky-cyber-sneakers',
      outfitColor: '#09090B',
      accentColor: '#EC4899',
      accessory: 'iem-earpiece',
      scalePreset: 'MEDIUM'
    },
    animations: ['IDLE', 'WALK', 'SING', 'DANCE_A', 'DANCE_B', 'WAVE', 'TALK', 'RUNWAY', 'FINAL_POSE'],
    defaultAnimation: 'DANCE_B'
  },
  {
    artistId: 'cortis_keonho',
    name: 'Keonho',
    displayName: 'KEONHO',
    koreanName: '건호',
    role: 'Vocal · Maknae',
    badge: 'MAKNAE',
    model: 'stylized-performer',
    stagePosition: [3.2, 1.45, -17.6],
    runwayPosition: [1.0, 1.25, -11.2],
    bStagePosition: [0.7, 1.15, 5.0],
    avatar: {
      gender: 'male',
      facePreset: 'male-sharp',
      skinTone: '#FDE7D6',
      hairStyle: 'cyber-crop',
      hairColor: '#A855F7', // Soft Lavender Violet
      outfitTop: 'oversized-cyber-hoodie',
      outfitBottom: 'cargo-joggers',
      shoes: 'chunky-cyber-sneakers',
      outfitColor: '#2E1065',
      accentColor: '#A855F7',
      accessory: 'iem-earpiece',
      scalePreset: 'MEDIUM'
    },
    animations: ['IDLE', 'WALK', 'SING', 'DANCE_A', 'DANCE_B', 'WAVE', 'TALK', 'RUNWAY', 'FINAL_POSE'],
    defaultAnimation: 'DANCE_A'
  }
];

export const BASE_PERFORMERS = CORTIS_MEMBERS;

/**
 * Generates an artist roster (1 Solo, 2 Duo, 5 CORTIS group, or expanded with backing dancers)
 */
export function getArtistRoster(castMode = 'group') {
  const count =
    typeof castMode === 'number'
      ? castMode
      : ARTIST_CAST_PRESETS[castMode] || 5;

  if (count <= 5) {
    return CORTIS_MEMBERS.slice(0, count);
  }

  // Expanded with backing dancers behind CORTIS
  const expanded = [...CORTIS_MEMBERS];
  const palette = ['#22D3EE', '#8B5CF6', '#EC4899', '#FACC15'];
  const extraCount = count - 5;

  for (let i = 0; i < extraCount; i++) {
    const row = Math.floor(i / 6) + 1;
    const col = i % 6;
    const xSpread = (col - 2.5) * 3.4;
    const zSpread = -21.5 - row * 2.2;

    expanded.push({
      artistId: `cortis_dancer_${i + 1}`,
      displayName: `DANCER // ${String(i + 1).padStart(2, '0')}`,
      badge: 'DANCER',
      role: 'Stage Performer & Backing Dancer',
      model: 'stylized-performer',
      stagePosition: [xSpread, 1.4, zSpread],
      runwayPosition: [(col - 2.5) * 1.1, 1.22, -13.5 - row * 1.8],
      bStagePosition: [(col - 2.5) * 0.6, 1.1, 4.2],
      avatar: {
        gender: i % 2 === 0 ? 'male' : 'female',
        facePreset: i % 2 === 0 ? 'male-sharp' : 'female-idol',
        skinTone: '#FDE7D6',
        hairStyle: i % 2 === 0 ? 'cyber-crop' : 'high-ponytail',
        hairColor: '#3F3F46',
        outfitTop: 'tactical-vest',
        outfitBottom: 'cargo-joggers',
        shoes: 'combat-boots',
        outfitColor: '#18181B',
        accentColor: palette[i % palette.length],
        accessory: 'iem-earpiece',
        scalePreset: 'MEDIUM'
      },
      animations: ['IDLE', 'WALK', 'SING', 'DANCE_A', 'DANCE_B', 'WAVE', 'TALK', 'RUNWAY', 'FINAL_POSE'],
      defaultAnimation: 'DANCE_A'
    });
  }

  return expanded;
}

export const ARTISTS = CORTIS_MEMBERS;

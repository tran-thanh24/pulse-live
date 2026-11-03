/**
 * PULSE//LIVE 2026 — Hair Presets
 * Includes gender compatibility rules ('male' | 'female' | 'unisex')
 * and headgear compatibility flags (`blocksLargeCap`: true if bulky high ponytail/twin-tails).
 */
export const HAIR_PRESETS = [
  // MALE & UNISEX STYLES
  {
    id: 'cyber-crop',
    label: 'Textured Crop',
    labelVi: 'Crop Hiện Đại',
    gender: 'unisex',
    geometryType: 'crop',
    blocksCap: false
  },
  {
    id: 'undercut-fade',
    label: 'Festival Undercut',
    labelVi: 'Undercut Nam Tính',
    gender: 'male',
    geometryType: 'spiky-fade',
    blocksCap: false
  },
  {
    id: 'slick-back',
    label: 'Minimal Slick Back',
    labelVi: 'Vuốt Ngược Minimal',
    gender: 'male',
    geometryType: 'slick',
    blocksCap: false
  },
  {
    id: 'curtain-flow',
    label: 'Two-Block Curtain',
    labelVi: 'Rẽ Ngôi Two-Block',
    gender: 'male',
    geometryType: 'curtain',
    blocksCap: false
  },
  {
    id: 'wolf-cut',
    label: 'Layered Wolf Cut',
    labelVi: 'Wolf Cut Cá Tính',
    gender: 'unisex',
    geometryType: 'wolf',
    blocksCap: false
  },
  // FEMALE & UNISEX STYLES
  {
    id: 'neon-bob',
    label: 'Sleek Studio Bob',
    labelVi: 'Tóc Bob Hiện Đại',
    gender: 'female',
    geometryType: 'bob',
    blocksCap: false
  },
  {
    id: 'long-wave',
    label: 'Long Silk Waves',
    labelVi: 'Tóc Dài Uốn Sóng',
    gender: 'female',
    geometryType: 'long-wave',
    blocksCap: false
  },
  {
    id: 'high-ponytail',
    label: 'High Stage Ponytail',
    labelVi: 'Đuôi Ngựa Cao',
    gender: 'female',
    geometryType: 'ponytail',
    blocksCap: true
  },
  {
    id: 'twin-tails',
    label: 'Idol Twin Tails',
    labelVi: 'Tóc Hai Chùm Idol',
    gender: 'female',
    geometryType: 'twin-tails',
    blocksCap: true
  },
  {
    id: 'braided-crown',
    label: 'Festival Braids',
    labelVi: 'Tóc Tết Lễ Hội',
    gender: 'unisex',
    geometryType: 'braids',
    blocksCap: false
  }
];

export const HAIR_COLORS = [
  { id: 'obsidian', label: 'Obsidian Black', color: '#18181B' },
  { id: 'platinum', label: 'Platinum Silver', color: '#E2E8F0' },
  { id: 'cyan', label: 'Pulse Cyan', color: '#22D3EE' },
  { id: 'violet', label: 'Sonic Violet', color: '#8B5CF6' },
  { id: 'magenta', label: 'Festival Rose', color: '#EC4899' },
  { id: 'gold', label: 'Honey Blonde', color: '#FACC15' },
  { id: 'chestnut', label: 'Warm Espresso', color: '#78350F' },
  { id: 'crimson', label: 'Velvet Crimson', color: '#E11D48' }
];


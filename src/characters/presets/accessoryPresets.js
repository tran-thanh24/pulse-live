/**
 * PULSE//LIVE 2026 — Accessory Presets
 * Includes slot & conflict tags so the Character Rule Engine prevents invalid combinations
 * (e.g., `cap` + `largeHeadAccessory` or incompatible hair).
 */
export const ACCESSORY_PRESETS = [
  {
    id: 'none',
    label: 'No Accessory',
    labelVi: 'Không Phụ Kiện',
    slot: 'none',
    isCap: false,
    isLargeHeadAccessory: false,
    gender: 'unisex'
  },
  {
    id: 'visor',
    label: 'LED Sound Visor',
    labelVi: 'Kính LED Âm Thanh',
    slot: 'eyes',
    isCap: false,
    isLargeHeadAccessory: false,
    gender: 'unisex'
  },
  {
    id: 'shades',
    label: 'Chrome Sunglasses',
    labelVi: 'Kính Râm Chrome',
    slot: 'eyes',
    isCap: false,
    isLargeHeadAccessory: false,
    gender: 'unisex'
  },
  {
    id: 'headphones',
    label: 'Studio Pro Headphones',
    labelVi: 'Tai Nghe Studio',
    slot: 'head',
    isCap: false,
    isLargeHeadAccessory: true,
    gender: 'unisex'
  },
  {
    id: 'street-cap',
    label: 'PULSE Tour Cap',
    labelVi: 'Mũ Lưỡi Trai PULSE',
    slot: 'head-top',
    isCap: true,
    isLargeHeadAccessory: false,
    gender: 'unisex'
  },
  {
    id: 'crystal-tiara',
    label: 'Sonic Crown Headpiece',
    labelVi: 'Vương Miện Ánh Sáng',
    slot: 'head-top',
    isCap: false,
    isLargeHeadAccessory: true,
    gender: 'femaleOnly'
  },
  {
    id: 'iem-earpiece',
    label: 'Stage In-Ear Monitor',
    labelVi: 'Tai Nghe In-Ear Nghệ Sĩ',
    slot: 'ears',
    isCap: false,
    isLargeHeadAccessory: false,
    gender: 'unisex'
  }
];

export const PULSE_LIGHT_COLORS = [
  { id: 'cyan', label: 'Cyan Pulse', color: '#22D3EE' },
  { id: 'violet', label: 'Violet Wave', color: '#8B5CF6' },
  { id: 'pink', label: 'Magenta Glow', color: '#EC4899' },
  { id: 'gold', label: 'Encore Gold', color: '#FACC15' },
  { id: 'white', label: 'Pure White', color: '#FFFFFF' }
];


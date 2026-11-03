/**
 * PULSE//LIVE 2026 — Outfit Presets (Top, Bottom, Shoes, Skin, Face)
 * Enforces gender compatibility ('maleOnly' | 'femaleOnly' | 'unisex').
 */

export const SKIN_TONES = [
  { id: 'porcelain', label: 'Porcelain', color: '#FDEBD0' },
  { id: 'warm-ivory', label: 'Warm Ivory', color: '#F5CBA7' },
  { id: 'golden-sand', label: 'Golden Sand', color: '#E59866' },
  { id: 'honey-bronze', label: 'Honey Bronze', color: '#CA6F1E' },
  { id: 'amber-tan', label: 'Amber Tan', color: '#A0522D' },
  { id: 'deep-espresso', label: 'Deep Espresso', color: '#5C3A21' }
];

export const FACE_PRESETS = [
  { id: 'male-sharp', label: 'Sharp Jawline', labelVi: 'Góc Cạnh Nam Tính', gender: 'male', eyeStyle: 'focused', browStyle: 'bold' },
  { id: 'male-cool', label: 'Cool Composed', labelVi: 'Điềm Đạm Lạnh Lùng', gender: 'male', eyeStyle: 'calm', browStyle: 'straight' },
  { id: 'male-bright', label: 'Bright Vibe', labelVi: 'Năng Động Tươi Sáng', gender: 'male', eyeStyle: 'bright', browStyle: 'arched' },
  { id: 'female-soft', label: 'Soft Elegance', labelVi: 'Thanh Tú Dịu Dàng', gender: 'female', eyeStyle: 'lashed', browStyle: 'soft' },
  { id: 'female-chic', label: 'Fierce Chic', labelVi: 'Sắc Sảo Cá Tính', gender: 'female', eyeStyle: 'cat-eye', browStyle: 'arched' },
  { id: 'female-idol', label: 'Starlight Idol', labelVi: 'Idol Rạng Rỡ', gender: 'female', eyeStyle: 'sparkle', browStyle: 'soft' }
];

export const TOP_PRESETS = [
  {
    id: 'techwear-jacket',
    label: 'Pulse Tech Jacket',
    labelVi: 'Áo Khoác Techwear',
    gender: 'unisex',
    style: 'jacket'
  },
  {
    id: 'oversized-hoodie',
    label: 'Festival Hoodie',
    labelVi: 'Hoodie Oversize',
    gender: 'unisex',
    style: 'hoodie'
  },
  {
    id: 'tailored-blazer',
    label: 'Structured Stage Blazer',
    labelVi: 'Blazer Sân Khấu Nam',
    gender: 'maleOnly',
    style: 'blazer-male'
  },
  {
    id: 'sleeveless-vest',
    label: 'Utility Acoustic Vest',
    labelVi: 'Áo Gile Chiến Thuật',
    gender: 'maleOnly',
    style: 'vest-male'
  },
  {
    id: 'cropped-bomber',
    label: 'Cropped Neon Bomber',
    labelVi: 'Áo Khoác Cropped Nữ',
    gender: 'femaleOnly',
    style: 'cropped-jacket'
  },
  {
    id: 'corset-stage-top',
    label: 'Hologram Stage Top',
    labelVi: 'Áo Corset Sân Khấu',
    gender: 'femaleOnly',
    style: 'corset-top'
  },
  {
    id: 'holo-tunic',
    label: 'Soundwave Jersey',
    labelVi: 'Áo Jersey Âm Thanh',
    gender: 'unisex',
    style: 'jersey'
  }
];

export const BOTTOM_PRESETS = [
  {
    id: 'cargo-tech-pants',
    label: 'Tactical Cargo Pants',
    labelVi: 'Quần Cargo Techwear',
    gender: 'unisex',
    style: 'cargo'
  },
  {
    id: 'relaxed-denim',
    label: 'Wide Street Denim',
    labelVi: 'Quần Jeans Ống Rộng',
    gender: 'unisex',
    style: 'wide-pants'
  },
  {
    id: 'tailored-trousers',
    label: 'Slim Stage Trousers',
    labelVi: 'Quần Âu Sân Khấu',
    gender: 'maleOnly',
    style: 'slim-pants'
  },
  {
    id: 'pleated-stage-skirt',
    label: 'Pleated Performance Skirt',
    labelVi: 'Chân Váy Xếp Ly',
    gender: 'femaleOnly',
    style: 'skirt'
  },
  {
    id: 'high-waist-flare',
    label: 'High-Waist Flare Pants',
    labelVi: 'Quần Cạp Cao Tôn Dáng',
    gender: 'femaleOnly',
    style: 'flare-pants'
  }
];

export const SHOE_PRESETS = [
  {
    id: 'chunky-runners',
    label: 'Pulse Wave Runners',
    labelVi: 'Giày Sneaker Đế Cao',
    gender: 'unisex',
    style: 'sneakers'
  },
  {
    id: 'combat-boots',
    label: 'Stage Combat Boots',
    labelVi: 'Boots Cổ Cao',
    gender: 'unisex',
    style: 'boots'
  },
  {
    id: 'platform-idol-boots',
    label: 'Platform Heels & Boots',
    labelVi: 'Boots Đế Xuồng Nữ',
    gender: 'femaleOnly',
    style: 'platform-boots'
  },
  {
    id: 'high-top-street',
    label: 'High-Top Street Kicks',
    labelVi: 'Sneaker Cổ Cao Nam',
    gender: 'maleOnly',
    style: 'high-tops'
  }
];

export const OUTFIT_COLORS = [
  { id: 'violet', label: 'Electric Violet', color: '#8B5CF6' },
  { id: 'cyan', label: 'Pulse Cyan', color: '#06B6D4' },
  { id: 'magenta', label: 'Hot Magenta', color: '#EC4899' },
  { id: 'gold', label: 'Encore Gold', color: '#EAB308' },
  { id: 'obsidian', label: 'Stealth Matte', color: '#1E293B' },
  { id: 'arctic', label: 'Arctic White', color: '#F8FAFC' },
  { id: 'crimson', label: 'Stage Crimson', color: '#E11D48' },
  { id: 'emerald', label: 'Laser Emerald', color: '#10B981' }
];


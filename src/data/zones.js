/**
 * PULSE//LIVE 2026 — CITY OF SOUND Venue & Stage Zones (`zones.js`)
 * Includes all required Public, VIP, and Restricted Stage/Technical Zones:
 * - ZONE_ENTRY, ZONE_PLAZA, ZONE_GA, ZONE_VIP, ZONE_SEATED, ZONE_BARRIER
 * - ZONE_MAIN_STAGE, ZONE_RUNWAY, ZONE_B_STAGE, ZONE_BACKSTAGE
 * - ZONE_TECH, ZONE_LED_CONTROL, ZONE_ARTIST_WAITING
 * Plus interactive Booth zones (MERCH_LAB, MEMORY_BOOTH, FOOD_STREET, FAN_HUB).
 */
export const ZONES = [
  {
    id: 'ENTRY',
    zoneCode: 'ZONE_ENTRY',
    label: 'ENTRY',
    name: 'ENTRY',
    nameVi: 'CỔNG CHECK-IN',
    position: [0, 0, 42],
    radius: 6.5,
    color: '#22D3EE',
    cameraPreset: 'PLAYER',
    interaction: 'info',
    accessLevel: 'ALL',
    allowedRoles: ['PLAYER', 'CROWD', 'STAFF', 'SECURITY'],
    interactionLabel: 'Press E — Entry Portal & Sound Check',
    interactionLabelVi: 'Nhấn E — Cổng vào & Kiểm tra vé'
  },
  {
    id: 'PULSE_PLAZA',
    zoneCode: 'ZONE_PLAZA',
    label: 'PULSE PLAZA',
    name: 'PULSE PLAZA',
    nameVi: 'QUẢNG TRƯỜNG ÂM THANH',
    position: [0, 0, 25],
    radius: 8.5,
    color: '#8B5CF6',
    cameraPreset: 'WIDE_STAGE',
    interaction: 'schedule',
    accessLevel: 'ALL',
    allowedRoles: ['PLAYER', 'CROWD', 'STAFF', 'SECURITY'],
    interactionLabel: 'Press E — View Show Lineup & Setlist',
    interactionLabelVi: 'Nhấn E — Xem Danh sách bài hát & Lịch trình'
  },
  {
    id: 'MERCH_LAB',
    zoneCode: 'ZONE_PLAZA',
    label: 'MERCH LAB',
    name: 'MERCH LAB',
    nameVi: 'PHÒNG LAB PHỤ KIỆN',
    position: [-22, 0, 22],
    radius: 6.5,
    color: '#EC4899',
    cameraPreset: 'PLAYER',
    interaction: 'merch',
    accessLevel: 'ALL',
    allowedRoles: ['PLAYER', 'CROWD', 'STAFF'],
    interactionLabel: 'Press E — Enter MERCH LAB (3D Gear)',
    interactionLabelVi: 'Nhấn E — Mở MERCH LAB (Xem đồ 3D)'
  },
  {
    id: 'MEMORY_BOOTH',
    zoneCode: 'ZONE_PLAZA',
    label: 'MEMORY BOOTH',
    name: 'MEMORY BOOTH',
    nameVi: 'TRẠM CHỤP ẢNH KỶ NIỆM',
    position: [22, 0, 22],
    radius: 6.5,
    color: '#FACC15',
    cameraPreset: 'PLAYER',
    interaction: 'photo',
    accessLevel: 'ALL',
    allowedRoles: ['PLAYER', 'CROWD', 'STAFF'],
    interactionLabel: 'Press E — Enter MEMORY BOOTH (Photo Studio)',
    interactionLabelVi: 'Nhấn E — Chụp ảnh kỷ niệm PULSE//LIVE'
  },
  {
    id: 'FOOD_STREET',
    zoneCode: 'ZONE_PLAZA',
    label: 'FOOD STREET',
    name: 'FOOD STREET',
    nameVi: 'PHỐ ẨM THỰC ACOUSTIC',
    position: [-24, 0, 6],
    radius: 6.0,
    color: '#22D3EE',
    cameraPreset: 'PLAYER',
    interaction: 'food',
    accessLevel: 'ALL',
    allowedRoles: ['PLAYER', 'CROWD', 'STAFF'],
    interactionLabel: 'Press E — Grab Frequency Tonic (+Energy)',
    interactionLabelVi: 'Nhấn E — Nhận Đồ uống Năng lượng'
  },
  {
    id: 'FAN_HUB',
    zoneCode: 'ZONE_PLAZA',
    label: 'FAN HUB',
    name: 'FAN HUB',
    nameVi: 'TRẠM KẾT NỐI KHÁN GIẢ',
    position: [24, 0, 6],
    radius: 6.0,
    color: '#A855F7',
    cameraPreset: 'CROWD',
    interaction: 'fanhub',
    accessLevel: 'ALL',
    allowedRoles: ['PLAYER', 'CROWD', 'STAFF'],
    interactionLabel: 'Press E — Trigger Arena Pulse Wave',
    interactionLabelVi: 'Nhấn E — Kích hoạt Sóng Ánh Sáng'
  },
  {
    id: 'B_STAGE',
    zoneCode: 'ZONE_B_STAGE',
    label: 'B-STAGE',
    name: 'B-STAGE PERIMETER',
    nameVi: 'SÂN KHẤU PHỤ TRUNG TÂM',
    position: [0, 0, 6],
    radius: 6.5,
    color: '#22D3EE',
    cameraPreset: 'B_STAGE',
    interaction: 'bstage',
    accessLevel: 'ALL',
    allowedRoles: ['ARTIST', 'DANCER', 'MC'],
    interactionLabel: 'Press E — B-Stage 360° Sound Ring View',
    interactionLabelVi: 'Nhấn E — Góc nhìn Sân khấu phụ 360°'
  },
  {
    id: 'GA',
    zoneCode: 'ZONE_GA',
    label: 'GA',
    name: 'GA STANDING',
    nameVi: 'KHU ĐỨNG TỰ DO (GA)',
    position: [-9, 0, -4],
    radius: 7.5,
    color: '#8B5CF6',
    cameraPreset: 'WIDE_STAGE',
    interaction: 'ga',
    accessLevel: 'GA',
    allowedRoles: ['PLAYER', 'CROWD', 'SECURITY', 'STAFF'],
    interactionLabel: 'Press E — Sync Pulse Light with GA Crowd',
    interactionLabelVi: 'Nhấn E — Đồng bộ Pulse Light khu GA'
  },
  {
    id: 'MAIN_ARENA',
    zoneCode: 'ZONE_BARRIER',
    label: 'MAIN ARENA',
    name: 'MAIN ARENA BARRIER',
    nameVi: 'HÀNG RÀO SÂN KHẤU CHÍNH',
    position: [0, 0, -11.5],
    radius: 7.5,
    color: '#EC4899',
    cameraPreset: 'ARTIST_CLOSE',
    interaction: 'stage',
    accessLevel: 'ALL',
    allowedRoles: ['PLAYER', 'CROWD', 'SECURITY', 'CAMERA_OPERATOR', 'STAFF'],
    interactionLabel: 'Press E — Front Barrier Artist View',
    interactionLabelVi: 'Nhấn E — Góc nhìn Cận cảnh Nghệ sĩ'
  },
  {
    id: 'VIP',
    zoneCode: 'ZONE_VIP',
    label: 'VIP',
    name: 'VIP TERRACE',
    nameVi: 'KHÁN ĐÀI VIP',
    position: [-19, 0, -10],
    radius: 6.0,
    color: '#FACC15',
    cameraPreset: 'CRANE',
    interaction: 'vip',
    accessLevel: 'VIP',
    allowedRoles: ['PLAYER', 'CROWD', 'SECURITY', 'STAFF'],
    interactionLabel: 'Press E — Activate VIP Crane Viewpoint',
    interactionLabelVi: 'Nhấn E — Bật Góc nhìn VIP'
  },
  {
    id: 'SEATED',
    zoneCode: 'ZONE_SEATED',
    label: 'SEATED',
    name: 'SEATED GRANDSTAND',
    nameVi: 'KHÁN ĐÀI GHẾ NGỒI',
    position: [19, 0, -10],
    radius: 6.0,
    color: '#22D3EE',
    cameraPreset: 'DRONE',
    interaction: 'seated',
    accessLevel: 'ALL',
    allowedRoles: ['PLAYER', 'CROWD', 'STAFF'],
    interactionLabel: 'Press E — Activate Panoramic Drone View',
    interactionLabelVi: 'Nhấn E — Bật Góc nhìn Toàn cảnh'
  },
  // Restricted Stage & Production Zones
  {
    id: 'ZONE_MAIN_STAGE',
    zoneCode: 'ZONE_MAIN_STAGE',
    label: 'MAIN STAGE',
    name: 'MAIN STAGE DECK',
    nameVi: 'SÂN KHẤU CHÍNH (KHU NGHỆ SĨ)',
    position: [0, 1.4, -22],
    radius: 15.0,
    color: '#EF4444',
    cameraPreset: 'WIDE_STAGE',
    interaction: null,
    accessLevel: 'ARTIST_ONLY',
    allowedRoles: ['ARTIST', 'DANCER', 'MC', 'STAFF', 'CAMERA_OPERATOR']
  },
  {
    id: 'ZONE_RUNWAY',
    zoneCode: 'ZONE_RUNWAY',
    label: 'RUNWAY',
    name: 'CENTRAL RUNWAY DECK',
    nameVi: 'ĐƯỜNG BĂNG SÂN KHẤU (KHU NGHỆ SĨ)',
    position: [0, 1.2, -9.5],
    radius: 3.0,
    color: '#EF4444',
    cameraPreset: 'RUNWAY',
    interaction: null,
    accessLevel: 'ARTIST_ONLY',
    allowedRoles: ['ARTIST', 'DANCER', 'MC', 'CAMERA_OPERATOR']
  },
  {
    id: 'ZONE_BACKSTAGE',
    zoneCode: 'ZONE_BACKSTAGE',
    label: 'BACKSTAGE',
    name: 'BACKSTAGE AREA',
    nameVi: 'KHU HẬU TRƯỜNG',
    position: [0, 1.4, -31],
    radius: 14.0,
    color: '#EF4444',
    cameraPreset: 'SIDE_STAGE',
    interaction: null,
    accessLevel: 'STAFF_AND_ARTIST',
    allowedRoles: ['ARTIST', 'DANCER', 'MC', 'STAFF', 'SECURITY']
  },
  {
    id: 'ZONE_TECH',
    zoneCode: 'ZONE_TECH',
    label: 'TECH AREA',
    name: 'FOH SOUND & LIGHTING TECH BOOTH',
    nameVi: 'TRẠM KỸ THUẬT ÂM THANH & ÁNH SÁNG',
    position: [-16, 0, -18],
    radius: 4.0,
    color: '#EF4444',
    cameraPreset: 'WIDE_STAGE',
    interaction: null,
    accessLevel: 'STAFF_ONLY',
    allowedRoles: ['STAFF', 'CAMERA_OPERATOR']
  },
  {
    id: 'ZONE_LED_CONTROL',
    zoneCode: 'ZONE_LED_CONTROL',
    label: 'LED CONTROL',
    name: 'LED MEDIA SERVER CONTROL',
    nameVi: 'TRẠM ĐIỀU KHIỂN MÀN HÌNH LED',
    position: [16, 0, -18],
    radius: 4.0,
    color: '#EF4444',
    cameraPreset: 'WIDE_STAGE',
    interaction: null,
    accessLevel: 'STAFF_ONLY',
    allowedRoles: ['STAFF']
  },
  {
    id: 'ZONE_ARTIST_WAITING',
    zoneCode: 'ZONE_ARTIST_WAITING',
    label: 'ARTIST WAITING',
    name: 'ARTIST GREEN ROOM',
    nameVi: 'PHÒNG CHỜ NGHỆ SĨ',
    position: [-12, 1.4, -31],
    radius: 5.0,
    color: '#EF4444',
    cameraPreset: 'SIDE_STAGE',
    interaction: null,
    accessLevel: 'ARTIST_ONLY',
    allowedRoles: ['ARTIST', 'DANCER', 'MC', 'STAFF']
  }
];

/**
 * Physical Collision Boxes, Cylinders & Restricted Stage Barriers
 * Used by CollisionSystem (`src/systems/CollisionSystem.js`)
 */
export const WORLD_COLLIDERS = [
  // 1. STAGE_BARRIER_COLLIDER + MAIN_STAGE_COLLIDER (Blocks Player from walking or jumping onto Main Stage, Left/Right Wing, Backstage, Tech/LED Control)
  {
    id: 'MAIN_STAGE_COLLIDER',
    type: 'box',
    minX: -18.5,
    maxX: 18.5,
    minZ: -35.0,
    maxZ: -13.0,
    height: 4.5,
    isRestricted: true,
    zoneCode: 'ZONE_MAIN_STAGE',
    restrictedTitle: 'ACCESS RESTRICTED // ARTIST AREA',
    restrictedMessage: 'Main Stage & Backstage are reserved for Artists & Production Crew.'
  },
  // 2. RUNWAY_COLLIDER (Blocks Player from walking or jumping onto Central Runway from sides or tip)
  {
    id: 'RUNWAY_COLLIDER',
    type: 'box',
    minX: -2.8,
    maxX: 2.8,
    minZ: -13.0,
    maxZ: -2.2,
    height: 3.5,
    isRestricted: true,
    zoneCode: 'ZONE_RUNWAY',
    restrictedTitle: 'ACCESS RESTRICTED // STAGE RUNWAY',
    restrictedMessage: 'Central Runway is reserved for Performing Artists.'
  },
  // 3. B_STAGE_COLLIDER (Blocks Player from climbing onto elevated B-Stage center deck while allowing 360° viewing around it)
  {
    id: 'B_STAGE_COLLIDER',
    type: 'cylinder',
    x: 0,
    z: 6.0,
    radius: 2.45,
    height: 3.2,
    isRestricted: true,
    zoneCode: 'ZONE_B_STAGE',
    restrictedTitle: 'ACCESS RESTRICTED // B-STAGE DECK',
    restrictedMessage: '360° B-Stage platform is reserved for Artist performances.'
  },
  // 4. VIP_ZONE_COLLIDER (Checks VIP Ticket via AccessControlSystem; blocks GENERAL ticket holders)
  {
    id: 'VIP_LOUNGE_COLLIDER',
    type: 'box',
    minX: -23.5,
    maxX: -14.8,
    minZ: -13.5,
    maxZ: -6.2,
    height: 3.0,
    isRestricted: true,
    requiresVipTicket: true,
    zoneCode: 'ZONE_VIP',
    restrictedTitle: 'VIP ACCESS ONLY // TERRACE LOUNGE',
    restrictedMessage: 'Upgrade to a VIP Pass on the Ticket Screen to enter the VIP Terrace.'
  },
  // 5. Architectural Venue Structures (Non-restricted solid props)
  {
    id: 'PLAZA_SCULPTURE_COLLIDER',
    type: 'cylinder',
    x: 0,
    z: 25,
    radius: 2.7,
    height: 5.0,
    isRestricted: false
  },
  {
    id: 'MERCH_LAB_COLLIDER',
    type: 'box',
    minX: -26.2,
    maxX: -18.5,
    minZ: 19.0,
    maxZ: 25.0,
    height: 4.0,
    isRestricted: false
  },
  {
    id: 'MEMORY_BOOTH_COLLIDER',
    type: 'box',
    minX: 18.5,
    maxX: 26.2,
    minZ: 19.0,
    maxZ: 25.0,
    height: 4.0,
    isRestricted: false
  },
  {
    id: 'FOOD_STREET_COLLIDER',
    type: 'box',
    minX: -27.5,
    maxX: -21.2,
    minZ: 3.0,
    maxZ: 9.0,
    height: 4.0,
    isRestricted: false
  },
  {
    id: 'FAN_HUB_COLLIDER',
    type: 'box',
    minX: 21.2,
    maxX: 27.5,
    minZ: 3.0,
    maxZ: 9.0,
    height: 4.0,
    isRestricted: false
  },
  {
    id: 'ENTRY_PILLAR_LEFT',
    type: 'cylinder',
    x: -5.2,
    z: 42,
    radius: 1.1,
    height: 6.0,
    isRestricted: false
  },
  {
    id: 'ENTRY_PILLAR_RIGHT',
    type: 'cylinder',
    x: 5.2,
    z: 42,
    radius: 1.1,
    height: 6.0,
    isRestricted: false
  }
];

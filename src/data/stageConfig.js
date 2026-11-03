/**
 * PULSE//LIVE 2026 — Architectural Stage Configuration (`stageConfig.js`)
 * Defines MAIN_STAGE, RUNWAY, B_STAGE, LEFT_WING, RIGHT_WING, BACKSTAGE
 * with exact world coordinates, dimensions, elevation height, allowedRoles,
 * cameraPreset, lightingGroup, and physical collider bounds.
 */
export const STAGE_CONFIG = {
  MAIN_STAGE: {
    id: 'MAIN_STAGE',
    zoneId: 'ZONE_MAIN_STAGE',
    label: 'MAIN STAGE',
    position: [0, 1.4, -22],
    size: [30, 1.4, 12],
    height: 1.4,
    allowedRoles: ['ARTIST', 'DANCER', 'MC', 'STAFF', 'CAMERA_OPERATOR'],
    cameraPreset: 'WIDE_STAGE',
    lightingGroup: 'MAIN_RIG',
    collision: {
      type: 'box',
      minX: -16.5,
      maxX: 16.5,
      minZ: -29.0,
      maxZ: -13.2,
      height: 2.8,
      restrictedReason: 'ARTIST AREA — MAIN STAGE'
    },
    waypoints: {
      CENTER: [0, 1.45, -17.0],
      FRONT_EDGE: [0, 1.45, -16.5],
      RISER_TOP: [0, 2.32, -23.8],
      LEFT_MARK: [-4.5, 1.45, -17.5],
      RIGHT_MARK: [4.5, 1.45, -17.5]
    }
  },
  RUNWAY: {
    id: 'RUNWAY',
    zoneId: 'ZONE_RUNWAY',
    label: 'CENTRAL RUNWAY',
    position: [0, 1.2, -9.8],
    size: [4.6, 1.2, 13.5],
    height: 1.2,
    allowedRoles: ['ARTIST', 'DANCER', 'MC', 'CAMERA_OPERATOR'],
    cameraPreset: 'RUNWAY',
    lightingGroup: 'RUNWAY_BEAMS',
    collision: {
      type: 'box',
      minX: -2.85,
      maxX: 2.85,
      minZ: -16.5,
      maxZ: -2.2,
      height: 2.6,
      restrictedReason: 'ARTIST AREA — STAGE RUNWAY'
    },
    waypoints: {
      MID: [0, 1.2, -9.5],
      TIP: [0, 1.2, -4.2]
    }
  },
  B_STAGE: {
    id: 'B_STAGE',
    zoneId: 'ZONE_B_STAGE',
    label: '360° B-STAGE PLATFORM',
    position: [0, 1.1, 6.0],
    size: [4.8, 1.1, 4.8],
    height: 1.1,
    allowedRoles: ['ARTIST', 'DANCER', 'MC'],
    cameraPreset: 'B_STAGE',
    lightingGroup: 'B_STAGE_RING',
    collision: {
      type: 'cylinder',
      x: 0,
      z: 6.0,
      radius: 2.55,
      height: 2.6,
      restrictedReason: 'ARTIST AREA — B-STAGE DECK'
    },
    waypoints: {
      CENTER: [0, 1.1, 6.0]
    }
  },
  LEFT_WING: {
    id: 'LEFT_WING',
    zoneId: 'ZONE_MAIN_STAGE',
    label: 'STAGE LEFT WING',
    position: [-11.5, 1.4, -20.5],
    size: [6, 1.4, 8],
    height: 1.4,
    allowedRoles: ['ARTIST', 'DANCER', 'MC', 'STAFF', 'CAMERA_OPERATOR'],
    cameraPreset: 'SIDE_STAGE',
    lightingGroup: 'LEFT_ARRAY',
    collision: {
      type: 'box',
      minX: -16.5,
      maxX: -9.5,
      minZ: -25.0,
      maxZ: -13.2,
      height: 2.8,
      restrictedReason: 'ARTIST AREA — LEFT WING'
    },
    waypoints: {
      CENTER: [-10.5, 1.4, -19.5]
    }
  },
  RIGHT_WING: {
    id: 'RIGHT_WING',
    zoneId: 'ZONE_MAIN_STAGE',
    label: 'STAGE RIGHT WING',
    position: [11.5, 1.4, -20.5],
    size: [6, 1.4, 8],
    height: 1.4,
    allowedRoles: ['ARTIST', 'DANCER', 'MC', 'STAFF', 'CAMERA_OPERATOR'],
    cameraPreset: 'SIDE_STAGE',
    lightingGroup: 'RIGHT_ARRAY',
    collision: {
      type: 'box',
      minX: 9.5,
      maxX: 16.5,
      minZ: -25.0,
      maxZ: -13.2,
      height: 2.8,
      restrictedReason: 'ARTIST AREA — RIGHT WING'
    },
    waypoints: {
      CENTER: [10.5, 1.4, -19.5]
    }
  },
  BACKSTAGE: {
    id: 'BACKSTAGE',
    zoneId: 'ZONE_BACKSTAGE',
    label: 'BACKSTAGE & ARTIST GREEN ROOM',
    position: [0, 1.4, -31.0],
    size: [32, 3.0, 8],
    height: 1.4,
    allowedRoles: ['ARTIST', 'DANCER', 'MC', 'STAFF', 'SECURITY'],
    cameraPreset: 'SIDE_STAGE',
    lightingGroup: 'BACKSTAGE_WORK',
    collision: {
      type: 'box',
      minX: -18.0,
      maxX: 18.0,
      minZ: -36.0,
      maxZ: -27.5,
      height: 4.0,
      restrictedReason: 'ACCESS RESTRICTED — BACKSTAGE ONLY'
    },
    waypoints: {
      CENTER: [0, 1.4, -29.5]
    }
  }
};

/**
 * Security Guard Posts along the Front Stage Barrier & VIP Entrance
 */
export const SECURITY_POSTS = [
  {
    id: 'SEC_01',
    displayName: 'SECURITY // BARRIER WEST',
    position: [-8.2, 0, -12.6],
    baseRotation: 0,
    watchZone: 'ZONE_MAIN_STAGE'
  },
  {
    id: 'SEC_02',
    displayName: 'SECURITY // RUNWAY WEST',
    position: [-3.6, 0, -12.2],
    baseRotation: 0.15,
    watchZone: 'ZONE_RUNWAY'
  },
  {
    id: 'SEC_03',
    displayName: 'SECURITY // RUNWAY EAST',
    position: [3.6, 0, -12.2],
    baseRotation: -0.15,
    watchZone: 'ZONE_RUNWAY'
  },
  {
    id: 'SEC_04',
    displayName: 'SECURITY // BARRIER EAST',
    position: [8.2, 0, -12.6],
    baseRotation: 0,
    watchZone: 'ZONE_MAIN_STAGE'
  },
  {
    id: 'SEC_05',
    displayName: 'SECURITY // VIP GATE',
    position: [-14.2, 0, -9.8],
    baseRotation: 1.2,
    watchZone: 'ZONE_VIP'
  }
];


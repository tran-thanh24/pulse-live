import { ZONES } from '../data/zones';
import { STAGE_CONFIG } from '../data/stageConfig';
import { accessControlSystem } from './AccessControlSystem';

/**
 * ZoneManager (`src/systems/ZoneManager.js`)
 * Tracks all 13 architectural & production zones:
 * ZONE_ENTRY, ZONE_PLAZA, ZONE_GA, ZONE_VIP, ZONE_SEATED, ZONE_BARRIER,
 * ZONE_MAIN_STAGE, ZONE_RUNWAY, ZONE_B_STAGE, ZONE_BACKSTAGE,
 * ZONE_TECH, ZONE_LED_CONTROL, ZONE_ARTIST_WAITING
 */
class ZoneManager {
  constructor() {
    this.zones = ZONES;
    this.stageConfig = STAGE_CONFIG;
  }

  getAllZones() {
    return this.zones;
  }

  getPublicInteractiveZones() {
    return this.zones.filter((z) => Boolean(z.interaction));
  }

  getZoneById(idOrCode) {
    return (
      this.zones.find((z) => z.id === idOrCode || z.zoneCode === idOrCode) || null
    );
  }

  getStageZone(stageKey) {
    return this.stageConfig[stageKey] || this.stageConfig.MAIN_STAGE;
  }

  /**
   * Returns the nearest interactive zone for the player's current `[x, y, z]` position
   */
  detectNearestInteractiveZone(position) {
    const [px, , pz] = position;
    let nearest = null;
    let minDistance = Infinity;

    for (const zone of this.zones) {
      if (!zone.interaction) continue;
      const dx = px - zone.position[0];
      const dz = pz - zone.position[2];
      const dist = Math.hypot(dx, dz);
      if (dist <= zone.radius && dist < minDistance) {
        minDistance = dist;
        nearest = zone;
      }
    }

    return nearest;
  }

  canCharacterEnter(character, zoneIdOrCode, ticket = null) {
    return accessControlSystem.canEnterZone(character, zoneIdOrCode, ticket);
  }
}

export const zoneManager = new ZoneManager();


import { ROLE_PERMISSIONS } from '../characters/CharacterRules';
import { ZONES } from '../data/zones';

/**
 * AccessControlSystem (`src/systems/AccessControlSystem.js`)
 * Enforces role-based and ticket-based zone permissions:
 * - PLAYER: allowed in ZONE_ENTRY, ZONE_PLAZA, ZONE_GA, ZONE_SEATED, ZONE_BARRIER;
 *           allowed in ZONE_VIP only if ticket.tier === 'VIP' (or 'VIP PASS').
 *           NEVER allowed in ZONE_MAIN_STAGE, ZONE_RUNWAY, ZONE_B_STAGE deck, ZONE_BACKSTAGE, ZONE_TECH, ZONE_LED_CONTROL.
 * - ARTIST / DANCER / MC: allowed on stage zones & backstage.
 * - STAFF / SECURITY / CAMERA_OPERATOR: allowed per role matrix.
 */
class AccessControlSystem {
  /**
   * Checks whether `character` is permitted to enter `zone` (zone object or zoneCode string).
   */
  canEnterZone(character = {}, zoneOrCode, ticket = null) {
    const role = String(character.role || 'PLAYER').toUpperCase();
    const rolePerms = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.PLAYER;

    const zoneObj =
      typeof zoneOrCode === 'string'
        ? ZONES.find((z) => z.zoneCode === zoneOrCode || z.id === zoneOrCode) || {
            zoneCode: zoneOrCode,
            allowedRoles: []
          }
        : zoneOrCode || {};

    const zoneCode = zoneObj.zoneCode || zoneObj.id || 'ZONE_PLAZA';

    // 1. Stage & Backstage Strict Restriction for PLAYER & CROWD
    const stageZones = [
      'ZONE_MAIN_STAGE',
      'ZONE_RUNWAY',
      'ZONE_B_STAGE',
      'ZONE_BACKSTAGE',
      'ZONE_TECH',
      'ZONE_LED_CONTROL',
      'ZONE_ARTIST_WAITING'
    ];

    if (stageZones.includes(zoneCode)) {
      if (role === 'PLAYER' || role === 'CROWD') {
        return {
          allowed: false,
          reason: 'ARTIST_AREA',
          title: 'ACCESS RESTRICTED // ARTIST AREA',
          message: `${zoneObj.name || zoneCode} is reserved for Performing Artists & Production Crew.`
        };
      }
    }

    // 2. VIP Zone Ticket Tier Check for PLAYER
    if (zoneCode === 'ZONE_VIP' && role === 'PLAYER') {
      const tier = String(ticket?.tier || character?.ticketTier || 'VIP').toUpperCase();
      const hasVip = tier.includes('VIP');
      if (!hasVip) {
        return {
          allowed: false,
          reason: 'VIP_REQUIRED',
          title: 'ACCESS RESTRICTED // VIP PASS REQUIRED',
          message: 'Switch your ticket tier to VIP PASS to enter the VIP Terrace Lounge.'
        };
      }
      return { allowed: true, reason: 'VIP_VERIFIED' };
    }

    // 3. Role matrix check
    if (
      Array.isArray(zoneObj.allowedRoles) &&
      zoneObj.allowedRoles.length > 0 &&
      !zoneObj.allowedRoles.includes(role)
    ) {
      return {
        allowed: false,
        reason: 'ROLE_RESTRICTED',
        title: 'ACCESS RESTRICTED',
        message: `Role ${role} cannot enter ${zoneObj.name || zoneCode}.`
      };
    }

    if (rolePerms.allowedZones && rolePerms.allowedZones.includes(zoneCode)) {
      return { allowed: true, reason: 'ROLE_ALLOWED' };
    }

    return { allowed: true, reason: 'PUBLIC_ZONE' };
  }
}

export const accessControlSystem = new AccessControlSystem();


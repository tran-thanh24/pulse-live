import { WORLD_COLLIDERS } from '../data/zones';
import { accessControlSystem } from './AccessControlSystem';

/**
 * Geometric Collider Primitives (Requirement 13: BoxCollider, CapsuleCollider, SphereCollider, WORLD BOUNDARY)
 */
export class BoxCollider {
  constructor({ id, minX, maxX, minZ, maxZ, height = 3.5, meta = {} }) {
    this.id = id;
    this.type = 'box';
    this.minX = minX;
    this.maxX = maxX;
    this.minZ = minZ;
    this.maxZ = maxZ;
    this.height = height;
    this.meta = meta;
  }

  intersectsCircle(x, z, radius) {
    return (
      x + radius > this.minX &&
      x - radius < this.maxX &&
      z + radius > this.minZ &&
      z - radius < this.maxZ
    );
  }
}

export class CapsuleCollider {
  constructor({ id, x, z, radius, height = 3.2, meta = {} }) {
    this.id = id;
    this.type = 'capsule';
    this.x = x;
    this.z = z;
    this.radius = radius;
    this.height = height;
    this.meta = meta;
  }

  intersectsCircle(px, pz, playerRadius) {
    const dx = px - this.x;
    const dz = pz - this.z;
    return Math.hypot(dx, dz) < this.radius + playerRadius;
  }
}

export class SphereCollider {
  constructor({ id, x, y = 0, z, radius, meta = {} }) {
    this.id = id;
    this.type = 'sphere';
    this.x = x;
    this.y = y;
    this.z = z;
    this.radius = radius;
    this.meta = meta;
  }

  intersectsPoint3D(px, py, pz, playerRadius) {
    return Math.hypot(px - this.x, py - this.y, pz - this.z) < this.radius + playerRadius;
  }
}

/**
 * CollisionSystem (`src/systems/CollisionSystem.js`)
 * Enforces:
 * 1. Solid BoxCollider, CapsuleCollider, SphereCollider, and WORLD_BOUNDARY collisions
 * 2. AccessControlSystem checks for VIP Zone (`VIP_LOUNGE_COLLIDER`) and Stage/Backstage zones
 * 3. Airborne & Jump Restriction (`isNearStageBarrier`) so Player can NEVER jump over barriers or onto MAIN_STAGE, RUNWAY, B_STAGE, or BACKSTAGE
 * 4. Throttled non-intrusive toast feedback (2.8s cooldown) when approaching restricted areas
 */
class CollisionSystem {
  constructor() {
    this.worldBoundary = {
      minX: -32.0,
      maxX: 32.0,
      minZ: -12.85,
      maxZ: 44.5
    };
    this.lastRestrictionToastTime = 0;
    this.toastCooldownMs = 2800;
  }

  /**
   * Returns true if the player is within jump-vaulting distance of any stage barrier or restricted deck.
   */
  isNearStageBarrier(x, z) {
    if (z < -11.2) return true;
    if (Math.abs(x) < 3.6 && z >= -13.5 && z <= -1.5) return true;
    if (Math.hypot(x, z - 6.0) < 3.3) return true;
    return false;
  }

  /**
   * Resolves player movement against all WORLD_COLLIDERS + AccessControlSystem + WORLD_BOUNDARY.
   */
  resolvePlayerMovement({
    nextX,
    nextZ,
    prevX,
    prevZ,
    playerRadius = 0.55,
    character = { role: 'PLAYER' },
    ticket = null,
    onRestrictedHit = null
  }) {
    let x = nextX;
    let z = nextZ;
    const r = playerRadius;
    let hitRestrictedCollider = null;

    for (const col of WORLD_COLLIDERS) {
      if (col.requiresVipTicket) {
        const access = accessControlSystem.canEnterZone(character, col.zoneCode, ticket);
        if (access.allowed) {
          continue;
        }
      }

      if (col.type === 'box') {
        if (
          x + r > col.minX &&
          x - r < col.maxX &&
          z + r > col.minZ &&
          z - r < col.maxZ
        ) {
          const canSlideZ = prevX + r <= col.minX || prevX - r >= col.maxX;
          const canSlideX = prevZ + r <= col.minZ || prevZ - r >= col.maxZ;

          if (canSlideZ) {
            x = prevX;
          } else if (canSlideX) {
            z = prevZ;
          } else {
            // If prevX, prevZ was already inside the box (e.g., after a warp), push out to nearest edge
            const distLeft = Math.abs(x - (col.minX - r));
            const distRight = Math.abs(col.maxX + r - x);
            const distFront = Math.abs(col.maxZ + r - z);
            const minEdge = Math.min(distLeft, distRight, distFront);
            if (minEdge === distLeft) x = col.minX - r - 0.05;
            else if (minEdge === distRight) x = col.maxX + r + 0.05;
            else z = col.maxZ + r + 0.05;
          }

          if (col.isRestricted) {
            hitRestrictedCollider = col;
          }
        }
      } else if (col.type === 'cylinder' || col.type === 'capsule') {
        const dx = x - col.x;
        const dz = z - col.z;
        const dist = Math.hypot(dx, dz);
        const minDist = col.radius + r;
        if (dist < minDist) {
          if (dist > 0.0001) {
            const push = (minDist - dist) / dist;
            x += dx * push;
            z += dz * push;
          } else {
            z = col.z + minDist + 0.05;
          }
          if (col.isRestricted) {
            hitRestrictedCollider = col;
          }
        }
      }
    }

    if (z < this.worldBoundary.minZ) {
      z = this.worldBoundary.minZ;
      hitRestrictedCollider = hitRestrictedCollider || {
        restrictedTitle: 'ACCESS RESTRICTED // ARTIST AREA',
        restrictedMessage: 'Stage Barrier: Main Stage & Backstage are reserved for Artists.'
      };
    }

    x = Math.max(this.worldBoundary.minX, Math.min(this.worldBoundary.maxX, x));
    z = Math.max(this.worldBoundary.minZ, Math.min(this.worldBoundary.maxZ, z));

    if (hitRestrictedCollider && typeof onRestrictedHit === 'function') {
      const now = Date.now();
      if (now - this.lastRestrictionToastTime >= this.toastCooldownMs) {
        this.lastRestrictionToastTime = now;
        onRestrictedHit(
          hitRestrictedCollider.restrictedTitle || 'ACCESS RESTRICTED',
          hitRestrictedCollider.restrictedMessage || 'Artist & Crew Area Only'
        );
      }
    }

    return [x, z];
  }
}

export const collisionSystem = new CollisionSystem();

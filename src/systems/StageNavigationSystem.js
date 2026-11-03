import { STAGE_CONFIG } from '../data/stageConfig';
import { eventBus } from '../core/EventBus';

/**
 * StageNavigationSystem (`src/systems/StageNavigationSystem.js`)
 * Controls Artist movement between stage zones (`MAIN_STAGE`, `RUNWAY`, `B_STAGE`, `LEFT_WING`, `RIGHT_WING`, `BACKSTAGE`)
 * driven by timeline `artistMove` cues or Studio Mode triggers.
 * Strictly clamps Artist positions inside valid stage boundaries so Artists never wander into audience zones.
 */
class StageNavigationSystem {
  constructor() {
    this.currentTargetZone = 'MAIN_STAGE';
    this.transitionDuration = 3.5;
    this.transitionStartTime = 0;

    eventBus.on('timeline:cue', (cue) => {
      if (cue.type === 'artistMove') {
        this.moveArtistToZone(cue.target || cue.value || 'MAIN_STAGE', cue.duration || 4.0);
      } else if (cue.type === 'artist' && cue.value === 'RUNWAY') {
        this.moveArtistToZone('RUNWAY', 3.8);
      }
    });
  }

  moveArtistToZone(targetZoneKey, duration = 3.8) {
    const normalized = String(targetZoneKey || 'MAIN_STAGE')
      .toUpperCase()
      .replace('-', '_');
    if (STAGE_CONFIG[normalized]) {
      this.currentTargetZone = normalized;
      this.transitionDuration = Math.max(0.5, Number(duration) || 3.8);
      eventBus.emit('artist:zoneChanged', {
        targetZone: this.currentTargetZone,
        duration: this.transitionDuration
      });
    }
  }

  /**
   * Computes the target world position `[x, y, z]` for an artist given their base formation offset
   * and current stage navigation target, clamped to stage boundaries.
   */
  getArtistTargetPosition(artist, artistIndex = 0, animationState = 'SING') {
    const baseStagePos = artist.stagePosition || [0, 1.4, -20.2];
    const baseRunwayPos = artist.runwayPosition || [0, 1.2, -9.2];

    const activeZone =
      animationState === 'RUNWAY' ? 'RUNWAY' : this.currentTargetZone;

    // Only Lead/Center performers (first 5 CORTIS members) travel down Runway or to B-Stage; backing ensemble holds Main Stage formation
    if (artistIndex >= 5 && (activeZone === 'RUNWAY' || activeZone === 'B_STAGE')) {
      return this.clampToStageBoundary(baseStagePos, 'MAIN_STAGE');
    }

    const spreadX = artistIndex === 0 ? 0 : artistIndex % 2 === 1 ? -1.1 : 1.1;
    const spreadZ = artistIndex === 0 ? 0 : Math.floor((artistIndex + 1) / 2) * -1.1;

    switch (activeZone) {
      case 'RUNWAY': {
        const pos = artist.runwayPosition || [
          spreadX * 0.75,
          STAGE_CONFIG.RUNWAY.height,
          -8.5 + spreadZ * 0.6
        ];
        return this.clampToStageBoundary(pos, 'RUNWAY');
      }
      case 'B_STAGE': {
        const pos = artist.bStagePosition || [
          spreadX * 0.85,
          STAGE_CONFIG.B_STAGE.height,
          STAGE_CONFIG.B_STAGE.position[2] + spreadZ * 0.5
        ];
        return this.clampToStageBoundary(pos, 'B_STAGE');
      }
      case 'LEFT_WING': {
        const pos = [
          STAGE_CONFIG.LEFT_WING.waypoints.CENTER[0] + spreadX * 0.8,
          STAGE_CONFIG.LEFT_WING.height,
          STAGE_CONFIG.LEFT_WING.waypoints.CENTER[2] + spreadZ * 0.6
        ];
        return this.clampToStageBoundary(pos, 'LEFT_WING');
      }
      case 'RIGHT_WING': {
        const pos = [
          STAGE_CONFIG.RIGHT_WING.waypoints.CENTER[0] + spreadX * 0.8,
          STAGE_CONFIG.RIGHT_WING.height,
          STAGE_CONFIG.RIGHT_WING.waypoints.CENTER[2] + spreadZ * 0.6
        ];
        return this.clampToStageBoundary(pos, 'RIGHT_WING');
      }
      case 'BACKSTAGE': {
        const pos = [
          spreadX * 1.4,
          STAGE_CONFIG.BACKSTAGE.height,
          STAGE_CONFIG.BACKSTAGE.waypoints.CENTER[2]
        ];
        return this.clampToStageBoundary(pos, 'BACKSTAGE');
      }
      case 'MAIN_STAGE':
      default: {
        return this.clampToStageBoundary(baseStagePos, 'MAIN_STAGE');
      }
    }
  }

  /**
   * Ensures an artist never leaves the valid stage deck boundary
   */
  clampToStageBoundary(pos, zoneKey = 'MAIN_STAGE') {
    const [x, y, z] = pos;
    if (zoneKey === 'B_STAGE') {
      const dz = z - 6.0;
      const dist = Math.hypot(x, dz);
      if (dist > 1.8) {
        const scale = 1.8 / dist;
        return [x * scale, 1.1, 6.0 + dz * scale];
      }
      return [x, 1.1, z];
    }
    if (zoneKey === 'RUNWAY') {
      return [
        Math.max(-1.85, Math.min(1.85, x)),
        1.2,
        Math.max(-16.0, Math.min(-3.0, z))
      ];
    }
    // MAIN_STAGE / WINGS / BACKSTAGE
    return [
      Math.max(-14.2, Math.min(14.2, x)),
      y || 1.4,
      Math.max(-32.0, Math.min(-14.5, z))
    ];
  }
}

export const stageNavigationSystem = new StageNavigationSystem();


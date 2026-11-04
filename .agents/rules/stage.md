---
trigger: model_decision
description: Use for Stage, zones, barriers, collision, access permissions, runway, B-stage, or backstage.
---

# Stage & Zone Invariants

- **Artist Stage Exclusion**: Audience members and local players are strictly prohibited from entering artist-only zones (Main Stage, Runway, B-Stage, Backstage).
- **Collision Enforcement**: Stage perimeters, security fences, and barricades are enforced by `CollisionSystem.js` via AABB / cylindrical boundary clamping.
- **Access Control Gates**: Checkpoints between Plaza and Arena/VIP areas are governed by `AccessControlSystem.js` checking user ticket tiers (`GENERAL` vs `VIP`).
- **Stage Coordinates**: Physical dimensions, speaker stack positions, and artist marks are defined in `src/data/stageConfig.js` and `src/data/zones.js`.


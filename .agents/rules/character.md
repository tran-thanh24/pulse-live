---
trigger: model_decision
description: Use for Player, Artist, Crowd, male/female character, animations, or character customization.
---

# Character System Invariants

- **Artist Profiles**: CORTIS band members (Martin, Seonghyeon, Dakee, Juhoon, Keonho) are configured in `src/data/artists.js` with dedicated stage marks and animation states (`IDLE`, `DANCE`, `SING`, `WAVE`, `TALK`).
- **Player Avatar**: Local user avatar is rendered via `Player.jsx` and controlled by `MovementSystem.js`. Camera follow points directly to the player mesh.
- **Crowd LOD Hierarchy**:
  - Near crowd (<15m): Procedural character meshes with synchronized cheering/jumping.
  - Far crowd (>15m): `InstancedMesh` with baked color variations.
  - Never instantiate individual SkinnedMesh + AnimationMixer pairs for background crowd NPCs.
- **Locomotion Boundaries**: Character velocity, jumping arc, and acceleration must respect `CharacterRules.js`.

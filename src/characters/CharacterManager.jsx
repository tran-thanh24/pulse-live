import React from 'react';
import { PlayerCharacter } from './player/PlayerCharacter';
import { ArtistManager } from './artist/ArtistManager';
import { CrowdManager } from './npc/CrowdManager';

/**
 * CharacterManager (`src/characters/CharacterManager.jsx`)
 * Top-level orchestrator for all 3D characters in PULSE//LIVE 2026:
 * - Controllable PlayerCharacter (Male / Female with Rule Engine validation)
 * - Stage ArtistManager (Performers + StageNavigationSystem across MAIN_STAGE, RUNWAY, B_STAGE, BACKSTAGE)
 * - CrowdManager (Security Guards + Hero Male/Female Fans + Instanced LOD Crowd + Multiplayer Peers)
 */
export function CharacterManager() {
  return (
    <group>
      <ArtistManager />
      <CrowdManager />
      <PlayerCharacter />
    </group>
  );
}


import React, { useMemo } from 'react';
import { getArtistRoster } from '../../data/artists';
import { useConcertStore } from '../../store/concertStore';
import { ArtistCharacter } from './ArtistCharacter';

/**
 * ArtistManager (`src/characters/artist/ArtistManager.jsx`)
 * Manages the active stage artist ensemble (solo, duo, group, ensemble12, mega24)
 * in world space and coordinates their performance animations and stage navigation.
 */
export function ArtistManager() {
  const castMode = useConcertStore((s) => s.castMode);
  const artistAnimation = useConcertStore((s) => s.artistAnimation);

  const performers = useMemo(() => getArtistRoster(castMode), [castMode]);

  return (
    <group>
      {performers.map((artist, idx) => (
        <ArtistCharacter
          key={artist.artistId}
          artist={artist}
          artistIndex={idx}
          animationState={artistAnimation}
          showLabel={performers.length <= 6}
        />
      ))}
    </group>
  );
}


/**
 * PULSE//LIVE 2026 — Show Manifest (`src/data/showManifest.js`)
 * Defines the multi-track concert structure including `MUSIC`, `MC`, `VIDEO`, `INTERMISSION`, `ENCORE`, and `FINALE` items.
 */
export const SHOW_MANIFEST = {
  showId: 'pulse_live_2026',
  title: 'PULSE//LIVE 2026 — CITY OF SOUND',
  setlist: [
    {
      id: 'set_01',
      type: 'MUSIC',
      trackId: 'what_you_want',
      title: 'What You Want (Opening Performance)',
      duration: 199
    },
    {
      id: 'set_02',
      type: 'MUSIC',
      trackId: 'acai',
      title: 'ACAI (Frequency Wave)',
      duration: 190
    },
    {
      id: 'set_03',
      type: 'MC',
      title: 'MC // CORTIS Welcome & Audience Energy Callout',
      duration: 15
    },
    {
      id: 'set_04',
      type: 'MUSIC',
      trackId: 'joyride',
      title: 'JoyRide (Kinetic Release)',
      duration: 171
    },
    {
      id: 'set_05',
      type: 'ENCORE',
      trackId: 'moneymoneymoney',
      title: 'MONEYMONEYMONEY (Encore Finale)',
      duration: 138
    }
  ]
};


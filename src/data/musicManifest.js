/**
 * Music Manifest for PULSE//LIVE 2026 — CITY OF SOUND
 * Each track defines its metadata, BPM, offset, matched YouTube MV/Visualizer,
 * LED visual preset, theme, and JSON timeline path.
 */
export const DEFAULT_TIMELINES = {
  '/timelines/what-you-want.json': [
    { time: 0, type: 'scene', value: 'blackout' },
    {
      time: 0.1,
      type: 'LED_SOURCE',
      target: 'MAIN_LED',
      sourceType: 'YOUTUBE',
      source: 'e2OpbOv_JiQ',
      loop: true
    },
    { time: 1.5, type: 'led', value: 'COUNTDOWN' },
    { time: 4.5, type: 'led', value: 'pulse-core-intro' },
    { time: 5.0, type: 'scene', value: 'INTRO' },
    { time: 6.0, type: 'camera', value: 'WIDE_STAGE' },
    { time: 8.0, type: 'spotlight', target: 'artist' },
    { time: 8.5, type: 'artist', value: 'WALK' },
    { time: 8.5, type: 'artistMove', target: 'MAIN_STAGE', duration: 3.0 },
    { time: 14.0, type: 'scene', value: 'VERSE' },
    { time: 14.0, type: 'camera', value: 'ARTIST_CLOSE' },
    { time: 14.5, type: 'artist', value: 'SING' },
    { time: 24.0, type: 'EnergyCallout', value: 'MAKE SOME NOISE' },
    { time: 25.0, type: 'camera', value: 'CRANE' },
    { time: 31.2, type: 'crowd', value: 'wave' },
    { time: 32.0, type: 'scene', value: 'CHORUS' },
    { time: 32.0, type: 'artist', value: 'DANCE_A' },
    { time: 32.5, type: 'pulseWave', value: 'CENTER_OUT' },
    { time: 45.0, type: 'laser', value: 'on' },
    { time: 46.0, type: 'camera', value: 'RUNWAY' },
    { time: 46.2, type: 'artist', value: 'RUNWAY' },
    { time: 46.2, type: 'artistMove', target: 'RUNWAY', duration: 4.0 },
    { time: 60.0, type: 'lightstick', value: 'sync' },
    { time: 60.5, type: 'pulseWave', value: 'LEFT_TO_RIGHT' },
    { time: 62.0, type: 'camera', value: 'CROWD' },
    { time: 65.0, type: 'artistMove', target: 'B_STAGE', duration: 4.5 },
    { time: 66.0, type: 'camera', value: 'B_STAGE' },
    { time: 76.0, type: 'EnergyCallout', value: 'MAKE SOME NOISE' },
    { time: 84.0, type: 'artistMove', target: 'MAIN_STAGE', duration: 4.5 },
    { time: 91.4, type: 'drop', value: 'DROP' },
    { time: 91.4, type: 'co2', value: 'burst' },
    { time: 91.4, type: 'artist', value: 'DANCE_B' },
    { time: 91.4, type: 'pulseWave', value: 'STAGE_TO_BACK' },
    { time: 92.0, type: 'camera', value: 'WIDE_STAGE' },
    { time: 110.0, type: 'scene', value: 'ENCORE' },
    { time: 110.5, type: 'camera', value: 'DRONE' },
    { time: 112.0, type: 'confetti', value: 'burst' },
    { time: 115.0, type: 'artist', value: 'FINAL_POSE' }
  ],
  '/timelines/acai.json': [
    { time: 0, type: 'scene', value: 'INTRO' },
    {
      time: 0.1,
      type: 'LED_SOURCE',
      target: 'MAIN_LED',
      sourceType: 'YOUTUBE',
      source: 'nCElUD0jvgo',
      loop: true
    },
    { time: 2.0, type: 'camera', value: 'ORBIT' },
    { time: 8.0, type: 'artist', value: 'DANCE_A' },
    { time: 8.0, type: 'artistMove', target: 'MAIN_STAGE', duration: 3.0 },
    { time: 12.0, type: 'laser', value: 'on' },
    { time: 18.0, type: 'scene', value: 'CHORUS' },
    { time: 18.5, type: 'camera', value: 'SIDE_STAGE' },
    { time: 22.0, type: 'artistMove', target: 'RUNWAY', duration: 3.8 },
    { time: 25.0, type: 'pulseWave', value: 'SPIRAL' },
    { time: 34.0, type: 'drop', value: 'DROP' },
    { time: 34.0, type: 'co2', value: 'burst' },
    { time: 34.5, type: 'camera', value: 'WIDE_STAGE' },
    { time: 50.0, type: 'EnergyCallout', value: 'MAKE SOME NOISE' },
    { time: 51.0, type: 'artistMove', target: 'B_STAGE', duration: 4.0 },
    { time: 52.0, type: 'camera', value: 'B_STAGE' },
    { time: 68.0, type: 'scene', value: 'ENCORE' },
    { time: 68.5, type: 'artistMove', target: 'MAIN_STAGE', duration: 4.0 },
    { time: 70.0, type: 'firework', value: 'burst' },
    { time: 75.0, type: 'camera', value: 'DRONE' }
  ],
  '/timelines/joyride.json': [
    { time: 0, type: 'scene', value: 'INTRO' },
    {
      time: 0.1,
      type: 'LED_SOURCE',
      target: 'MAIN_LED',
      sourceType: 'YOUTUBE',
      source: '8QZeXvOjgGE',
      loop: true
    },
    { time: 2.0, type: 'camera', value: 'ORBIT' },
    { time: 8.0, type: 'artist', value: 'DANCE_A' },
    { time: 8.0, type: 'artistMove', target: 'MAIN_STAGE', duration: 3.0 },
    { time: 12.0, type: 'laser', value: 'on' },
    { time: 18.0, type: 'scene', value: 'CHORUS' },
    { time: 18.5, type: 'camera', value: 'SIDE_STAGE' },
    { time: 22.0, type: 'artistMove', target: 'RUNWAY', duration: 3.8 },
    { time: 25.0, type: 'pulseWave', value: 'SPIRAL' },
    { time: 34.0, type: 'drop', value: 'DROP' },
    { time: 34.0, type: 'co2', value: 'burst' },
    { time: 34.5, type: 'camera', value: 'WIDE_STAGE' },
    { time: 50.0, type: 'EnergyCallout', value: 'MAKE SOME NOISE' },
    { time: 51.0, type: 'artistMove', target: 'B_STAGE', duration: 4.0 },
    { time: 52.0, type: 'camera', value: 'B_STAGE' },
    { time: 68.0, type: 'scene', value: 'ENCORE' },
    { time: 68.5, type: 'artistMove', target: 'MAIN_STAGE', duration: 4.0 },
    { time: 70.0, type: 'firework', value: 'burst' },
    { time: 75.0, type: 'camera', value: 'DRONE' }
  ],
  '/timelines/moneymoneymoney.json': [
    { time: 0, type: 'scene', value: 'BALLAD' },
    {
      time: 0.1,
      type: 'LED_SOURCE',
      target: 'MAIN_LED',
      sourceType: 'YOUTUBE',
      source: 'OhdvNHmJDsw',
      loop: true
    },
    { time: 2.0, type: 'camera', value: 'ARTIST_CLOSE' },
    { time: 6.0, type: 'artist', value: 'SING' },
    { time: 16.0, type: 'artistMove', target: 'RUNWAY', duration: 4.0 },
    { time: 18.0, type: 'crowd', value: 'wave' },
    { time: 20.0, type: 'pulseWave', value: 'CENTER_OUT' },
    { time: 32.0, type: 'scene', value: 'ENCORE' },
    { time: 32.5, type: 'camera', value: 'CRANE' },
    { time: 45.0, type: 'confetti', value: 'burst' },
    { time: 48.0, type: 'firework', value: 'burst' },
    { time: 52.0, type: 'camera', value: 'DRONE' },
    { time: 60.0, type: 'artist', value: 'FINAL_POSE' }
  ]
};

// Backwards compatibility aliases for older references
DEFAULT_TIMELINES['/timelines/afterglow.json'] = DEFAULT_TIMELINES['/timelines/what-you-want.json'];
DEFAULT_TIMELINES['/timelines/frequency-zero.json'] = DEFAULT_TIMELINES['/timelines/acai.json'];
DEFAULT_TIMELINES['/timelines/golden-echo.json'] = DEFAULT_TIMELINES['/timelines/moneymoneymoney.json'];

export const MUSIC_MANIFEST = [
  {
    id: 'what_you_want',
    title: 'What You Want',
    artist: 'CORTIS',
    audio: '/audio/what-you-want.m4a',
    youtubeVideoId: 'e2OpbOv_JiQ',
    youtubeUrl: 'https://youtu.be/e2OpbOv_JiQ',
    youtubeTitle: "CORTIS — 'What You Want' (Official MV)",
    cover: 'linear-gradient(135deg, #22D3EE 0%, #8B5CF6 50%, #EC4899 100%)',
    duration: 199,
    bpm: 124,
    offset: 0,
    timeline: '/timelines/what-you-want.json',
    ledVisual: 'AUDIO_REACTIVE',
    theme: {
      primary: '#22D3EE',
      secondary: '#8B5CF6',
      accent: '#EC4899'
    },
    synthProfile: {
      rootFreq: 110,
      scale: [220, 261.63, 329.63, 392.0, 440.0, 523.25],
      style: 'progressive-pulse'
    }
  },
  {
    id: 'acai',
    title: 'ACAI',
    artist: 'CORTIS',
    audio: '/audio/acai.m4a',
    youtubeVideoId: 'nCElUD0jvgo',
    youtubeUrl: 'https://youtu.be/nCElUD0jvgo',
    youtubeTitle: "CORTIS — 'ACAI' (Official MV)",
    cover: 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 60%, #06B6D4 100%)',
    duration: 190,
    bpm: 128,
    offset: 0,
    timeline: '/timelines/acai.json',
    ledVisual: 'PULSE_PATTERN',
    theme: {
      primary: '#EC4899',
      secondary: '#22D3EE',
      accent: '#FACC15'
    },
    synthProfile: {
      rootFreq: 98,
      scale: [196, 233.08, 293.66, 349.23, 392.0, 466.16],
      style: 'kinetic-bass'
    }
  },
  {
    id: 'joyride',
    title: 'JoyRide',
    artist: 'CORTIS',
    audio: '/audio/joyride.m4a',
    youtubeVideoId: '8QZeXvOjgGE',
    youtubeUrl: 'https://youtu.be/8QZeXvOjgGE',
    youtubeTitle: "CORTIS — 'JoyRide' (Official MV)",
    cover: 'linear-gradient(135deg, #8B5CF6 0%, #22D3EE 60%, #FACC15 100%)',
    duration: 171,
    bpm: 130,
    offset: 0,
    timeline: '/timelines/joyride.json',
    ledVisual: 'SHADER',
    theme: {
      primary: '#8B5CF6',
      secondary: '#22D3EE',
      accent: '#EC4899'
    },
    synthProfile: {
      rootFreq: 116.54,
      scale: [233.08, 293.66, 349.23, 440.0, 466.16, 587.33],
      style: 'stadium-anthem'
    }
  },
  {
    id: 'moneymoneymoney',
    title: 'MONEYMONEYMONEY',
    artist: 'CORTIS',
    audio: '/audio/moneymoneymoney.m4a',
    youtubeVideoId: 'OhdvNHmJDsw',
    youtubeUrl: 'https://youtu.be/OhdvNHmJDsw',
    youtubeTitle: "CORTIS — 'MONEYMONEYMONEY' (Official Visualizer)",
    cover: 'linear-gradient(135deg, #FACC15 0%, #F59E0B 50%, #FFFFFF 100%)',
    duration: 138,
    bpm: 135,
    offset: 0,
    timeline: '/timelines/moneymoneymoney.json',
    ledVisual: 'LYRIC_STYLE',
    theme: {
      primary: '#FACC15',
      secondary: '#FFFFFF',
      accent: '#22D3EE'
    },
    synthProfile: {
      rootFreq: 130.81,
      scale: [261.63, 329.63, 392.0, 493.88, 523.25, 659.25],
      style: 'anthemic-encore'
    }
  }
];

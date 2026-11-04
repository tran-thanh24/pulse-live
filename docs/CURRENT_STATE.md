# PULSE//LIVE — Current State

Status snapshot of active subsystems, known constraints, and immediate priorities.

---

### Implemented
- **3D Stadium Arena**: Outdoor plaza, main stage, B-stage circle, trusses, PA towers, and VIP terrace.
- **Character System**: Procedural 3D character rigs for Player, CORTIS artists (Martin, Seonghyeon, Dakee, Juhoon, Keonho), and Crowd NPCs.
- **Locomotion & Camera**: WASD / touch keyboard movement, jumping, collision against stage walls/barricades, 3rd-person follow camera, and OrbitControls.
- **Audio Engine**: `MusicEngine` master clock driven by Web Audio API, real-time FFT frequency analysis (bass, mid, treble), track crossfading, and timeline synchronization.
- **Setlist & Timeline**: Multi-track setlist (`What You Want`, `GO!`, `Fa$hion`, `Never Let Go`), pre-show 10s countdown, automated cue triggers for lighting, lasers, and camera cuts.
- **Dual LED Architecture**: Central `LEDMediaManager` with independent 5-channel routing (`MAIN_LED`, `LEFT_LED`, `RIGHT_LED`, `B_STAGE_LED`, `PULSE_CORE`).
- **Cinema MV PiP Mode**: Picture-in-Picture floating HUD window (`CinemaMVPiP.jsx`) streaming official YouTube MV in sync with current track, with 3 size presets, mute protection, and keyboard shortcut `[V]`.
- **Audio-Reactive 3D Stage Screens**: Pure WebGL CanvasTexture on 3D LED screens rendering real-time frequency visualizers, kinetic neon rings, and track metadata without DOM occlusions.
- **PulseCore Resonance**: Centered kinetic 3D sphere with rotating ring meshes and audio pulse reactions.
- **Lighting & FX**: Moving heads, spotlights, laser arrays, CO2 jets, confetti cannons, and audience lightstick waves.
- **Access Control**: Ticket tier enforcement (`GENERAL` vs `VIP`) at plaza gates; player boundary clamping prevents entering artist stage zones.
- **Dance & Character Action System**: Full action suite (10 dances, reactions, poses, combos) with `AnimationRegistry`, `DanceController`, smooth crossfading, movement lock interrupts, quick actions [1-4], and Action Menu [B/M].
- **Studio Mode**: Floating director console to control lighting scenes, manual FX firing, track switching, LED channel media assignment, and Character Action controls.
- **Performance Manager & HUD**: FPS monitoring, frame time, draw calls, triangle counters, and adaptive DPR throttling (0.75x–1.5x).
- **Deployment**: Vite build with base `/pulse-live/` and GitHub Actions automated deployment to GitHub Pages.

---

### Partially Implemented
- **Native Video MP4 on LED Screens**: `NativeVideoSource` with `THREE.VideoTexture` is fully architected and supported in Studio Mode, but requires hosted MP4 assets in production.
- **Audience Energy Overload Reactions**: Basic cheer sound and CO2 surge triggers above 80% energy; additional kinetic stadium transformations can be expanded.
- **Mobile Touch Controls**: Basic virtual joystick and touch gestures functional; UI scaling on ultra-compact mobile screens can be further polished.

---

### Known Issues
- **Drei `<Html transform>` DOM Occlusion**: Embedding YouTube iframe into 3D world meshes causes DOM elements to draw on top of WebGL canvas, occluding 3D artists and stage lights. Solved by decoupling YouTube to `CinemaMVPiP` HUD while stage LED screens use native WebGL CanvasTexture.
- **Web Audio Autoplay Restrictions**: Audio requires initial user click/interaction before `AudioContext` can start playback.
- **Retina Displays High DPR**: Without clamp, high-DPR displays (DPR 2–3) drop frames; mitigated by `PerformanceManager` capping DPR to 1.5 max.

---

### Current Priority
1. **Targeted Context Reading**: Maintain compact agent navigation layer to keep token consumption minimal.
2. **Performance Pass V1 Maintenance**: Keep draw calls and geometry count low; verify 45-60 FPS on standard desktop hardware.
3. **Audio-Visual Stability**: Ensure zero audio overlap and seamless track crossfading across all setlist transitions.


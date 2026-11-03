# PULSE//LIVE — Project Subsystem Index

Compact map of subsystems, core files, responsibilities, and primary dependencies.

---

### APP
- `src/main.jsx`: Bootstrap entry, Canvas mounting, CSS import.
- `src/app/App.jsx`: Screen router (`landing`, `ticket`, `avatar`, `concert`, `end`), modal overlays.
- `src/store/concertStore.js`: Global concert state (show phase, current track, lighting, FX, Studio flags).
- `src/store/userStore.js`: User state (ticket tier, avatar identity, badges, settings).
- **Dependencies**: React, Zustand.

### 3D CORE
- `src/core/SceneManager.jsx`: R3F Canvas wrapper, render loop, adaptive DPR, tone mapping.
- `src/core/EventBus.js`: Lightweight decoupled pub/sub bus across audio, cues, and UI.
- **Dependencies**: `@react-three/fiber`, `three`.

### WORLD
- `src/world/ConcertWorld.jsx`: Root 3D world grouping Plaza, Stage, Lighting, and Characters.
- `src/world/ConcertPlaza.jsx`: Outdoor entry plaza, security barricades, plaza floor.
- `src/world/Entrance.jsx`, `FanZone.jsx`, `FoodZone.jsx`, `MerchZone.jsx`, `PhotoZone.jsx`: Sub-zones.
- **Dependencies**: Three.js, `ZoneManager`, `InteractionSystem`.

### STAGE
- `src/world/MainStage.jsx`: Architectural main stage, roof trusses, PA towers, runway, B-stage circle.
- `src/world/PulseCore.jsx`: Iconic 3D kinetic resonance sphere, pulsing neon rings, particle overload.
- `src/data/stageConfig.js`: Stage coordinates, artist marks, speaker placements.
- **Dependencies**: Three.js, `stageConfig`, `LEDMediaManager`.

### CHARACTER
- `src/characters/CharacterController.jsx`: 3D procedural character rig, limb animation, nameplates.
- `src/characters/CharacterFactory.jsx`: Factory generating artists, player, or NPCs.
- `src/characters/CharacterAppearance.js`: Appearance palette, clothing, skin color, accessories.
- `src/characters/CharacterRules.js`: Velocity limits, movement bounds, rotation damping.
- `src/data/artists.js`: CORTIS member profiles, stage marks, animation bindings.
- **Dependencies**: Three.js, `concertStore`.

### PLAYER
- `src/characters/Player.jsx`: Local user avatar, 3rd-person camera follow target, input handler.
- `src/systems/MovementSystem.js`: Locomotion velocity, jumping, collision response.
- `src/ui/AvatarCreator.jsx`: Character customization screen before entering arena.
- **Dependencies**: `CollisionSystem`, `AccessControlSystem`, `CameraController`.

### CROWD
- `src/characters/CrowdManager.jsx`: Multi-zone audience LOD (procedural near meshes, instanced far).
- `src/systems/AudienceEnergySystem.js`: Audience cheer tracking, energy meter, overload (>80%) surge.
- `src/systems/LightstickSystem.js`: Stadium-wide synchronized lightstick color waves.
- **Dependencies**: `concertStore`, `EventBus`, `PerformanceManager`.

### LED
- `src/systems/LEDMediaManager.js`: Multi-channel orchestrator (`MAIN_LED`, `LEFT_LED`, `RIGHT_LED`, `B_STAGE_LED`, `PULSE_CORE`).
- `src/systems/led/LEDChannel.js`: Channel state machine, capability checks, clock sync.
- `src/systems/led/MediaSource.js`: Base interface (`load`, `play`, `pause`, `seek`, `destroy`).
- `src/systems/led/NativeVideoSource.js`, `ProjectVideoSource.js`, `RemoteVideoSource.js`: HTML5 `<video>` + `THREE.VideoTexture`.
- `src/systems/led/YouTubeMediaSource.js`: YouTube IFrame API controller.
- `src/systems/led/AudioReactiveSource.js`: Real-time procedural CanvasTexture audio visualizer.
- `src/world/LEDVideoPlayer.jsx`: 3D WebGL screen mesh, CanvasTexture / VideoTexture cover/contain fit.
- `src/ui/CinemaMVPiP.jsx`: Floating Picture-in-Picture YouTube MV player (hotkey `V`).
- `src/ui/StudioLEDControl.jsx`: Studio Mode per-channel source selector & test patterns.
- **Dependencies**: `MusicEngine`, `ShowDirector`, `concertStore`.

### MUSIC
- `src/core/MusicEngine.js`: Web Audio API master clock, audio element loader, FFT analyser, crossfader.
- `src/core/AudioManager.js`: Spatial SFX, UI sound effects, cheering sound loops.
- `src/data/musicManifest.js`: Track list, audio URLs, YouTube IDs, BPM, timeline cues.
- **Dependencies**: `EventBus`, `concertStore`.

### SHOW TIMELINE
- `src/systems/ShowDirector.js`: Show sequencer, pre-show 10s countdown, setlist advancement.
- `src/systems/SetlistManager.js`: Setlist queue (`MUSIC`, `MC`, `ENCORE`, `FINALE`).
- `src/systems/ConcertTimeline.js`: Sub-second timeline cues parser (lights, laser, camera).
- `src/systems/MediaPreloader.js`: Background preloader for subsequent audio/textures.
- **Dependencies**: `MusicEngine`, `LEDMediaManager`, `LightingManager`.

### LIGHTING
- `src/core/LightingManager.jsx`: Moving heads, spot beams, laser projectors, strobe, CO2 jets.
- `src/data/concert.js`: Lighting color palettes (`INTRO`, `VERSE`, `CHORUS`, `DROP`, `ENCORE`, `BLACKOUT`).
- **Dependencies**: Three.js, `concertStore`, `MusicEngine`.

### CAMERA
- `src/core/CameraController.jsx`: OrbitControls, third-person avatar follow, camera damping.
- `src/systems/CameraDirector.js`: Automated cinematic camera angles cut to music drops.
- `src/systems/CameraSystem.js`: Camera presets (FOH, VIP, Stage Center, Drone, Crane).
- **Dependencies**: Three.js, `concertStore`.

### COLLISION
- `src/systems/CollisionSystem.js`: 2D/3D cylindrical & AABB boundary checks, wall clamping.
- `src/systems/StageNavigationSystem.js`: NPC/artist stage walking paths and boundary limits.
- **Dependencies**: `stageConfig`, `zones`.

### ACCESS CONTROL
- `src/systems/AccessControlSystem.js`: Ticket validation (`GENERAL` vs `VIP`) at barriers.
- `src/systems/ZoneManager.js`: Arena zone boundary tracker.
- `src/data/zones.js`: Security barricades, VIP gate, and stage perimeter geometry.
- **Dependencies**: `userStore`, `concertStore`.

### STUDIO MODE
- `src/ui/StudioPanel.jsx`: Live operator dashboard (lighting scene, FX triggers, setlist overrides).
- `src/ui/StudioLEDControl.jsx`: Channel media routing, test card patterns, video fit modes.
- **Dependencies**: `concertStore`, `ShowDirector`, `LEDMediaManager`.

### PERFORMANCE
- `src/systems/PerformanceManager.js`: Adaptive quality manager (DPR clamp 0.75-1.5, FPS window, auto-downgrade).
- `src/ui/PerformanceHUD.jsx`: Dev overlay showing FPS, frame time, draw calls, triangles, video count.
- **Dependencies**: `three.WebGLRenderer.info`, `concertStore`.

### DEPLOYMENT
- `vite.config.js`: Asset build configuration, base path `/pulse-live/`.
- `src/utils/assetUrl.js`: URL helper resolving assets relative to `import.meta.env.BASE_URL`.
- `.github/workflows/deploy.yml`: GitHub Actions automated deployment to GitHub Pages.
- **Dependencies**: Vite, GitHub Pages.

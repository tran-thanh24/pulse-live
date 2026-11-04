# PULSE//LIVE — Architectural Decisions

Long-term architectural principles and non-negotiable design invariants.

---

### 1. Technology Stack: React + Vite + Three.js / R3F
- React handles UI overlay, modals, and reactive state management.
- `@react-three/fiber` (R3F) orchestrates the Three.js 3D WebGL scene graph.
- Vite powers fast bundling, local HMR, and production tree-shaking.

### 2. Single Master Clock: `MusicEngine`
- `MusicEngine` (Web Audio API) is the single authoritative master clock for the entire show.
- All lighting cues, laser pulses, LED video playback, camera director cuts, and timeline events synchronize strictly against `MusicEngine.getCurrentTime()`.
- Nothing runs an independent clock that drifts from song audio.

### 3. Dual LED Media Architecture: `LEDMediaManager` Channels
- Stage screens are divided into distinct logical channels: `MAIN_LED`, `LEFT_LED`, `RIGHT_LED`, `B_STAGE_LED`, `PULSE_CORE`.
- Each channel operates independently with its own media source state machine (`AUDIO_REACTIVE`, `NATIVE_VIDEO`, `YOUTUBE`, `IMAGE`, `OFF`).
- Stage components must never manage media loading directly; all media operations route through `LEDMediaManager.getChannel(id)`.

### 4. Video Rendering Differentiation
- **Native Video (MP4 / HLS)**: Uses standard HTML5 `<video>` element decoded into `THREE.VideoTexture` rendered on 3D meshes with custom UV Cover/Contain scaling and WebGL depth testing.
- **YouTube Streams**: Due to browser sandbox constraints, YouTube iframes cannot feed raw pixel data into WebGL textures. Stage screens use pure WebGL `CanvasTexture` audio-reactive visualizers, while official YouTube MVs stream via the floating `CinemaMVPiP` HUD window or DOM overlay in Studio Mode.

### 5. Stage Zone Access Restrictions
- Audience avatars and local players are strictly clamped to audience areas (Arena Floor, GA Standing, VIP Terrace, Plaza).
- Player collision bodies are physically blocked from walking onto the Main Stage, Runway, B-Stage, or Backstage artist areas during the show.

### 6. Deployment & Asset Resolution
- GitHub Pages deployment uses the subpath base `/pulse-live/`.
- Never hardcode absolute paths like `/assets/...` or local filesystem paths.
- Always resolve assets through `assetUrl(path)` or `import.meta.env.BASE_URL`.

### 7. Performance-First Architecture
- Measure before optimizing (`PerformanceManager` + `PerformanceHUD`).
- No React state churn in the 60fps render loop; use mutable store references or event callbacks for frame updates.
- Clamp DPR: Maximum 1.5 on High, 1.25 on Medium, 1.0 on Low (never let Retina displays render at unconstrained DPR 2–3).
- Crowd rendering must use InstancedMesh or simplified geometry for distant spectators; never allocate individual SkinnedMesh + AnimationMixer pairs for background crowd.


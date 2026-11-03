---
trigger: model_decision
description: Use when modifying LED screens, LED media, native video, YouTube media, VideoTexture, or LED Studio controls.
---

# LED System Invariants

- **Channel Centralization**: All LED displays must be controlled via `LEDMediaManager.getChannel(screenId)`. Stage components never manage media state directly.
- **Recognized Channels**: `MAIN_LED`, `LEFT_LED`, `RIGHT_LED`, `B_STAGE_LED`, `PULSE_CORE`.
- **Media Source Interface**: All sources implement `load`, `play`, `pause`, `seek`, `setVolume`, `setMuted`, `setBrightness`, `destroy`, and expose explicit capabilities.
- **Native Video**: Rendered via HTML5 `<video>` + `THREE.VideoTexture` supporting Cover/Contain UV fitting and WebGL depth testing.
- **YouTube Decoupling**: YouTube iframes cannot feed raw WebGL textures. Stage screens use pure WebGL `CanvasTexture` audio-reactive visualizers, while YouTube MV streams via the floating `CinemaMVPiP` HUD window.
- **Clock Synchronization**: Media sources with `syncToMusic: true` synchronize continuously with `MusicEngine.getCurrentTime()`.

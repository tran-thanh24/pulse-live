---
trigger: model_decision
description: Use when modifying MusicEngine, playlist, setlist, audio, or timeline synchronization.
---

# Music System Invariants

- **Master Show Clock**: `MusicEngine` is the single source of truth for concert timing.
- **Clock Consumer Discipline**: All lighting cues, laser firings, camera director cuts, and LED sync events must query `MusicEngine.getCurrentTime()`.
- **Track Transitions**: Always transition audio via `MusicEngine.crossfadeToTrack()`. Never abruptly cut audio without fade curves.
- **Audio Analysis**: FFT frequency analysis (bass, mid, treble, waveform) is updated once per frame in `MusicEngine.updateAnalysis()` and read reactively without mutating global React state.
- **Setlist Sequencing**: Setlist flow (`MUSIC`, `MC`, `ENCORE`, `FINALE`) is managed exclusively by `SetlistManager` and sequenced by `ShowDirector`.

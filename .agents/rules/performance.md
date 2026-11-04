---
trigger: model_decision
description: Use for FPS, crowd optimization, DPR, draw calls, textures, LOD, video performance, shadows, or post-processing.
---

# Performance Architecture Invariants

- **Profile Before Optimizing**: Use `PerformanceHUD` and `renderer.info` metrics to verify bottlenecks before refactoring.
- **DPR Clamping**:
  - High Quality: Max DPR 1.5.
  - Medium Quality: DPR 1.25.
  - Low Quality: DPR 1.0.
  - Never allow Retina displays to render unconstrained at DPR 2.0–3.0.
- **Zero React State in 60fps Loop**: Do not invoke React `setState` inside `useFrame`. Use mutable Zustand store references or event bus dispatches throttled to <= 6.5 Hz.
- **Visibility Throttling**: When the document tab is hidden, suspend video decode and canvas rendering loops via `perf:visibilityChanged`.
- **Target Performance Budgets**:
  - High Desktop: 60 FPS.
  - Medium Desktop: 45–60 FPS.
  - Laptop / Low: 30+ FPS.


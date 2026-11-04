---
trigger: model_decision
description: Use for GitHub, GitHub Pages, Vite base, production build, or asset path.
---

# Deployment Invariants

- **Vite Base Path**: Deployment target is GitHub Pages at `/pulse-live/`. Keep `base: '/pulse-live/'` in `vite.config.js`.
- **Safe Asset URLs**: Never use absolute `/assets/...` paths. Always wrap local public asset paths with `assetUrl(path)` or `import.meta.env.BASE_URL`.
- **Preload Critical Assets**: Ensure key audio tracks and initial textures are registered in `src/systems/MediaPreloader.js`.
- **Clean Build Verification**: Always execute `npm run build` before committing structural or bundle-affecting changes.


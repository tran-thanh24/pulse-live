# PULSE//LIVE 2026 — VIRTUAL CONCERT EXPERIENCE

> **FEEL THE SOUND. BECOME THE SHOW.**  
> *CITY OF SOUND · 3D Interactive Stadium Music Experience*

---

## ⚡ LIVE DEMO

Experience the live interactive 3D virtual concert:

**https://tran-thanh24.github.io/pulse-live/**  
*(or `https://<github-username>.github.io/<repository-name>/`)*

---

## ✨ Features

- **Master Clock & MusicEngine:** Real-time Web Audio API `AnalyserNode` frequency extraction (Bass, Mid, Treble, Kick, Energy) driving stage lighting, lasers, and crowd lightsticks.
- **PULSE CORE:** Kinetic, reactive 3D energy ring silhouette with real-time waveform pulse expansion.
- **Character & Avatar System:** Male & Female customizer with 6 presets each, hairstyle, outfit color, accessory styling, and synchronized 3D skeletal animations.
- **LED Video Engine:** 5 independent screen channels (`MAIN_LED`, `LEFT_LED`, `RIGHT_LED`, `PULSE_CORE`, `B_STAGE_LED`) supporting audio-reactive shaders, live stage camera broadcast (`LIVE_CAM`), and local file uploads.
- **Studio Director Mode:** Real-time timeline cue editor, camera director, crowd lightstick wave patterns, and local audio importer.
- **Spatial Audio & Sound Dome:** 11 venue sound zones, collision detection, and VIP terrace access control.
- **Memory Booth & Digital Card:** Photo mode with camera orbital controls, depth-of-field filters, and exportable commemorative concert cards (zero NFT/blockchain).

---

## 🛠️ Tech Stack

- **Framework:** React 18, Vite 5
- **3D Engine:** Three.js, React Three Fiber (R3F), Drei
- **State Management:** Zustand
- **Audio:** Web Audio API (Synthesizer + AnalyserNode)
- **Styling:** Tailwind CSS, PostCSS
- **Deployment:** GitHub Pages via GitHub Actions

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or 20+
- npm 9+

### 1. Install Dependencies

```bash
npm install
# or for strict reproducible install:
npm ci
```

### 2. Development Mode

Run the local Vite development server with HMR:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Production Build

Build the optimized production bundle with automated base path resolution:

```bash
npm run build
```

The output will be generated in `./dist`.

### 4. Local Production Preview

Preview the production build locally:

```bash
npm run preview
```

Open [http://localhost:4173](http://localhost:4173) to verify assets, audio, and shaders.

---

## 🌐 Deployment to GitHub Pages

This repository is configured for automated CI/CD deployment to **GitHub Pages** using official GitHub Actions (`.github/workflows/deploy.yml`).

### Setup in 1 Step:

1. In your GitHub repository, navigate to **Settings** → **Pages**.
2. Under **Build and deployment** → **Source**, select **GitHub Actions**.
3. Push changes to the `main` branch:
   ```bash
   git push -u origin main
   ```
4. The workflow will automatically install dependencies, build the production bundle, and publish your concert site to:
   ```
   https://<username>.github.io/<repository-name>/
   ```

---

## 📄 License

MIT License. Designed & Developed for PULSE//LIVE 2026.


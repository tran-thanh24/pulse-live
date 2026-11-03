import React, { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ledMediaManager, BUILTIN_VIDEO_CLIPS } from '../systems/LEDMediaManager';
import { LEDMaterialHelper } from '../systems/LEDMaterial';
import { useConcertStore } from '../store/concertStore';
import { CONCERT_CONFIG } from '../data/concert';

/**
 * LEDVideoPlayer (`src/world/LEDVideoPlayer.jsx`)
 * Renders an independent LED screen channel (`MAIN_LED`, `LEFT_LED`, `RIGHT_LED`, `B_STAGE_LED`)
 * supporting:
 * 1. Real `HTMLVideoElement` + `THREE.VideoTexture` / aspect-ratio `COVER | CONTAIN | STRETCH` drawing
 * 2. Built-in procedural MP4 motion video streams (`afterglow_intro.mp4`, `pulse_drop_tunnel.mp4`, `encore_gold_horizon.mp4`)
 * 3. `LIVE_CAM` live stage broadcast camera feed (default on `LEFT_LED` for authentic stadium concert immersion)
 * 4. Audio-reactive Stage Sync visuals (`COUNTDOWN`, `PULSE_PATTERN`, `LYRIC_STYLE`, `SHADER`, `AUDIO_REACTIVE`)
 */
export function LEDVideoPlayer({
  channelId = 'MAIN_LED',
  width = 19.5,
  height = 9.4,
  position = [0, 0, 0],
  rotation = [0, 0, 0]
}) {
  const { canvas, ctx, texture } = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = channelId === 'MAIN_LED' ? 1024 : 640;
    c.height = channelId === 'MAIN_LED' ? 512 : 360;
    const context = c.getContext('2d');
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return { canvas: c, ctx: context, texture: tex };
  }, [channelId]);

  useFrame((state) => {
    if (!ctx || !canvas) return;
    const t = state.clock.getElapsedTime();
    const ch = ledMediaManager.getChannel(channelId);
    const cStore = useConcertStore.getState();
    const lightingScene = cStore.lightingScene || 'INTRO';
    const ledSceneType = cStore.ledSceneType || 'AUDIO_REACTIVE';
    const fxState = cStore.fxState;
    const { bass, mid, treble, waveform } = cStore.audioAnalysis;
    const palette =
      CONCERT_CONFIG.stageColors[lightingScene] || CONCERT_CONFIG.stageColors.INTRO;

    if (channelId === 'MAIN_LED') {
      ledMediaManager.checkDriftAndSync();
    }

    const w = canvas.width;
    const h = canvas.height;

    // 1. Blackout check
    if (lightingScene === 'BLACKOUT' || fxState.blackout || !ch.playing) {
      ctx.fillStyle = '#04050C';
      ctx.fillRect(0, 0, w, h);
      texture.needsUpdate = true;
      return;
    }

    // 2. Local MP4 / WebM Video File via HTMLVideoElement
    if (ch.mode === 'LOCAL_VIDEO' && ch.videoEl && ch.videoEl.readyState >= 2) {
      LEDMaterialHelper.drawMediaWithFit(
        ctx,
        w,
        h,
        ch.videoEl,
        ch.mediaWidth,
        ch.mediaHeight,
        ch.fitMode,
        ch.brightness
      );
      texture.needsUpdate = true;
      return;
    }

    ctx.save();
    ctx.globalAlpha = Math.max(0.1, Math.min(1.0, ch.brightness));

    // 3. LIVE_CAM Broadcast Feed (Simulated Live Stage Camera on LEFT_LED or selected channel)
    if (ch.mode === 'LIVE_CAM') {
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#070B19');
      grad.addColorStop(0.5, palette.primary + '55');
      grad.addColorStop(1, '#090D1E');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Simulated Artist Close-Up Silhouette & Stage Halo in Live Camera Frame
      const cx = w / 2 + Math.sin(t * 1.4) * 18;
      const cy = h * 0.56 + Math.abs(Math.sin(t * 4.2)) * 12;

      // Pulse Core Halo behind Artist in Live Cam
      ctx.strokeStyle = palette.primary;
      ctx.lineWidth = 4 + bass * 8;
      ctx.beginPath();
      ctx.arc(cx, cy - 25, 95 + bass * 35, 0, Math.PI * 2);
      ctx.stroke();

      // Artist Head & Shoulders Close-Up Silhouette
      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.arc(cx, cy - 42, 34, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(cx - 64, cy - 4, 128, 120);

      // Visor Glow on Artist Silhouette
      ctx.fillStyle = '#22D3EE';
      ctx.fillRect(cx - 22, cy - 48, 44, 10);

      // Broadcast Viewfinder Frame & LIVE CAM Telemetry
      ctx.strokeStyle = 'rgba(255,255,255,0.35)';
      ctx.lineWidth = 2;
      ctx.strokeRect(24, 24, w - 48, h - 48);

      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.arc(48, 48, 7, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '700 18px "Space Grotesk", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('LIVE CAM 01 // ARTIST CLOSE-UP', 64, 54);

      ctx.fillStyle = '#22D3EE';
      ctx.font = '600 15px "Inter", sans-serif';
      ctx.fillText(
        `TC ${Math.floor(cStore.concertTime / 60)
          .toString()
          .padStart(2, '0')}:${Math.floor(cStore.concertTime % 60)
          .toString()
          .padStart(2, '0')} · ${cStore.castMode.toUpperCase()}`,
        36,
        h - 36
      );

      ctx.restore();
      texture.needsUpdate = true;
      return;
    }

    // 4. Built-in Motion Video Clips (`BUILTIN_VIDEO`)
    if (ch.mode === 'BUILTIN_VIDEO') {
      const clip =
        BUILTIN_VIDEO_CLIPS.find((c) => c.id === ch.src) || BUILTIN_VIDEO_CLIPS[0];
      const grad = ctx.createRadialGradient(w / 2, h / 2, 20, w / 2, h / 2, w * 0.65);
      grad.addColorStop(0, clip.primary + '88');
      grad.addColorStop(0.5, clip.secondary + '44');
      grad.addColorStop(1, '#050712');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      for (let i = 1; i <= 8; i++) {
        const radius = ((t * 140 + i * 52) % (w * 0.55)) + bass * 40;
        ctx.strokeStyle = i % 2 === 0 ? clip.primary : clip.secondary;
        ctx.lineWidth = 3 + bass * 6;
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, radius, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.fillStyle = '#FFFFFF';
      ctx.font = `700 ${Math.round(w * 0.055)}px "Space Grotesk", sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(
        clip.theme === 'ENCORE'
          ? 'PULSE // GOLDEN HORIZON'
          : clip.theme === 'DROP'
          ? 'OVERDRIVE // DROP TUNNEL'
          : 'CITY OF SOUND // LIVE STREAM',
        w / 2,
        h / 2 + 16
      );

      ctx.restore();
      texture.needsUpdate = true;
      return;
    }

    // 5. Default Stage Sync (`STAGE_SYNC`) driven by ShowDirector + MusicEngine
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#060814');
    grad.addColorStop(0.5, palette.primary + '44');
    grad.addColorStop(1, '#080B1C');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    for (let gx = 0; gx < w; gx += 64) {
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, h);
      ctx.stroke();
    }

    if (ledSceneType === 'COUNTDOWN' || cStore.showState === 'PRE_SHOW') {
      ctx.fillStyle = '#22D3EE';
      ctx.font = `600 ${Math.round(w * 0.024)}px "Space Grotesk", sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('PULSE//LIVE 2026  ·  PRE-SHOW SEQUENCE', w / 2, h * 0.26);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = `700 ${Math.round(w * 0.14)}px "Space Grotesk", sans-serif`;
      ctx.fillText(String(cStore.preShowCountdown || 'GO'), w / 2, h * 0.6);

      ctx.fillStyle = '#A1A1AA';
      ctx.font = `600 ${Math.round(w * 0.022)}px "Inter", sans-serif`;
      ctx.fillText('FEEL THE SOUND. BECOME THE SHOW.', w / 2, h * 0.78);
    } else if (ledSceneType === 'PULSE_PATTERN') {
      for (let r = 1; r <= 7; r++) {
        const rad = ((t * 110 + r * 50) % (w * 0.42)) + bass * 42;
        ctx.strokeStyle = r % 2 === 0 ? palette.primary : palette.accent;
        ctx.lineWidth = 3 + bass * 5;
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, rad, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.fillStyle = '#FFFFFF';
      ctx.font = `700 ${Math.round(w * 0.052)}px "Space Grotesk", sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('PULSE // CORE RESONANCE', w / 2, h / 2 + 16);
    } else if (ledSceneType === 'LYRIC_STYLE') {
      ctx.fillStyle = palette.primary;
      ctx.font = `600 ${Math.round(w * 0.024)}px "Space Grotesk", sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(cStore.currentTrack?.title?.toUpperCase() || 'AFTERGLOW', w / 2, h * 0.32);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = `700 ${Math.round(w * 0.054)}px "Space Grotesk", sans-serif`;
      ctx.fillText('FEEL THE FREQUENCY IN CARVED LIGHT', w / 2, h * 0.52);

      ctx.fillStyle = '#FACC15';
      ctx.font = `600 ${Math.round(w * 0.028)}px "Space Grotesk", sans-serif`;
      ctx.fillText('EVERY HEARTBEAT IS THE MASTER CLOCK', w / 2, h * 0.68);
    } else if (ledSceneType === 'TEXT' || ledSceneType === 'ARTIST_NAME') {
      ctx.fillStyle = '#22D3EE';
      ctx.font = `600 ${Math.round(w * 0.024)}px "Space Grotesk", sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('PULSE//LIVE 2026  ·  CITY OF SOUND', w / 2, h * 0.32);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = `700 ${Math.round(w * 0.068)}px "Space Grotesk", sans-serif`;
      ctx.fillText(
        ledSceneType === 'ARTIST_NAME'
          ? cStore.currentTrack?.artist || 'PULSE COLLECTIVE'
          : cStore.ledCustomText || 'PULSE//LIVE 2026',
        w / 2,
        h * 0.56
      );
    } else {
      // Live Audio Spectrum + Waveform
      const barCount = 36;
      const barW = w / barCount;
      for (let b = 0; b < barCount; b++) {
        const norm =
          Math.abs(Math.sin(t * 5 + b * 0.35)) * (0.35 + bass * 0.65) +
          (b > 18 ? treble * 0.45 : mid * 0.45);
        const barH = Math.min(h * 0.72, Math.max(14, norm * h * 0.52));
        ctx.fillStyle = b % 2 === 0 ? palette.primary + 'AA' : palette.secondary + 'AA';
        ctx.fillRect(b * barW + 3, h - barH, barW - 6, barH);
      }

      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      for (let i = 0; i < 32; i++) {
        const wx = (i / 31) * w;
        const wy = h * 0.42 + (waveform?.[i] || Math.sin(t * 6 + i) * 0.25) * (h * 0.22);
        if (i === 0) ctx.moveTo(wx, wy);
        else ctx.lineTo(wx, wy);
      }
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = `700 ${Math.round(w * 0.058)}px "Space Grotesk", sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(
        (cStore.currentTrack?.title || 'AFTERGLOW').toUpperCase(),
        w / 2,
        h * 0.3
      );
    }

    ctx.restore();
    texture.needsUpdate = true;
  });

  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, -0.15]}>
        <boxGeometry args={[width + 0.5, height + 0.5, 0.22]} />
        <meshStandardMaterial color="#080A14" metalness={0.85} roughness={0.25} />
      </mesh>
    </group>
  );
}


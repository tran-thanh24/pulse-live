/**
 * LEDVideoPlayer.jsx — Renders an architectural LED screen supporting Dual Media:
 * 1. YOUTUBE MODE (3D CSS3D/DOM transform projection aligned to LED screen mesh plane)
 * 2. NATIVE VIDEO MODE (High-Quality HTMLVideoElement + THREE.VideoTexture with Cover/Contain Fit & Brightness)
 * 3. AUDIO REACTIVE MODE (Procedural Canvas Texture driven by Web Audio API Master Clock)
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { ledMediaManager } from '../systems/LEDMediaManager';
import { LED_MEDIA_TYPES, FIT_MODES } from '../systems/led/LEDConstants';
import { useConcertStore } from '../store/concertStore';
import { CONCERT_CONFIG } from '../data/concert';

export function LEDVideoPlayer({
  channelId = 'MAIN_LED',
  width = 19.5,
  height = 9.4,
  position = [0, 0, 0],
  rotation = [0, 0, 0]
}) {
  const [channelState, setChannelState] = useState(() => ledMediaManager.getChannel(channelId).getState());
  const studioMode = useConcertStore((s) => s.studioMode);
  const masterBlackout = useConcertStore((s) => s.fxState?.blackout || false);

  const containerRef = useRef(null);

  // Subscribe to channel changes
  useEffect(() => {
    const ch = ledMediaManager.getChannel(channelId);
    setChannelState(ch.getState());
    const unsub = ch.subscribe((st) => setChannelState(st));
    return unsub;
  }, [channelId]);

  // Procedural Canvas Texture for Audio Reactive & Fallback Mode
  const { canvas, ctx, canvasTexture } = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = channelId === 'MAIN_LED' ? 1024 : 640;
    c.height = channelId === 'MAIN_LED' ? 512 : 360;
    const context = c.getContext('2d');
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return { canvas: c, ctx: context, canvasTexture: tex };
  }, [channelId]);

  // Mount YouTube player element into Drei HTML container when in YouTube mode
  useEffect(() => {
    if (channelState.sourceType === LED_MEDIA_TYPES.YOUTUBE && containerRef.current) {
      const ytSource = channelState.source;
      if (ytSource && ytSource.containerEl) {
        if (!containerRef.current.contains(ytSource.containerEl)) {
          containerRef.current.innerHTML = '';
          containerRef.current.appendChild(ytSource.containerEl);
        }
      }
    }
  }, [channelState.sourceType, channelState.source]);

  // Frame Loop for Audio-Reactive Canvas & Drift Check
  useFrame((state) => {
    if (channelId === 'MAIN_LED') {
      ledMediaManager.checkDriftAndSync();
    }

    if (channelState.sourceType !== LED_MEDIA_TYPES.AUDIO_REACTIVE && channelState.sourceType !== LED_MEDIA_TYPES.NONE) {
      return;
    }

    if (!ctx || !canvas) return;
    const t = state.clock.getElapsedTime();
    const cStore = useConcertStore.getState();
    const lightingScene = cStore.lightingScene || 'INTRO';
    const ledSceneType = cStore.ledSceneType || 'AUDIO_REACTIVE';
    const { bass, mid, treble, waveform } = cStore.audioAnalysis;
    const palette = CONCERT_CONFIG.stageColors[lightingScene] || CONCERT_CONFIG.stageColors.INTRO;

    const w = canvas.width;
    const h = canvas.height;

    // Blackout check
    if (channelState.blackout || masterBlackout) {
      ctx.fillStyle = '#03050C';
      ctx.fillRect(0, 0, w, h);
      canvasTexture.needsUpdate = true;
      return;
    }

    ctx.save();
    ctx.globalAlpha = Math.max(0.1, Math.min(1.0, channelState.brightness));

    // Dynamic gradient backdrop
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#060814');
    grad.addColorStop(0.5, palette.primary + '44');
    grad.addColorStop(1, '#080B1C');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Audio-reactive visualizer
    if (ledSceneType === 'PULSE_PATTERN') {
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
        (cStore.currentTrack?.title || 'CORTIS LIVE').toUpperCase(),
        w / 2,
        h * 0.3
      );
    }

    ctx.restore();
    canvasTexture.needsUpdate = true;
  });

  const isYouTube = channelState.sourceType === LED_MEDIA_TYPES.YOUTUBE;
  const isBlackout = channelState.blackout || masterBlackout;

  // Compute 3D HTML scale so CSS pixels match 3D mesh units
  const cssResolutionWidth = 1280;
  const screenAspect = width / height;
  const cssResolutionHeight = Math.round(cssResolutionWidth / screenAspect);
  const htmlScale = width / cssResolutionWidth;

  const nativeTexture = channelState.texture;

  return (
    <group position={position} rotation={rotation}>
      {/* 1. Physical Bezel & Backing Shell */}
      <mesh position={[0, 0, -0.16]} castShadow receiveShadow>
        <boxGeometry args={[width + 0.5, height + 0.5, 0.24]} />
        <meshStandardMaterial color="#060812" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* 2. LED WebGL Plane */}
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[width, height]} />
        {isYouTube ? (
          // When YouTube is active, WebGL mesh stays matte dark so no texture clashes behind iframe
          <meshBasicMaterial color="#020308" />
        ) : nativeTexture ? (
          <meshBasicMaterial
            map={nativeTexture}
            toneMapped={false}
            color={
              isBlackout
                ? '#000000'
                : new THREE.Color(
                    channelState.brightness,
                    channelState.brightness,
                    channelState.brightness
                  )
            }
          />
        ) : (
          <meshBasicMaterial
            map={canvasTexture}
            toneMapped={false}
            color={isBlackout ? '#000000' : '#ffffff'}
          />
        )}
      </mesh>

      {/* 3. YOUTUBE 3D PRESENTATION (Drei HTML 3D Layer with Exact Perspective Alignment) */}
      {isYouTube && (
        <Html
          transform
          position={[0, 0, 0.04]}
          scale={htmlScale}
          zIndexRange={[10, 0]}
          style={{
            width: `${cssResolutionWidth}px`,
            height: `${cssResolutionHeight}px`,
            pointerEvents: studioMode ? 'auto' : 'none',
            opacity: isBlackout ? 0 : 1,
            transition: 'opacity 0.25s ease'
          }}
        >
          <div
            className="w-full h-full relative overflow-hidden bg-black flex items-center justify-center select-none"
            style={{
              borderRadius: '4px'
            }}
          >
            {/* The mounted YouTube Iframe Container */}
            <div
              ref={containerRef}
              className="w-full h-full"
              style={{
                objectFit: channelState.fitMode === FIT_MODES.CONTAIN ? 'contain' : 'cover'
              }}
            />

            {/* Error Overlay if YouTube video is unavailable / embedding disabled */}
            {channelState.error && (
              <div className="absolute inset-0 z-20 bg-black/90 flex flex-col items-center justify-center p-6 text-center text-white">
                <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-500/50 flex items-center justify-center text-red-400 text-xl font-bold mb-3">
                  ⚠️
                </div>
                <div className="text-xl font-bold font-heading text-red-400">
                  YOUTUBE VIDEO UNAVAILABLE
                </div>
                <div className="text-sm text-zinc-400 mt-2 max-w-md">
                  {channelState.error}
                </div>
                <div className="text-xs text-zinc-500 mt-4">
                  Please check video ID, URL, or select another video in Studio Mode.
                </div>
              </div>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}

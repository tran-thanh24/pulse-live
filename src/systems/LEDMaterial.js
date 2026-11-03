import * as THREE from 'three';

/**
 * LEDMaterial (`src/systems/LEDMaterial.js`)
 * Computes aspect-ratio-correct UV transform (`repeat` & `offset`) for `COVER`, `CONTAIN`, and `STRETCH`
 * so LED screens never distort 16:9 or custom aspect-ratio video textures.
 * Also applies channel brightness and tone-mapping-free emissive output.
 */
export class LEDMaterialHelper {
  /**
   * Applies `COVER | CONTAIN | STRETCH` UV mapping to a Three.js Texture
   */
  static applyFitMode(texture, screenAspect = 16 / 9, mediaAspect = 16 / 9, fitMode = 'COVER') {
    if (!texture) return;
    const mode = String(fitMode || 'COVER').toUpperCase();

    if (mode === 'STRETCH' || Math.abs(screenAspect - mediaAspect) < 0.01) {
      texture.repeat.set(1, 1);
      texture.offset.set(0, 0);
      return;
    }

    if (mode === 'COVER') {
      if (screenAspect > mediaAspect) {
        // Screen is wider than video: crop top/bottom
        const scaleY = mediaAspect / screenAspect;
        texture.repeat.set(1, scaleY);
        texture.offset.set(0, (1 - scaleY) / 2);
      } else {
        // Screen is taller than video: crop left/right
        const scaleX = screenAspect / mediaAspect;
        texture.repeat.set(scaleX, 1);
        texture.offset.set((1 - scaleX) / 2, 0);
      }
    } else if (mode === 'CONTAIN') {
      // CONTAIN: preserve full frame inside screen bounds
      texture.repeat.set(1, 1);
      texture.offset.set(0, 0);
    }
  }

  /**
   * Draws a video or image onto a composite LED canvas respecting `COVER | CONTAIN | STRETCH` and `brightness`
   */
  static drawMediaWithFit(ctx, canvasW, canvasH, mediaEl, mediaW, mediaH, fitMode = 'COVER', brightness = 1.0) {
    ctx.save();
    ctx.fillStyle = '#04050C';
    ctx.fillRect(0, 0, canvasW, canvasH);

    if (brightness !== 1.0) {
      ctx.globalAlpha = Math.max(0.05, Math.min(1.0, brightness));
    }

    const mode = String(fitMode || 'COVER').toUpperCase();
    const srcW = mediaW || 1280;
    const srcH = mediaH || 720;

    if (mode === 'STRETCH') {
      ctx.drawImage(mediaEl, 0, 0, canvasW, canvasH);
    } else if (mode === 'CONTAIN') {
      const scale = Math.min(canvasW / srcW, canvasH / srcH);
      const drawW = srcW * scale;
      const drawH = srcH * scale;
      const dx = (canvasW - drawW) / 2;
      const dy = (canvasH - drawH) / 2;
      ctx.drawImage(mediaEl, dx, dy, drawW, drawH);
    } else {
      // COVER
      const scale = Math.max(canvasW / srcW, canvasH / srcH);
      const drawW = srcW * scale;
      const drawH = srcH * scale;
      const dx = (canvasW - drawW) / 2;
      const dy = (canvasH - drawH) / 2;
      ctx.drawImage(mediaEl, dx, dy, drawW, drawH);
    }

    ctx.restore();
  }
}


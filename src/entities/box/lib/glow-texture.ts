import { DataTexture, LinearFilter, RGBAFormat } from 'three';

/**
 * A soft white radial falloff, generated in memory: expo-gl has no canvas to draw gradients on,
 * and tinting one white texture per sprite avoids shipping image assets for every glow.
 */
export function createGlowTexture(size = 64) {
  const data = new Uint8Array(size * size * 4);
  const center = (size - 1) / 2;
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const distance = Math.hypot(x - center, y - center) / center;
      const falloff = Math.max(0, 1 - distance) ** 2;
      const i = (y * size + x) * 4;
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
      data[i + 3] = Math.round(falloff * 255);
    }
  }
  const texture = new DataTexture(data, size, size, RGBAFormat);
  texture.magFilter = LinearFilter;
  texture.minFilter = LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

/** A light shaft: brightest at the base and along its center line, fading out toward the tip and the edges. */
export function createBeamTexture(width = 32, height = 64) {
  const data = new Uint8Array(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    const along = (1 - y / (height - 1)) ** 1.5;
    for (let x = 0; x < width; x += 1) {
      const across = (1 - Math.abs((2 * x) / (width - 1) - 1)) ** 2;
      const i = (y * width + x) * 4;
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
      data[i + 3] = Math.round(along * across * 255);
    }
  }
  const texture = new DataTexture(data, width, height, RGBAFormat);
  texture.magFilter = LinearFilter;
  texture.minFilter = LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

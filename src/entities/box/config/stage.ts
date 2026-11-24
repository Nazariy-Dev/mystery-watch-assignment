import { MathUtils } from 'three';

// ── Reveal ──
/** Model -Z faces the camera here, so the lid (hinged at +Z) falls away from it; the offset keeps a three-quarter view. */
export const OPEN_YAW = Math.PI + 0.45;
export const GLOW_INTENSITY = 6;
/** Front light that washes the visible faces in the teased color on each step. */
export const FLASH_INTENSITY = 14;
/** Sits behind the box, so the box itself occludes the bright core and only a halo shows around it. */
export const AURA_Z = -0.8;
/** Kept under the canvas's narrowest visible span at the aura's depth, or the sprite is clipped into a rectangle. */
export const AURA_MAX_SCALE = 1.9;

// ── Camera ──
export const FOV = 30;
export const ELEVATION = MathUtils.degToRad(14);
/** Half-extents to keep in view (MODEL.md bounds, padded for rotation): closed box vs fully open lid. */
export const CLOSED_FRAME = { centerY: 0.52, halfHeight: 0.8, halfWidth: 0.82 };
export const OPEN_FRAME = { centerY: 0.92, halfHeight: 1.08, halfWidth: 0.95 };
export const KICK_PUNCH = 0.08;
export const KICK_SHUDDER = 0.06;

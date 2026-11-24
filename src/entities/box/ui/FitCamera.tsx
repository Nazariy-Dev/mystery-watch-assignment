import { useFrame, useThree } from '@react-three/fiber/native';
import { MathUtils, type PerspectiveCamera } from 'three';

import { CLOSED_FRAME, ELEVATION, FOV, KICK_PUNCH, KICK_SHUDDER, OPEN_FRAME } from '../config/stage';
import type { BoxMotion } from '../model/motion';
import type { Entrance } from '../model/entrance';
import type { RevealTimeline } from '../model/reveal';

type FitCameraProps = { motion: BoxMotion; entrance: Entrance; timeline: RevealTimeline; reduceMotion: boolean };

/**
 * Places the camera so the box fits the canvas in both directions, whatever its aspect ratio.
 * A fixed camera only fits one shape: tall cards cropped the sides and the open lid left the frame.
 */
export function FitCamera({ motion, entrance, timeline, reduceMotion }: FitCameraProps) {
  const camera = useThree((state) => state.camera) as PerspectiveCamera;
  const { width, height } = useThree((state) => state.size);

  useFrame(() => {
    const openness = MathUtils.clamp(motion.openness, 0, 1);
    const centerY = MathUtils.lerp(CLOSED_FRAME.centerY, OPEN_FRAME.centerY, openness);
    const halfHeight = MathUtils.lerp(CLOSED_FRAME.halfHeight, OPEN_FRAME.halfHeight, openness);
    const halfWidth = MathUtils.lerp(CLOSED_FRAME.halfWidth, OPEN_FRAME.halfWidth, openness);
    const tanV = Math.tan(MathUtils.degToRad(FOV / 2));
    const tanH = tanV * (width / height);
    const age = reduceMotion ? null : timeline.burstAge;
    // The burst kicks the camera: a quick punch in plus a shudder that dies within half a second.
    const kick = age === null ? 0 : Math.exp(-age * 8);
    const distance = Math.max(halfHeight / tanV, halfWidth / tanH) * (1 - KICK_PUNCH * kick) * entrance.dolly;
    const shudderX = Math.sin((age ?? 0) * 57) * KICK_SHUDDER * kick;
    const shudderY = Math.cos((age ?? 0) * 43) * KICK_SHUDDER * kick;

    camera.position.set(shudderX, centerY + shudderY + distance * Math.sin(ELEVATION), distance * Math.cos(ELEVATION));
    camera.lookAt(shudderX * 0.5, centerY, 0);
  });
  return null;
}

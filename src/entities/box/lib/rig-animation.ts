import { useFrame } from '@react-three/fiber/native';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Group, PointLight, Sprite, SpriteMaterial } from 'three';

import { AURA_MAX_SCALE, FLASH_INTENSITY, GLOW_INTENSITY, OPEN_YAW } from '../config/stage';
import type { Entrance } from '../model/entrance';
import type { BoxMotion } from '../model/motion';
import type { RevealBeat, RevealTimeline } from '../model/reveal';
import type { SeamGlow } from '../model/seam';
import type { SpinController } from '../model/spin';
import { BurstVisuals } from './burst-visuals';
import { createGlowTexture } from './glow-texture';
import { MoteVisuals } from './mote-visuals';

export type RigAnimationOptions = {
  spin: SpinController;
  motion: BoxMotion;
  entrance: Entrance;
  ambient: boolean;
  onLand?: () => void;
  timeline: RevealTimeline;
  seam: SeamGlow;
  spinning: boolean;
  charging: boolean;
  reduceMotion: boolean;
  onBeat?: (beat: RevealBeat) => void;
};

/** Advances every controller each frame and writes the result onto the returned scene refs and effects. */
export function useRigAnimation({
  spin,
  motion,
  entrance,
  ambient,
  onLand,
  timeline,
  seam,
  spinning,
  charging,
  reduceMotion,
  onBeat,
}: RigAnimationOptions) {
  const turntable = useRef<Group>(null);
  const shaker = useRef<Group>(null);
  const light = useRef<PointLight>(null);
  const flash = useRef<PointLight>(null);
  const aura = useRef<Sprite>(null);
  const glowTexture = useMemo(() => createGlowTexture(), []);
  const [burst] = useState(() => new BurstVisuals());
  const [motes] = useState(() => (ambient ? new MoteVisuals() : null));

  useEffect(() => () => glowTexture.dispose(), [glowTexture]);
  useEffect(() => () => burst.dispose(), [burst]);
  useEffect(() => () => motes?.dispose(), [motes]);

  useFrame((_, delta) => {
    // The entrance clock starts here, once the model has loaded, so the drop is never missed behind a blank canvas.
    if (entrance.tick(delta)) onLand?.();
    timeline.tick(delta).forEach((beat) => onBeat?.(beat));
    motion.tick(delta, { open: timeline.opened, charging: charging || (timeline.teasing && !reduceMotion) });
    seam.update({ charge: motion.shake, shown: timeline.shown, pulse: timeline.pulse });
    const openness = Math.max(0, motion.openness);

    // Once the result is in, the box swings round to face the camera for the burst.
    const yaw = spin.tick(delta, spinning, timeline.running ? OPEN_YAW : undefined);
    if (turntable.current) {
      turntable.current.rotation.y = yaw;
      turntable.current.position.y = entrance.drop;
    }
    if (shaker.current) {
      shaker.current.rotation.z = motion.wobble * 0.05;
      shaker.current.position.x = motion.wobble * 0.02;
      const punch = reduceMotion ? 1 : 1 + timeline.pulse * 0.12;
      // Squashes on landing: shorter and wider for a moment, so the drop has weight.
      shaker.current.scale.set(punch * (1 + entrance.impact * 0.06), punch * (1 - entrance.impact * 0.1), punch * (1 + entrance.impact * 0.06));
    }
    motes?.update(delta, { charge: motion.shake, color: seam.color });
    if (light.current) {
      light.current.color.copy(seam.color);
      light.current.intensity = openness * GLOW_INTENSITY;
    }
    if (flash.current) {
      flash.current.color.copy(seam.color);
      flash.current.intensity = timeline.pulse * FLASH_INTENSITY;
    }
    burst.update(delta * timeline.effectsTimeScale, {
      opened: timeline.opened,
      celebration: timeline.celebration,
      color: seam.color,
      sparks: !reduceMotion,
    });
    if (aura.current) {
      const material = aura.current.material as SpriteMaterial;
      material.color.copy(seam.color);
      material.opacity = Math.min(1, motion.shake * 0.35 + timeline.pulse + openness * 0.7 + entrance.impact * 0.6);
      aura.current.visible = material.opacity > 0.01;
      aura.current.scale.setScalar(Math.min(AURA_MAX_SCALE, 1.4 + motion.shake * 0.2 + timeline.pulse * 0.5));
      aura.current.position.y = 0.6 + openness * 0.4;
    }
  });

  return { turntable, shaker, light, flash, aura, glowTexture, burst, motes };
}

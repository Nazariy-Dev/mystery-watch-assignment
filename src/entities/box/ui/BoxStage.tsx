import { Canvas, useFrame, useThree } from '@react-three/fiber/native';
import { Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import { useReducedMotion } from 'react-native-reanimated';
import { AdditiveBlending, MathUtils, type Group, type PerspectiveCamera, type PointLight, type Sprite, type SpriteMaterial } from 'three';

import type { Rarity } from '@/shared/api';
import { BurstVisuals } from '../lib/burst-visuals';
import { createGlowTexture } from '../lib/glow-texture';
import { BoxMotion } from '../model/motion';
import { RevealTimeline, type RevealBeat } from '../model/reveal';
import { SeamGlow } from '../model/seam';
import { SpinController } from '../model/spin';
import { BoxLighting } from './BoxLighting';
import { BoxModel } from './BoxModel';

type BoxStageProps = {
  tier: Rarity;
  /** Shakes the box with building intensity and heats the seam, for the hold-to-open charge. */
  charging?: boolean;
  /** The won rarity: setting it plays the tease and bursts the lid open; clearing it seals the box again. */
  result?: Rarity;
  /** Fires on each reveal beat, from the render loop, for haptics and for handing over to the result card. */
  onBeat?: (beat: RevealBeat) => void;
  /** When false the canvas renders on demand only, so off-focus boxes cost no frames. */
  spinning?: boolean;
  /** Horizontal drags turn the box; vertical drags still reach the parent scroll view. */
  inspectable?: boolean;
  /** Makes the stage a labelled image for screen readers; omit when a parent already describes the box. */
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

/** Model -Z faces the camera here, so the lid (hinged at +Z) falls away from it; the offset keeps a three-quarter view. */
const OPEN_YAW = Math.PI + 0.45;
const GLOW_INTENSITY = 6;
/** Front light that washes the visible faces in the teased color on each step. */
const FLASH_INTENSITY = 14;
/** Sits behind the box, so the box itself occludes the bright core and only a halo shows around it. */
const AURA_Z = -0.8;
/** Kept under the canvas's narrowest visible span at the aura's depth, or the sprite is clipped into a rectangle. */
const AURA_MAX_SCALE = 1.9;

type RigProps = {
  spin: SpinController;
  motion: BoxMotion;
  timeline: RevealTimeline;
  seam: SeamGlow;
  spinning: boolean;
  charging: boolean;
  reduceMotion: boolean;
  onBeat?: (beat: RevealBeat) => void;
  children: ReactNode;
};

// Everything per-frame lives in useFrame on plain objects, so animation never re-renders React.
function Rig({ spin, motion, timeline, seam, spinning, charging, reduceMotion, onBeat, children }: RigProps) {
  const turntable = useRef<Group>(null);
  const shaker = useRef<Group>(null);
  const light = useRef<PointLight>(null);
  const flash = useRef<PointLight>(null);
  const aura = useRef<Sprite>(null);
  const glowTexture = useMemo(() => createGlowTexture(), []);
  const [burst] = useState(() => new BurstVisuals());

  useEffect(() => () => glowTexture.dispose(), [glowTexture]);
  useEffect(() => () => burst.dispose(), [burst]);

  useFrame((_, delta) => {
    timeline.tick(delta).forEach((beat) => {
      if (beat.kind === 'burst' && !reduceMotion) burst.burst();
      onBeat?.(beat);
    });
    motion.tick(delta, { open: timeline.opened, charging: charging || (timeline.teasing && !reduceMotion) });
    seam.update({ charge: motion.shake, shown: timeline.shown, pulse: timeline.pulse });
    const openness = Math.max(0, motion.openness);

    // Once the result is in, the box swings round to face the camera for the burst.
    const yaw = spin.tick(delta, spinning, timeline.running ? OPEN_YAW : undefined);
    if (turntable.current) turntable.current.rotation.y = yaw;
    if (shaker.current) {
      shaker.current.rotation.z = motion.wobble * 0.05;
      shaker.current.position.x = motion.wobble * 0.02;
      shaker.current.scale.setScalar(reduceMotion ? 1 : 1 + timeline.pulse * 0.12);
    }
    if (light.current) {
      light.current.color.copy(seam.color);
      light.current.intensity = openness * GLOW_INTENSITY;
    }
    if (flash.current) {
      flash.current.color.copy(seam.color);
      flash.current.intensity = timeline.pulse * FLASH_INTENSITY;
    }
    burst.update(delta, timeline.burstAge, seam.color);
    if (aura.current) {
      const material = aura.current.material as SpriteMaterial;
      material.color.copy(seam.color);
      material.opacity = Math.min(1, motion.shake * 0.35 + timeline.pulse + openness * 0.7);
      aura.current.visible = material.opacity > 0.01;
      aura.current.scale.setScalar(Math.min(AURA_MAX_SCALE, 1.4 + motion.shake * 0.2 + timeline.pulse * 0.5));
      aura.current.position.y = 0.6 + openness * 0.4;
    }
  });

  return (
    <>
      <sprite ref={aura} position={[0, 0.6, AURA_Z]} visible={false}>
        <spriteMaterial map={glowTexture} blending={AdditiveBlending} depthWrite={false} transparent opacity={0} />
      </sprite>
      <pointLight ref={flash} position={[0, 0.8, 1.6]} intensity={0} distance={4} />
      <group ref={turntable}>
        <group ref={shaker}>
          {children}
          {/* At the box mouth, so the walls hide where the rays start. */}
          <primitive object={burst.root} position={[0, 0.8, 0]} />
          <pointLight ref={light} position={[0, 0.75, 0]} intensity={0} distance={3} />
        </group>
      </group>
    </>
  );
}

const FOV = 30;
const ELEVATION = MathUtils.degToRad(14);
/** Half-extents to keep in view (MODEL.md bounds, padded for rotation): closed box vs fully open lid. */
const CLOSED = { centerY: 0.52, halfHeight: 0.8, halfWidth: 0.82 };
const OPEN = { centerY: 0.92, halfHeight: 1.08, halfWidth: 0.95 };
const KICK_PUNCH = 0.08;
const KICK_SHUDDER = 0.06;

/**
 * Places the camera so the box fits the canvas in both directions, whatever its aspect ratio.
 * A fixed camera only fits one shape: tall cards cropped the sides and the open lid left the frame.
 */
function FitCamera({ motion, timeline, reduceMotion }: { motion: BoxMotion; timeline: RevealTimeline; reduceMotion: boolean }) {
  const camera = useThree((state) => state.camera) as PerspectiveCamera;
  const { width, height } = useThree((state) => state.size);

  useFrame(() => {
    const openness = MathUtils.clamp(motion.openness, 0, 1);
    const centerY = MathUtils.lerp(CLOSED.centerY, OPEN.centerY, openness);
    const halfHeight = MathUtils.lerp(CLOSED.halfHeight, OPEN.halfHeight, openness);
    const halfWidth = MathUtils.lerp(CLOSED.halfWidth, OPEN.halfWidth, openness);
    const tanV = Math.tan(MathUtils.degToRad(FOV / 2));
    const tanH = tanV * (width / height);
    const age = reduceMotion ? null : timeline.burstAge;
    // The burst kicks the camera: a quick punch in plus a shudder that dies within half a second.
    const kick = age === null ? 0 : Math.exp(-age * 8);
    const distance = Math.max(halfHeight / tanV, halfWidth / tanH) * (1 - KICK_PUNCH * kick);
    const shudderX = Math.sin((age ?? 0) * 57) * KICK_SHUDDER * kick;
    const shudderY = Math.cos((age ?? 0) * 43) * KICK_SHUDDER * kick;

    camera.position.set(shudderX, centerY + shudderY + distance * Math.sin(ELEVATION), distance * Math.cos(ELEVATION));
    camera.lookAt(shudderX * 0.5, centerY, 0);
  });
  return null;
}

/** Self-contained 3D view of one box: camera, lighting and the tier-colored model. */
export function BoxStage({
  tier,
  charging = false,
  result,
  onBeat,
  spinning = true,
  inspectable = false,
  accessibilityLabel,
  style,
}: BoxStageProps) {
  // Reduce Motion stops the idle spin and the charge shake; the lid still opens, as it carries the result.
  const reduceMotion = useReducedMotion();
  const [spin] = useState(() => new SpinController());
  const [motion] = useState(() => new BoxMotion());
  const [timeline] = useState(() => new RevealTimeline());
  const seam = useMemo(() => new SeamGlow(tier), [tier]);

  useEffect(() => {
    if (result) timeline.start(result);
    else timeline.reset();
  }, [result, timeline]);

  const drag = usePanGesture({
    // SpinController is a plain JS object, so the callbacks must run on the JS thread, not as worklets.
    runOnJS: true,
    enabled: inspectable,
    // Claim only horizontal drags; vertical ones fail early and fall through to the parent scroll view.
    activeOffsetX: [-8, 8],
    failOffsetY: [-8, 8],
    onActivate: () => spin.grab(),
    onUpdate: (event) => spin.drag(event.translationX),
    onDeactivate: (event) => spin.release(event.velocityX),
  });

  return (
    <GestureDetector gesture={drag}>
      <View
        style={style}
        accessible={accessibilityLabel !== undefined}
        accessibilityRole={accessibilityLabel ? 'image' : undefined}
        accessibilityLabel={accessibilityLabel}
      >
        {/* R3F's canvas claims touches; letting them through keeps parent scrolls, presses and the drag working. */}
        <View style={fill} pointerEvents="none">
          <Canvas frameloop={spinning ? 'always' : 'demand'} camera={{ fov: FOV }}>
            <FitCamera motion={motion} timeline={timeline} reduceMotion={reduceMotion} />
            <BoxLighting tier={tier} />
            <Suspense fallback={null}>
              <Rig
                spin={spin}
                motion={motion}
                timeline={timeline}
                seam={seam}
                spinning={spinning && !reduceMotion}
                charging={charging && !reduceMotion}
                reduceMotion={reduceMotion}
                onBeat={onBeat}
              >
                <BoxModel tier={tier} motion={motion} seam={seam} />
              </Rig>
            </Suspense>
          </Canvas>
        </View>
      </View>
    </GestureDetector>
  );
}

const fill = { flex: 1 };

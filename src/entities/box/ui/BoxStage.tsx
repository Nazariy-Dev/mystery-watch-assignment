import { Canvas, useFrame, useThree } from '@react-three/fiber/native';
import { Suspense, useRef, useState, type ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import { useReducedMotion } from 'react-native-reanimated';
import { MathUtils, type Group, type PerspectiveCamera, type PointLight } from 'three';

import type { Rarity } from '@/shared/api';
import { darkTheme } from '@/shared/theme';

import { BoxMotion } from '../model/motion';
import { SpinController } from '../model/spin';
import { BoxLighting } from './BoxLighting';
import { BoxModel } from './BoxModel';

type BoxStageProps = {
  tier: Rarity;
  /** Springs the lid open; toggling back to false springs it shut. */
  open?: boolean;
  /** Shakes the box with building intensity, for the hold-to-open charge. */
  charging?: boolean;
  /** Color of the light that floods out of the box as the lid opens; defaults to the box tier. */
  glow?: Rarity;
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

type RigProps = {
  spin: SpinController;
  motion: BoxMotion;
  spinning: boolean;
  open: boolean;
  charging: boolean;
  glowColor: string;
  children: ReactNode;
};

// Everything per-frame lives in useFrame on plain objects, so animation never re-renders React.
function Rig({ spin, motion, spinning, open, charging, glowColor, children }: RigProps) {
  const turntable = useRef<Group>(null);
  const shaker = useRef<Group>(null);
  const light = useRef<PointLight>(null);

  useFrame((_, delta) => {
    motion.tick(delta, { open, charging });
    const yaw = spin.tick(delta, spinning, open ? OPEN_YAW : undefined);
    if (turntable.current) turntable.current.rotation.y = yaw;
    if (shaker.current) {
      shaker.current.rotation.z = motion.wobble * 0.05;
      shaker.current.position.x = motion.wobble * 0.02;
    }
    if (light.current) light.current.intensity = Math.max(0, motion.openness) * GLOW_INTENSITY;
  });

  return (
    <group ref={turntable}>
      <group ref={shaker}>
        {children}
        <pointLight ref={light} position={[0, 0.75, 0]} color={glowColor} intensity={0} distance={3} />
      </group>
    </group>
  );
}

const FOV = 30;
const ELEVATION = MathUtils.degToRad(14);
/** Half-extents to keep in view (MODEL.md bounds, padded for rotation): closed box vs fully open lid. */
const CLOSED = { centerY: 0.52, halfHeight: 0.8, halfWidth: 0.82 };
const OPEN = { centerY: 0.92, halfHeight: 1.08, halfWidth: 0.95 };

/**
 * Places the camera so the box fits the canvas in both directions, whatever its aspect ratio.
 * A fixed camera only fits one shape: tall cards cropped the sides and the open lid left the frame.
 */
function FitCamera({ motion }: { motion: BoxMotion }) {
  const camera = useThree((state) => state.camera) as PerspectiveCamera;
  const { width, height } = useThree((state) => state.size);

  useFrame(() => {
    const openness = MathUtils.clamp(motion.openness, 0, 1);
    const centerY = MathUtils.lerp(CLOSED.centerY, OPEN.centerY, openness);
    const halfHeight = MathUtils.lerp(CLOSED.halfHeight, OPEN.halfHeight, openness);
    const halfWidth = MathUtils.lerp(CLOSED.halfWidth, OPEN.halfWidth, openness);
    const tanV = Math.tan(MathUtils.degToRad(FOV / 2));
    const tanH = tanV * (width / height);
    const distance = Math.max(halfHeight / tanV, halfWidth / tanH);

    camera.position.set(0, centerY + distance * Math.sin(ELEVATION), distance * Math.cos(ELEVATION));
    camera.lookAt(0, centerY, 0);
  });
  return null;
}

/** Self-contained 3D view of one box: camera, lighting and the tier-colored model. */
export function BoxStage({
  tier,
  open = false,
  charging = false,
  glow,
  spinning = true,
  inspectable = false,
  accessibilityLabel,
  style,
}: BoxStageProps) {
  // Reduce Motion stops the idle spin and the charge shake; the lid still opens, as it carries the result.
  const reduceMotion = useReducedMotion();
  const [spin] = useState(() => new SpinController());
  const [motion] = useState(() => new BoxMotion());
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
            <FitCamera motion={motion} />
            <BoxLighting tier={tier} />
            <Suspense fallback={null}>
              <Rig
                spin={spin}
                motion={motion}
                spinning={spinning && !reduceMotion}
                open={open}
                charging={charging && !reduceMotion}
                glowColor={darkTheme.rarity[glow ?? tier]}
              >
                <BoxModel tier={tier} motion={motion} />
              </Rig>
            </Suspense>
          </Canvas>
        </View>
      </View>
    </GestureDetector>
  );
}

const fill = { flex: 1 };

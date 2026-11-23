import { Canvas, useFrame, useThree } from '@react-three/fiber/native';
import { Suspense, useRef, useState, type ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import { MathUtils, type Group, type PerspectiveCamera } from 'three';

import type { Rarity } from '@/shared/api';

import { SpinController } from '../model/spin';
import { BoxLighting } from './BoxLighting';
import { BoxModel } from './BoxModel';

type BoxStageProps = {
  tier: Rarity;
  /** 0 = closed, 1 = fully open. */
  openness?: number;
  /** When false the canvas renders on demand only, so off-focus boxes cost no frames. */
  spinning?: boolean;
  /** Horizontal drags turn the box; vertical drags still reach the parent scroll view. */
  inspectable?: boolean;
  style?: StyleProp<ViewStyle>;
};

// Advanced from useFrame, so dragging and spinning never re-render React.
function Spin({ active, spin, children }: { active: boolean; spin: SpinController; children: ReactNode }) {
  const group = useRef<Group>(null);
  useFrame((_, delta) => {
    const yaw = spin.tick(delta, active);
    if (group.current) group.current.rotation.y = yaw;
  });
  return <group ref={group}>{children}</group>;
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
function FitCamera({ openness }: { openness: number }) {
  const camera = useThree((state) => state.camera) as PerspectiveCamera;
  const { width, height } = useThree((state) => state.size);

  useFrame(() => {
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
export function BoxStage({ tier, openness = 0, spinning = true, inspectable = false, style }: BoxStageProps) {
  const [spin] = useState(() => new SpinController());
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
      <View style={style}>
        {/* R3F's canvas claims touches; letting them through keeps parent scrolls, presses and the drag working. */}
        <View style={fill} pointerEvents="none">
          <Canvas
            frameloop={spinning ? 'always' : 'demand'}
            camera={{ fov: FOV }}
          >
            <FitCamera openness={openness} />
            <BoxLighting tier={tier} />
            <Suspense fallback={null}>
              <Spin active={spinning} spin={spin}>
                <BoxModel tier={tier} openness={openness} />
              </Spin>
            </Suspense>
          </Canvas>
        </View>
      </View>
    </GestureDetector>
  );
}

const fill = { flex: 1 };

import { Canvas } from '@react-three/fiber/native';
import { Suspense, type Ref } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import { useReducedMotion } from 'react-native-reanimated';

import type { Rarity } from '@/shared/api';

import { FOV } from '../config/stage';
import { useInspectDrag } from '../lib/inspect-drag';
import { useStageControllers, type BoxStageHandle } from '../lib/stage-controllers';
import type { RevealBeat } from '../model/reveal';
import { BoxLighting } from './BoxLighting';
import { BoxModel } from './BoxModel';
import { FitCamera } from './FitCamera';
import { Rig } from './Rig';

type BoxStageProps = {
  ref?: Ref<BoxStageHandle>;
  tier: Rarity;
  /** Shakes the box with building intensity and heats the seam, for the hold-to-open charge. */
  charging?: boolean;
  /** The won rarity: setting it plays the tease and bursts the lid open; clearing it seals the box again. */
  result?: Rarity;
  /** Fires on each reveal beat, from the render loop, for haptics and for handing over to the result card. */
  onBeat?: (beat: RevealBeat) => void;
  /** Drops the box onto the stage with a bounce and eases the camera in, once, when it first appears. */
  entrance?: boolean;
  /** Fires when the dropping box first hits the ground. */
  onLand?: () => void;
  /** Dust motes drift around the box and gather into it while charging. */
  ambient?: boolean;
  /** When false the canvas renders on demand only, so off-focus boxes cost no frames. */
  spinning?: boolean;
  /** Horizontal drags turn the box; vertical drags still reach the parent scroll view. */
  inspectable?: boolean;
  /** Makes the stage a labelled image for screen readers; omit when a parent already describes the box. */
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

/** Self-contained 3D view of one box: camera, lighting and the tier-colored model. */
export function BoxStage({
  tier,
  charging = false,
  result,
  onBeat,
  entrance = false,
  onLand,
  ambient = false,
  ref,
  spinning = true,
  inspectable = false,
  accessibilityLabel,
  style,
}: BoxStageProps) {
  // Reduce Motion stops the idle spin and the charge shake; the lid still opens, as it carries the result.
  const reduceMotion = useReducedMotion();
  const { spin, motion, timeline, arrival, seam } = useStageControllers({ ref, tier, result, entrance, reduceMotion });
  const drag = useInspectDrag(spin, inspectable);

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
            <FitCamera motion={motion} entrance={arrival} timeline={timeline} reduceMotion={reduceMotion} />
            <BoxLighting tier={tier} />
            <Suspense fallback={null}>
              <Rig
                spin={spin}
                motion={motion}
                entrance={arrival}
                ambient={ambient}
                onLand={onLand}
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

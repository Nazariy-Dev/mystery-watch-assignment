import { useEffect } from 'react';
import { cancelAnimation, Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

import { CLOSED_FRAME } from '../config/stage';

const REVEAL_MS = 350;
const FLASH_MS = 520;
const BREATH_MS = 900;
/** How far below its resting spot the box starts as it rises in, in points. */
const RISE = 16;
/** Closed box extents from MODEL.md, in model units. */
const BOX_WIDTH = 1.12;
const BOX_HEIGHT = 1.1166;

/**
 * Drives a stage's loading state: the placeholder breathes until the canvas reports its first frame,
 * then the canvas fades and rises in over a flash. `shown` goes 0 → 1 with the reveal, `flash` 0 → 1 once.
 */
export function useStageReveal(reduceMotion: boolean) {
  const shown = useSharedValue(0);
  const breath = useSharedValue(0);
  const flash = useSharedValue(0);

  useEffect(() => {
    breath.value = reduceMotion
      ? 0.5
      : withRepeat(withTiming(1, { duration: BREATH_MS, easing: Easing.inOut(Easing.sin) }), -1, true);
    return () => cancelAnimation(breath);
  }, [breath, reduceMotion]);

  const onReady = () => {
    shown.value = withTiming(1, { duration: REVEAL_MS, easing: Easing.out(Easing.cubic) }, (finished) => {
      if (finished) cancelAnimation(breath);
    });
    if (!reduceMotion) flash.value = withTiming(1, { duration: FLASH_MS, easing: Easing.out(Easing.quad) });
  };

  const canvasStyle = useAnimatedStyle(() => ({
    opacity: shown.value,
    transform: [{ translateY: reduceMotion ? 0 : (1 - shown.value) * RISE }],
  }));

  return { shown, breath, flash, onReady, canvasStyle };
}

/**
 * Where the closed box will be drawn in a canvas of this size, in points: its middle and its width.
 * Mirrors FitCamera's fit, ignoring the slight camera tilt, which is close enough for a placeholder.
 */
export function placeholderFrame(width: number, height: number) {
  const visibleHalfHeight = Math.max(CLOSED_FRAME.halfHeight, (CLOSED_FRAME.halfWidth * height) / width);
  const pointsPerUnit = height / 2 / visibleHalfHeight;
  return {
    centerX: width / 2,
    centerY: height / 2 - (BOX_HEIGHT / 2 - CLOSED_FRAME.centerY) * pointsPerUnit,
    height,
    boxWidth: BOX_WIDTH * pointsPerUnit,
  };
}

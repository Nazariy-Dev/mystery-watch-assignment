import { useEffect } from 'react';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

import { easedRadialGradient } from '../lib/eased-gradient';

/** Clear center easing out to dark edges; the eased stops keep the falloff smooth and free of banding. */
const VIGNETTE = easedRadialGradient({
  from: 'rgba(5, 5, 14, 0)',
  to: 'rgba(5, 5, 14, 1)',
  start: 0.32,
  end: 0.88,
  shape: 'ellipse farthest-corner at center',
});

/**
 * Darkens the screen edges to pull focus onto the box. `strength` 0…1 is approached over `durationMs`,
 * so it can creep in with the hold and lift quickly afterwards.
 */
export function Vignette({ strength, durationMs }: { strength: number; durationMs: number }) {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(strength, { duration: durationMs, easing: Easing.inOut(Easing.quad) });
  }, [opacity, strength, durationMs]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return <Animated.View pointerEvents="none" style={[styles.layer, style]} />;
}

const styles = StyleSheet.create({
  layer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundImage: VIGNETTE,
  },
});

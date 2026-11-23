import { useEffect } from 'react';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

/** Smoothstep falloff from a clear center to dark edges; many stops along the curve keep it free of banding. */
const SMOOTHSTEP_STOPS = Array.from({ length: 11 }, (_, i) => {
  const t = i / 10;
  const alpha = t * t * (3 - 2 * t);
  return `rgba(5, 5, 14, ${alpha.toFixed(3)}) ${(32 + 56 * t).toFixed(1)}%`;
}).join(', ');

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
    backgroundImage: `radial-gradient(ellipse farthest-corner at center, ${SMOOTHSTEP_STOPS})`,
  },
});

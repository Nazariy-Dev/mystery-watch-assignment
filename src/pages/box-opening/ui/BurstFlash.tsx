import { useEffect } from 'react';
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

/**
 * A white full-screen flash that plays once on mount, timed to the lid bursting open.
 * `strength` (0…1) is its peak opacity, so rarer results flash harder. Skipped under Reduce Motion.
 */
export function BurstFlash({ strength }: { strength: number }) {
  const flash = useSharedValue(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) return;
    flash.value = withSequence(withTiming(strength, { duration: 50 }), withTiming(0, { duration: 650, easing: Easing.out(Easing.cubic) }));
  }, [flash, strength, reduceMotion]);

  const flashStyle = useAnimatedStyle(() => ({ opacity: flash.value }));

  return <Animated.View pointerEvents="none" style={[styles.flash, flashStyle]} />;
}

const styles = StyleSheet.create({
  flash: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: '#FFFFFF',
  },
});

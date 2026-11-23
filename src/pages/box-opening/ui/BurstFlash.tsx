import { useEffect } from 'react';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

/** A white full-screen flash that plays once on mount, timed to the lid bursting open. */
export function BurstFlash() {
  const flash = useSharedValue(0);

  useEffect(() => {
    flash.value = withSequence(withTiming(0.85, { duration: 50 }), withTiming(0, { duration: 650, easing: Easing.out(Easing.cubic) }));
  }, [flash]);

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

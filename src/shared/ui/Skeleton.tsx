import { useEffect } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

/** Placeholder block that breathes while content loads; size and shape come from `style`. Still under Reduce Motion. */
export function Skeleton({ style }: { style?: StyleProp<ViewStyle> }) {
  const reduceMotion = useReducedMotion();
  const pulse = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    pulse.value = withRepeat(withTiming(1, { duration: 900, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [pulse, reduceMotion]);

  const pulseStyle = useAnimatedStyle(() => ({ opacity: 0.45 + pulse.value * 0.4 }));

  return <Animated.View style={[styles.block, style, pulseStyle]} />;
}

const styles = StyleSheet.create((theme) => ({
  block: {
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surfaceRaised,
  },
}));

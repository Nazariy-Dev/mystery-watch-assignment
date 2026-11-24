import Animated, { interpolate, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

type CarouselDotProps = {
  index: number;
  snap: number;
  scrollX: SharedValue<number>;
};

/** A page dot that stretches into a violet pill as its card scrolls into focus, tracking the swipe frame by frame. */
export function CarouselDot({ index, snap, scrollX }: CarouselDotProps) {
  const dotStyle = useAnimatedStyle(() => {
    const closeness = interpolate(Math.abs(scrollX.value / snap - index), [0, 1], [1, 0], 'clamp');
    return { width: 8 + closeness * 16 };
  });

  const fillStyle = useAnimatedStyle(() => ({
    opacity: interpolate(Math.abs(scrollX.value / snap - index), [0, 1], [1, 0], 'clamp'),
  }));

  return (
    <Animated.View style={[styles.dot, dotStyle]}>
      <Animated.View style={[styles.fill, fillStyle]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create((theme) => ({
  dot: {
    height: 8,
    borderRadius: theme.radius.pill,
    overflow: 'hidden',
    backgroundColor: theme.colors.border,
  },
  fill: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: theme.colors.primary,
  },
}));

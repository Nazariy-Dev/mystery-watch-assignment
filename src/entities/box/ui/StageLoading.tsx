import { useState } from 'react';
import { View, type LayoutChangeEvent } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

import type { Rarity } from '@/shared/api';
import { easedRadialGradient } from '@/shared/lib';

import { placeholderFrame } from '../lib/stage-reveal';

/** Where each halo's gradient has faded out, as a fraction of its radius. */
const GLOW_END = 0.7;
const FLASH_END = 0.6;
/** Scale ranges the halos animate through; the largest decides how big they may be drawn. */
const GLOW_SCALE = { from: 0.9, to: 1.05 };
const FLASH_SCALE = { from: 0.8, to: 1.1 };

type StageLoadingProps = {
  tier: Rarity;
  shown: SharedValue<number>;
  breath: SharedValue<number>;
  flash: SharedValue<number>;
  /** Free points around the canvas the halos may spread into. */
  space: number;
};

/** Sits behind the canvas: a breathing tier glow where the box will stand, then a flash as it appears. */
export function StageLoading({ tier, shown, breath, flash, space }: StageLoadingProps) {
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setSize({ width, height });
  };

  const glowStyle = useAnimatedStyle(() => ({
    opacity: (0.45 + 0.55 * breath.value) * (1 - shown.value),
    transform: [{ scale: GLOW_SCALE.from + (GLOW_SCALE.to - GLOW_SCALE.from) * breath.value }],
  }));
  const flashStyle = useAnimatedStyle(() => ({
    opacity: interpolate(flash.value, [0, 0.25, 1], [0, 0.9, 0]),
    transform: [{ scale: FLASH_SCALE.from + (FLASH_SCALE.to - FLASH_SCALE.from) * flash.value }],
  }));

  const frame = size && placeholderFrame(size.width, size.height);
  // Scroll views clip their content, so each halo is kept small enough that its faded edge stays inside the canvas
  // plus the free space around it, even at the largest scale it animates to.
  const room = frame ? 2 * (Math.min(frame.centerY, frame.height - frame.centerY) + space) : 0;

  return (
    <View pointerEvents="none" style={styles.layer} onLayout={onLayout}>
      {frame && (
        <>
          <Animated.View style={[styles.glow(tier), circle(Math.min(frame.boxWidth * 2.1, room / (GLOW_END * GLOW_SCALE.to)), frame), glowStyle]} />
          <Animated.View style={[styles.flash(tier), circle(Math.min(frame.boxWidth * 2.4, room / (FLASH_END * FLASH_SCALE.to)), frame), flashStyle]} />
        </>
      )}
    </View>
  );
}

const circle = (diameter: number, { centerX, centerY }: { centerX: number; centerY: number }) => ({
  width: diameter,
  height: diameter,
  left: centerX - diameter / 2,
  top: centerY - diameter / 2,
});

const styles = StyleSheet.create((theme) => ({
  layer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  glow: (tier: Rarity) => ({
    position: 'absolute',
    backgroundImage: easedRadialGradient({
      from: `${theme.rarity[tier]}55`,
      to: `${theme.rarity[tier]}00`,
      end: GLOW_END,
      shape: 'circle closest-side',
    }),
  }),
  flash: (tier: Rarity) => ({
    position: 'absolute',
    backgroundImage: easedRadialGradient({
      from: `${theme.rarity[tier]}CC`,
      to: `${theme.rarity[tier]}00`,
      end: FLASH_END,
      shape: 'circle closest-side',
    }),
  }),
}));

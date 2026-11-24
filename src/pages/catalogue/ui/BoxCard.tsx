import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

import { BoxStage } from '@/entities/box';
import type { Box, Rarity } from '@/shared/api';
import { easedRadialGradient } from '@/shared/lib';
import { CoinIcon, Text, Touchable } from '@/shared/ui';

type BoxCardProps = {
  box: Box;
  index: number;
  /** Card width plus gap; one snap step of the carousel. */
  snap: number;
  width: number;
  scrollX: SharedValue<number>;
  /** Mounts the live 3D canvas; only cards near focus get one to cap GL contexts. */
  hasStage: boolean;
  focused: boolean;
  onPress: () => void;
};

const SCROLL_PRESS_DELAY_MS = 100;
const BOB_MS = 2400;
const BOB_HEIGHT = 8;

/** A box floating in open space with its rarity, name and price; it tilts and sinks away as the carousel moves on. */
export function BoxCard({ box, index, snap, width, scrollX, hasStage, focused, onPress }: BoxCardProps) {
  const reduceMotion = useReducedMotion();
  const bob = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    bob.value = withRepeat(withTiming(1, { duration: BOB_MS, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [bob, reduceMotion]);

  // -1 when the card sits one step to the left of focus, 0 in focus, 1 one step to the right.
  const offset = useDerivedValue(() =>
    interpolate(scrollX.value, [(index - 1) * snap, index * snap, (index + 1) * snap], [1, 0, -1], 'clamp'),
  );

  const floatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -bob.value * BOB_HEIGHT }],
  }));

  const stageStyle = useAnimatedStyle(() => {
    const o = offset.value;
    const away = Math.abs(o);
    return {
      opacity: 1 - away * 0.6,
      transform: [
        { perspective: 800 },
        { translateY: away * 40 },
        { rotateY: `${o * -35}deg` },
        { scale: 1 - away * 0.3 },
      ],
    };
  });

  // The text leads the box out and trails it in, so the two layers separate mid-swipe.
  const infoStyle = useAnimatedStyle(() => {
    const o = offset.value;
    return {
      opacity: interpolate(Math.abs(o), [0, 0.5], [1, 0], 'clamp'),
      transform: [{ translateX: o * 60 }],
    };
  });

  return (
    <Animated.View style={[styles.card, { width }, floatStyle]}>
      <Touchable
        accessibilityRole="button"
        accessibilityLabel={`${box.name}, ${box.tier}, ${box.price} coins`}
        // A swipe through the carousel starts on a card; the delay keeps it from clicking.
        unstable_pressDelay={SCROLL_PRESS_DELAY_MS}
        onPress={onPress}
        style={({ pressed }) => [styles.touch, pressed && styles.pressed]}
      >
        <Animated.View style={[styles.space, stageStyle]}>
          <View pointerEvents="none" style={styles.glow(box.tier)} />
          {hasStage ? <BoxStage tier={box.tier} spinning={focused} style={styles.stage} /> : <View style={styles.stage} />}
        </Animated.View>
        <Animated.View style={[styles.info, infoStyle]}>
          <View style={styles.rarityChip(box.tier)}>
            <View style={styles.rarityDot(box.tier)} />
            <Text variant="label" style={styles.rarityText(box.tier)}>{box.tier}</Text>
          </View>
          <Text variant="title" style={styles.name}>{box.name}</Text>
          <View style={styles.price}>
            <CoinIcon size={20} />
            <Text variant="title" tone="coin">{box.price.toLocaleString('en-US')}</Text>
          </View>
        </Animated.View>
      </Touchable>
    </Animated.View>
  );
}

const styles = StyleSheet.create((theme) => ({
  card: {
    height: '100%',
  },
  touch: {
    flex: 1,
  },
  pressed: {
    transform: [{ scale: 0.97 }],
  },
  space: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // A pool of the tier's light the box hovers in; edgeless, so nothing reads as a card boundary.
  glow: (tier: Rarity) => ({
    position: 'absolute',
    width: '120%',
    aspectRatio: 1,
    backgroundImage: easedRadialGradient({
      from: `${theme.rarity[tier]}38`,
      to: `${theme.rarity[tier]}00`,
      end: 0.7,
      shape: 'circle',
    }),
  }),
  // Inset from the sides: the camera fits the box to its canvas, so a narrower canvas draws a smaller box.
  stage: {
    alignSelf: 'stretch',
    flex: 1,
    minHeight: 160,
    marginHorizontal: theme.gap(10),
  },
  info: {
    alignItems: 'center',
    gap: theme.gap(2),
    paddingBottom: theme.gap(2),
  },
  rarityChip: (tier: Rarity) => ({
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.gap(2),
    paddingHorizontal: theme.gap(3),
    paddingVertical: theme.gap(1),
    borderRadius: theme.radius.pill,
    backgroundColor: `${theme.rarity[tier]}1F`,
    borderWidth: 1,
    borderColor: `${theme.rarity[tier]}55`,
  }),
  rarityDot: (tier: Rarity) => ({
    width: 8,
    height: 8,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.rarity[tier],
  }),
  rarityText: (tier: Rarity) => ({
    color: theme.rarity[tier],
  }),
  name: {
    textAlign: 'center',
  },
  price: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.gap(2),
  },
}));

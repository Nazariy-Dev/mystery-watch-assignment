import Ionicons from '@expo/vector-icons/Ionicons';
import { View } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import { StyleSheet, withUnistyles } from 'react-native-unistyles';

import { BoxStage } from '@/entities/box';
import type { Box } from '@/shared/api';
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
const ThemedIcon = withUnistyles(Ionicons, (theme) => ({ color: theme.colors.textMuted }));

export function BoxCard({ box, index, snap, width, scrollX, hasStage, focused, onPress }: BoxCardProps) {
  const variantStyles = styles.useVariants({ tier: box.tier });

  const range = [(index - 1) * snap, index * snap, (index + 1) * snap];
  const scaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(scrollX.value, range, [0.9, 1, 0.9], 'clamp') }],
  }));
  // Side cards fade via an overlay, not opacity: a translucent view on Android shows its own elevation shadow through itself.
  const dimStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollX.value, range, [0.5, 0, 0.5], 'clamp'),
  }));

  return (
    <Animated.View style={[{ width }, scaleStyle]}>
      <Touchable
        accessibilityRole="button"
        accessibilityLabel={`${box.name}, ${box.tier}, ${box.price} coins`}
        // A swipe through the carousel starts on a card; the delay keeps it from clicking.
        unstable_pressDelay={SCROLL_PRESS_DELAY_MS}
        onPress={onPress}
        style={({ pressed }) => [variantStyles.card, pressed && styles.pressed]}
      >
        <View style={variantStyles.chip}>
          <Text variant="label" style={variantStyles.chipLabel}>{box.tier}</Text>
        </View>
        {hasStage ? <BoxStage tier={box.tier} spinning={focused} style={styles.stage} /> : <View style={styles.stage} />}
        <View style={styles.info}>
          <Text variant="title">{box.name}</Text>
          <Text variant="caption" tone="muted" numberOfLines={1}>{box.tagline}</Text>
          <View style={styles.footer}>
            <View style={styles.price}>
              <CoinIcon size={20} />
              <Text variant="title" tone="coin">{box.price.toLocaleString('en-US')}</Text>
            </View>
            <ThemedIcon name="arrow-forward-circle" size={28} />
          </View>
        </View>
      </Touchable>
      <Animated.View style={[styles.dim, dimStyle]} pointerEvents="none" />
    </Animated.View>
  );
}

const styles = StyleSheet.create((theme) => ({
  card: {
    flex: 1,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
    borderWidth: 1.5,
    padding: theme.gap(4),
    shadowOpacity: 0.45,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 3 },
    elevation: 8,
    variants: {
      tier: {
        common: { borderColor: `${theme.rarity.common}55`, shadowColor: theme.rarity.common },
        rare: { borderColor: `${theme.rarity.rare}66`, shadowColor: theme.rarity.rare },
        epic: { borderColor: `${theme.rarity.epic}66`, shadowColor: theme.rarity.epic },
        legendary: { borderColor: `${theme.rarity.legendary}77`, shadowColor: theme.rarity.legendary },
      },
    },
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
  dim: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.background,
  },
  chip: {
    alignSelf: 'flex-start',
    paddingHorizontal: theme.gap(3),
    paddingVertical: theme.gap(1),
    borderRadius: theme.radius.pill,
    variants: {
      tier: {
        common: { backgroundColor: `${theme.rarity.common}22` },
        rare: { backgroundColor: `${theme.rarity.rare}22` },
        epic: { backgroundColor: `${theme.rarity.epic}22` },
        legendary: { backgroundColor: `${theme.rarity.legendary}22` },
      },
    },
  },
  chipLabel: {
    variants: {
      tier: {
        common: { color: theme.rarity.common },
        rare: { color: theme.rarity.rare },
        epic: { color: theme.rarity.epic },
        legendary: { color: theme.rarity.legendary },
      },
    },
  },
  stage: {
    flex: 1,
    minHeight: 220,
  },
  info: {
    gap: theme.gap(1),
  },
  footer: {
    marginTop: theme.gap(2),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.gap(2),
  },
}));

import Ionicons from '@expo/vector-icons/Ionicons';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { WatchImage } from '@/entities/watch';
import type { Box } from '@/shared/api';
import { easedRadialGradient } from '@/shared/lib';
import { Text, Touchable } from '@/shared/ui';

/** Hero promo for the priciest box, selling its best prize; tapping anywhere opens the box. */
export function PromoBanner({ box, onPress }: { box: Box; onPress: () => void }) {
  const prize = box.contents.reduce((best, content) => (content.watch.value > best.watch.value ? content : best));

  return (
    <Touchable
      accessibilityRole="button"
      accessibilityLabel={`${box.name}: ${prize.chance} percent chance at a ${prize.watch.name}. Open box`}
      onPress={onPress}
      style={({ pressed }) => [styles.banner, pressed && styles.pressed]}
    >
      <View style={styles.glow} />
      <WatchImage watch={prize.watch} style={styles.watch} />
      <Ionicons name="sparkles" size={22} color="#FFFFFF" style={styles.sparkle} />
      <View style={styles.copy}>
        <View style={styles.badge}>
          <Text variant="label" style={styles.badgeText}>Hot drop</Text>
        </View>
        <Text variant="title" style={styles.title}>{box.name}</Text>
        <Text variant="caption" style={styles.subtitle}>
          {prize.chance}% chance at a {prize.watch.name}
        </Text>
        <View style={styles.cta}>
          <Text variant="caption" style={styles.ctaText}>Open box</Text>
        </View>
      </View>
    </Touchable>
  );
}

const styles = StyleSheet.create((theme) => ({
  banner: {
    height: 168,
    padding: theme.gap(5),
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    backgroundImage: `linear-gradient(135deg, ${theme.colors.promo} 0%, ${theme.colors.primary} 100%)`,
    boxShadow: 'inset 0 2px 0 rgba(255, 255, 255, 0.3)',
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
  glow: {
    position: 'absolute',
    right: -60,
    top: -30,
    width: 260,
    height: 260,
    backgroundImage: easedRadialGradient({ from: 'rgba(255, 255, 255, 0.45)', to: 'rgba(255, 255, 255, 0)', end: 0.7, shape: 'circle' }),
  },
  watch: {
    position: 'absolute',
    right: -4,
    top: -6,
    // Absolutely positioned, so both sides must be set; aspectRatio alone resolves to zero width here.
    width: 126,
    height: 190,
    transform: [{ rotate: '14deg' }],
  },
  sparkle: {
    position: 'absolute',
    right: 118,
    top: 22,
  },
  copy: {
    flex: 1,
    width: '62%',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  badge: {
    paddingHorizontal: theme.gap(2),
    paddingVertical: 2,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.coin,
  },
  badgeText: {
    color: theme.colors.background,
  },
  title: {
    color: theme.colors.onPrimary,
    textTransform: 'uppercase',
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.85)',
  },
  cta: {
    paddingHorizontal: theme.gap(4),
    paddingVertical: theme.gap(2),
    borderRadius: theme.radius.pill,
    backgroundColor: '#FFFFFF',
    boxShadow: 'inset 0 -3px 0 rgba(0, 0, 0, 0.12)',
  },
  ctaText: {
    color: theme.colors.background,
    fontFamily: theme.fonts.display,
    fontWeight: theme.fontWeight.bold,
  },
}));

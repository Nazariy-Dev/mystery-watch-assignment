import * as Haptics from 'expo-haptics';
import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { Easing, FadeInDown, useReducedMotion, withDelay, withTiming } from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

import type { Rarity, Watch } from '@/shared/api';
import { CoinIcon, Text } from '@/shared/ui';

const STAMP_DELAY_MS = 650;

/** Slams the word down from oversized to its place, like a stamp hitting paper. */
const stampIn = () => {
  'worklet';
  return {
    initialValues: { opacity: 0, transform: [{ scale: 2.8 }] },
    animations: {
      opacity: withDelay(STAMP_DELAY_MS, withTiming(1, { duration: 90 })),
      transform: [{ scale: withDelay(STAMP_DELAY_MS, withTiming(1, { duration: 260, easing: Easing.out(Easing.back(2)) })) }],
    },
  };
};

/** Rarity, name, brand and value of the won watch; a legendary gets its rarity stamped down with a thud. */
export function RevealDetails({ watch }: { watch: Watch }) {
  const reduceMotion = useReducedMotion();
  const legendary = watch.rarity === 'legendary';

  useEffect(() => {
    if (!legendary) return;
    const timer = setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid), STAMP_DELAY_MS + 150);
    return () => clearTimeout(timer);
  }, [legendary]);

  return (
    <Animated.View entering={FadeInDown.delay(350).duration(400)} style={styles.details}>
      {legendary ? (
        <Animated.Text entering={reduceMotion ? undefined : stampIn} style={styles.stamp}>
          {watch.rarity}
        </Animated.Text>
      ) : (
        <Text variant="label" style={styles.rarity(watch.rarity)}>{watch.rarity}</Text>
      )}
      <Text variant="display" style={styles.center}>{watch.name}</Text>
      <Text tone="muted">{watch.brand}</Text>
      <View style={styles.value}>
        <CoinIcon size={18} />
        <Text variant="title" tone="coin">{watch.value.toLocaleString('en-US')}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create((theme) => ({
  details: {
    alignItems: 'center',
    gap: theme.gap(1),
    marginBottom: theme.gap(6),
  },
  rarity: (rarity: Rarity) => ({
    color: theme.rarity[rarity],
  }),
  stamp: {
    fontFamily: theme.fonts.display,
    fontWeight: theme.fontWeight.bold,
    fontSize: 20,
    letterSpacing: 4,
    textTransform: 'uppercase',
    color: theme.rarity.legendary,
    paddingHorizontal: theme.gap(3),
    paddingVertical: theme.gap(1),
    marginBottom: theme.gap(1),
    borderWidth: 2,
    borderColor: theme.rarity.legendary,
    borderRadius: theme.radius.sm,
    textShadowColor: theme.rarity.legendary,
    textShadowRadius: 12,
  },
  center: {
    textAlign: 'center',
  },
  value: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.gap(2),
    marginTop: theme.gap(2),
  },
}));

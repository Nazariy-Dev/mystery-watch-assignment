import * as Haptics from 'expo-haptics';
import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

import { WatchImage } from '@/entities/watch';
import type { OwnedItem, Rarity } from '@/shared/api';
import { Button, CoinIcon, Text } from '@/shared/ui';

type RevealOverlayProps = {
  item: OwnedItem;
  canOpenAnother: boolean;
  selling: boolean;
  error: string | null;
  onKeep: () => void;
  onSell: () => void;
  onOpenAnother: () => void;
};

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

export function RevealOverlay({ item, canOpenAnother, selling, error, onKeep, onSell, onOpenAnother }: RevealOverlayProps) {
  const { watch } = item;
  const pulse = useSharedValue(0);
  const reduceMotion = useReducedMotion();
  const legendary = watch.rarity === 'legendary';

  useEffect(() => {
    if (!legendary) return;
    const timer = setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid), STAMP_DELAY_MS + 150);
    return () => clearTimeout(timer);
  }, [legendary]);

  useEffect(() => {
    if (reduceMotion) return;
    pulse.value = withRepeat(withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [pulse, reduceMotion]);

  const haloStyle = useAnimatedStyle(() => ({
    opacity: 0.55 + pulse.value * 0.35,
    transform: [{ scale: 0.92 + pulse.value * 0.12 }],
  }));

  return (
    <Animated.View entering={FadeIn.duration(350)} style={styles.backdrop}>
      <View style={styles.showcase}>
        <Animated.View style={[styles.halo(watch.rarity), haloStyle]} />
        <Animated.View entering={ZoomIn.delay(150).duration(500).easing(Easing.out(Easing.cubic))}>
          <WatchImage watch={watch} style={styles.watch} />
        </Animated.View>
      </View>
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
      <Animated.View entering={FadeInDown.delay(550).duration(400)} style={styles.actions}>
        {error && <Text variant="caption" style={styles.error}>{error}</Text>}
        <Button label="Keep it" onPress={onKeep} disabled={selling} />
        <View style={styles.row}>
          <View style={styles.cell}>
            <Button
              label={selling ? 'Selling…' : `Sell ${watch.value.toLocaleString('en-US')}`}
              variant="secondary"
              onPress={onSell}
              disabled={selling}
            />
          </View>
          {canOpenAnother && (
            <View style={styles.cell}>
              <Button label="Open again" variant="secondary" onPress={onOpenAnother} disabled={selling} />
            </View>
          )}
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  backdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: `${theme.colors.background}F0`,
    paddingTop: rt.insets.top + theme.gap(6),
    paddingBottom: rt.insets.bottom + theme.gap(3),
    paddingHorizontal: theme.gap(4),
  },
  showcase: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  halo: (rarity: Rarity) => ({
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: `${theme.rarity[rarity]}33`,
    shadowColor: theme.rarity[rarity],
    shadowOpacity: 0.9,
    shadowRadius: 60,
    shadowOffset: { width: 0, height: 0 },
    elevation: 24,
  }),
  watch: {
    height: 300,
  },
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
    fontWeight: theme.fontWeight.extraBold,
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
  actions: {
    gap: theme.gap(3),
  },
  row: {
    flexDirection: 'row',
    gap: theme.gap(3),
  },
  cell: {
    flex: 1,
  },
  error: {
    color: theme.colors.danger,
    textAlign: 'center',
  },
}));

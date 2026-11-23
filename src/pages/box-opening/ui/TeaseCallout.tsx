import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withSequence, withTiming, ZoomIn } from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

import type { Rarity } from '@/shared/api';

export type TeaseStep = { rarity: Rarity; final: boolean; count: number };

/** Full-screen color flash plus the rarity name punching in, once per tease step. */
export function TeaseCallout({ step }: { step: TeaseStep }) {
  const flash = useSharedValue(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    // Repeated full-screen flashes are exactly what Reduce Motion asks to avoid; the colored name still shows.
    if (reduceMotion) return;
    flash.value = withSequence(withTiming(0.35, { duration: 60 }), withTiming(0, { duration: 500, easing: Easing.out(Easing.quad) }));
  }, [flash, step.count, reduceMotion]);

  const flashStyle = useAnimatedStyle(() => ({ opacity: flash.value }));

  return (
    <View style={styles.layer} pointerEvents="none">
      <Animated.View style={[styles.flash(step.rarity), flashStyle]} />
      <View style={styles.callout}>
        {/* Keyed by step so each one remounts and punches in again. */}
        <Animated.Text
          key={step.count}
          entering={ZoomIn.duration(260).easing(Easing.out(Easing.back(2.5)))}
          style={[styles.name(step.rarity), step.final && styles.final]}
        >
          {step.rarity}
          {step.final ? '!' : '…'}
        </Animated.Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  layer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  flash: (rarity: Rarity) => ({
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: theme.rarity[rarity],
  }),
  callout: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: '22%',
    alignItems: 'center',
  },
  name: (rarity: Rarity) => ({
    fontFamily: theme.fonts.display,
    fontWeight: theme.fontWeight.extraBold,
    fontSize: 34,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: theme.rarity[rarity],
    textShadowColor: theme.rarity[rarity],
    textShadowRadius: 18,
  }),
  final: {
    fontSize: 42,
  },
}));

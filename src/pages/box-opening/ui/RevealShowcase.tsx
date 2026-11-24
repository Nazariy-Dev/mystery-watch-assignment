import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming, ZoomIn } from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

import { WatchImage } from '@/entities/watch';
import type { Rarity, Watch } from '@/shared/api';

import { easedRadialGradient } from '../lib/eased-gradient';

/** The won watch zooming in over a slowly breathing halo in its rarity color. */
export function RevealShowcase({ watch }: { watch: Watch }) {
  const pulse = useSharedValue(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) return;
    pulse.value = withRepeat(withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [pulse, reduceMotion]);

  const haloStyle = useAnimatedStyle(() => ({
    opacity: 0.55 + pulse.value * 0.35,
    transform: [{ scale: 0.92 + pulse.value * 0.12 }],
  }));

  return (
    <View style={styles.showcase}>
      <Animated.View style={[styles.halo(watch.rarity), haloStyle]} />
      <Animated.View entering={ZoomIn.delay(150).duration(500).easing(Easing.out(Easing.cubic))}>
        <WatchImage watch={watch} style={styles.watch} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  showcase: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  halo: (rarity: Rarity) => ({
    position: 'absolute',
    width: 440,
    height: 440,
    // Full strength in the middle, eased out to nothing by 70% of the default farthest-corner radius, which is
    // exactly the inscribed circle: the glow is round and edgeless without a clipping borderRadius.
    // No shadow or elevation: both trace the view's outline and would bring a hard edge back.
    backgroundImage: easedRadialGradient({
      from: `${theme.rarity[rarity]}99`,
      to: `${theme.rarity[rarity]}00`,
      end: 0.7,
      shape: 'circle',
    }),
  }),
  watch: {
    height: 300,
  },
}));

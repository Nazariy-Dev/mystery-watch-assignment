import * as SplashScreen from 'expo-splash-screen';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';
import { scheduleOnRN } from 'react-native-worklets';

import { easedRadialGradient } from '@/shared/lib';

/** Must equal `imageWidth` of the expo-splash-screen plugin in app.json, so the native splash hands over without a jump. */
const LOGO_SIZE = 200;
const SPLASH_ICON = require('../../../assets/app/splash-icon.png');
const GLOW_MS = 650;
const HOLD_MS = 150;
const EXIT_MS = 400;

/**
 * Picks up from the native splash with the same logo in the same spot, makes it glow and pop, then fades
 * into the app. Calls `onDone` once it is fully transparent, so the parent can unmount it.
 */
export function SplashIntro({ onDone }: { onDone: () => void }) {
  const reduceMotion = useReducedMotion();
  const glow = useSharedValue(0);
  const exit = useSharedValue(0);

  // The native splash stays up until this view has drawn the identical frame underneath it.
  const onLayout = () => {
    SplashScreen.hideAsync();
    const finish = (finished?: boolean) => {
      'worklet';
      if (finished) scheduleOnRN(onDone);
    };
    if (reduceMotion) {
      exit.value = withTiming(1, { duration: 250 }, finish);
      return;
    }
    glow.value = withTiming(1, { duration: GLOW_MS, easing: Easing.out(Easing.cubic) });
    exit.value = withDelay(GLOW_MS + HOLD_MS, withTiming(1, { duration: EXIT_MS, easing: Easing.in(Easing.cubic) }, finish));
  };

  const layerStyle = useAnimatedStyle(() => ({ opacity: 1 - exit.value }));
  const logoStyle = useAnimatedStyle(() => ({
    // Overshoots a little as the glow peaks, then swells away as the app shows through.
    transform: [{ scale: interpolate(glow.value, [0, 0.6, 1], [1, 1.1, 1.05]) + exit.value * 0.35 }],
  }));
  const haloStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
    transform: [{ scale: 0.6 + glow.value * 0.5 + exit.value * 0.4 }],
  }));

  return (
    <Animated.View style={[styles.layer, layerStyle]} onLayout={onLayout}>
      <Animated.View style={[styles.halo, haloStyle]} />
      <Animated.Image source={SPLASH_ICON} style={[styles.logo, logoStyle]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create((theme) => ({
  layer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
  },
  halo: {
    position: 'absolute',
    width: 420,
    height: 420,
    backgroundImage: easedRadialGradient({
      from: `${theme.colors.primary}55`,
      to: `${theme.colors.primary}00`,
      end: 0.7,
      shape: 'circle',
    }),
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },
}));

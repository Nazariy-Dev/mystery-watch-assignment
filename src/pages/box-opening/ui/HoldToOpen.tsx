import * as Haptics from 'expo-haptics';
import { useEffect, useRef } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';
import { scheduleOnRN } from 'react-native-worklets';

type HoldToOpenProps = {
  label: string;
  disabled: boolean;
  /** Fires on press-in (true) and on an early release (false); not after a completed hold. */
  onChargingChange: (charging: boolean) => void;
  /** Fires once the button has been held for the full charge. */
  onComplete: () => void;
};

const HOLD_MS = 1200;
const HAPTIC_TICK_MS = 110;

/** A button that fills while held; letting go early drains it and nothing happens. Remount it (via `key`) to reset. */
export function HoldToOpen({ label, disabled, onChargingChange, onComplete }: HoldToOpenProps) {
  const progress = useSharedValue(0);
  const ticker = useRef<ReturnType<typeof setInterval>>(null);

  const stopHaptics = () => {
    if (ticker.current) clearInterval(ticker.current);
    ticker.current = null;
  };

  useEffect(() => stopHaptics, []);

  const complete = () => {
    stopHaptics();
    onComplete();
  };

  const onPressIn = () => {
    onChargingChange(true);
    progress.value = withTiming(1, { duration: HOLD_MS, easing: Easing.in(Easing.quad) }, (finished) => {
      if (finished) scheduleOnRN(complete);
    });
    // Taps get heavier as the charge builds, so the hold feels like it is straining the lid.
    let ticks = 0;
    ticker.current = setInterval(() => {
      ticks += 1;
      const style =
        ticks < 4 ? Haptics.ImpactFeedbackStyle.Light : ticks < 8 ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Heavy;
      Haptics.impactAsync(style);
    }, HAPTIC_TICK_MS);
  };

  const onPressOut = () => {
    stopHaptics();
    if (progress.value >= 1) return;
    progress.value = withTiming(0, { duration: 250 });
    onChargingChange(false);
  };

  const fillStyle = useAnimatedStyle(() => ({ width: `${progress.value * 100}%` }));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint="Opens the box and spends the coins"
      accessibilityState={{ disabled }}
      // Screen-reader users can't easily hold, so their activate gesture opens straight away.
      accessibilityActions={[{ name: 'activate' }]}
      onAccessibilityAction={(event) => {
        if (event.nativeEvent.actionName !== 'activate' || disabled) return;
        progress.value = 1;
        complete();
      }}
      disabled={disabled}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={[styles.track, disabled && styles.disabled]}
    >
      <Animated.View style={[styles.fill, fillStyle]} />
      {/* Drawn over the fill: a border on the track itself insets the fill and leaves a hairline gap on iOS. */}
      <View style={styles.border} pointerEvents="none" />
      <View style={styles.labelBox}>
        <Text style={styles.label}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  track: {
    height: 64,
    borderRadius: theme.radius.pill,
    overflow: 'hidden',
    backgroundColor: theme.colors.surfaceRaised,
  },
  border: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: theme.radius.pill,
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    // Same candy bevel as the primary button, over both the track and the fill.
    boxShadow: 'inset 0 2px 0 rgba(255, 255, 255, 0.25), inset 0 -4px 0 rgba(0, 0, 0, 0.22)',
  },
  fill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    backgroundImage: `linear-gradient(90deg, ${theme.colors.primary} 0%, ${theme.colors.promo} 100%)`,
  },
  labelBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: theme.fonts.display,
    fontWeight: theme.fontWeight.bold,
    fontSize: 16,
    letterSpacing: 0.5,
    color: theme.colors.text,
    // Keeps the label readable over both the dark track and the bright fill.
    textShadowColor: theme.colors.background,
    textShadowRadius: 6,
  },
  disabled: {
    opacity: 0.4,
  },
}));

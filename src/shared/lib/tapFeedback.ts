import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import type { AudioBuffer } from 'react-native-audio-api';

import { loadSound, playSound } from './audio';

/** What a tap means; each has its own click and haptic. */
export type TapFeedback = 'confirm' | 'back' | 'tab' | 'denied';

// Synthesized by scripts/synthesize-sounds.py: three pitches about 3% apart per kind.
const SOUNDS: Record<TapFeedback, number[]> = {
  confirm: [require('./sounds/confirm-1.wav'), require('./sounds/confirm-2.wav'), require('./sounds/confirm-3.wav')],
  back: [require('./sounds/back-1.wav'), require('./sounds/back-2.wav'), require('./sounds/back-3.wav')],
  tab: [require('./sounds/tab-1.wav'), require('./sounds/tab-2.wav'), require('./sounds/tab-3.wav')],
  denied: [require('./sounds/denied-1.wav'), require('./sounds/denied-2.wav'), require('./sounds/denied-3.wav')],
};

/** Platform guidance: selection ticks for tabs, light impacts for buttons, a warning for a refused tap. */
const IOS_HAPTICS: Record<TapFeedback, () => Promise<void>> = {
  confirm: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  back: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft),
  tab: () => Haptics.selectionAsync(),
  denied: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
};

/**
 * Android's own touch feedback constants: the system's light key ticks, which follow the user's touch-feedback
 * setting. The impact and notification calls drive the vibrator directly, a hard buzz on many Android phones.
 */
const ANDROID_HAPTICS: Record<TapFeedback, Haptics.AndroidHaptics> = {
  confirm: Haptics.AndroidHaptics.Virtual_Key,
  back: Haptics.AndroidHaptics.Keyboard_Tap,
  tab: Haptics.AndroidHaptics.Clock_Tick,
  denied: Haptics.AndroidHaptics.Reject,
};

// A type the device lacks (`Reject` needs Android 11) rejects; a missing tick isn't worth an error.
const playHaptic = (kind: TapFeedback) =>
  (Platform.OS === 'android' ? Haptics.performAndroidHapticsAsync(ANDROID_HAPTICS[kind]) : IOS_HAPTICS[kind]()).catch(() => {});


/** Decoded clicks per kind, filled at startup; a tap before they are ready just gets its haptic. */
const clicks: Partial<Record<TapFeedback, AudioBuffer[]>> = {};
/** Index of the last variant played per kind, so the next tap picks another pitch and repeats don't wear. */
const lastVariant: Partial<Record<TapFeedback, number>> = {};

/** Decodes the clicks into memory, so the very first tap is not silent while they load. Call once at startup. */
export function prepareTapFeedback() {
  (Object.keys(SOUNDS) as TapFeedback[]).forEach((kind) => {
    Promise.all(SOUNDS[kind].map(loadSound)).then((buffers) => {
      clicks[kind] = buffers;
    });
  });
}

/** Plays the click and haptic for a tap, picking a pitch variant other than the previous one. */
export function playTapFeedback(kind: TapFeedback) {
  playHaptic(kind);
  const variants = clicks[kind];
  if (!variants) return;
  const offset = 1 + Math.floor(Math.random() * (variants.length - 1));
  const next = ((lastVariant[kind] ?? 0) + offset) % variants.length;
  lastVariant[kind] = next;
  playSound(variants[next]);
}

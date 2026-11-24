import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import type { AudioBuffer } from 'react-native-audio-api';

import { loadSound, playSound } from './audio';

/** What a tap means; each has its own click, and the meaningful ones a haptic. */
export type TapFeedback = 'confirm' | 'back' | 'tab' | 'denied';

// Synthesized by scripts/synthesize-sounds.py: three pitches about 3% apart per kind.
const SOUNDS: Record<TapFeedback, number[]> = {
  confirm: [require('./sounds/confirm-1.wav'), require('./sounds/confirm-2.wav'), require('./sounds/confirm-3.wav')],
  back: [require('./sounds/back-1.wav'), require('./sounds/back-2.wav'), require('./sounds/back-3.wav')],
  tab: [require('./sounds/tab-1.wav'), require('./sounds/tab-2.wav'), require('./sounds/tab-3.wav')],
  denied: [require('./sounds/denied-1.wav'), require('./sounds/denied-2.wav'), require('./sounds/denied-3.wav')],
};

/**
 * Only taps that carry meaning get a haptic: a selection changing and a refused tap. Plain buttons (`confirm`,
 * `back`) only click, so the opening sequence's haptics still stand out rather than blending into constant buzzing.
 */
type HapticFeedback = Extract<TapFeedback, 'tab' | 'denied'>;

const IOS_HAPTICS: Record<HapticFeedback, () => Promise<void>> = {
  tab: () => Haptics.selectionAsync(),
  denied: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
};

/**
 * Android's own touch feedback constants, which follow the user's touch-feedback setting. The impact and
 * notification calls drive the vibrator directly, a hard buzz on many Android phones.
 */
const ANDROID_HAPTICS: Record<HapticFeedback, Haptics.AndroidHaptics> = {
  tab: Haptics.AndroidHaptics.Clock_Tick,
  denied: Haptics.AndroidHaptics.Reject,
};

const hasHaptic = (kind: TapFeedback): kind is HapticFeedback => kind === 'tab' || kind === 'denied';

// A type the device lacks (`Reject` needs Android 11) rejects; a missing tick isn't worth an error.
const playHaptic = (kind: HapticFeedback) =>
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

/** Plays the click (and haptic, where the kind has one) for a tap, picking a pitch variant other than the previous one. */
export function playTapFeedback(kind: TapFeedback) {
  if (hasHaptic(kind)) playHaptic(kind);
  const variants = clicks[kind];
  if (!variants) return;
  const offset = 1 + Math.floor(Math.random() * (variants.length - 1));
  const next = ((lastVariant[kind] ?? 0) + offset) % variants.length;
  lastVariant[kind] = next;
  playSound(variants[next]);
}

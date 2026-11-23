import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';

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
const HAPTICS: Record<TapFeedback, () => Promise<void>> = {
  confirm: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  back: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft),
  tab: () => Haptics.selectionAsync(),
  denied: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
};

type Pool = { players: AudioPlayer[]; last: number };

/**
 * One player per pitch variant, so a tap picks a different pitch from the last and repeats don't wear.
 * Several players also mean fast taps find one that has finished: a single player is still playing or parked
 * at its end, and the asynchronous rewind loses the race with `play()`, so nothing sounds.
 */
let pools: Record<TapFeedback, Pool> | null = null;

const createPool = (sources: number[]): Pool => ({
  players: sources.map((source) => {
    const player = createAudioPlayer(source);
    // Rewind as soon as it ends, so the player is ready at the start for its next turn.
    player.addListener('playbackStatusUpdate', (status) => {
      if (status.didJustFinish) player.seekTo(0);
    });
    return player;
  }),
  last: -1,
});

const getPools = () =>
  (pools ??= {
    confirm: createPool(SOUNDS.confirm),
    back: createPool(SOUNDS.back),
    tab: createPool(SOUNDS.tab),
    denied: createPool(SOUNDS.denied),
  });

/**
 * Sets the app's audio rules and loads the clicks, so the very first tap is not silent while they load.
 * Call once at startup. Game sounds obey the silent switch and never stop the user's own music.
 */
export function prepareTapFeedback() {
  setAudioModeAsync({ playsInSilentMode: false, interruptionMode: 'mixWithOthers', shouldPlayInBackground: false });
  getPools();
}

/** Plays the click and haptic for a tap, picking a pitch variant other than the previous one. */
export function playTapFeedback(kind: TapFeedback) {
  HAPTICS[kind]();
  const pool = getPools()[kind];
  const offset = 1 + Math.floor(Math.random() * (pool.players.length - 1));
  pool.last = (Math.max(pool.last, 0) + offset) % pool.players.length;
  const player = pool.players[pool.last];
  // Only when taps outpace the pool: restart this player once its rewind has landed.
  if (player.playing || player.currentTime > 0) player.seekTo(0).then(() => player.play());
  else player.play();
}

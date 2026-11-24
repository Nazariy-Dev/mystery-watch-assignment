import { useEffect, useMemo, useRef } from 'react';
import type { AudioBuffer } from 'react-native-audio-api';

import type { Rarity } from '@/shared/api';
import { loadSound, playSound, type PlayingSound } from '@/shared/lib';

export const stepSound = (rarity: Rarity) => `step-${rarity}` as const;
export const revealSound = (rarity: Rarity) => `reveal-${rarity}` as const;

// Synthesized for this app by `scripts/synthesize-sounds.py`.
const SOURCES = {
  land: require('../sounds/land.wav'),
  charge: require('../sounds/charge.wav'),
  burst: require('../sounds/burst.wav'),
  'step-common': require('../sounds/step-common.wav'),
  'step-rare': require('../sounds/step-rare.wav'),
  'step-epic': require('../sounds/step-epic.wav'),
  'step-legendary': require('../sounds/step-legendary.wav'),
  'reveal-common': require('../sounds/reveal-common.wav'),
  'reveal-rare': require('../sounds/reveal-rare.wav'),
  'reveal-epic': require('../sounds/reveal-epic.wav'),
  'reveal-legendary': require('../sounds/reveal-legendary.wav'),
} satisfies Record<string, number>;

type SoundName = keyof typeof SOURCES;

/**
 * Sound effects for the opening screen, decoded into memory on mount so each plays the instant its beat comes.
 * The decoded audio stays cached for the next box; what is still playing stops when the screen unmounts.
 */
export function useOpeningSounds() {
  const buffers = useRef<Partial<Record<SoundName, AudioBuffer>>>({});
  // The latest voice of each sound, for `stop` and `mute`.
  const playing = useRef<Partial<Record<SoundName, PlayingSound>>>({});

  useEffect(() => {
    (Object.keys(SOURCES) as SoundName[]).forEach((name) => {
      loadSound(SOURCES[name]).then((buffer) => {
        buffers.current[name] = buffer;
      });
    });
    const voices = playing.current;
    return () => Object.values(voices).forEach((voice) => voice.stop());
  }, []);

  return useMemo(
    () => ({
      play(name: SoundName) {
        const buffer = buffers.current[name];
        if (buffer) playing.current[name] = playSound(buffer);
      },
      stop(name: SoundName) {
        playing.current[name]?.stop();
      },
      /** Silences a sound but lets it run on to its end, so it never cuts off audibly under a sound starting at once. */
      mute(name: SoundName) {
        playing.current[name]?.mute();
      },
    }),
    [],
  );
}

import { useAudioPlayer, type AudioPlayer } from 'expo-audio';
import { useEffect, useMemo } from 'react';

import type { Rarity } from '@/shared/api';

const setVolume = (player: AudioPlayer, volume: number) => {
  player.volume = volume;
};

export const stepSound = (rarity: Rarity) => `step-${rarity}` as const;
export const revealSound = (rarity: Rarity) => `reveal-${rarity}` as const;

/**
 * Sound effects for the opening screen: one preloaded player per effect, so each plays without a load
 * delay at its beat. The players belong to the screen and are released when it unmounts.
 * The WAVs are synthesized for this app by `scripts/synthesize-sounds.py`.
 */
export function useOpeningSounds() {
  const land = useAudioPlayer(require('../sounds/land.wav'));
  const charge = useAudioPlayer(require('../sounds/charge.wav'));
  const burst = useAudioPlayer(require('../sounds/burst.wav'));
  const stepCommon = useAudioPlayer(require('../sounds/step-common.wav'));
  const stepRare = useAudioPlayer(require('../sounds/step-rare.wav'));
  const stepEpic = useAudioPlayer(require('../sounds/step-epic.wav'));
  const stepLegendary = useAudioPlayer(require('../sounds/step-legendary.wav'));
  const revealCommon = useAudioPlayer(require('../sounds/reveal-common.wav'));
  const revealRare = useAudioPlayer(require('../sounds/reveal-rare.wav'));
  const revealEpic = useAudioPlayer(require('../sounds/reveal-epic.wav'));
  const revealLegendary = useAudioPlayer(require('../sounds/reveal-legendary.wav'));

  const players = useMemo(
    () => ({
      land,
      charge,
      burst,
      'step-common': stepCommon,
      'step-rare': stepRare,
      'step-epic': stepEpic,
      'step-legendary': stepLegendary,
      'reveal-common': revealCommon,
      'reveal-rare': revealRare,
      'reveal-epic': revealEpic,
      'reveal-legendary': revealLegendary,
    }),
    [land, charge, burst, stepCommon, stepRare, stepEpic, stepLegendary, revealCommon, revealRare, revealEpic, revealLegendary],
  );

  useEffect(() => {
    // Rewind each effect as soon as it ends, so the next play starts at once instead of racing a seek.
    const subscriptions = Object.values(players).map((player) =>
      player.addListener('playbackStatusUpdate', (status) => {
        if (status.didJustFinish) player.seekTo(0);
      }),
    );
    return () => subscriptions.forEach((subscription) => subscription.remove());
  }, [players]);

  return useMemo(
    () => ({
      play(name: keyof typeof players) {
        const player = players[name];
        // Normally already rewound; this covers a replay that interrupts the sound mid-way.
        if (player.currentTime > 0) player.seekTo(0);
        setVolume(player, 1);
        player.play();
      },
      /** Pauses and rewinds. Only for when nothing else is about to play; see `mute`. */
      stop(name: keyof typeof players) {
        players[name].pause();
        players[name].seekTo(0);
      },
      /**
       * Silences a sound but lets it run on to its end. Use this when another sound starts at the same moment:
       * pausing the only playing sound lets iOS deactivate the audio session, which can swallow the new one.
       */
      mute(name: keyof typeof players) {
        setVolume(players[name], 0);
      },
    }),
    [players],
  );
}

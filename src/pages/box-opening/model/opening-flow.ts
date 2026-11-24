import { usePreventRemove } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { useRef, useState } from 'react';

import type { BoxStageHandle, RevealBeat } from '@/entities/box';
import { useOpenBoxMutation, useSellItemMutation } from '@/entities/player';
import type { ApiErrorBody, OwnedItem, Rarity } from '@/shared/api';

import { revealSound, stepSound, useOpeningSounds } from '../lib/opening-sounds';
import type { TeaseStep } from '../ui/TeaseCallout';

/** ready → charging (held) → opening (request in flight) → opened (the stage plays the tease and burst) → revealed (result card). */
export type Phase = 'ready' | 'charging' | 'opening' | 'opened' | 'revealed';

/** Heavy thumps on the burst per rarity, so a legendary is felt as well as seen. */
const BURST_THUMPS: Record<Rarity, number> = { common: 1, rare: 1, epic: 2, legendary: 3 };
const THUMP_GAP_MS = 110;
/** The fanfare follows the boom instead of masking it. */
const FANFARE_DELAY_MS = 250;

const errorMessage = (error: unknown) =>
  (error as { data?: Partial<ApiErrorBody> }).data?.message ?? 'Something went wrong. Please try again.';

/** Drives one box opening: the phase machine, the purchase and sale requests, and the sounds and haptics on each beat. */
export function useOpeningFlow(boxId: string) {
  const [openBox] = useOpenBoxMutation();
  const [sellItem, { isLoading: selling }] = useSellItemMutation();

  const [phase, setPhase] = useState<Phase>('ready');
  const [item, setItem] = useState<OwnedItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [teaseStep, setTeaseStep] = useState<TeaseStep | null>(null);
  const [burst, setBurst] = useState(false);
  const stage = useRef<BoxStageHandle>(null);
  const sounds = useOpeningSounds();
  // Remounts the hold button so its fill starts empty for each attempt.
  const [attempt, setAttempt] = useState(0);

  const busy = phase === 'opening' || phase === 'opened';

  // The purchase is already committed on the server; leaving now would skip the reveal of what was paid for.
  usePreventRemove(busy, () => {});

  const onChargingChange = (charging: boolean) => {
    setPhase(charging ? 'charging' : 'ready');
    // The hum rises with the hold; letting go early cuts it off, a full hold lets it swell on into the tease.
    if (charging) sounds.play('charge');
    else sounds.stop('charge');
  };

  const open = async () => {
    setPhase('opening');
    setError(null);
    try {
      const result = await openBox(boxId).unwrap();
      setItem(result.item);
      setPhase('opened');
    } catch (failure) {
      setError(errorMessage(failure));
      setPhase('ready');
      setAttempt((n) => n + 1);
      sounds.stop('charge');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const onLand = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    sounds.play('land');
  };

  const onBeat = (beat: RevealBeat) => {
    if (beat.kind === 'step') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      // The charge hum swells through the wait for the result; the first step takes over from it.
      sounds.mute('charge');
      sounds.play(stepSound(beat.rarity));
      setTeaseStep((previous) => ({ rarity: beat.rarity, final: beat.final, count: (previous?.count ?? 0) + 1 }));
    } else if (beat.kind === 'burst') {
      setTeaseStep(null);
      setBurst(true);
      const thumps = item ? BURST_THUMPS[item.watch.rarity] : 1;
      for (let i = 0; i < thumps; i += 1) {
        setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), i * THUMP_GAP_MS);
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      sounds.play('burst');
      if (item) {
        const fanfare = revealSound(item.watch.rarity);
        setTimeout(() => sounds.play(fanfare), FANFARE_DELAY_MS);
      }
    } else {
      setPhase('revealed');
    }
  };

  const skip = () => stage.current?.skip();

  const reset = () => {
    setItem(null);
    setTeaseStep(null);
    setBurst(false);
    setError(null);
    setPhase('ready');
    setAttempt((n) => n + 1);
  };

  const sell = async () => {
    if (!item) return;
    setError(null);
    try {
      await sellItem(item.id).unwrap();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      reset();
    } catch (failure) {
      setError(errorMessage(failure));
    }
  };

  return {
    phase,
    busy,
    item,
    error,
    teaseStep,
    burst,
    attempt,
    selling,
    stage,
    onChargingChange,
    open,
    onLand,
    onBeat,
    skip,
    reset,
    sell,
  };
}

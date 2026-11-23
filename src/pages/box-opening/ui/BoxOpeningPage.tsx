import { usePreventRemove } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { useRef, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { StyleSheet, withUnistyles } from 'react-native-unistyles';

import { BoxStage, useGetBoxQuery, type BoxStageHandle, type RevealBeat } from '@/entities/box';
import { CoinBalance, useGetMeQuery, useOpenBoxMutation, useSellItemMutation } from '@/entities/player';
import type { ApiErrorBody, OwnedItem, Rarity } from '@/shared/api';
import type { RootStackParamList } from '@/shared/config';
import { IconButton, Screen, Text, Touchable } from '@/shared/ui';

import { revealSound, stepSound, useOpeningSounds } from '../lib/opening-sounds';
import { BurstFlash } from './BurstFlash';
import { Confetti } from './Confetti';
import { HoldToOpen } from './HoldToOpen';
import { RevealOverlay } from './RevealOverlay';
import { TeaseCallout, type TeaseStep } from './TeaseCallout';
import { Vignette } from './Vignette';

type BoxOpeningPageProps = NativeStackScreenProps<RootStackParamList, 'BoxOpening'>;

/** ready → charging (held) → opening (request in flight) → opened (the stage plays the tease and burst) → revealed (result card). */
type Phase = 'ready' | 'charging' | 'opening' | 'opened' | 'revealed';

/** Peak opacity of the burst flash per rarity. */
const FLASH_STRENGTH: Record<Rarity, number> = { common: 0.5, rare: 0.7, epic: 0.85, legendary: 0.95 };
/** Heavy thumps on the burst per rarity, so a legendary is felt as well as seen. */
const BURST_THUMPS: Record<Rarity, number> = { common: 1, rare: 1, epic: 2, legendary: 3 };
const THUMP_GAP_MS = 110;
/** The fanfare follows the boom instead of masking it. */
const FANFARE_DELAY_MS = 250;

const Spinner = withUnistyles(ActivityIndicator, (theme) => ({ color: theme.colors.primary }));

const errorMessage = (error: unknown) =>
  (error as { data?: Partial<ApiErrorBody> }).data?.message ?? 'Something went wrong. Please try again.';

export function BoxOpeningPage({ navigation, route }: BoxOpeningPageProps) {
  const { boxId } = route.params;
  const { data: box } = useGetBoxQuery(boxId);
  const { data: me } = useGetMeQuery();
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

  // The purchase is already committed on the server; leaving now would skip the reveal of what was paid for.
  usePreventRemove(phase === 'opening' || phase === 'opened', () => {});

  if (!box) {
    return (
      <Screen>
        <View style={styles.status}>
          <Spinner size="large" accessibilityLabel="Loading box" />
        </View>
      </Screen>
    );
  }

  const shortBy = me ? box.price - me.balance : 0;
  const canAfford = me !== undefined && shortBy <= 0;

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

  const busy = phase === 'opening' || phase === 'opened';
  const holdLabel =
    phase === 'charging' ? 'Keep holding…' : busy ? 'Unlocking…' : 'Hold to open';

  return (
    <Screen>
      <View style={styles.header}>
        {busy ? <View style={styles.headerSpacer} /> : <IconButton icon="close" accessibilityLabel="Close" onPress={navigation.goBack} />}
        <CoinBalance />
      </View>
      <View style={styles.title}>
        <Text variant="label" style={styles.tier(box.tier)}>{box.tier} box</Text>
        <Text variant="title" accessibilityRole="header">{box.name}</Text>
      </View>
      <View style={styles.stage}>
        <BoxStage
          ref={stage}
          tier={box.tier}
          entrance
          ambient
          onLand={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            sounds.play('land');
          }}
          charging={phase === 'charging' || phase === 'opening'}
          result={item?.watch.rarity}
          onBeat={onBeat}
          inspectable={phase === 'ready'}
          accessibilityLabel={item ? `Open ${box.name} box` : `Closed ${box.name} box`}
          style={styles.fill}
        />
        {phase === 'opened' && (
          <Touchable
            style={styles.skip}
            accessibilityRole="button"
            accessibilityLabel="Skip to the result"
            onPress={() => stage.current?.skip()}
          />
        )}
      </View>
      {/* Creeps in over the hold, peaks through the tease, then lifts for the reveal. Drawn under the footer. */}
      <Vignette
        strength={phase === 'charging' ? 0.85 : busy ? 1 : 0}
        durationMs={phase === 'charging' ? 1200 : 400}
      />
      <View style={styles.footer}>
        {error ? (
          <Text variant="caption" style={styles.error}>{error}</Text>
        ) : !canAfford && phase === 'ready' ? (
          <Text variant="caption" tone="muted" style={styles.center}>
            {me ? `You need ${shortBy.toLocaleString('en-US')} more coins` : 'Loading balance…'}
          </Text>
        ) : phase === 'opened' ? (
          <Text variant="caption" tone="muted" style={styles.center}>Tap the box to skip</Text>
        ) : (
          <Text variant="caption" tone="muted" style={styles.center}>
            {box.price.toLocaleString('en-US')} coins · let go early to cancel
          </Text>
        )}
        <HoldToOpen
          key={attempt}
          label={holdLabel}
          // Stays enabled while charging: disabling a Pressable mid-press cancels the hold.
          disabled={!canAfford || busy}
          onChargingChange={(charging) => {
            setPhase(charging ? 'charging' : 'ready');
            // The hum rises with the hold; letting go early cuts it off, a full hold lets it swell on into the tease.
            if (charging) sounds.play('charge');
            else sounds.stop('charge');
          }}
          onComplete={open}
        />
      </View>
      {teaseStep && <TeaseCallout step={teaseStep} />}
      {burst && phase !== 'revealed' && item && <BurstFlash strength={FLASH_STRENGTH[item.watch.rarity]} />}
      {phase === 'revealed' && item && (
        <RevealOverlay
          item={item}
          canOpenAnother={me !== undefined && me.balance >= box.price}
          selling={selling}
          error={error}
          onKeep={navigation.goBack}
          onSell={sell}
          onOpenAnother={reset}
        />
      )}
      {/* Starts at the burst and keeps falling over the result card. */}
      {burst && item && (item.watch.rarity === 'epic' || item.watch.rarity === 'legendary') && (
        <Confetti rarity={item.watch.rarity} />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create((theme) => ({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.gap(2),
  },
  headerSpacer: {
    width: 44,
    height: 44,
  },
  title: {
    alignItems: 'center',
    gap: theme.gap(1),
  },
  tier: (tier: Rarity) => ({
    color: theme.rarity[tier],
  }),
  stage: {
    flex: 1,
  },
  fill: {
    flex: 1,
  },
  skip: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  footer: {
    gap: theme.gap(3),
    paddingBottom: theme.gap(3),
  },
  center: {
    textAlign: 'center',
  },
  error: {
    color: theme.colors.danger,
    textAlign: 'center',
  },
  status: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));

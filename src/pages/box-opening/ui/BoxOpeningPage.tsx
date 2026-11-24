import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { StyleSheet, withUnistyles } from 'react-native-unistyles';

import { BoxStage, useGetBoxQuery } from '@/entities/box';
import { CoinBalance, useGetMeQuery } from '@/entities/player';
import type { Rarity } from '@/shared/api';
import type { RootStackParamList } from '@/shared/config';
import { IconButton, Screen, Text, Touchable } from '@/shared/ui';

import { useOpeningFlow } from '../model/opening-flow';
import { BurstFlash } from './BurstFlash';
import { Confetti } from './Confetti';
import { HoldToOpen } from './HoldToOpen';
import { RevealOverlay } from './RevealOverlay';
import { TeaseCallout } from './TeaseCallout';
import { Vignette } from './Vignette';

type BoxOpeningPageProps = NativeStackScreenProps<RootStackParamList, 'BoxOpening'>;

/** Peak opacity of the burst flash per rarity. */
const FLASH_STRENGTH: Record<Rarity, number> = { common: 0.5, rare: 0.7, epic: 0.85, legendary: 0.95 };

const Spinner = withUnistyles(ActivityIndicator, (theme) => ({ color: theme.colors.primary }));

export function BoxOpeningPage({ navigation, route }: BoxOpeningPageProps) {
  const { boxId } = route.params;
  const { data: box } = useGetBoxQuery(boxId);
  const { data: me } = useGetMeQuery();
  const { phase, busy, item, error, teaseStep, burst, attempt, selling, stage, onChargingChange, open, onLand, onBeat, skip, reset, sell } =
    useOpeningFlow(boxId);

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
          onLand={onLand}
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
            onPress={skip}
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
          onChargingChange={onChargingChange}
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

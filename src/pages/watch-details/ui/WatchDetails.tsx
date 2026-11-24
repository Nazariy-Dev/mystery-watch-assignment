import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Alert, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { useGetBoxesQuery } from '@/entities/box';
import { useSellItemMutation } from '@/entities/player';
import { WatchImage } from '@/entities/watch';
import type { ApiErrorBody, OwnedItem, Rarity } from '@/shared/api';
import { easedRadialGradient } from '@/shared/lib';
import { Button, CoinIcon, Text } from '@/shared/ui';

import { Fact } from './Fact';

export function WatchDetails({ item, onSold }: { item: OwnedItem; onSold: () => void }) {
  const { watch } = item;
  const { data: boxes } = useGetBoxesQuery();
  const [sellItem, { isLoading: selling }] = useSellItemMutation();
  const [error, setError] = useState<string | null>(null);
  const boxName = boxes?.find((box) => box.id === item.boxId)?.name;
  const value = watch.value.toLocaleString('en-US');

  const sell = async () => {
    setError(null);
    try {
      await sellItem(item.id).unwrap();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onSold();
    } catch (failure) {
      setError((failure as { data?: Partial<ApiErrorBody> }).data?.message ?? 'Something went wrong. Please try again.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const confirmSell = () =>
    Alert.alert(`Sell ${watch.name}?`, `You get ${value} coins and the watch leaves your vault.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: `Sell for ${value}`, style: 'destructive', onPress: sell },
    ]);

  return (
    <>
      <View style={styles.showcase}>
        {/* Wider than the showcase, so it spreads over the back button; touches must pass through it. */}
        <View pointerEvents="none" style={styles.halo(watch.rarity)} />
        <WatchImage watch={watch} style={styles.watch} />
      </View>
      <View style={styles.titleBlock}>
        <View style={styles.rarityChip(watch.rarity)}>
          <View style={styles.rarityDot(watch.rarity)} />
          <Text variant="label" style={styles.rarity(watch.rarity)}>{watch.rarity}</Text>
        </View>
        <Text variant="display" accessibilityRole="header" style={styles.center}>{watch.name}</Text>
        <Text tone="muted">{watch.brand}</Text>
      </View>
      <View style={styles.facts}>
        <Fact label="Sell value">
          <View style={styles.coins}>
            <CoinIcon size={16} />
            <Text tone="coin" style={styles.coinText}>{value}</Text>
          </View>
        </Fact>
        {boxName && (
          <Fact label="Won from">
            <Text>{boxName}</Text>
          </Fact>
        )}
        <Fact label="Won on" last>
          <Text>{new Date(item.wonAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
        </Fact>
      </View>
      <View style={styles.actions}>
        {error && <Text variant="caption" style={styles.error}>{error}</Text>}
        <Button label={selling ? 'Selling…' : `Sell for ${value}`} variant="secondary" onPress={confirmSell} disabled={selling} />
      </View>
    </>
  );
}

const styles = StyleSheet.create((theme) => ({
  showcase: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Same edgeless eased glow as the reveal, so a watch looks lit the same way it did when it was won.
  halo: (rarity: Rarity) => ({
    position: 'absolute',
    width: 440,
    height: 440,
    backgroundImage: easedRadialGradient({
      from: `${theme.rarity[rarity]}80`,
      to: `${theme.rarity[rarity]}00`,
      end: 0.7,
      shape: 'circle',
    }),
  }),
  watch: {
    height: 280,
  },
  titleBlock: {
    alignItems: 'center',
    gap: theme.gap(1),
    marginBottom: theme.gap(5),
  },
  rarityChip: (rarity: Rarity) => ({
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.gap(2),
    paddingHorizontal: theme.gap(3),
    paddingVertical: theme.gap(1),
    marginBottom: theme.gap(1),
    borderRadius: theme.radius.pill,
    backgroundColor: `${theme.rarity[rarity]}1F`,
    borderWidth: 1,
    borderColor: `${theme.rarity[rarity]}55`,
  }),
  rarityDot: (rarity: Rarity) => ({
    width: 8,
    height: 8,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.rarity[rarity],
  }),
  rarity: (rarity: Rarity) => ({
    color: theme.rarity[rarity],
  }),
  center: {
    textAlign: 'center',
  },
  facts: {
    paddingHorizontal: theme.gap(5),
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: `${theme.colors.primary}55`,
    backgroundImage: `linear-gradient(135deg, ${theme.colors.primary}40 0%, ${theme.colors.surface} 75%)`,
    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.12)',
    marginBottom: theme.gap(4),
  },
  coins: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.gap(2),
  },
  coinText: {
    fontWeight: theme.fontWeight.bold,
  },
  actions: {
    gap: theme.gap(2),
    paddingBottom: theme.gap(3),
  },
  error: {
    color: theme.colors.danger,
    textAlign: 'center',
  },
}));

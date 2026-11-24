import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Alert, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { useGetBoxesQuery } from '@/entities/box';
import { useSellItemMutation } from '@/entities/player';
import { WatchImage } from '@/entities/watch';
import type { ApiErrorBody, OwnedItem, Rarity } from '@/shared/api';
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
        <View style={styles.halo(watch.rarity)} />
        <WatchImage watch={watch} style={styles.watch} />
      </View>
      <View style={styles.titleBlock}>
        <Text variant="label" style={styles.rarity(watch.rarity)}>{watch.rarity}</Text>
        <Text variant="display" accessibilityRole="header" style={styles.center}>{watch.name}</Text>
        <Text tone="muted">{watch.brand}</Text>
      </View>
      <View style={styles.facts}>
        <Fact label="Sell value">
          <View style={styles.coins}>
            <CoinIcon size={16} />
            <Text tone="coin">{value}</Text>
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
  halo: (rarity: Rarity) => ({
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: `${theme.rarity[rarity]}26`,
    shadowColor: theme.rarity[rarity],
    shadowOpacity: 0.8,
    shadowRadius: 50,
    shadowOffset: { width: 0, height: 0 },
  }),
  watch: {
    height: 280,
  },
  titleBlock: {
    alignItems: 'center',
    gap: theme.gap(1),
    marginBottom: theme.gap(5),
  },
  rarity: (rarity: Rarity) => ({
    color: theme.rarity[rarity],
  }),
  center: {
    textAlign: 'center',
  },
  facts: {
    paddingHorizontal: theme.gap(4),
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.gap(4),
  },
  coins: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.gap(1.5),
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

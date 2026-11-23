import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { useState, type ReactNode } from 'react';
import { Alert, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { useGetBoxesQuery } from '@/entities/box';
import { useGetMeQuery, useSellItemMutation } from '@/entities/player';
import { WatchImage } from '@/entities/watch';
import type { ApiErrorBody, OwnedItem, Rarity } from '@/shared/api';
import type { RootStackParamList } from '@/shared/config';
import { Button, CoinIcon, IconButton, Screen, Text } from '@/shared/ui';

type WatchDetailsPageProps = NativeStackScreenProps<RootStackParamList, 'WatchDetails'>;

export function WatchDetailsPage({ navigation, route }: WatchDetailsPageProps) {
  const { data: me } = useGetMeQuery();
  const item = me?.inventory.find((owned) => owned.id === route.params.itemId);

  return (
    <Screen>
      <IconButton icon="chevron-back" accessibilityLabel="Back" onPress={navigation.goBack} />
      {item ? (
        <WatchDetails item={item} onSold={navigation.goBack} />
      ) : (
        // Also shown for a frame after a sale, between the cache dropping the item and the screen popping.
        <View style={styles.missing}>
          <Text tone="muted">This watch is no longer in your vault.</Text>
        </View>
      )}
    </Screen>
  );
}

function WatchDetails({ item, onSold }: { item: OwnedItem; onSold: () => void }) {
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
        <Text variant="display" style={styles.center}>{watch.name}</Text>
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

function Fact({ label, last = false, children }: { label: string; last?: boolean; children: ReactNode }) {
  return (
    <View style={[styles.fact, !last && styles.factDivider]}>
      <Text tone="muted">{label}</Text>
      {children}
    </View>
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
  fact: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.gap(3),
  },
  factDivider: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
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
  missing: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));

import { useNavigation } from '@react-navigation/native';
import { useMemo } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, View } from 'react-native';
import { StyleSheet, withUnistyles } from 'react-native-unistyles';

import { CoinBalance, useGetMeQuery, useResetDemoMutation } from '@/entities/player';
import { WatchImage } from '@/entities/watch';
import type { OwnedItem, Rarity } from '@/shared/api';
import { Button, CoinIcon, Screen, Text } from '@/shared/ui';

const RARITY_RANK: Record<Rarity, number> = { legendary: 0, epic: 1, rare: 2, common: 3 };

const Spinner = withUnistyles(ActivityIndicator, (theme) => ({ color: theme.colors.primary }));

export function CollectionPage() {
  const navigation = useNavigation();
  const { data: me, isError, refetch } = useGetMeQuery();
  const [resetDemo, { isLoading: resetting }] = useResetDemoMutation();

  // Rarest first, newest first within a rarity.
  const items = useMemo(
    () =>
      [...(me?.inventory ?? [])].sort(
        (a, b) => RARITY_RANK[a.watch.rarity] - RARITY_RANK[b.watch.rarity] || b.wonAt - a.wonAt,
      ),
    [me?.inventory],
  );
  const vaultValue = items.reduce((sum, item) => sum + item.watch.value, 0);

  const confirmReset = () =>
    Alert.alert('Reset demo?', 'Your vault is emptied and your balance goes back to 1,000 coins.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: () => resetDemo() },
    ]);

  return (
    <Screen withBottomInset={false}>
      <View style={styles.header}>
        <View>
          <Text variant="label" tone="primary">Vault</Text>
          <Text variant="title" accessibilityRole="header">Your collection</Text>
        </View>
        <CoinBalance />
      </View>
      {me ? (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            items.length > 0 ? (
              <View style={styles.stats}>
                <Stat label="Watches" value={items.length.toLocaleString('en-US')} />
                <Stat label="Vault value" value={vaultValue.toLocaleString('en-US')} coin />
              </View>
            ) : undefined
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text variant="title">Your vault is empty</Text>
              <Text tone="muted" style={styles.center}>Open a mystery box and the watches you win land here.</Text>
              <Button label="Browse boxes" onPress={() => navigation.navigate('Tabs', { screen: 'Shop' })} />
            </View>
          }
          ListFooterComponent={
            <View style={styles.footer}>
              <Button label={resetting ? 'Resetting…' : 'Reset demo'} variant="secondary" onPress={confirmReset} disabled={resetting} />
            </View>
          }
          renderItem={({ item }) => (
            <WatchCard item={item} onPress={() => navigation.navigate('WatchDetails', { itemId: item.id })} />
          )}
        />
      ) : (
        <View style={styles.status}>
          {isError ? (
            <>
              <Text tone="muted">Couldn&apos;t load your vault.</Text>
              <Button label="Retry" variant="secondary" onPress={refetch} />
            </>
          ) : (
            <Spinner size="large" accessibilityLabel="Loading vault" />
          )}
        </View>
      )}
    </Screen>
  );
}

function Stat({ label, value, coin = false }: { label: string; value: string; coin?: boolean }) {
  return (
    <View style={styles.stat}>
      <Text variant="label" tone="muted">{label}</Text>
      <View style={styles.statValue}>
        {coin && <CoinIcon size={18} />}
        <Text variant="title" tone={coin ? 'coin' : undefined}>{value}</Text>
      </View>
    </View>
  );
}

function WatchCard({ item, onPress }: { item: OwnedItem; onPress: () => void }) {
  const { watch } = item;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${watch.brand} ${watch.name}, ${watch.rarity}, worth ${watch.value} coins`}
      onPress={onPress}
      style={({ pressed }) => [styles.card(watch.rarity), pressed && styles.pressed]}
    >
      <View style={styles.imageWell(watch.rarity)}>
        <WatchImage watch={watch} style={styles.image} />
      </View>
      <Text variant="label" style={styles.rarity(watch.rarity)}>{watch.rarity}</Text>
      <Text numberOfLines={1}>{watch.name}</Text>
      <View style={styles.value}>
        <CoinIcon size={14} />
        <Text variant="caption" tone="coin">{watch.value.toLocaleString('en-US')}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.gap(3),
  },
  list: {
    flexGrow: 1,
    gap: theme.gap(3),
    paddingBottom: theme.gap(4),
  },
  row: {
    gap: theme.gap(3),
  },
  stats: {
    flexDirection: 'row',
    gap: theme.gap(3),
    marginBottom: theme.gap(1),
  },
  stat: {
    flex: 1,
    gap: theme.gap(1),
    padding: theme.gap(4),
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.gap(2),
  },
  card: (rarity: Rarity) => ({
    // Fixed half width, not flex: 1, so an odd last card doesn't stretch across the row.
    width: (rt.screen.width - theme.gap(8) - theme.gap(3)) / 2,
    padding: theme.gap(3),
    gap: theme.gap(1),
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: `${theme.rarity[rarity]}44`,
  }),
  pressed: {
    transform: [{ scale: 0.97 }],
  },
  imageWell: (rarity: Rarity) => ({
    alignItems: 'center',
    paddingVertical: theme.gap(2),
    marginBottom: theme.gap(1),
    borderRadius: theme.radius.sm,
    backgroundColor: `${theme.rarity[rarity]}14`,
  }),
  image: {
    height: 110,
  },
  rarity: (rarity: Rarity) => ({
    color: theme.rarity[rarity],
  }),
  value: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.gap(1),
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.gap(3),
    paddingHorizontal: theme.gap(4),
  },
  center: {
    textAlign: 'center',
  },
  footer: {
    marginTop: theme.gap(3),
  },
  status: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.gap(4),
  },
}));

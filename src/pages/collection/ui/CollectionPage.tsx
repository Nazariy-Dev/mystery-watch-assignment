import { useNavigation } from '@react-navigation/native';
import { useMemo } from 'react';
import { ActivityIndicator, Alert, FlatList, View } from 'react-native';
import { StyleSheet, withUnistyles } from 'react-native-unistyles';

import { CoinBalance, useGetMeQuery, useResetDemoMutation } from '@/entities/player';
import type { Rarity } from '@/shared/api';
import { Button, Screen, Text } from '@/shared/ui';

import { EmptyVault } from './EmptyVault';
import { Stat } from './Stat';
import { WatchCard } from './WatchCard';

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
    Alert.alert('Reset demo?', 'Your vault is emptied and your balance goes back to 100,000 coins.', [
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
            <EmptyVault onBrowse={() => navigation.navigate('Tabs', { screen: 'Shop' })} />
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

const styles = StyleSheet.create((theme) => ({
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

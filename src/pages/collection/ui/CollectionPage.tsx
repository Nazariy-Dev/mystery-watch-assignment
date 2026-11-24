import { useNavigation } from '@react-navigation/native';
import { useMemo } from 'react';
import { Alert, FlatList, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { useGetMeQuery, useResetDemoMutation } from '@/entities/player';
import type { Rarity } from '@/shared/api';
import { Button, Screen, Text } from '@/shared/ui';
import { AppHeader } from '@/widgets/app-header';

import { CollectionSkeleton } from './CollectionSkeleton';
import { EmptyVault } from './EmptyVault';
import { Stat } from './Stat';
import { WatchCard } from './WatchCard';

const RARITY_RANK: Record<Rarity, number> = { legendary: 0, epic: 1, rare: 2, common: 3 };

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
      <AppHeader />
      <Text variant="title" accessibilityRole="header" style={styles.title}>Your collection</Text>
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
      ) : isError ? (
        <View style={styles.status}>
          <Text tone="muted">Couldn&apos;t load your vault.</Text>
          <Button label="Retry" variant="secondary" onPress={refetch} />
        </View>
      ) : (
        <CollectionSkeleton />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create((theme) => ({
  title: {
    marginTop: theme.gap(2),
    marginBottom: theme.gap(3),
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

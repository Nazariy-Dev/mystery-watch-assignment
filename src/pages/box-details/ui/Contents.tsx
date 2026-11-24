import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { WatchImage } from '@/entities/watch';
import type { Box } from '@/shared/api';
import { CoinIcon, Text } from '@/shared/ui';

export function Contents({ box }: { box: Box }) {
  return (
    <View style={styles.section}>
      <Text variant="title">What&apos;s inside</Text>
      <View style={styles.grid}>
        {box.contents.map(({ watch, chance }) => (
          <View
            key={watch.id}
            style={styles.watchCard(watch.rarity)}
            accessible
            accessibilityLabel={`${watch.brand} ${watch.name}, ${watch.rarity}, ${chance} percent, worth ${watch.value} coins`}
          >
            <View style={styles.watchGlow(watch.rarity)}>
              <WatchImage watch={watch} style={styles.watchImage} />
            </View>
            <Text variant="label" style={styles.rarityText(watch.rarity)}>{watch.rarity}</Text>
            <Text variant="body" numberOfLines={1}>{watch.name}</Text>
            <View style={styles.watchFooter}>
              <Text variant="title">{chance}%</Text>
              <View style={styles.value}>
                <CoinIcon size={14} />
                <Text variant="caption" tone="coin">{watch.value.toLocaleString('en-US')}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  section: {
    gap: theme.gap(3),
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.gap(3),
  },
  watchCard: (rarity: Box['tier']) => ({
    // Two per row: half the width minus half the gap.
    flexBasis: (rt.screen.width - theme.gap(8) - theme.gap(3)) / 2,
    padding: theme.gap(4),
    gap: theme.gap(1),
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: `${theme.rarity[rarity]}44`,
  }),
  watchGlow: (rarity: Box['tier']) => ({
    alignItems: 'center',
    paddingVertical: theme.gap(2),
    marginBottom: theme.gap(1),
    borderRadius: theme.radius.sm,
    backgroundColor: `${theme.rarity[rarity]}14`,
  }),
  watchImage: {
    height: 120,
  },
  rarityText: (rarity: Box['tier']) => ({
    color: theme.rarity[rarity],
  }),
  watchFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  value: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.gap(1),
  },
}));

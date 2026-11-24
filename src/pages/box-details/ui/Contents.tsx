import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { WatchImage } from '@/entities/watch';
import type { Box } from '@/shared/api';
import { CoinIcon, Text } from '@/shared/ui';

export function Contents({ box }: { box: Box }) {
  return (
    <View style={styles.section}>
      <Text variant="title" accessibilityRole="header">What&apos;s inside</Text>
      <View style={styles.grid}>
        {box.contents.map(({ watch, chance }) => (
          <View
            key={watch.id}
            style={styles.watchCard(watch.rarity)}
            accessible
            accessibilityLabel={`${watch.brand} ${watch.name}, ${watch.rarity}, ${chance} percent, worth ${watch.value} coins`}
          >
            <View style={styles.chanceBadge(watch.rarity)}>
              <Text variant="caption" style={styles.chanceText}>{chance}%</Text>
            </View>
            <WatchImage watch={watch} style={styles.watchImage} />
            <Text variant="label" style={styles.rarityText(watch.rarity)}>{watch.rarity}</Text>
            <Text variant="body" numberOfLines={1}>{watch.name}</Text>
            <View style={styles.value}>
              <CoinIcon size={16} />
              <Text variant="body" tone="coin" style={styles.valueText}>{watch.value.toLocaleString('en-US')}</Text>
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
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: `${theme.rarity[rarity]}55`,
    // The rarity hue washes down from the top and settles into the surface, like a lit display case.
    backgroundImage: `linear-gradient(180deg, ${theme.rarity[rarity]}33 0%, ${theme.colors.surface} 70%)`,
    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.12)',
  }),
  chanceBadge: (rarity: Box['tier']) => ({
    position: 'absolute',
    top: theme.gap(3),
    right: theme.gap(3),
    zIndex: 1,
    paddingHorizontal: theme.gap(2),
    paddingVertical: 2,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.rarity[rarity],
    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.4), inset 0 -2px 0 rgba(0, 0, 0, 0.18)',
  }),
  chanceText: {
    fontFamily: theme.fonts.display,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.background,
  },
  watchImage: {
    alignSelf: 'center',
    height: 120,
    marginVertical: theme.gap(2),
  },
  rarityText: (rarity: Box['tier']) => ({
    color: theme.rarity[rarity],
  }),
  value: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.gap(1),
    marginTop: theme.gap(1),
  },
  valueText: {
    fontWeight: theme.fontWeight.bold,
  },
}));

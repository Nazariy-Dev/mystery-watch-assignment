import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import type { Box } from '@/shared/api';
import { Text } from '@/shared/ui';

export function Odds({ box }: { box: Box }) {
  return (
    <View style={styles.section}>
      <Text variant="title">Odds</Text>
      <View style={styles.oddsBar}>
        {box.contents.map(({ watch, chance }) => (
          <View key={watch.id} style={[styles.oddsSegment(watch.rarity), { flex: chance }]} />
        ))}
      </View>
      <View style={styles.legend}>
        {box.contents.map(({ watch, chance }) => (
          <View key={watch.id} style={styles.legendItem}>
            <View style={styles.legendDot(watch.rarity)} />
            <Text variant="caption" tone="muted">
              {watch.rarity} {chance}%
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  section: {
    gap: theme.gap(3),
  },
  oddsBar: {
    flexDirection: 'row',
    height: 12,
    gap: 2,
    borderRadius: theme.radius.pill,
    overflow: 'hidden',
  },
  oddsSegment: (rarity: Box['tier']) => ({
    backgroundColor: theme.rarity[rarity],
  }),
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: theme.gap(4),
    rowGap: theme.gap(1),
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.gap(2),
  },
  legendDot: (rarity: Box['tier']) => ({
    width: 8,
    height: 8,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.rarity[rarity],
  }),
}));

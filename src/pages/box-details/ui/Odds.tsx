import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import type { Box } from '@/shared/api';
import { Text } from '@/shared/ui';

export function Odds({ box }: { box: Box }) {
  return (
    <View style={styles.section}>
      <Text variant="title" accessibilityRole="header">Odds</Text>
      <View style={styles.oddsBar}>
        {box.contents.map(({ watch, chance }) => (
          <View key={watch.id} style={[styles.oddsSegment(watch.rarity), { flex: chance }]} />
        ))}
      </View>
      <View style={styles.legend}>
        {box.contents.map(({ watch, chance }) => (
          <View key={watch.id} style={styles.legendItem}>
            <View style={styles.legendDot(watch.rarity)} />
            <Text variant="caption" style={styles.legendLabel}>{watch.rarity}</Text>
            <Text variant="caption" tone="muted">{chance}%</Text>
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
    height: 14,
    gap: 2,
    padding: 2,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface,
    overflow: 'hidden',
  },
  oddsSegment: (rarity: Box['tier']) => ({
    borderRadius: theme.radius.pill,
    backgroundColor: theme.rarity[rarity],
    // Same candy bevel as the primary button, scaled down to the thin bar.
    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.4)',
  }),
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.gap(2),
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.gap(2),
    paddingHorizontal: theme.gap(3),
    paddingVertical: theme.gap(1),
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  legendDot: (rarity: Box['tier']) => ({
    width: 8,
    height: 8,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.rarity[rarity],
  }),
  legendLabel: {
    textTransform: 'capitalize',
  },
}));

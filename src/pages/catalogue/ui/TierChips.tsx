import { ScrollView, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import type { Rarity } from '@/shared/api';
import { Text, Touchable } from '@/shared/ui';

type TierChipsProps = {
  /** One chip per box, in carousel order. */
  tiers: Rarity[];
  selected: number;
  onSelect: (index: number) => void;
};

/** Rarity shortcuts above the carousel: tapping one jumps to that box, and the highlight follows swipes. */
export function TierChips({ tiers, selected, onSelect }: TierChipsProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroller} contentContainerStyle={styles.row}>
      {tiers.map((tier, index) => {
        const active = index === selected;
        return (
          <Touchable
            key={tier}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={`${tier} box`}
            feedback="tab"
            onPress={() => onSelect(index)}
            style={[styles.chip, active && styles.chipActive]}
          >
            <View style={styles.dot(tier)} />
            <Text variant="caption" style={[styles.label, active && styles.labelActive]}>{tier}</Text>
          </Touchable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create((theme) => ({
  // Scrolls edge to edge, so chips slide under the screen edge instead of being cut at the gutter.
  scroller: {
    marginHorizontal: -theme.gap(4),
  },
  row: {
    gap: theme.gap(2),
    paddingHorizontal: theme.gap(4),
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.gap(2),
    height: 44,
    paddingHorizontal: theme.gap(3),
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  chipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: `${theme.colors.accent}80`,
    // Same candy bevel as the primary button.
    boxShadow: 'inset 0 2px 0 rgba(255, 255, 255, 0.35), inset 0 -3px 0 rgba(0, 0, 0, 0.22)',
  },
  dot: (tier: Rarity) => ({
    width: 8,
    height: 8,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.rarity[tier],
  }),
  label: {
    fontFamily: theme.fonts.display,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textMuted,
    textTransform: 'capitalize',
  },
  labelActive: {
    color: theme.colors.onPrimary,
  },
}));

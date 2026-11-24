import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { WatchImage } from '@/entities/watch';
import type { OwnedItem, Rarity } from '@/shared/api';
import { CoinIcon, Text, Touchable } from '@/shared/ui';

const SCROLL_PRESS_DELAY_MS = 100;

export function WatchCard({ item, onPress }: { item: OwnedItem; onPress: () => void }) {
  const { watch } = item;

  return (
    <Touchable
      accessibilityRole="button"
      accessibilityLabel={`${watch.brand} ${watch.name}, ${watch.rarity}, worth ${watch.value} coins`}
      // A scroll through the vault starts on a card; the delay keeps it from clicking.
      unstable_pressDelay={SCROLL_PRESS_DELAY_MS}
      onPress={onPress}
      style={({ pressed }) => [styles.card(watch.rarity), pressed && styles.pressed]}
    >
      <WatchImage watch={watch} style={styles.image} />
      <Text variant="label" style={styles.rarity(watch.rarity)}>{watch.rarity}</Text>
      <Text numberOfLines={1}>{watch.name}</Text>
      <View style={styles.value}>
        <CoinIcon size={16} />
        <Text tone="coin" style={styles.valueText}>{watch.value.toLocaleString('en-US')}</Text>
      </View>
    </Touchable>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  card: (rarity: Rarity) => ({
    // Fixed half width, not flex: 1, so an odd last card doesn't stretch across the row.
    width: (rt.screen.width - theme.gap(8) - theme.gap(3)) / 2,
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
  pressed: {
    transform: [{ scale: 0.97 }],
  },
  image: {
    alignSelf: 'center',
    height: 110,
    marginVertical: theme.gap(2),
  },
  rarity: (rarity: Rarity) => ({
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

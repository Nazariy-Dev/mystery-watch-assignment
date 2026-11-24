import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Skeleton } from '@/shared/ui';

/** The promo banner, rarity chips, section heading and focused carousel card, while the boxes load. */
export function CatalogueSkeleton() {
  return (
    <View style={styles.container} accessible accessibilityLabel="Loading boxes">
      <Skeleton style={styles.banner} />
      <View style={styles.chips}>
        <Skeleton style={styles.chip} />
        <Skeleton style={styles.chip} />
        <Skeleton style={styles.chip} />
      </View>
      <Skeleton style={styles.heading} />
      <Skeleton style={styles.card} />
    </View>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  container: {
    flex: 1,
    gap: theme.gap(4),
    paddingTop: theme.gap(2),
  },
  banner: {
    height: 168,
    borderRadius: theme.radius.lg,
  },
  chips: {
    flexDirection: 'row',
    gap: theme.gap(2),
  },
  chip: {
    width: 96,
    height: 44,
    borderRadius: theme.radius.pill,
  },
  heading: {
    width: 180,
    height: 24,
    marginTop: theme.gap(2),
  },
  // Same footprint as a BoxCarousel card, so nothing jumps when the boxes arrive.
  card: {
    alignSelf: 'center',
    width: rt.screen.width * 0.84,
    aspectRatio: 1 / 1.3,
    borderRadius: theme.radius.lg,
  },
}));

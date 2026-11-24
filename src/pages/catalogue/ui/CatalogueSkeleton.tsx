import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Skeleton } from '@/shared/ui';

/** The focused carousel card and its page dots, while the boxes load. */
export function CatalogueSkeleton() {
  return (
    <View style={styles.container} accessible accessibilityLabel="Loading boxes">
      <Skeleton style={styles.card} />
      <View style={styles.dots}>
        <Skeleton style={styles.dotActive} />
        <Skeleton style={styles.dot} />
        <Skeleton style={styles.dot} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.gap(8),
  },
  // Same footprint as a BoxCarousel card, so nothing jumps when the boxes arrive.
  card: {
    width: rt.screen.width * 0.84,
    aspectRatio: 1 / 1.45,
    maxHeight: '80%',
    borderRadius: theme.radius.lg,
  },
  dots: {
    flexDirection: 'row',
    gap: theme.gap(2),
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: theme.radius.pill,
  },
  dotActive: {
    width: 24,
    height: 8,
    borderRadius: theme.radius.pill,
  },
}));

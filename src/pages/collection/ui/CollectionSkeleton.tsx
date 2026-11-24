import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Skeleton } from '@/shared/ui';

/** The stat tiles and the first rows of the watch grid, while the vault loads. */
export function CollectionSkeleton() {
  return (
    <View style={styles.content} accessible accessibilityLabel="Loading vault">
      <View style={styles.row}>
        <Skeleton style={styles.stat} />
        <Skeleton style={styles.stat} />
      </View>
      <View style={styles.row}>
        <Skeleton style={styles.card} />
        <Skeleton style={styles.card} />
      </View>
      <View style={styles.row}>
        <Skeleton style={styles.card} />
        <Skeleton style={styles.card} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  content: {
    gap: theme.gap(3),
  },
  row: {
    flexDirection: 'row',
    gap: theme.gap(3),
  },
  stat: {
    flex: 1,
    height: 80,
    borderRadius: theme.radius.md,
  },
  card: {
    width: (rt.screen.width - theme.gap(8) - theme.gap(3)) / 2,
    height: 210,
    borderRadius: theme.radius.md,
  },
}));

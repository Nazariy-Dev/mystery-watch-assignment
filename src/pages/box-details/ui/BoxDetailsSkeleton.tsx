import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Skeleton } from '@/shared/ui';

export function BoxDetailsSkeleton() {
  return (
    <View style={styles.content} accessible accessibilityLabel="Loading box">
      <Skeleton style={styles.stage} />
      <View style={styles.titleBlock}>
        <Skeleton style={styles.label} />
        <Skeleton style={styles.title} />
        <Skeleton style={styles.tagline} />
      </View>
      <View style={styles.section}>
        <Skeleton style={styles.heading} />
        <Skeleton style={styles.oddsBar} />
      </View>
      <View style={styles.grid}>
        <Skeleton style={styles.card} />
        <Skeleton style={styles.card} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  content: {
    flex: 1,
    gap: theme.gap(6),
    paddingTop: theme.gap(4),
  },
  stage: {
    height: 300,
    borderRadius: theme.radius.lg,
  },
  titleBlock: {
    gap: theme.gap(2),
  },
  label: {
    width: 96,
    height: 12,
  },
  title: {
    width: '70%',
    height: 32,
  },
  tagline: {
    width: '55%',
    height: 16,
  },
  section: {
    gap: theme.gap(3),
  },
  heading: {
    width: 80,
    height: 20,
  },
  oddsBar: {
    height: 12,
    borderRadius: theme.radius.pill,
  },
  grid: {
    flexDirection: 'row',
    gap: theme.gap(3),
  },
  card: {
    width: (rt.screen.width - theme.gap(8) - theme.gap(3)) / 2,
    height: 220,
    borderRadius: theme.radius.md,
  },
}));

import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { useGetBoxesQuery } from '@/entities/box';
import { CoinBalance } from '@/entities/player';
import { Button, Screen, Text } from '@/shared/ui';

import { BoxCarousel } from './BoxCarousel';
import { CatalogueSkeleton } from './CatalogueSkeleton';

export function CataloguePage() {
  const { data: boxes, isError, refetch } = useGetBoxesQuery();

  return (
    <Screen withBottomInset={false}>
      <View style={styles.header}>
        <View>
          <Text variant="label" tone="primary">Mystery Watch</Text>
          <Text variant="title" accessibilityRole="header">Pick your box</Text>
        </View>
        <CoinBalance />
      </View>
      {boxes ? (
        <View style={styles.carousel}>
          <BoxCarousel boxes={boxes} />
        </View>
      ) : isError ? (
        <View style={styles.status}>
          <Text tone="muted">Couldn&apos;t load the boxes.</Text>
          <Button label="Retry" variant="secondary" onPress={refetch} />
        </View>
      ) : (
        <CatalogueSkeleton />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create((theme) => ({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.gap(3),
  },
  carousel: {
    flex: 1,
    // Bleed the carousel to the screen edges so neighbouring cards peek in from both sides.
    marginHorizontal: -theme.gap(4),
    paddingBottom: theme.gap(2),
  },
  status: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.gap(4),
  },
}));

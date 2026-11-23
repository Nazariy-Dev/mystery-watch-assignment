import { ActivityIndicator, View } from 'react-native';
import { StyleSheet, withUnistyles } from 'react-native-unistyles';

import { useGetBoxesQuery } from '@/entities/box';
import { CoinBalance } from '@/entities/player';
import { Button, Screen, Text } from '@/shared/ui';

import { BoxCarousel } from './BoxCarousel';

const Spinner = withUnistyles(ActivityIndicator, (theme) => ({ color: theme.colors.primary }));

export function CataloguePage() {
  const { data: boxes, isError, refetch } = useGetBoxesQuery();

  return (
    <Screen withBottomInset={false}>
      <View style={styles.header}>
        <View>
          <Text variant="label" tone="primary">Mystery Watch</Text>
          <Text variant="title">Pick your box</Text>
        </View>
        <CoinBalance />
      </View>
      {boxes ? (
        <View style={styles.carousel}>
          <BoxCarousel boxes={boxes} />
        </View>
      ) : (
        <View style={styles.status}>
          {isError ? (
            <>
              <Text tone="muted">Couldn&apos;t load the boxes.</Text>
              <Button label="Retry" variant="secondary" onPress={refetch} />
            </>
          ) : (
            <Spinner size="large" accessibilityLabel="Loading boxes" />
          )}
        </View>
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

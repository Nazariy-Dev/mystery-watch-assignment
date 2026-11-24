import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { useGetBoxesQuery } from '@/entities/box';
import { Button, Screen, Text } from '@/shared/ui';
import { AppHeader } from '@/widgets/app-header';

import { BoxCarousel } from './BoxCarousel';
import { CatalogueSkeleton } from './CatalogueSkeleton';
import { WelcomeBanner } from './WelcomeBanner';

export function CataloguePage() {
  const { data: boxes, isError, refetch } = useGetBoxesQuery();

  return (
    <Screen withBottomInset={false}>
      <AppHeader />
      <Text variant="title" accessibilityRole="header" style={styles.title}>Pick your box</Text>
      <WelcomeBanner />
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
  title: {
    marginTop: theme.gap(2),
    marginBottom: theme.gap(3),
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

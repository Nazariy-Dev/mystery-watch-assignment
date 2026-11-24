import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { useGetBoxesQuery } from '@/entities/box';
import { Button, Screen, SparklesIcon, Text } from '@/shared/ui';
import { AppHeader } from '@/widgets/app-header';

import { BoxCarousel } from './BoxCarousel';
import { CatalogueSkeleton } from './CatalogueSkeleton';
import { PromoBanner } from './PromoBanner';
import { TierChips } from './TierChips';
import { WelcomeBanner } from './WelcomeBanner';

export function CataloguePage() {
  const navigation = useNavigation();
  const { data: boxes, isError, refetch } = useGetBoxesQuery();
  const [focused, setFocused] = useState(0);
  const featured = boxes?.reduce((top, box) => (box.price > top.price ? box : top));

  return (
    <Screen withBottomInset={false}>
      <AppHeader />
      {boxes && featured ? (
        <ScrollView style={styles.feed} contentContainerStyle={styles.feedContent} showsVerticalScrollIndicator={false}>
          <WelcomeBanner />
          <PromoBanner box={featured} onPress={() => navigation.navigate('BoxDetails', { boxId: featured.id })} />
          <TierChips tiers={boxes.map((box) => box.tier)} selected={focused} onSelect={setFocused} />
          <View style={styles.section}>
            <SparklesIcon size={28} />
            <Text variant="title" accessibilityRole="header" style={styles.sectionTitle}>Pick your box</Text>
            <Text variant="caption" tone="muted">{boxes.length} boxes</Text>
          </View>
          <View style={styles.carousel}>
            <BoxCarousel boxes={boxes} focused={focused} onFocusChange={setFocused} />
          </View>
        </ScrollView>
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
  // Bleeds to the screen edges so the carousel's neighbouring cards can peek in; the content re-adds the gutter.
  feed: {
    marginHorizontal: -theme.gap(4),
  },
  feedContent: {
    paddingHorizontal: theme.gap(4),
    paddingTop: theme.gap(2),
    paddingBottom: theme.gap(4),
    gap: theme.gap(4),
  },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.gap(2),
    marginTop: theme.gap(2),
  },
  sectionTitle: {
    flex: 1,
  },
  // The carousel's own padding leaves room for card glows; pulling it up keeps the card close to its heading.
  carousel: {
    marginHorizontal: -theme.gap(4),
    marginTop: -theme.gap(6),
  },
  status: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.gap(4),
  },
}));

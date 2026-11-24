import { useIsFocused } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { StyleSheet, withUnistyles } from 'react-native-unistyles';

import { BoxStage, useGetBoxQuery } from '@/entities/box';
import { CoinBalance, useGetMeQuery } from '@/entities/player';
import type { Box } from '@/shared/api';
import type { RootStackParamList } from '@/shared/config';
import { Button, IconButton, Screen, Text } from '@/shared/ui';

import { Contents } from './Contents';
import { Footer } from './Footer';
import { Odds } from './Odds';

type BoxDetailsPageProps = NativeStackScreenProps<RootStackParamList, 'BoxDetails'>;

const Spinner = withUnistyles(ActivityIndicator, (theme) => ({ color: theme.colors.primary }));

export function BoxDetailsPage({ navigation, route }: BoxDetailsPageProps) {
  const { boxId } = route.params;
  const { data: box, isError, refetch } = useGetBoxQuery(boxId);
  const { data: me } = useGetMeQuery();
  // The opening modal keeps this screen mounted; unmounting the canvas frees its GL context meanwhile.
  const isFocused = useIsFocused();

  return (
    <Screen withBottomInset={false}>
      <View style={styles.header}>
        <IconButton icon="chevron-back" accessibilityLabel="Back" onPress={navigation.goBack} />
        <CoinBalance />
      </View>
      {/* Branch on data, not isLoading: a background refetch must not swap the loaded page for a spinner. */}
      {box ? (
        <>
          <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {isFocused ? (
              <BoxStage
                tier={box.tier}
                inspectable
                accessibilityLabel={`3D model of the ${box.name} box`}
                style={styles.stage}
              />
            ) : (
              <View style={styles.stage} />
            )}
            <Text variant="caption" tone="muted" style={styles.hint}>Drag to spin</Text>
            <View style={styles.titleBlock}>
              <Text variant="label" style={styles.rarityText(box.tier)}>{box.tier} box</Text>
              <Text variant="display" accessibilityRole="header">{box.name}</Text>
              <Text tone="muted">{box.tagline}</Text>
            </View>
            <Odds box={box} />
            <Contents box={box} />
          </ScrollView>
          <Footer box={box} balance={me?.balance} onOpen={() => navigation.navigate('BoxOpening', { boxId })} />
        </>
      ) : (
        <View style={styles.status}>
          {isError ? (
            <>
              <Text tone="muted">Couldn&apos;t load this box.</Text>
              <Button label="Retry" variant="secondary" onPress={refetch} />
            </>
          ) : (
            <Spinner size="large" accessibilityLabel="Loading box" />
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
    paddingVertical: theme.gap(2),
  },
  scroll: {
    marginHorizontal: -theme.gap(4),
  },
  content: {
    paddingHorizontal: theme.gap(4),
    paddingBottom: theme.gap(8),
    gap: theme.gap(6),
  },
  stage: {
    height: 300,
  },
  hint: {
    textAlign: 'center',
    marginTop: -theme.gap(6),
  },
  titleBlock: {
    gap: theme.gap(1),
  },
  rarityText: (rarity: Box['tier']) => ({
    color: theme.rarity[rarity],
  }),
  status: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.gap(4),
  },
}));

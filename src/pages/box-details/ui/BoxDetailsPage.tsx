import { useIsFocused } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { StyleSheet, withUnistyles } from 'react-native-unistyles';

import { BoxStage, useGetBoxQuery } from '@/entities/box';
import { CoinBalance, useGetMeQuery } from '@/entities/player';
import { WatchImage } from '@/entities/watch';
import type { Box } from '@/shared/api';
import type { RootStackParamList } from '@/shared/config';
import { Button, CoinIcon, IconButton, Screen, Text } from '@/shared/ui';

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

function Odds({ box }: { box: Box }) {
  return (
    <View style={styles.section}>
      <Text variant="title">Odds</Text>
      <View style={styles.oddsBar}>
        {box.contents.map(({ watch, chance }) => (
          <View key={watch.id} style={[styles.oddsSegment(watch.rarity), { flex: chance }]} />
        ))}
      </View>
      <View style={styles.legend}>
        {box.contents.map(({ watch, chance }) => (
          <View key={watch.id} style={styles.legendItem}>
            <View style={styles.legendDot(watch.rarity)} />
            <Text variant="caption" tone="muted">
              {watch.rarity} {chance}%
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function Contents({ box }: { box: Box }) {
  return (
    <View style={styles.section}>
      <Text variant="title">What&apos;s inside</Text>
      <View style={styles.grid}>
        {box.contents.map(({ watch, chance }) => (
          <View
            key={watch.id}
            style={styles.watchCard(watch.rarity)}
            accessible
            accessibilityLabel={`${watch.brand} ${watch.name}, ${watch.rarity}, ${chance} percent, worth ${watch.value} coins`}
          >
            <View style={styles.watchGlow(watch.rarity)}>
              <WatchImage watch={watch} style={styles.watchImage} />
            </View>
            <Text variant="label" style={styles.rarityText(watch.rarity)}>{watch.rarity}</Text>
            <Text variant="body" numberOfLines={1}>{watch.name}</Text>
            <View style={styles.watchFooter}>
              <Text variant="title">{chance}%</Text>
              <View style={styles.value}>
                <CoinIcon size={14} />
                <Text variant="caption" tone="coin">{watch.value.toLocaleString('en-US')}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function Footer({ box, balance, onOpen }: { box: Box; balance?: number; onOpen: () => void }) {
  const shortBy = balance === undefined ? 0 : box.price - balance;

  return (
    <View style={styles.footer}>
      {shortBy > 0 && (
        <Text variant="caption" tone="muted" style={styles.shortfall}>
          You need {shortBy.toLocaleString('en-US')} more coins
        </Text>
      )}
      <Button
        label={`Buy & open · ${box.price.toLocaleString('en-US')}`}
        disabled={balance === undefined || shortBy > 0}
        onPress={onOpen}
      />
    </View>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
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
  section: {
    gap: theme.gap(3),
  },
  oddsBar: {
    flexDirection: 'row',
    height: 12,
    gap: 2,
    borderRadius: theme.radius.pill,
    overflow: 'hidden',
  },
  oddsSegment: (rarity: Box['tier']) => ({
    backgroundColor: theme.rarity[rarity],
  }),
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: theme.gap(4),
    rowGap: theme.gap(1),
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.gap(1.5),
  },
  legendDot: (rarity: Box['tier']) => ({
    width: 8,
    height: 8,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.rarity[rarity],
  }),
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.gap(3),
  },
  watchCard: (rarity: Box['tier']) => ({
    // Two per row: half the width minus half the gap.
    flexBasis: (rt.screen.width - theme.gap(8) - theme.gap(3)) / 2,
    padding: theme.gap(3),
    gap: theme.gap(1),
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: `${theme.rarity[rarity]}44`,
  }),
  watchGlow: (rarity: Box['tier']) => ({
    alignItems: 'center',
    paddingVertical: theme.gap(2),
    marginBottom: theme.gap(1),
    borderRadius: theme.radius.sm,
    backgroundColor: `${theme.rarity[rarity]}14`,
  }),
  watchImage: {
    height: 120,
  },
  watchFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  value: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.gap(1),
  },
  footer: {
    gap: theme.gap(2),
    paddingTop: theme.gap(3),
    paddingBottom: rt.insets.bottom + theme.gap(3),
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  shortfall: {
    textAlign: 'center',
  },
  status: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.gap(4),
  },
}));

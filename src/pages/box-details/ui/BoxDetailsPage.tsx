import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { StyleSheet, withUnistyles } from 'react-native-unistyles';

import { BoxStage, useGetBoxQuery } from '@/entities/box';
import type { RootStackParamList } from '@/shared/config';
import { Button, IconButton, Screen, Text } from '@/shared/ui';

type BoxDetailsPageProps = NativeStackScreenProps<RootStackParamList, 'BoxDetails'>;

const Spinner = withUnistyles(ActivityIndicator, (theme) => ({ color: theme.colors.primary }));

export function BoxDetailsPage({ navigation, route }: BoxDetailsPageProps) {
  const { boxId } = route.params;
  const { data: box, isError, refetch } = useGetBoxQuery(boxId);
  const [open, setOpen] = useState(false);

  return (
    <Screen>
      <IconButton icon="chevron-back" accessibilityLabel="Back" onPress={navigation.goBack} />
      {/* Branch on data, not isLoading: a background refetch must not swap the loaded page for a spinner. */}
      {box ? (
        <>
          <BoxStage tier={box.tier} openness={open ? 1 : 0} style={styles.stage} />
          <View style={styles.content}>
            <Text variant="label" tone="primary">{box.tier}</Text>
            <Text variant="display">{box.name}</Text>
            <Button label={open ? 'Close lid' : 'Open lid'} variant="secondary" onPress={() => setOpen(!open)} />
            <Button label="Open box" onPress={() => navigation.navigate('BoxOpening', { boxId })} />
          </View>
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
  stage: {
    height: 360,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: theme.gap(4),
  },
  status: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.gap(4),
  },
}));

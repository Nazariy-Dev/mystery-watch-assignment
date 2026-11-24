import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { useGetMeQuery } from '@/entities/player';
import type { RootStackParamList } from '@/shared/config';
import { IconButton, Screen, Text } from '@/shared/ui';

import { WatchDetails } from './WatchDetails';

type WatchDetailsPageProps = NativeStackScreenProps<RootStackParamList, 'WatchDetails'>;

export function WatchDetailsPage({ navigation, route }: WatchDetailsPageProps) {
  const { data: me } = useGetMeQuery();
  const item = me?.inventory.find((owned) => owned.id === route.params.itemId);

  return (
    <Screen>
      <IconButton icon="chevron-back" accessibilityLabel="Back" onPress={navigation.goBack} />
      {item ? (
        <WatchDetails item={item} onSold={navigation.goBack} />
      ) : (
        // Also shown for a frame after a sale, between the cache dropping the item and the screen popping.
        <View style={styles.missing}>
          <Text tone="muted">This watch is no longer in your vault.</Text>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  missing: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

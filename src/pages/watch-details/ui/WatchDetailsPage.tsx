import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import type { RootStackParamList } from '@/shared/config';
import { IconButton, Screen, Text } from '@/shared/ui';

type WatchDetailsPageProps = NativeStackScreenProps<RootStackParamList, 'WatchDetails'>;

export function WatchDetailsPage({ navigation, route }: WatchDetailsPageProps) {
  return (
    <Screen>
      <IconButton icon="chevron-back" accessibilityLabel="Back" onPress={navigation.goBack} />
      <View style={styles.content}>
        <Text variant="label" tone="primary">Watch</Text>
        <Text variant="display">{route.params.itemId}</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create((theme) => ({
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: theme.gap(4),
  },
}));

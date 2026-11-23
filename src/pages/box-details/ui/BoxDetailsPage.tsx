import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import type { RootStackParamList } from '@/shared/config';
import { Button, IconButton, Screen, Text } from '@/shared/ui';

type BoxDetailsPageProps = NativeStackScreenProps<RootStackParamList, 'BoxDetails'>;

export function BoxDetailsPage({ navigation, route }: BoxDetailsPageProps) {
  const { boxId } = route.params;

  return (
    <Screen>
      <IconButton icon="chevron-back" accessibilityLabel="Back" onPress={navigation.goBack} />
      <View style={styles.content}>
        <Text variant="label" tone="primary">Box details</Text>
        <Text variant="display">{boxId}</Text>
        <Button label="Open box" onPress={() => navigation.navigate('BoxOpening', { boxId })} />
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

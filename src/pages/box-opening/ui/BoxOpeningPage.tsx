import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import type { RootStackParamList } from '@/shared/config';
import { IconButton, Screen, Text } from '@/shared/ui';

type BoxOpeningPageProps = NativeStackScreenProps<RootStackParamList, 'BoxOpening'>;

export function BoxOpeningPage({ navigation, route }: BoxOpeningPageProps) {
  return (
    <Screen>
      <IconButton icon="close" accessibilityLabel="Close" onPress={navigation.goBack} />
      <View style={styles.content}>
        <Text variant="label" tone="primary">Opening</Text>
        <Text variant="display">{route.params.boxId}</Text>
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

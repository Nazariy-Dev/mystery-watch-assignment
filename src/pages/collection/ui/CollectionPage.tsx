import { useNavigation } from '@react-navigation/native';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Button, Screen, Text } from '@/shared/ui';

export function CollectionPage() {
  const navigation = useNavigation();

  return (
    <Screen withBottomInset={false}>
      <View style={styles.content}>
        <Text variant="label" tone="primary">Vault</Text>
        <Text variant="display">Your collection</Text>
        <Button
          label="View a watch"
          variant="secondary"
          onPress={() => navigation.navigate('WatchDetails', { itemId: 'demo-item' })}
        />
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

import { useNavigation } from '@react-navigation/native';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Button, Screen, Text } from '@/shared/ui';

export function CataloguePage() {
  const navigation = useNavigation();

  return (
    <Screen withBottomInset={false}>
      <View style={styles.content}>
        <Text variant="label" tone="primary">Shop</Text>
        <Text variant="display">Mystery boxes</Text>
        <Button
          label="View Icy Classic"
          onPress={() => navigation.navigate('BoxDetails', { boxId: 'icy-classic' })}
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

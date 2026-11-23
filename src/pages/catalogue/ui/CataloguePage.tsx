import { useNavigation } from '@react-navigation/native';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { useGetBoxesQuery, useGetMeQuery } from '@/shared/api';
import { Button, Screen, Text } from '@/shared/ui';

export function CataloguePage() {
  const navigation = useNavigation();
  const me = useGetMeQuery();
  const boxes = useGetBoxesQuery();

  return (
    <Screen withBottomInset={false}>
      <View style={styles.content}>
        <Text variant="label" tone="primary">Shop</Text>
        <Text variant="display">Mystery boxes</Text>
        <Text variant="title" tone="coin">
          {me.data ? `${me.data.balance} coins · ${me.data.inventory.length} watches` : 'Loading wallet…'}
        </Text>
        {boxes.isError && <Button label="Retry" variant="secondary" onPress={boxes.refetch} />}
        {boxes.data?.map((box) => (
          <Button
            key={box.id}
            label={`${box.name} · ${box.price}`}
            variant="secondary"
            onPress={() => navigation.navigate('BoxDetails', { boxId: box.id })}
          />
        ))}
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

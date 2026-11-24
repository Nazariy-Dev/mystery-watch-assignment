import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Button, Text } from '@/shared/ui';

export function EmptyVault({ onBrowse }: { onBrowse: () => void }) {
  return (
    <View style={styles.empty}>
      <Text variant="title">Your vault is empty</Text>
      <Text tone="muted" style={styles.center}>Open a mystery box and the watches you win land here.</Text>
      <Button label="Browse boxes" onPress={onBrowse} />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.gap(3),
    paddingHorizontal: theme.gap(4),
  },
  center: {
    textAlign: 'center',
  },
}));
